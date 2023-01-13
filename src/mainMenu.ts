import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import * as ARTIFACT from './artifact';
import * as IMAGES from './images';
import StoryBoard from "./app";
import { createTimer, stopTimer, startTimer } from './timer';

import { startExperienceAvatarPartOne, startExperienceAvatarPartTwo, startExperienceAvatarPartThree } from './talkingActor';

import { alertStepConnectivityStart } from './alertStepConnectivity';
import { alertStepVulnerabilityStart } from './alertStepVulnerability';
import { alertStepAccessManagementStart } from './alertStepAccessManagement';

import { genName } from './naming';
import * as SCORE from './score';

import { getAudioLength, startIntroPart1String, startIntroPart2String, startIntroPart3String } from './audio';
import { Vector3 } from '@microsoft/mixed-reality-extension-sdk';

import * as SCOREBOARD from './scoreboard';

export const FONT = MRE.TextFontFamily.SansSerif;

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
            parentId: app.mainMenuAnchor.id
        }
    });

	return backgroundImage
}
function displayImageSolid(app: StoryBoard, image: string, location: any, size: any): MRE.Actor {
	let displayScreentexture = app.assets.createTexture(image , { uri: image });
    let displayScreenMaterial = app.assets.createMaterial(image, {
        mainTextureId: displayScreentexture.id,
        mainTextureScale: { x: 1, y: 1 },
        emissiveTextureId: displayScreentexture.id,
        emissiveTextureScale: { x: 1, y: 1 },
        emissiveColor: new MRE.Color3(1, 1, 1),
        alphaMode: MRE.AlphaMode.Mask
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
            parentId: app.mainMenuAnchor.id
        }
    });

	return backgroundImage
}
function moveScreenAway(app:StoryBoard, screenActor: MRE.Actor, myLocation: { x: number; y: number; z: number; }){
    MRE.Animation.AnimateTo(app.context, screenActor, {
		destination: { transform: { local: { position: myLocation } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});
}
function fadeOutAway(app:StoryBoard, screenActor: MRE.Actor, speed: number){
    MRE.Animation.AnimateTo(app.context, screenActor, {
		destination: { transform: { local: { scale: {x: 0, y:0, z: 0} } } },
		duration: speed,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});
}
function rotateScreenAway(app:StoryBoard, screenActor: MRE.Actor, direction: MRE.Vector3) {

    let spinAnimData = app.assets.createAnimationData(
		"Spin",
		{
			tracks: [{
				target: MRE.ActorPath("someScreen").transform.local.rotation,
				keyframes: [{time: 0, value: screenActor.transform.local.rotation}, 
                            {time: 6, value: MRE.Quaternion.RotationAxis(direction, Math.PI / 2).add(MRE.Quaternion.RotationAxis(direction, Math.PI / 2))
                }],
				easing: MRE.AnimationEaseCurves.Linear
			}]
		});

	spinAnimData.bind({ someScreen: screenActor }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Once });

}
function moveObject(app:StoryBoard, targetActor: MRE.Actor, direct: { x: number; y: number; z: number;}, speed: number){
    let elementInfo = targetActor.transform.toJSON();
    let targetX = elementInfo.local.position.x + direct.x;
    let targetY = elementInfo.local.position.y + direct.y;
    let targetZ = elementInfo.local.position.z + direct.z;
    MRE.Animation.AnimateTo(app.context, targetActor, {
        destination: { transform: { local: { position: { x: targetX, y: targetY, z: targetZ} } } },
        duration: speed,
        easing: MRE.AnimationEaseCurves.EaseOutSine
    });
}
function updateMiniScreen(app:StoryBoard, screenActor: MRE.Actor, url: string){
	let displayScreentexture = app.assets.createTexture(url , { uri: url });
	let displayScreenMaterial = app.assets.createMaterial(url, {
		mainTextureId: displayScreentexture.id,
		mainTextureScale: { x: 1, y: 1 },
		emissiveTextureId: displayScreentexture.id,
		emissiveTextureScale: { x: 1, y: 1 },
		emissiveColor: new MRE.Color3(1, 1, 1),
        //alphaMode: MRE.AlphaMode.Mask
	});
	let background = MRE.Actor.Create(app.context, {
		actor: {
			name: url,
			transform: { local: { position: { x: 0, y: 0, z: -0.02 } } },
			appearance: {
				meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id,
				materialId: displayScreenMaterial.id
			},
			parentId: screenActor.id
		}
	});
}
export function displayMainMenu(app: StoryBoard) {
    app.mainMenuAnchor = MRE.Actor.Create(app.context);

    app.frontWallAnchor = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.frontWallTall,
		actor: {
			name: 'frontWallTall',
			transform: { local: { //position: { x: -1, y: 2.5, z: -1 }, 
                                    position: { x: 0, y: 1.3, z: -8 },     
                                    scale: { x: 1, y: 1, z: 1 }//, 
                                  //rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Down(),  Math.PI / 5) 
                                } },
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
		}
	});

    let displayScreen1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.screen,
		actor: {
			name: 'displayScreen1',
			transform: { local: { position: { x: -6, y: 2.5, z: 1 }, scale: { x: .4, y: .6, z: .4 }, 
                                 //rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Down(),  Math.PI / 5) 
                                }},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.mainMenuAnchor.id
		}
	});

    let displayScreen2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.screen,
		actor: {
			name: 'displayScreen2',
			transform: { local: { position: { x: -2, y: 2.5, z: 1 }, scale: { x: .4, y: .6, z: .4 }, 
                                //rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Down(),  Math.PI / 8)
                            }},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.mainMenuAnchor.id
		}
	});

    let displayScreen3 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.screen,
		actor: {
			name: 'displayScreen3',
			transform: { local: { position: { x: 2, y: 2.5, z: 1 }, scale: { x: .4, y: .6, z: .4 }, 
                                //rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Up(),  Math.PI / 8)
                                } },
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.mainMenuAnchor.id
		}
	});

    let displayScreen4 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.screen,
		actor: {
			name: 'displayScreen4',
			transform: { local: { position: { x: 6, y: 2.5, z: 1 }, scale: { x: .4, y: .6, z: .4 }, 
                                //rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Up(),  Math.PI / 5)
                                } },
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: app.mainMenuAnchor.id
		}
	});

    let floorLight = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1162104712200192219',
		actor: {
			name: 'floorLight',
			parentId: app.mainMenuAnchor.id,
			transform: { 
				local: { 
					position: { x: 0, y: -.5, z: 0 }, 
					scale: { x: 2, y: .5, z: 2 },
					//rotation: { x: 0, y: -1, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

    let introComputer = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.WorkStationWithAlerts,
        actor: {
            name: 'computer',
            parentId: app.mainMenuAnchor.id,
            transform: { 
                local: { 
                    position: { x: .8, y: -3, z: 0 }, 
                    //scale: { x: 2, y: .8, z: 2 },
                    rotation: { x: 0, y: -1, z: 0 }
                }
            },
            collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
        }
    });

    let introInstruction = displayImage(app, IMAGES.PopUp_Intro_Instructions, 
        { x: 0, y: .8, z: -1 }, { x: .32, y: .2, z: .001 })
                                

    updateMiniScreen(app, displayScreen1, "main-menu-grab-drop.png");
    updateMiniScreen(app, displayScreen2, "main-menu-teleport.png");
    updateMiniScreen(app, displayScreen3, "main-menu-turn-move.png");
    updateMiniScreen(app, displayScreen4, "main-menu-select.png");

    // TEST CODE !TODO
    testCode(app);

    let introInstructionBackGroundButton = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.screen,
		actor: {
			name: 'introInstructionBackGroundButton',
            appearance: {enabled: false},
			transform: { local: {  scale: { x: .95, y: .9, z: .4 }, 
                                } },
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
			parentId: introInstruction.id
		}
	});
    introInstructionBackGroundButton.setBehavior(MRE.ButtonBehavior).onClick(user => {

        introInstruction.destroy();
        let tempName: string;
        let notFound = false;
        while (!notFound) {
            tempName = genName(app);
            notFound = SCORE.isAvailableTeamName(app, tempName);
        }
        app.teamName = tempName;
        app.teamScore = 0;
        SCORE.saveFinalScoreInit(app, app.teamName, 0);
        SCOREBOARD.createTeamNameDisplay(app);
        console.log("My Team Name Is:")
        console.log(app.teamName)

        moveScreenAway(app, displayScreen1, {x: -14, y: 2.5, z: -5});
        moveScreenAway(app, displayScreen2, {x: -14, y: 2.5, z: -1});
        moveScreenAway(app, displayScreen3, {x: 13.7, y: 2.5, z: -1});
        moveScreenAway(app, displayScreen4, {x: 13.7, y: 2.5, z: -5});

        rotateScreenAway(app, displayScreen1, MRE.Vector3.Down());
        rotateScreenAway(app, displayScreen2, MRE.Vector3.Down());
        rotateScreenAway(app, displayScreen3, MRE.Vector3.Up());
        rotateScreenAway(app, displayScreen4, MRE.Vector3.Up());

        startExperienceAvatarPartOne(app);
        moveObject(app, introComputer,{x: 0, y: 3, z: 0}, 10);
        setTimeout(() => {
            
            let displayScreentexture = app.assets.createTexture(IMAGES.PopUp_Intro_ShowPossible , { uri: IMAGES.PopUp_Intro_ShowPossible });
            let displayScreenMaterial = app.assets.createMaterial(IMAGES.PopUp_Intro_ShowPossible, {
                mainTextureId: displayScreentexture.id,
                mainTextureScale: { x: 1, y: 1 },
                emissiveTextureId: displayScreentexture.id,
                emissiveTextureScale: { x: 1, y: 1 },
                emissiveColor: new MRE.Color3(1, 1, 1),
                alphaMode: MRE.AlphaMode.Blend
            });
            let showTheFutureMainDisplay = MRE.Actor.Create(app.context, {
                actor: {
                    name: IMAGES.PopUp_Intro_ShowPossible,
                    transform: { local: { position: { x: 0, y: 1.7, z: -.6 } , scale: {x:.15, y: .12, z:.001 } } },
                    collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
                    appearance: {
                        meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id,
                        materialId: displayScreenMaterial.id,
                        enabled: true 
                    },
                    parentId: app.mainMenuAnchor.id
                }
            });

            // invisble button spanning
            let showTheFutureButton = MRE.Actor.CreateFromLibrary(app.context, {
                resourceId: ARTIFACT.screen,
                actor: {
                    name: "showTheFutureButton",
                    //transform: { local: { position: { x: 0, y: 1.7, z: -.6 },
                    //                        }}, //scale: { x: .2, y: .12, z: .1 } } },
                    collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
                    parentId: showTheFutureMainDisplay.id
                }
            });

            showTheFutureButton.appearance.enabled = false;

            showTheFutureButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
                showTheFutureButton.setBehavior(MRE.ButtonBehavior);
                fadeOutAway(app, introComputer, 10);
                fadeOutAway(app,showTheFutureMainDisplay, 10)
                setTimeout(() => {
                    introComputer.destroy();
                    showTheFutureButton.destroy();
                    showTheFutureMainDisplay.destroy();
                },5000);
                setUpTableWarehouse(app);
                startExperienceAvatarPartTwo(app);
            });
        }, getAudioLength(app.assets, startIntroPart1String) * 1000);
    });
}
function setUpTableWarehouse(app: StoryBoard) {

    app.tableWarehouseAnchor = MRE.Actor.Create(app.context);

    let myTable = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.table,
        actor: {
            name: 'Table',
            parentId: app.tableWarehouseAnchor.id,
            transform: { 
                local: { 
                    position: { x: 0, y: -1, z: 0 },
                    //position: { x: 0, y: -3, z: 0 }, 
                    scale: { x: 2, y: .6, z: 2 },
                    rotation: { x: 0, y: 1, z: 0 }
                }
            },
            collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
        }
    });

    let miniWarehouse = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.FactoryFloor,
        actor: {
            name: 'miniWarehouse',
            parentId: app.tableWarehouseAnchor.id,
            transform: {
                local: {
                    position:{ x: -.0325, y: -.55, z: 0.15 }, // { x: .5, y: -.65, z: 0 },
                    rotation: MRE.Quaternion.RotationAxis(Vector3.Down(), Math.PI/2),
                    scale: { x: .1, y: .1, z: .1 }
                    //position: { x: .5, y: -2.65, z: 0 },
                    //rotation: { x: 0, y: 1, z: 0 },
                    //scale: { x: .6, y: .6, z: .6 }
                }
            },
            //collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
        }
    });

    moveObject(app, myTable,{x: 0, y: 1, z: 0}, 12);
    moveObject(app, miniWarehouse,{x: 0, y: 1, z: 0}, 12);

    setTimeout(() => {
        let expandWarehouseAnimData = app.assets.createAnimationData(
            "expandWarehouse",
            {
                tracks: [{
                    target: MRE.ActorPath("someBall").transform.local.scale,
                    keyframes: [{time: 0, value: miniWarehouse.transform.local.scale},
                                {time: 8, value: { x: .6, y: .6, z: .6 }} ],
                    easing: MRE.AnimationEaseCurves.Linear
                }]
        });
        let rotateWarehouseAnimData = app.assets.createAnimationData(
            "rotateWarehouse",
            {
                tracks: [{
                    target: MRE.ActorPath("someBall").transform.local.rotation,
                    keyframes: [{time: 0, value: miniWarehouse.transform.local.rotation},
                                {time: 8, value: MRE.Quaternion.RotationAxis(Vector3.Up(), Math.PI/2)}],
                    easing: MRE.AnimationEaseCurves.Linear
                }]
        });
        rotateWarehouseAnimData.bind({ someBall: miniWarehouse }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Once});
        expandWarehouseAnimData.bind({ someBall: miniWarehouse }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Once});

    }, (getAudioLength(app.assets, startIntroPart2String) * 1000) - 8000);

    setTimeout(() => {
        startExperienceAvatarPartThree(app);
    },getAudioLength(app.assets, startIntroPart2String) * 1000);

    let timeBeforeAlertOne = (getAudioLength(app.assets, startIntroPart2String) * 1000) + (getAudioLength(app.assets, startIntroPart3String) * 1000)
    
    setTimeout(() => {
        alertStepAccessManagementStart(app);
    }, timeBeforeAlertOne);
}

