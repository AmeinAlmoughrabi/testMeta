import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import * as ARTIFACT from "./artifact";
import * as IMAGES from './images';
import { alertStepVulnerabilityStart } from './alertStepVulnerability';
import { decisionScreenConnectivity } from './decisionToolConnectivity';
import { drawLineBetweenTwoPointsinXY } from './util';
import { playInstructionConnectivityAudio  } from './audio';

export const FONT = MRE.TextFontFamily.SansSerif;

let printerNotification: MRE.Actor;
let popupFastenersBad: MRE.Actor;
let alertMachine: MRE.Actor;
let popupFastenersGood: MRE.Actor;
let printerNotificationInputOutput: MRE.Actor;
let printerExternalCommunication: MRE.Actor;
let alertMachineArm1 : MRE.Actor;

let alertMachineIntruder: MRE.Actor;
let pointerToBadArm: MRE.Actor;
let pointerToGoodArm: MRE.Actor;

let alertMachineArm1Loc = { x: 2, y: 1, z: -.9 };
let alertMachineArm2Loc = { x: 1.4, y: 1.5, z: .85 };

let alertMachineArm1LocPointerStart = { x: 2, y: 1.4, z: -.9 };
let alertMachineArm2LocPointerStart = { x: 1.4, y: 1.9, z: .85 };

let alertMachineArm1LocPointerEnd = { x: 3, y: 1.6, z: -.9 };
let alertMachineArm2LocPointerEnd = {x: 1.6, y: 2.1, z: .85};

let alertMachineBall1a: MRE.Actor;
let alertMachineBall1b: MRE.Actor;

let popupLoadingLocation = { x: 0, y: 1.5, z: 0 };
let popupLoadingScale = {x:.2, y: .13, z:.001 };

let alertMachineLocation = { x: -1.8, y: 1.2, z: .15 };

let alertMachineActionLocation = {x: -5.2, y: 2.8, z: .15 };

let popupFastenersGoodLocation = { x: 1.6, y: 2.5, z: .85 };
let popupFastenersGoodScale = {x:.2, y: .2, z:.001 }

let popupFastenersBadLocation = { x: 3, y: 2, z: -.9 };
let popupFastenersBadScale = {x:.2, y: .2, z:.001 }


