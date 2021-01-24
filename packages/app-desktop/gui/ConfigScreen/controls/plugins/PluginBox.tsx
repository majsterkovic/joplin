import * as React from 'react';
import { useCallback } from 'react';
import { _ } from '@joplin/lib/locale';
import styled from 'styled-components';
import ToggleButton from '../../../lib/ToggleButton/ToggleButton';
import Button, { ButtonLevel } from '../../../Button/Button';
import { PluginManifest } from '@joplin/lib/services/plugins/utils/types';
import bridge from '../../../../services/bridge';

export enum InstallState {
	NotInstalled = 1,
	Installing = 2,
	Installed = 3,
}

export enum UpdateState {
	Idle = 1,
	CanUpdate = 2,
	Updating = 3,
	HasBeenUpdated = 4,
}

interface Props {
	item?: PluginItem;
	manifest?: PluginManifest;
	installState?: InstallState;
	updateState?: UpdateState;
	themeId: number;
	isCompatible: boolean;
	onToggle?: Function;
	onDelete?: Function;
	onInstall?: Function;
	onUpdate?: Function;
}

function manifestToItem(manifest: PluginManifest): PluginItem {
	return {
		manifest: manifest,
		enabled: true,
		deleted: false,
		devMode: false,
		hasBeenUpdated: false,
	};
}

export interface PluginItem {
	manifest: PluginManifest;
	enabled: boolean;
	deleted: boolean;
	devMode: boolean;
	hasBeenUpdated: boolean;
}

const CellRoot = styled.div`
	display: flex;
	box-sizing: border-box;
	background-color: ${props => props.theme.backgroundColor};
	flex-direction: column;
	align-items: flex-start;
	padding: 15px;
	border: 1px solid ${props => props.theme.dividerColor};
	border-radius: 6px;
	width: 320px;
	margin-right: 20px;
	margin-bottom: 20px;
	box-shadow: 1px 1px 3px rgba(0,0,0,0.2);

	opacity: ${props => props.isCompatible ? '1' : '0.6'};
`;

const CellTop = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	margin-bottom: 10px;
`;

const CellContent = styled.div`
	display: flex;
	margin-bottom: 10px;
	flex: 1;
`;

const CellFooter = styled.div`
	display: flex;
	flex-direction: row;
`;

const NeedUpgradeMessage = styled.span`
	font-family: ${props => props.theme.fontFamily};
	color: ${props => props.theme.colorWarn};
	font-size: ${props => props.theme.fontSize}px;
`;

const DevModeLabel = styled.div`
	border: 1px solid ${props => props.theme.color};
	border-radius: 4px;
	padding: 4px 6px;
	font-size: ${props => props.theme.fontSize * 0.75}px;
	color: ${props => props.theme.color};
`;

const StyledNameAndVersion = styled.div`
	font-family: ${props => props.theme.fontFamily};
	color: ${props => props.theme.color};
	font-size: ${props => props.theme.fontSize}px;
	font-weight: bold;
	padding-right: 5px;
	flex: 1;
`;

const StyledName = styled.a`
	color: ${props => props.theme.color};

	&:hover {
		text-decoration: underline;
	}
`;

const StyledVersion = styled.span`
	color: ${props => props.theme.colorFaded};
	font-size: ${props => props.theme.fontSize * 0.9}px;
`;

const StyledDescription = styled.div`
	font-family: ${props => props.theme.fontFamily};
	color: ${props => props.theme.colorFaded};
	font-size: ${props => props.theme.fontSize}px;
	line-height: 1.6em;
`;

export default function(props: Props) {
	const item = props.item ? props.item : manifestToItem(props.manifest);

	const onNameClick = useCallback(() => {
		if (!props.item.manifest.homepage_url) return;
		bridge().openExternal(props.item.manifest.homepage_url);
	}, [props.item]);

	// For plugins in dev mode things like enabling/disabling or
	// uninstalling them doesn't make sense, as that should be done by
	// adding/removing them from wherever they were loaded from.

	function renderToggleButton() {
		if (!props.onToggle) return null;

		if (item.devMode) {
			return <DevModeLabel>DEV</DevModeLabel>;
		}

		return <ToggleButton
			themeId={props.themeId}
			value={item.enabled}
			onToggle={() => props.onToggle({ item })}
		/>;
	}

	function renderDeleteButton() {
		if (!props.onDelete) return null;
		return <Button level={ButtonLevel.Secondary} onClick={() => props.onDelete({ item })} title={_('Delete')}/>;
	}

	function renderInstallButton() {
		if (!props.onInstall) return null;

		let title = _('Install');
		if (props.installState === InstallState.Installing) title = _('Installing...');
		if (props.installState === InstallState.Installed) title = _('Installed');

		return <Button
			level={ButtonLevel.Secondary}
			disabled={props.installState !== InstallState.NotInstalled}
			onClick={() => props.onInstall({ item })}
			title={title}
		/>;
	}

	function renderUpdateButton() {
		if (!props.onUpdate) return null;

		let title = _('Update');
		if (props.updateState === UpdateState.Updating) title = _('Updating...');
		if (props.updateState === UpdateState.Idle) title = _('Updated');
		if (props.updateState === UpdateState.HasBeenUpdated) title = _('Updated');

		return <Button
			ml={1}
			level={ButtonLevel.Recommended}
			onClick={() => props.onUpdate({ item })}
			title={title}
			disabled={props.updateState === UpdateState.HasBeenUpdated}
		/>;
	}

	function renderFooter() {
		if (item.devMode) return null;

		if (!props.isCompatible) {
			return (
				<CellFooter>
					<NeedUpgradeMessage>
						{_('Please upgrade Joplin to use this plugin')}
					</NeedUpgradeMessage>
				</CellFooter>
			);
		}

		return (
			<CellFooter>
				{renderDeleteButton()}
				{renderInstallButton()}
				{renderUpdateButton()}
				<div style={{ display: 'flex', flex: 1 }}/>
			</CellFooter>
		);
	}

	return (
		<CellRoot isCompatible={props.isCompatible}>
			<CellTop>
				<StyledNameAndVersion mb={'5px'}><StyledName onClick={onNameClick} href="#" style={{ marginRight: 5 }}>{item.manifest.name} {item.deleted ? _('(%s)', 'Deleted') : ''}</StyledName><StyledVersion>v{item.manifest.version}</StyledVersion></StyledNameAndVersion>
				{renderToggleButton()}
			</CellTop>
			<CellContent>
				<StyledDescription>{item.manifest.description}</StyledDescription>
			</CellContent>
			{renderFooter()}
		</CellRoot>
	);
}