export function endStoryScreens(app: StoryBoard){
    
    app.frontWallAnchor.destroy();
    app.teamNameAnchor.destroy();

    let outroCongratulations = displayImageSolid(app, IMAGES.PopUp_Outro_Congratulations, 
        { x: -1.5, y: 2.5, z: 0 }, { x: .3, y: .5, z: .001 });
    let outroScoreBreakdown = displayImageSolid(app, IMAGES.PopUp_Outro_Score, 
        { x: 1.5, y: 2.5, z: 0 }, { x: .3, y: .5, z: .001 });
    
    function textBox(location: any, content: string, height: number, anchorT : any){
        let teamName = MRE.Actor.Create(app.context, {
            actor: {
                transform: { local: { 
                    position: location
                } },
            text: {
                contents: content,
                height: height,
                anchor: anchorT,
                justify: MRE.TextJustify.Center,
                font: FONT,
                color: MRE.Color3.White()
            },
            parentId: app.mainMenuAnchor.id
            }
        });
    }
    let spacing = .185
    textBox({ x: -1.5, y:  2.48, z: -.0001 } , app.teamName, 0.2, MRE.TextAnchorLocation.MiddleCenter);
    textBox({ x: 2.3, y:  3.05, z: -.0001 } , app.teamScoreAccessManagement + "/500", 0.1, MRE.TextAnchorLocation.MiddleRight);
    textBox({ x: 2.3, y:  3.05 - spacing, z: -.0001 } , app.teamScoreAccessManagemenTimeBonus + "/150", 0.1, MRE.TextAnchorLocation.MiddleRight);
    textBox({ x: 2.3, y:  3.05 - spacing * 2, z: -.0001 } , app.teamScoreConnectivity + "/500", 0.1, MRE.TextAnchorLocation.MiddleRight);
    textBox({ x: 2.3, y:  3.05 - spacing * 3, z: -.0001 } , app.teamScoreConnectivityTimeBonus + "/180", 0.1, MRE.TextAnchorLocation.MiddleRight);
    textBox({ x: 2.3, y:  3.05 - spacing * 4, z: -.0001 } , app.teamScoreVulnerability + "/1000", 0.1, MRE.TextAnchorLocation.MiddleRight);
    textBox({ x: 2.3, y:  3.05 - spacing * 5, z: -.0001 } , app.teamScoreVulnerabilityTimeBonus + "/300", 0.1, MRE.TextAnchorLocation.MiddleRight);
    textBox({ x: 2.3, y:  3.05 - 1.34, z: -.0001 } , app.teamScore + "", 0.1, MRE.TextAnchorLocation.MiddleRight);
}

