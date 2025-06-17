import { Dex, toID } from "./battle-dex";
import { PS, type RoomID, type PSRoom } from "./client-main";
import { Teams } from "./battle-teams";
import { PSRoomPanel, PSPanelWrapper } from "./panels";

class AltFormPanel extends PSRoomPanel {
	static readonly id = 'altform';
	static readonly routes = ['altform-*'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	getArgs() {
		return this.props.room.args as { teamKey: string, setIndex: number } | undefined;
	}

	closeAndUpdate() {
		const { teamKey } = this.getArgs() || ({} as { teamKey?: string });
		if (teamKey) {
			const team = PS.teams.byKey[teamKey];
			if (team) {
				PS.teams.save();
				const room = PS.rooms[`team-${team.key}` as RoomID];
				if (room) {
					(room as any).forceReload = true;
					room.update(null);
				}
			}
		}
		this.close();
	}

	selectForm = (ev: MouseEvent) => {
		const formValue = (ev.currentTarget as HTMLButtonElement).value;
		const args = this.getArgs();
		if (!args) return;
		const { teamKey, setIndex } = args;
		const team = PS.teams.byKey[teamKey];
		if (!team) return;
		const sets = Teams.unpack(team.packedTeam);
		if (setIndex < 0 || setIndex >= sets.length) return;
		const set = sets[setIndex];

		const species = Dex.species.get(set.species);
		if (!species.exists) return;
		let newSpecies = species.baseSpecies;
		if (formValue) {
			const fullName = species.baseSpecies + formValue;
			const lookup = Dex.species.get(fullName);
			if (lookup.exists) newSpecies = lookup.name;
		}
		set.species = newSpecies;
		delete (set as any).name;

		team.packedTeam = Teams.pack(sets);
		team.iconCache = null;
		this.closeAndUpdate();
	};

	override render() {
		const args = this.getArgs();
		if (!args) {
			return <PSPanelWrapper room={this.props.room}><div class="pad">Loading memes...</div></PSPanelWrapper>;
		}
		const { teamKey, setIndex } = args;
		const team = PS.teams.byKey[teamKey];
		if (!team) {
			return <PSPanelWrapper room={this.props.room}><div class="pad">Team not found.</div></PSPanelWrapper>;
		}

		let packed = team.packedTeam;
		if (!packed) {
			PS.teams.loadTeam?.(team, true as any)?.then(() => {
				this.forceUpdate();
			});
			return <PSPanelWrapper room={this.props.room}><div class="pad">Loading...</div></PSPanelWrapper>;
		}
		const sets = Teams.unpack(packed);
		const set = sets[setIndex];
		if (!set) return <PSPanelWrapper room={this.props.room}><div class="pad">Pokémon not found.</div></PSPanelWrapper>;

		const species = Dex.species.get(set.species);
		const baseId = toID(species.baseSpecies);
		const forms = species.cosmeticFormes?.length ? [baseId, ...species.cosmeticFormes.map(toID)] : [baseId];

		// Determine maximum sprite size (same logic as legacy: dex vs home)
		let maxSpriteSize = 96;
		const renderButton = (formId: string) => {
			const formeIdPart = formId === baseId ? '' : formId.slice(baseId.length);
			const formLabel = formeIdPart ? formeIdPart.charAt(0).toUpperCase() + formeIdPart.slice(1) : '';
			const spriteId = baseId + (formLabel ? '-' + formeIdPart : '');
			const data = Dex.getTeambuilderSpriteData(spriteId);
			const spriteSize = data.spriteDir === 'sprites/dex' ? 120 : 96;
			maxSpriteSize = Math.max(maxSpriteSize, spriteSize);
			const spriteDim = `width:${spriteSize}px;height:${spriteSize}px;`;
			const resize = data.h ? `background-size:${data.h}px;` : '';
			const cur = (formLabel === (species.forme || '')) ? ' cur' : '';
			return <button
				name="setForm" value={formLabel}
				onClick={this.selectForm as any}
				style={`background-image:url(${Dex.resourcePrefix}${data.spriteDir}/${spriteId}.png);${spriteDim}${resize}`}
				class={`option${cur}`}
			></button>;
		};

		return <PSPanelWrapper room={this.props.room} width={(4 + maxSpriteSize) * 7}><div class="pad">
			<p>Pick a variant or <button name="close" class="button" data-cmd="/close">Cancel</button></p>
			<div class="formlist">
				{forms.map(renderButton as any)}
				<div style="clear:both"></div>
			</div>
		</div></PSPanelWrapper>;
	}
}

PS.addRoomType(AltFormPanel);
