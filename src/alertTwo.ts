import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { start } from 'repl';

import StoryBoard from "./app";
import { alertMenuTable}  from "./ui";
import { playStartAudio } from './audio';
import { XReserveActor } from '@microsoft/mixed-reality-extension-sdk/built/internal/payloads';

export const FONT = MRE.TextFontFamily.SansSerif;

let onClickMachineStatus = 0;
let alertPhase = 0;
let alertMachineLocation = { x: -.8, y: 1.2, z: .15 };

/**
 * Generate keyframe data for a simple spin animation.
 * @param duration The length of time in seconds it takes to complete a full revolution.
 * @param axis The axis of rotation in local space.
 */
function generateSpinKeyframes(duration: number, axis: MRE.Vector3): Array<MRE.Keyframe<MRE.Quaternion>> {
	return [{
		time: 0 * duration,
		value: MRE.Quaternion.RotationAxis(axis, 0)
	}, {
		time: 0.25 * duration,
		value: MRE.Quaternion.RotationAxis(axis, Math.PI / 2)
	}, {
		time: 0.5 * duration,
		value: MRE.Quaternion.RotationAxis(axis, Math.PI)
	}, {
		time: 0.75 * duration,
		value: MRE.Quaternion.RotationAxis(axis, 3 * Math.PI / 2)
	}, {
		time: 1 * duration,
		value: MRE.Quaternion.RotationAxis(axis, 2 * Math.PI)
	}];
}

export function startAlertTwo(app: StoryBoard) {

	restartAlertTwo(app);

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

	const mainScreen = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1338743673998803669',
		actor: {
			name: 'mainScreen',
			transform: { local: { position: { x: -.2, y: 2, z: 1 }, scale: { x: 0, y: 0, z: 0 } } },
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.anchorActor.id
		}
	});

	MRE.Animation.AnimateTo(app.context, mainScreen, {
		destination: { transform: { local: { scale: { x: .4, y: .4, z: .4 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	let alertTwoLogo = MRE.Actor.Create(app.context, {
		actor: {
			name: 'alertTwoLogo',
			parentId: app.anchorActor.id,
			transform: {
				local: { position: { x: 0, y: 2, z: 0 } }
			},
			text: {
				contents: "alertTwoLogo",
				font: FONT,
				justify: MRE.TextJustify.Center,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				//color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
				height: 0.3
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	createAlertTwoMenu(app);

	setTimeout(function() {
		finishAlertTwo(app);
	  }, 10 * 1000);
	  
}

function createAlertMenuButton(app:StoryBoard, location: any, buttonName: string, url: string){
	const menuOption = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1338743673998803669',
		actor: {
			name: buttonName,
			transform: { local: { position: location, 
									scale: { x: .04, y: .04, z: .8 },
									rotation: {x: .5, y: 0, z: 0} } },
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.anchorActor.id
		}
	});
	let backgroundTextureCase = app.assets.createTexture("bgTex", { uri: url });
	let backgroundMaterialCase = app.assets.createMaterial("bgMat", {
		mainTextureId: backgroundTextureCase.id,
		mainTextureScale: { x: 1, y: 1 },
		emissiveTextureId: backgroundTextureCase.id,
		emissiveTextureScale: { x: 1, y: 1 },
		emissiveColor: new MRE.Color3(1, 1, 1)
	});
	let background = MRE.Actor.Create(app.context, {
		actor: {
			name: "background",
			transform: { local: { position: { x: 0, y: 0, z: -0.02 } } },
			appearance: {
				meshId: app.assets.createBoxMesh("cube", 7.8, 4.38, 0.02).id, 
				materialId: backgroundMaterialCase.id
			},
			parentId: menuOption.id
		}
	});
	return [menuOption, background]
}

function createAlertTwoMenu(app: StoryBoard) {

	let [menuOption1, bg1] = createAlertMenuButton(app, { x: -1, y: 1, z: -1.5 }, 'menuOption1', 'button-access-management-icon.png')
	let [menuOption2, bg2] = createAlertMenuButton(app, { x: -.4, y: 1, z: -1.5 }, 'menuOption2',  'button-connectivity-icon.png')
	let [menuOption3, bg3] = createAlertMenuButton(app, { x: .2, y: 1, z: -1.5 }, 'menuOption3',  'button-vulnerabilities-icon.png')
	let [menuOption4, bg4] = createAlertMenuButton(app, { x: .8, y: 1, z: -1.5 }, 'menuOption4',  'button-controls-icon.png')

	menuOption1.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
		bg2.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg3.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg4.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);

	});
	menuOption2.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg2.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
		bg3.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg4.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);

	});
	menuOption3.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg2.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg3.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
		bg4.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		
	});
	menuOption4.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg2.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg3.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg4.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
	
	});
}

function finishAlertTwo(app: StoryBoard) {
	app.alertTwoCompletionStatus = true;
	alertMenuTable(app);
}

export function restartAlertTwo(app: StoryBoard) {
	onClickMachineStatus = Number(0);
	alertPhase = Number(0);
}
