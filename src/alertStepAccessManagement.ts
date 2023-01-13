import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import * as ARTIFACT from "./artifact";
import * as IMAGES from './images';

import { decisionScreenAccessManagement } from './decisionToolAccessManagement';
import { alertStepConnectivityStart } from './alertStepConnectivity';

import { playInstructionAccessAudio } from './audio';
import * as SCORE from './score';


export const FONT = MRE.TextFontFamily.SansSerif;

let popupLoadingLocation = { x: 0, y: 1.5, z: 0 };
let popupLoadingScale = {x:.2, y: .13, z:.001 };
let alertMachineLocation = { x: -1.8, y: 1.2, z: .15 };


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
            parentId: app.accessManagementAnchor.id
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
			
            parentId: app.accessManagementAnchor.id
        }
    });
	return backgroundImage
}

function displayHeadModels(app:StoryBoard, groupActor: string, headAvatar: string, location: {x: number, y: number, z: number}, promptText: string): MRE.Actor{

	let groupOrb = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: groupActor,
		actor: {
			name: groupActor,
			parentId: app.accessManagementAnchor.id,
			transform: {
				local: {
					position: location,
					rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Down(),  Math.PI),
					scale: { x: .6, y: .6, z: .6 }
				}
			},
		}
	});

	let headLoc = {x: location.x, y: location.y -.15, z: location.z}

	let headOrb = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: headAvatar,
		actor: {
			name: headAvatar,
			parentId: app.accessManagementAnchor.id,
			transform: {
				local: {
					position: headLoc,
					rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Down(),  Math.PI),
					scale: { x: 1, y: 1, z: 1 }
				}
			},
		}
	});

	let headOrbBehavior = groupOrb.setBehavior(MRE.ButtonBehavior);

	headOrbBehavior.onClick(user => {
		user.prompt(promptText)
	  });

	return groupOrb;
}

function alertMachineAccessManagement(app: StoryBoard, alertMachineLocation: { x: number; y: number; z: number; }) {
	
	let machine1Loc = { x: -2, y: 1.1, z: .7 };
	let machine1Head1Loc = { x: -1.65, y: 1.3, z: .7 };
	let machine1Head2Loc = { x: -2.35, y: 1.3, z: .7 };
	let machine1Head3Loc = { x: -2, y: 1.5, z: .7 };
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee01, machine1Head1Loc, "UserID:\nbobbuilder\n\nLast Command:\n'fax(file-status.docx)'");
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee02, machine1Head2Loc, "UserID:\ntaylor\n\nLast Command:\n'increase water speed'");
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee03, machine1Head3Loc, "UserID:\ncory\n\nLast Command:\n'display warehouse status'");

	let machine1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.Machine1,
		actor: {
			name: 'machine1',
			parentId: app.accessManagementAnchor.id,
			transform: {
				local: {
					position: machine1Loc,
					scale: { x: .15, y: .15, z: .15 }
				}
			},
		}
	});
	let machine2Loc = { x: .3, y: 1.1, z: -.28 };
	let machine2Head1Loc = { x: -.05, y: 1.3, z: -.28 };
	let machine2Head2Loc = { x: .65, y: 1.3, z: -.28 };
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee04, machine2Head1Loc, "UserID:\nanusha\n\nLast Command:\n'print(file-status.docx)'");
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee05, machine2Head2Loc, "UserID:\nmaria\n\nLast Command:\n'rotate gear 90 degrees'");

	let machine2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.Machine2,
		actor: {
			name: 'machine2',
			parentId: app.accessManagementAnchor.id,
			transform: {
				local: {
					position: machine2Loc,
					scale: { x: .3, y: .3, z: .3 }
				}
			},
		}
	});

	let machine3Loc = { x: -3.2, y: 1.1, z: -0.1 };
	let machine3Head1Loc = { x: -3.55, y: 1.3, z: 0 };
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee03, machine3Head1Loc, "UserID:\ncory\n\nLast Command:\n'increase process speed'");

	let machine3 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.Machine3,
		actor: {
			name: 'machine3',
			parentId: app.accessManagementAnchor.id,
			transform: {
				local: {
					position: machine3Loc,
					scale: { x: .2, y: .2, z: .2 }
				}
			},
		}
	});

	let robotArmLoc = { x: 2.1, y: 1.1, z: 0.2 };
	let robotArmHead1Loc = { x: 2.45, y: 1.3, z: 0.2 };
	let robotArmHead2Loc = { x: 1.75, y: 1.3, z: 0.2 };
	let intruderOrb = displayHeadModels(app, ARTIFACT.AccessIntruder, ARTIFACT.HeadIntruder01, robotArmHead1Loc, "UserID:\ntomhuber\n\nLast Command:\n'reduce arm speed 0.4'");
	displayHeadModels(app, ARTIFACT.AccessEmployee, ARTIFACT.HeadEmployee01, robotArmHead2Loc, "UserID:\nbobbuilder\n\nLast Command:\n'update patch on arm'");

	let robotArm = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.RobotArm,
		actor: {
			name: 'robotArm',
			parentId: app.accessManagementAnchor.id,
			transform: {
				local: {
					position: robotArmLoc,
					scale: { x: .2, y: .2, z: .2 }
				}
			},
		}
	});

	const growAndShrinkAnimData = app.assets.createAnimationData(
		"growAndShrink",
		{
			tracks: [{
				target: MRE.ActorPath("someBall").transform.local.scale,
				keyframes: [{time: 0, value: intruderOrb.transform.local.scale},
							{time: 1, value: { x: .5, y: .5, z: .5 }}],
				easing: MRE.AnimationEaseCurves.Linear
			}]
	});
	growAndShrinkAnimData.bind({ someBall: intruderOrb }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.PingPong});

	let popUpDecison = {x: robotArmHead1Loc.x + 1, y: robotArmHead1Loc.y + 1.6, z: robotArmHead1Loc.z};
	decisionScreenAccessManagement(app, popUpDecison, finishAlertAccessManagement);
}

function loadingFlipBook(app: StoryBoard, popupLoadingLocation:any, popupLoadingScale: any){
	let popupLoading0: MRE.Actor;
	let popupLoading1: MRE.Actor;
	let popupLoading2: MRE.Actor;
	let popupLoading3: MRE.Actor;
	let popupLoading4: MRE.Actor;
	let popupLoading5: MRE.Actor;

	popupLoading0 = displayImageInv(app, IMAGES.PopUp_Access_Scanning0, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading1 = displayImageInv(app, IMAGES.PopUp_Access_Scanning1, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading2 = displayImageInv(app, IMAGES.PopUp_Access_Scanning2, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading3 = displayImageInv(app, IMAGES.PopUp_Access_Scanning3, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading4 = displayImageInv(app, IMAGES.PopUp_Access_Scanning4, 
		popupLoadingLocation, popupLoadingScale)
	popupLoading5 = displayImageInv(app, IMAGES.PopUp_Access_Scanning5, 
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

export function alertStepAccessManagementStart(app: StoryBoard) {

	app.accessManagementAnchor = MRE.Actor.Create(app.context);

	loadingFlipBook(app, popupLoadingLocation, popupLoadingScale)

	setTimeout(() => {
		playInstructionAccessAudio(app.assets, app.accessManagementAnchor);

    	alertMachineAccessManagement(app, alertMachineLocation);
	}, 6000);

}	

function finishAlertAccessManagement(app: StoryBoard) {
	app.alertAccessManagementCompletionStatus = true;
	app.accessManagementAnchor.destroy();
    alertStepConnectivityStart(app);
	//refreshLeaderBoard(app);
}