function displayImage(app: StoryBoard, image: string, location: any, size: any): MRE.Actor {
	let displayScreentexture = app.assets.createTexture(image , { uri: image });
    let displayScreenMaterial = app.assets.createMaterial(image, {
        mainTextureId: displayScreentexture.id,
        mainTextureScale: { x: 1, y: 1 },
        emissiveTextureId: displayScreentexture.id,
        emissiveTextureScale: { x: 1, y: 1 },
        emissiveColor: new MRE.Color3(1, 1, 1),
        alphaMode: MRE.AlphaMode.Blend
    });
    let backgroundImage = MRE.Actor.Create(app.context, {
        actor: {
            name: image,
            transform: { local: { position: location, scale: size} },
            collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
            appearance: {
                meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id,
                materialId: displayScreenMaterial.id
            },
            parentId: app.connectivityAnchor.id
        }
    });

	return backgroundImage
}
function displayImageInv(app: StoryBoard, image: string, location: any, size: any): MRE.Actor {
	let displayScreentexture = app.assets.createTexture(image , { uri: image });
    let displayScreenMaterial = app.assets.createMaterial(image, {
        mainTextureId: displayScreentexture.id,
        mainTextureScale: { x: 1, y: 1 },
        emissiveTextureId: displayScreentexture.id,
        emissiveTextureScale: { x: 1, y: 1 },
        emissiveColor: new MRE.Color3(1, 1, 1),
        alphaMode: MRE.AlphaMode.Blend
    });
    let backgroundImage = MRE.Actor.Create(app.context, {
        actor: {
            name: image,
            transform: { local: { position: location, scale: size} },
            collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
            appearance: {
                meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id,
                materialId: displayScreenMaterial.id,
				enabled: false
            },
			
            parentId: app.connectivityAnchor.id
        }
    });
	return backgroundImage
}
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
			parentId: app.connectivityAnchor.id,
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
function alertMachineConnectivity(app: StoryBoard, alertMachineLocation: { x: number; y: number; z: number; }) {

	alertMachineIntruder = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.ComputerRed,
		actor: {
			name: 'alertMachineIntruder',
			parentId: app.connectivityAnchor.id,
			transform: {
				local: {
					position:  { x: -3.5, y: 1.5, z: -1.7 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .3, y: .3, z: .3 }
				}
			},
		}
	});

	let alertMachineArm2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.RobotArmGreen,
		actor: {
			name: 'alertMachineArm2',
			parentId: app.connectivityAnchor.id,
			transform: {
				local: {
					position: alertMachineArm2Loc,
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .02, y: .02, z: .02 } //{ x: .15, y: .15, z: .15 }
				}
			},
		}
	});

	let alertMachinePC2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.ComputerGreen,
		actor: {
			name: 'alertMachinePC2',
			parentId: app.connectivityAnchor.id,
			transform: {
				local: {
					position: { x: .2, y: 1, z: -.6 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .15, y: .15, z: .15 }
				}
			},
		}
	});

    alertMachineArm1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.RobotArmOrange,
		actor: {
			name: 'alertMachinePC2',
			parentId: app.connectivityAnchor.id,
			transform: {
				local: {
					position: alertMachineArm1Loc,
					rotation: { x: 0, y: 90, z: 0 },
					scale:  { x: .02, y: .02, z: .02 } //{ x: .15, y: .15, z: .15 }
				}
			},
		}
	});

	MRE.Animation.AnimateTo(app.context, alertMachineArm1, {
		destination: { transform: { local: { scale: { x: .15, y: .15, z: .15 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});
	MRE.Animation.AnimateTo(app.context, alertMachineArm2, {
		destination: { transform: { local: { scale: { x: .15, y: .15, z: .15 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	const spinAnimData = app.assets.createAnimationData(
		"SpinIt",
		{
			tracks: [{
				target: MRE.ActorPath("alertMachine").transform.local.rotation,
				keyframes: generateSpinKeyframes(20, MRE.Vector3.Up()),
				easing: MRE.AnimationEaseCurves.Linear
			}]
		});

	spinAnimData.bind({ alertMachine: alertMachineArm1 }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop });
	spinAnimData.bind({ alertMachine: alertMachineArm2 }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop });
	
	
	alertMachineBall1a = generateAlertConnectionBall(app, ARTIFACT.SphereRed,
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
		{ x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z }, 
													1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall1a");
	alertMachineBall1b = generateAlertConnectionBall(app, ARTIFACT.SphereRed,
		{ x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
													1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall1b");

	let alertMachineBall2a = generateAlertConnectionBall(app, ARTIFACT.SphereGreen,
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
		{ x: alertMachineArm2.transform.local.position.x, y: alertMachineArm2.transform.local.position.y, z: alertMachineArm2.transform.local.position.z }, 
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall2a");	

	let alertMachineBall2b = generateAlertConnectionBall(app, ARTIFACT.SphereGreen,
		{ x: alertMachineArm2.transform.local.position.x, y: alertMachineArm2.transform.local.position.y, z: alertMachineArm2.transform.local.position.z },
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z }, 
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall2b");	

	let alertMachineBall3a = generateAlertConnectionBall(app, ARTIFACT.SphereGreen,
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
		{ x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z }, 
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall3a");

	let alertMachineBall3b = generateAlertConnectionBall(app, ARTIFACT.SphereGreen,
		{ x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z }, 
		{ x: alertMachineLocation.x, y: alertMachineLocation.y, z: alertMachineLocation.z },
												1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBall3b");

    let alertMachineBallArm = generateAlertConnectionBall(app, ARTIFACT.SphereGreen,
    { x: alertMachineArm1.transform.local.position.x, y: alertMachineArm1.transform.local.position.y, z: alertMachineArm1.transform.local.position.z }, 
    { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
                                            1,  MRE.AnimationWrapMode.PingPong,  "alertMachineBallArm");
}
function loadingFlipBook(app: StoryBoard, popupLoadingLocation:any, popupLoadingScale: any){
	let popupLoading0: MRE.Actor;
	let popupLoading1: MRE.Actor;
	let popupLoading2: MRE.Actor;
	let popupLoading3: MRE.Actor;
	let popupLoading4: MRE.Actor;
	let popupLoading5: MRE.Actor;

	popupLoading0 = displayImageInv(app, IMAGES.PopUp_Connectivity_Scanning0, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading1 = displayImageInv(app, IMAGES.PopUp_Connectivity_Scanning1, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading2 = displayImageInv(app, IMAGES.PopUp_Connectivity_Scanning2, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading3 = displayImageInv(app, IMAGES.PopUp_Connectivity_Scanning3, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading4 = displayImageInv(app, IMAGES.PopUp_Connectivity_Scanning4, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading5 = displayImageInv(app, IMAGES.PopUp_Connectivity_Scanning5, 
		popupLoadingLocation, popupLoadingScale)
	setTimeout(() => {
		popupLoading0.appearance.enabled = true;
	}, 100);
	setTimeout(() => {
		popupLoading1.appearance.enabled = true;
		popupLoading0.destroy();
	}, 1000);
	setTimeout(() => {
		popupLoading2.appearance.enabled = true;
		popupLoading1.destroy();
	}, 2000);
	setTimeout(() => {
		popupLoading3.appearance.enabled = true;
		popupLoading2.destroy();
	}, 3000);
	setTimeout(() => {
		popupLoading4.appearance.enabled = true;
		popupLoading3.destroy();
	}, 4000);
	setTimeout(() => {
		popupLoading5.appearance.enabled = true;
		popupLoading4.destroy();
	}, 5000);
	setTimeout(() => {
		popupLoading5.destroy();
	}, 6000);

}
export function alertStepConnectivityStart(app: StoryBoard) {

	app.connectivityAnchor = MRE.Actor.Create(app.context);

	loadingFlipBook(app, popupLoadingLocation, popupLoadingScale);

	setTimeout(() => {
		playInstructionConnectivityAudio(app.assets, app.connectivityAnchor);

		alertMachine = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: ARTIFACT.PrinterRed, //'artifact:2126472062959616801',// 2112700092199731767',
			actor: {
				name: 'alertMachine',
				parentId: app.connectivityAnchor.id,
				transform: {
					local: {
						position: alertMachineLocation,
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
			"Spin",
			{
				tracks: [{
					target: MRE.ActorPath("alertMachine").transform.local.rotation,
					keyframes: generateSpinKeyframes(20, MRE.Vector3.Up()),
					easing: MRE.AnimationEaseCurves.Linear
				}]
			});

		spinAnimData.bind({ alertMachine: alertMachine }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop });
		
		alertMachineConnectivity(app, alertMachineLocation);

		popupFastenersBad = displayImage(app, IMAGES.PopUp_Connectivity_4FastenersPerSecond, 
			popupFastenersBadLocation, popupFastenersBadScale)

		popupFastenersGood = displayImage(app, IMAGES.PopUp_Connectivity_10FastenersPerSecond, 
			popupFastenersGoodLocation, popupFastenersGoodScale)

		pointerToBadArm = drawLineBetweenTwoPointsinXY(app, app.connectivityAnchor, "linebad", alertMachineArm1LocPointerEnd, alertMachineArm1LocPointerStart, "blue")
		pointerToGoodArm = drawLineBetweenTwoPointsinXY(app, app.connectivityAnchor, "linegood", alertMachineArm2LocPointerEnd, alertMachineArm2LocPointerStart, "blue")
		decisionScreenConnectivity(app, alertMachineActionLocation,finishAlertConnectivityImpact)
	}, 6000);

	//setTimeout(() => {
	//	decisionScreenConnectivity(app, alertMachineActionLocation,finishAlertConnectivityImpact)
	//}, 7000);
}	

function finishAlertConnectivityImpact(app: StoryBoard, status:string){
	if ((status == "terminate") || (status == "restart")){
		popupFastenersBad.destroy();
		popupFastenersGood.destroy();
		alertMachineBall1a.destroy();
		alertMachineBall1b.destroy();
		alertMachineIntruder.destroy();
		pointerToBadArm.destroy();
		pointerToGoodArm.destroy();
		alertMachine.destroy();
		alertMachine = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: ARTIFACT.GreenPrinter,
			actor: {
				name: 'alertMachine',
				parentId: app.connectivityAnchor.id,
				transform: {
					local: {
						position: alertMachineLocation,
						scale:  { x: 0.3, y: 0.3, z: 0.3 }
					}
				},
			}
		});
		alertMachineArm1.destroy();
		alertMachineArm1 = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: ARTIFACT.RobotArmGreen,
			actor: {
				name: 'alertMachinePC2',
				parentId: app.connectivityAnchor.id,
				transform: {
					local: {
						position: alertMachineArm1Loc,
						rotation: { x: 0, y: 90, z: 0 },
						scale:  { x: .15, y: .15, z: .15 }
					}
				},
			}
		});
		setTimeout(() => {
			popupFastenersBad.destroy();
			pointerToBadArm = drawLineBetweenTwoPointsinXY(app, app.connectivityAnchor, "linebad", alertMachineArm1LocPointerEnd, alertMachineArm1LocPointerStart, "blue")
			popupFastenersBad = displayImage(app, IMAGES.PopUp_Connectivity_12FastenersPerSecond, 
				popupFastenersBadLocation, popupFastenersBadScale)
		}, 2000);
		setTimeout(() => {
			finishAlertConnectivity(app);
		}, 6000);
	}else{
		finishAlertConnectivity(app);
	}

}

function finishAlertConnectivity(app: StoryBoard) {
	app.alertConnectivityCompletionStatus = true;
	app.connectivityAnchor.destroy();
    alertStepVulnerabilityStart(app);
}

