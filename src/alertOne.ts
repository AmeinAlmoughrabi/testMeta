import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { start } from 'repl';
import ColorMaterials from './colorMaterials';

import StoryBoard from "./app";
import { alertMenuTable}  from "./ui";
import { playStartAudio } from './audio';
import { Actor, Appearance, Color3, TargetBehavior } from '@microsoft/mixed-reality-extension-sdk';
import { Team } from './telemetry';
import { ConnectedUsers } from './telemetry';
import { stopScorebard } from './assets';

export const FONT = MRE.TextFontFamily.SansSerif;

let onClickMachineStatus = 0;
let alertPhase = 0;


let alertOneAnchor: MRE.Actor;
let alertMachineLocation = { x: 1.8, y: 1.2, z: .15 };

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
function generateAlertConnectionBall(app: StoryBoard, artifactid: string, targetStart: any, targetEnd: any, speed: number, pong : any, name: string){

	let alertMachineBall = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: artifactid,
		actor: {
			name: name,
			parentId: alertOneAnchor.id,
			transform: {
				local: {
					position: targetStart,
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});
	const backAndForthAnimData = app.assets.createAnimationData(
		"backAndForth",
		{
			tracks: [{
				target: MRE.ActorPath("someBall").transform.local.position,
				keyframes: [{time: 0, value: targetStart},
							{time: speed, value: targetEnd}],
				easing: MRE.AnimationEaseCurves.Linear
			}]
	});
	backAndForthAnimData.bind({ someBall: alertMachineBall }, { isPlaying: true, wrapMode: pong});
	return alertMachineBall;
}

export function startAlertOne(app: StoryBoard) {

	restartAlertOne(app);

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

	let alertMachine = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126472062959616801',// 2112700092199731767',
		actor: {
			name: 'alertMachine',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: alertMachineLocation,
					//rotation: { x: 0, y: 1, z: 0 },//MRE.Vector3(),//{x:0, y: 90, z: 0},
					scale: { x: .02, y: .02, z: .02 }
				}
			},
			//collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }

		}
	});

	MRE.Animation.AnimateTo(app.context, alertMachine, {
		destination: { transform: { local: { scale: { x: 0.3, y: 0.3, z: 0.3 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	const spinAnimData = app.assets.createAnimationData(
		// The name is a unique identifier for this data. You can use it to find the data in the asset container,
		// but it's merely descriptive in this sample.
		"Spin",
		{
			// Animation data is defined by a list of animation "tracks": a particular property you want to change,
			// and the values you want to change it to.
			tracks: [{
				// This animation targets the rotation of an actor named "text"
				target: MRE.ActorPath("alertMachine").transform.local.rotation,
				// And the rotation will be set to spin over 20 seconds
				keyframes: generateSpinKeyframes(20, MRE.Vector3.Up()),
				// And it will move smoothly from one frame to the next
				easing: MRE.AnimationEaseCurves.Linear
			}]
		});

	spinAnimData.bind({ alertMachine: alertMachine }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop });

	const alertMachineBehavior = alertMachine.setBehavior(MRE.ButtonBehavior);	

	const menuOption2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1579239603192201565',
		actor: {
			name: 'menuOption2', // left/right, front/back up/down
			transform: {
				local: {
					position: { x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.anchorActor.id,
		}
	});

	menuOption2.setBehavior(MRE.ButtonBehavior).onClick(user => {
		finishAlertOne(app);
	});

	const menuOption3 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1579239603192201565',
		actor: {
			name: 'menuOption3', // left/right, front/back up/down
			transform: {
				local: {
					position: { x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.anchorActor.id,
		}
	});

	menuOption3.setBehavior(MRE.ButtonBehavior).onClick(user => {
		finishAlertOne(app);
	});

	const menuOption4 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1579239603192201565',
		actor: {
			name: 'menuOption4', // left/right, front/back up/down
			transform: {
				local: {
					position: { x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.anchorActor.id,
		}
	});

	menuOption4.setBehavior(MRE.ButtonBehavior).onClick(user => {
		finishAlertOne(app);
	});

	let menuOption2label = MRE.Actor.Create(app.context, {
		actor: {
		  transform: { local: { position: { x: 0.2, y: 0, z: 0 } } },
		  text: {
			contents: 'Quarantine',
			height: 0.2,
			anchor: MRE.TextAnchorLocation.MiddleLeft,
			justify: MRE.TextJustify.Left,
			font: FONT
		  },
		  parentId: menuOption2.id
		}
	});

	let menuOption3label = MRE.Actor.Create(app.context, {
		actor: {
		  transform: { local: { position: { x: 0.2, y: 0, z: 0 } } },
		  text: {
			contents: 'Terminate Server',
			height: 0.2,
			anchor: MRE.TextAnchorLocation.MiddleLeft,
			justify: MRE.TextJustify.Left,
			font: FONT
		  },
		  parentId: menuOption3.id
		}
	});

	let menuOption4label = MRE.Actor.Create(app.context, {
		actor: {
		  transform: { local: { position: { x: 0.2, y: 0, z: 0 } } },
		  text: {
			contents: 'False Positive/Ignore',
			height: 0.2,
			anchor: MRE.TextAnchorLocation.MiddleLeft,
			justify: MRE.TextJustify.Left,
			font: FONT
		  },
		  parentId: menuOption4.id
		}
	});

	alertMachineBehavior.onClick(user => {
		switch (onClickMachineStatus) {
			case 0:
				MRE.Animation.AnimateTo(app.context, menuOption2, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x + 1.3, y: alertMachineLocation.y + 1, z: alertMachineLocation.z },
								scale: { x: 1, y: 1, z: 1 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				MRE.Animation.AnimateTo(app.context, menuOption3, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x + 1.3, y: alertMachineLocation.y + .6, z: alertMachineLocation.z },
								scale: { x: 1, y: 1, z: 1 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				MRE.Animation.AnimateTo(app.context, menuOption4, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x + 1.3, y: alertMachineLocation.y + .2, z: alertMachineLocation.z },
								scale: { x: 1, y: 1, z: 1 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				onClickMachineStatus = 1;
				break;
			case 1:
				MRE.Animation.AnimateTo(app.context, menuOption2, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
								scale: { x: 0, y: 0, z: 0 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				MRE.Animation.AnimateTo(app.context, menuOption3, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
								scale: { x: 0, y: 0, z: 0 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				MRE.Animation.AnimateTo(app.context, menuOption4, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
								scale: { x: 0, y: 0, z: 0 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				onClickMachineStatus = 0;
				break;
			default:
			// code block
		}
	});

	

	// create texture from image asset in public folder
	let mainScreentexture = app.assets.createTexture("bgText", { uri: 'screen-intro.png' });
	let mainScreenMaterial = app.assets.createMaterial("bgMaterial", {
		mainTextureId: mainScreentexture.id,
		mainTextureScale: { x: 1, y: 1 },
		emissiveTextureId: mainScreentexture.id,
		emissiveTextureScale: { x: 1, y: 1 },
		emissiveColor: new MRE.Color3(1, 1, 1)
	});
	let background = MRE.Actor.Create(app.context, {
		actor: {
			name: "mainScreenbackground",
			transform: { local: { position: { x: 0, y: 0, z: -0.02 } } }, // -Z is towards you when looking at the screen
			appearance: {
				meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id, // X is width, Y is height, Z is depth when looking at screen
				materialId: mainScreenMaterial.id
			},
			parentId: mainScreen.id
		}
	});

	// create texture from image asset in public folder
	
	createAlertTwoMenu(app);
	// call createLeaderboard function from assets.ts
	
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

function updateMiniScreen(app:StoryBoard, url: string){
	// create texture from image asset in public folder
	let mainScreentexture = app.assets.createTexture(url, { uri: url });
	let mainScreenMaterial = app.assets.createMaterial(url, {
		mainTextureId: mainScreentexture.id,
		mainTextureScale: { x: 1, y: 1 },
		emissiveTextureId: mainScreentexture.id,
		emissiveTextureScale: { x: 1, y: 1 },
		emissiveColor: new MRE.Color3(1, 1, 1)
	});
	app.anchorActor.findChildrenByName("mainScreenbackground", true)[0].appearance.materialId = mainScreenMaterial.id;
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
		alertOneAnchor.destroy();
		alertOneAnchor = MRE.Actor.Create(app.context);
		updateMiniScreen(app, 'screen-access-management.png');
		alertMachineAccessManagement(app, alertMachineLocation);
	});
	menuOption2.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg2.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
		bg3.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg4.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		alertOneAnchor.destroy();
		alertOneAnchor = MRE.Actor.Create(app.context);
		updateMiniScreen(app, 'screen-connectivity.png');
		alertMachineConnectivity(app, alertMachineLocation);
	});
	menuOption3.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg2.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg3.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
		bg4.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		alertOneAnchor.destroy();
		alertOneAnchor = MRE.Actor.Create(app.context);
		updateMiniScreen(app, 'screen-vulnerabilities.png');
		alertMachineVulnerabilities(app, alertMachineLocation);
	});
	menuOption4.setBehavior(MRE.ButtonBehavior).onClick(user => {
		bg1.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg2.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg3.appearance.material.emissiveColor = new MRE.Color3(1, 1, 1);
		bg4.appearance.material.emissiveColor = new MRE.Color3(0, 0, 255);
		alertOneAnchor.destroy();
		alertOneAnchor = MRE.Actor.Create(app.context);
		updateMiniScreen(app, 'screen-controls.png');
		alertMachineControls(app, alertMachineLocation);
	});
}



function alertMachineConnectivity(app: StoryBoard, alertMachineLocation: { x: number; y: number; z: number; }) {

	let alertMachineIntruder = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2130760160438649729',
		actor: {
			name: 'alertMachineIntruder',
			parentId: alertOneAnchor.id,
			transform: {
				local: {
					position:  { x: 3.5, y: 1.5, z: .15 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .3, y: .3, z: .3 }
				}
			},
		}
	});

	let alertMachinePC1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2130760147855737725',
		actor: {
			name: 'alertMachinePC1',
			parentId: alertOneAnchor.id,
			transform: {
				local: {
					position: { x: -.2, y: 1, z: .5 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .15, y: .15, z: .15 }
				}
			},
		}
	});

	let alertMachinePC2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2130760147855737725',
		actor: {
			name: 'alertMachinePC2',
			parentId: alertOneAnchor.id,
			transform: {
				local: {
					position: { x: .2, y: 1, z: -.6 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .15, y: .15, z: .15 }
				}
			},
		}
	});
	
	let alertMachineBall1a = generateAlertConnectionBall(app, 'artifact:2126289302236168721',
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
		{ x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z }, 
													1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall1a");
	let alertMachineBall1b = generateAlertConnectionBall(app, 'artifact:2126289302236168721',
		{ x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
													1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall1b");

	let alertMachineBall2a = generateAlertConnectionBall(app, 'artifact:2126289315867656728',
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
		{ x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z }, 
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall2a");	

	let alertMachineBall2b = generateAlertConnectionBall(app, 'artifact:2126289315867656728',
		{ x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z }, 
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall2b");	

	let alertMachineBall3a = generateAlertConnectionBall(app, 'artifact:2126289315867656728',
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
		{ x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z }, 
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall3a");

	let alertMachineBall3b = generateAlertConnectionBall(app, 'artifact:2126289315867656728',
		{ x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z }, 
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall3b");
}

function createControlHelp(app: StoryBoard, location: any, buttonName: string, text: string){
	let control = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1579238405710021245',
		actor: {
			name: buttonName,
			parentId: alertOneAnchor.id,
			transform: {
				local: {
					position: location,
					scale: { x: .4, y: .4, z: .4 }
				}
			},
		}
	});
	control.setBehavior(MRE.ButtonBehavior).onClick(user => {
		user.prompt(text)
	  });
	
	return control
}

function alertMachineControls(app: StoryBoard, alertMachineLocation: { x: number; y: number; z: number; }) {
	//1579238405710021245	
	let initial = 2.14;
	let spacing = .181;
	let control1 = createControlHelp(app, { x: -1.63, y: initial, z: .94}, "controlHelp1", 
		"Disable accounts within [Assignment: organization-defined time period] when the accounts: \n(a) Have expired;\n(b) Are no longer associated with a user or individual;\n(c) Are in violation of organizational policy; or\n(d) Have been inactive for [Assignment: organization-defined time period].")
	let control2 = createControlHelp(app, { x: -1.63, y: initial - spacing , z: .94}, "controlHelp3",
		"Enforce the revocation of access authorizations resulting from changes to the security attributes of subjects and objects based on [Assignment: organization-defined rules governing the timing of revocations of access authorizations].")
	let control3 = createControlHelp(app, { x: -1.63, y: initial - spacing * 2, z: .94}, "controlHelp4",
		"(a) Enforce information flow control using [Assignment: organization-defined security or privacy policy filters] as a basis for flow control decisions for [Assignment: organization-defined information flows]; and\n (b) [Selection (one or more): Block; Strip; Modify; Quarantine] data after a filter processing failure in accordance with [Assignment: organization-defined security or privacy policy].")
	let control4 = createControlHelp(app, { x: -1.63, y: initial - spacing * 3, z: .94}, "controlHelp6",
		"Provide access from a single device to computing platforms, applications, or data residing in multiple different security domains, while preventing information flow between the different security domains.")
	let control5 = createControlHelp(app, { x: -1.63, y: initial - spacing * 4, z: .94}, "controlHelp7",
		"Prevent the following software from executing at higher privilege levels than users executing the software: [Assignment: organization-defined software].")
	
}

function alertMachineVulnerabilities(app: StoryBoard, alertMachineLocation: { x: number; y: number; z: number; }) {
	
	let miniWarehouseOverhead = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2130879701231599940',
		actor: {
			name: 'miniWarehouseOverhead',
			parentId: alertOneAnchor.id,
			transform: {
				local: {
					position:{ x: .25, y: 1.555, z: -0.3 }, //{ x: .5, y: .6, z: 0 }
					rotation: { x: 0, y: 1, z: 0 },
					scale: { x: .6, y: .6, z: .6 }
				}
			},
		}
	});
	
}

function alertMachineAccessManagement(app: StoryBoard, alertMachineLocation: { x: number; y: number; z: number; }) {

	let floorLightAccessManagement = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1162104712200192219',
		actor: {
			name: 'floorLightAccessManagement',
			parentId: alertOneAnchor.id,
			transform: { 
				local: { 
					position: { x: -1, y: -.01, z: -1.5 },
					scale: { x: .1, y: .001, z: .1 },
					rotation: { x: 0, y: -.5, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	MRE.Animation.AnimateTo(app.context, floorLightAccessManagement, {
		destination: { transform: { local: { 	scale: { x: 2, y: .5, z: 2 },
												position: { x: -6, y: -.5, z: -3 }
											} } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	setTimeout(() => {
		let adminGroup = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130807129362137325',
			actor: {
				name: 'adminGroup',
				parentId: alertOneAnchor.id,
				transform: {
					local: {
						position: { x: -6, y: 1.5, z: -3.5 },
						rotation: { x: 0, y: 45, z: 0 },
						scale: { x: .8, y: .8, z: .8 }
					}
				},
			}
		});

		let adminGroup1 = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130807100136226882',
			actor: {
				name: 'adminGroup',
				parentId: alertOneAnchor.id,
				transform: {
					local: {
						position: { x: -6.05, y: 1.5, z: -3.4 },
						rotation: { x: 0, y: 45, z: 0 },
						scale: { x: .8, y: .8, z: .8 }
					}
				},
			}
		});

		let adminGroup2 = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130807076933337142',
			actor: {
				name: 'adminGroup',
				parentId: alertOneAnchor.id,
				transform: {
					local: {
						position: { x: -5.95, y: 1.5, z: -3.5 },
						rotation: { x: 0, y: 45, z: 0 },
						scale: { x: .8, y: .8, z: .8 }
					}
				},
			}
		});
	
		let engineerGroup = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130807088861937726',
			actor: {
				name: 'engineerGroup',
				parentId: alertOneAnchor.id,
				transform: {
					local: {
						position: { x: -5.5, y: 1.5, z: -2 },
						rotation: { x: 0, y: 90, z: 0 },
						scale: { x: .8, y: .8, z: .8 }
					}
				},
			}
		});

		let engineerGroup1 = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130807065004736558',
			actor: {
				name: 'engineerGroup',
				parentId: alertOneAnchor.id,
				transform: {
					local: {
						position: { x: -5.5, y: 1.45, z: -1.85 },
						rotation: { x: 0, y: 90, z: 0 },
						scale: { x: .8, y: .8, z: .8 }
					}
				},
			}
		});

		let engineerGroup2 = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130807113633497265',
			actor: {
				name: 'engineerGroup',
				parentId: alertOneAnchor.id,
				transform: {
					local: {
						position: { x: -5.5, y: 1.45, z: -1.85 },
						rotation: { x: 0, y: 90, z: 0 },
						scale: { x: .8, y: .8, z: .8 }
					}
				},
			}
		});
	},6000);

}

function finishAlertOne(app: StoryBoard) {
	app.alertOneCompletionStatus = true;
	alertOneAnchor.destroy();
	alertMenuTable(app);
	stopScorebard(app);
}

export function restartAlertOne(app: StoryBoard) {
	onClickMachineStatus = Number(0);
	alertPhase = Number(0);
	alertOneAnchor = MRE.Actor.Create(app.context);
}