function testCode(app: StoryBoard){
    let dev = 0;
    /*
    app.teamName = "Some Team Name Bird"
    app.teamScore = 4543;
	app.teamScoreAccessManagement = 345;
	app.teamScoreConnectivity = 445;
	app.teamScoreVulnerability = 1000 ;
	app.teamScoreAccessManagemenTimeBonus = 443;
	app.teamScoreConnectivityTimeBonus = 4;
	app.teamScoreVulnerabilityTimeBonus = 44;
    endStoryScreens(app);
    */
    if(dev == 2){
        alertStepConnectivityStart(app);
    }else if(dev == 3){
        alertStepVulnerabilityStart(app);
    }else if(dev == 1){
        setTimeout(() => {
            alertStepAccessManagementStart(app);
        }, 5000);
    }else if(dev == 20){
        let OPTION1Count = 2;
        let OPTION2Count = 2;
        let OPTION3Count = 0;
        if ((OPTION1Count == 0) && (OPTION2Count == 0) && (OPTION3Count == 0) ){
            console.log("ignore")
        }else{
            if (OPTION1Count > OPTION2Count){
                if(OPTION1Count > OPTION3Count){
                    console.log("first")
                }
                else{
                    console.log("ignore")
                }
            }else{
                if(OPTION2Count > OPTION3Count){
                    console.log("second")
                }else{
                    console.log("ignore")
                }
            }
        }
    }

    if( dev == 1 || dev == 2 || dev == 3){
        app.tableWarehouseAnchor = MRE.Actor.Create(app.context);
        app.mainMenuAnchor.findChildrenByName(IMAGES.PopUp_Intro_Instructions,false)[0].destroy();
        app.mainMenuAnchor.findChildrenByName("displayScreen1",false)[0].destroy();
        app.mainMenuAnchor.findChildrenByName("displayScreen2",false)[0].destroy();
        app.mainMenuAnchor.findChildrenByName("displayScreen3",false)[0].destroy();
        app.mainMenuAnchor.findChildrenByName("displayScreen4",false)[0].destroy();

        let myTable = MRE.Actor.CreateFromLibrary(app.context, {
            resourceId: ARTIFACT.table,
            actor: {
                name: 'Table',
                parentId: app.tableWarehouseAnchor.id,
                transform: { 
                    local: { 
                        position: { x: 0, y: -1, z: 0 },
                        //position: { x: 0, y: -3, z: 0 }, 
                        scale: { x: 2, y: .6, z: 2 },
                        rotation: { x: 0, y: 1, z: 0 }
                    }
                },
                collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
            }
        });
    
        let miniWarehouse = MRE.Actor.CreateFromLibrary(app.context, {
            resourceId: ARTIFACT.FactoryFloor,
            actor: {
                name: 'miniWarehouse',
                parentId: app.tableWarehouseAnchor.id,
                transform: {
                    local: {
                        position: { x: -.0325, y: -.55, z: 0.15 }, //{ x: .5, y: -.65, z: 0 },
                        rotation: MRE.Quaternion.RotationAxis(Vector3.Down(), Math.PI/2),
                        scale: { x: .1, y: .1, z: .1 }
                    }
                },
                 }
        });


    
        moveObject(app, myTable,{x: 0, y: 1, z: 0}, 1);
        moveObject(app, miniWarehouse,{x: 0, y: 1, z: 0}, 1);

        let expandWarehouseAnimData = app.assets.createAnimationData(
            "expandWarehouse",
            {
                tracks: [{
                    target: MRE.ActorPath("someBall").transform.local.scale,
                    keyframes: [{time: 0, value: miniWarehouse.transform.local.scale},
                                {time: 2, value: { x: .6, y: .6, z: .6 }} ],
                    easing: MRE.AnimationEaseCurves.Linear
                }]
        });
        let rotateWarehouseAnimData = app.assets.createAnimationData(
            "rotateWarehouse",
            {
                tracks: [{
                    target: MRE.ActorPath("someBall").transform.local.rotation,
                    keyframes: [{time: 0, value: miniWarehouse.transform.local.rotation},
                                {time: 2, value: MRE.Quaternion.RotationAxis(Vector3.Up(), Math.PI/2)}],
                    easing: MRE.AnimationEaseCurves.Linear
                }]
        });
        rotateWarehouseAnimData.bind({ someBall: miniWarehouse }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Once});
        expandWarehouseAnimData.bind({ someBall: miniWarehouse }, { isPlaying: true, wrapMode: MRE.AnimationWrapMode.Once});

    }
}