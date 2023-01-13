import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { start } from 'repl';

import StoryBoard from "./app";
import { alertMenuTable}  from "./ui";
import { playStartAudio } from './audio';

export const FONT = MRE.TextFontFamily.SansSerif;

let onClickMachineStatus = 0;
let alertPhase = 0;


export function startAlertThree(app: StoryBoard) {

	
	let miniWarehouse = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2112697538195751303',
		actor: {
			name: 'miniWarehouse',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: .5, y: .6, z: 0 },
					rotation: { x: 0, y: 1, z: 0 },
					scale: { x: .6, y: .6, z: .6 }
				}
			},
			//collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
		}
	});

	let alertThreeLogo = MRE.Actor.Create(app.context, {
		actor: {
			name: 'alertThreeLogo',
			parentId: app.anchorActor.id,
			transform: {
				local: { position: { x: 0, y: 2, z: 0 } }
			},
			text: {
				contents: "alertThreeLogo",
				font: FONT,
				justify: MRE.TextJustify.Center,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				//color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
				height: 0.3
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	setTimeout(function() {
		finishAlertThree(app);
	  }, 10 * 1000);

}

function finishAlertThree(app: StoryBoard) {
	app.alertThreeCompletionStatus = true;
	alertMenuTable(app);
}