/**
 * Damage Calc Panel
 *
 * Embeds the Relumi damage calculator in a right panel (like stats).
 * Also provides a button to open the full calculator in a new tab.
 *
 * @license MIT
 */

import { PS, PSRoom } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";

const FULL_CALC_URL = "https://calc.relumishowdown.dpdns.org/";

export class DamageCalcRoom extends PSRoom {
	override readonly classType: string = 'damagecalc';
}

class DamageCalcPanel extends PSRoomPanel<DamageCalcRoom> {
	static readonly id = 'damagecalc';
	static readonly routes = ['damagecalc'];
	static readonly Model = DamageCalcRoom;
	static readonly location = 'right';
	static readonly title = 'Damage Calc';
	static readonly icon = <i class="fa fa-calculator" aria-hidden></i>;

	openFullSite = () => {
		window.open(FULL_CALC_URL, '_blank', 'noopener noreferrer');
	};

	override render() {
		return <PSPanelWrapper room={this.props.room} noScroll>
			<div style="display:flex;flex-direction:column;height:100%">
		<div class="pad" style="flex-shrink:0;display:flex;align-items:center;gap:8px">
			<strong>Damage Calculator</strong>
			<small><em>Tip: Export your current team in battle chat using <code>/showteam</code></em></small>
			<button class="button" onClick={this.openFullSite} style="margin-left:auto">
				<i class="fa fa-external-link" aria-hidden></i> Open full site
			</button>
		</div>
				<iframe
					src={FULL_CALC_URL}
					style="flex:1;width:100%;border:none;min-height:0"
					title="Damage Calculator"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
				/>
			</div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(DamageCalcPanel);
