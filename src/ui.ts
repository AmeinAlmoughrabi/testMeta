import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor, Appearance, MreArgumentError } from '@microsoft/mixed-reality-extension-sdk';
import { generateKeyPairSync } from 'crypto';
import { start } from 'repl';
import { startAlertOne } from './alertOne';
import { startAlertTwo } from './alertTwo';
import { startAlertThree } from './alertThree';
import { startScoreboard } from './assets';
import StoryBoard from "./app"
import { playStartAudio, startNewWayOfWorkingString, startAudioString, playStartNewWayOfWorkingAudio, playEndAudio,endAudioString, playAlertThreeAudio, getAudioLength} from './audio';

export const FONT = MRE.TextFontFamily.SansSerif;

const animationUpDistanceY = 3;

export function showActor(actor: MRE.Actor) {
	actor.appearance.enabled = true;
}

export function hideActor(actor: MRE.Actor) {
	actor.appearance.enabled = false;
}

export function delay(milliseconds: number): Promise<void> {
	return new Promise<void>((resolve) => {
	  setTimeout(() => resolve(), milliseconds);
	});
}

export function myLocation(actor: MRE.Actor) {
	let elementInfo = actor.transform.toJSON();
	let currentElemlocationX = elementInfo.local.position.x;
	let currentElemlocationY = elementInfo.local.position.y;
	let currentElemlocationZ = elementInfo.local.position.z;
	console.log(actor.name)
	console.log("x: " + currentElemlocationX.toString())
	console.log("y: " + currentElemlocationY.toString())
	console.log("z: " + currentElemlocationZ.toString())
}

export function startIntroduction(app: StoryBoard): MRE.Actor {

	const anchorActor = MRE.Actor.Create(app.context);

	const setUpAvatar = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2127848811328962660',
		actor: {
			name: 'setUpAvatar',
			parentId: anchorActor.id,
			transform: { 
				local: { 
					position: app.avatarLocation, 
					//scale: { x: 2, y: .8, z: 2 },
					rotation: app.avatarRotation
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	const floorLight = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1162104712200192219',
		actor: {
			name: 'floorLight',
			parentId: anchorActor.id,
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
	let startAudioLength = getAudioLength(app.assets, startAudioString) * 1000;
	
	playStartAudio(app.assets, anchorActor);

	let introComputer =  MRE.Actor.Create(app.context);

	setTimeout(() => {
		introComputer = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2130837278413554193',
			actor: {
				name: 'computer',
				parentId: anchorActor.id,
				transform: { 
					local: { 
						position: { x: .8, y: 0, z: 0 }, 
						//scale: { x: 2, y: .8, z: 2 },
						rotation: { x: 0, y: -1, z: 0 }
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
			}
		});
	}, startAudioLength - 32000);

	setTimeout(() => {

		const buttonBehavior = introComputer.setBehavior(MRE.ButtonBehavior);
	
		buttonBehavior.onClick( user => {
				// use the convenience function "AnimateTo" instead of creating the animation data in advance
				MRE.Animation.AnimateTo(app.context, introComputer, {
					destination: { transform: { local: { position: { x: .8, y: -3, z: 0 } } } },
					duration: 6,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				setTimeout(function() {
					createTable(app)
				  }, 2 * 1000);
				setTimeout(function(){
					introComputer.destroy()
				}, (6 * 1000));
			});

		setUpAvatar.destroy();
	} ,(startAudioLength));
	
	return anchorActor
}

export function createTable(app: StoryBoard) {

	const wayOfWorkingAvatar = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2125596229931893017',
		actor: {
			name: 'wayOfWorkingAvatar',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: app.avatarLocation, 
					//scale: { x: 2, y: .8, z: 2 },
					rotation: app.wayOfWorkingAvatarRotation
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});


	playStartNewWayOfWorkingAudio(app.assets, app.anchorActor);
	setTimeout(() => {
		wayOfWorkingAvatar.destroy();
	}, getAudioLength(app.assets, startNewWayOfWorkingString) * 1000);


	const myTable = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1138731296642564775',
		actor: {
			name: 'Table',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: { x: 0, y: 0 - animationUpDistanceY, z: 0 }, 
					scale: { x: 2, y: .8, z: 2 },
					rotation: { x: 0, y: 1, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	let startText = MRE.Actor.Create(app.context, {
		actor: {
			name: 'startText',
			parentId: app.anchorActor.id,
			transform: {
				local: { position: { x: 0, y: 1.7 - animationUpDistanceY, z: 0 } }
			},
			text: {
				contents: "Big Air Fasteners\nTerminal\n(Press Button\nto Begin)",
				font: FONT,
				justify: MRE.TextJustify.Center,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				//color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
				height: 0.3
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	let theButton = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1162104204731351706',
		actor: {
			name: 'theButton',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: { x: 0, y: .6 - animationUpDistanceY, z: 0 },
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
		}
	});

	let listOfActors = [myTable, startText, theButton]
	
	listOfActors.forEach(element => {
		let elementInfo = element.transform.toJSON();
		let currentElemlocationX = elementInfo.local.position.x;
		let currentElemlocationY = elementInfo.local.position.y;
		let currentElemlocationZ = elementInfo.local.position.z;

		MRE.Animation.AnimateTo(app.context, element, {
			destination: { transform: { local: { 
											position: { 
												x: currentElemlocationX, 
												y: currentElemlocationY + animationUpDistanceY,
				 								z: currentElemlocationZ } 
											} } },
			duration: 6,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		});
	});

	theButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
		startText.destroy();
		theButton.destroy();
		displayalertMenu(app);
	});
	
}

export function alertMenuTable(app: StoryBoard) {
	app.anchorActor.destroy();

	app.anchorActor = MRE.Actor.Create(app.context);

	let floorLight = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1162104712200192219',
		actor: {
			name: 'floorLight',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: { x: 0, y: -.5, z: 0 }, 
					scale: { x: 2, y: .5, z: 2 },
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	let myTable = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1138731296642564775',
		actor: {
			name: 'myTable',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: { x: 0, y: 0, z: 0 }, 
					scale: { x: 2, y: .8, z: 2 },
					rotation: { x: 0, y: 1, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

	if(app.alertThreeCompletionStatus === true){

		const endStoryAvatar = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2127800586186260598',
			actor: {
				name: 'endStoryAvatar',
				parentId: app.anchorActor.id,
				transform: { 
					local: { 
						position: app.avatarLocation, 
						//scale: { x: 2, y: .8, z: 2 },
						rotation: app.wayOfWorkingAvatarRotation
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
			}
		});
	
	
		playEndAudio(app.assets, app.anchorActor);
		setTimeout(() => {
			endStoryAvatar.destroy();
		}, getAudioLength(app.assets, endAudioString) * 1000);
	

		playEndAudio(app.assets, app.anchorActor);

		MRE.Animation.AnimateTo(app.context, myTable, {
			destination: { transform: { local: { 
											position: { 
												x: 0, 
												y: - animationUpDistanceY,
				 								z: 0 } 
											} } },
			duration: 10,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		});
		
		MRE.Animation.AnimateTo(app.context, floorLight, {
			destination: { transform: { local: { 
											position: { 
												x: 0, 
												y: -.15,
				 								z: 0 } 
											} } },
			duration: 6,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		});
		
		setTimeout(function() {
			MRE.Animation.AnimateTo(app.context, floorLight, {
				destination: { transform: { local: { 
												scale: { 
													x: 0, 
													y: 0,
													 z: 0 } 
												} } },
				duration: 3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		  }, 4 * 1000);
	} else {
		displayalertMenu(app);
	}
}

function displayalertMenu(app: StoryBoard) {

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

	let alertOneButtonUpdate = MRE.Actor.Create(app.context);
	let alertTwoButtonUpdate = MRE.Actor.Create(app.context);
		
		
	let alertOneButton = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2121995536583098565',
		actor: {
			name: 'alertOneButton',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: { x: 1.6, y: 1.2, z: .15 }, 
					scale: { x: .6, y: .6, z: .6},
					rotation: { x: 0, y: 1, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
		}
	});

	let alertTwoButton = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2121995536583098565',
		actor: {
			name: 'alertTwoButton',
			parentId: app.anchorActor.id,
			transform: { 
				local: { 
					position: { x: -.6, y: 1.2, z: .15 }, 
					scale: { x: .6, y: .6, z: .6},
					rotation: { x: 0, y: 1, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
		}
	});

	alertOneButton.setBehavior(MRE.ButtonBehavior).onClick(user => {

		alertOneButton.destroy();
		alertTwoButton.destroy();
		alertOneButtonUpdate.destroy();
		alertTwoButtonUpdate.destroy();
		startAlertOne(app);
		miniWarehouse.destroy();
	});
	alertTwoButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
		alertOneButton.destroy();
		alertTwoButton.destroy();
		alertOneButtonUpdate.destroy();
		alertTwoButtonUpdate.destroy();
		startAlertTwo(app);
		miniWarehouse.destroy();

	});

	if(app.alertOneCompletionStatus === true){
		alertOneButton.destroy();
		alertOneButtonUpdate.destroy();
		alertOneButtonUpdate = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2121995564240339284',
			actor: {
				name: 'alertOneButton',
				parentId: app.anchorActor.id,
				transform: { 
					local: { 
						position: { x: 1.6, y: 1.2, z: .15 }, 
						scale: { x: .6, y: .6, z: .6},
						rotation: { x: 0, y: 1, z: 0 }
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
			}
		});
	}
	
	if(app.alertTwoCompletionStatus == true){
		alertTwoButton.destroy();
		alertOneButtonUpdate.destroy();
		alertTwoButtonUpdate = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2121995564240339284',
			actor: {
				name: 'alertTwoButton',
				parentId: app.anchorActor.id,
				transform: { 
					local: { 
						position: { x: -.6, y: 1.2, z: .15 }, 
						scale: { x: .6, y: .6, z: .6},
						rotation: { x: 0, y: 1, z: 0 }
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
			}
		});
	}

	if( (app.alertOneCompletionStatus === true) && (app.alertTwoCompletionStatus === true)) {
		playAlertThreeAudio(app.assets, app.anchorActor);
		alertOneButton.destroy();
		alertTwoButton.destroy();
		alertOneButtonUpdate.destroy();
		alertTwoButtonUpdate.destroy();

		let alertThreeButton = MRE.Actor.CreateFromLibrary(app.context, {
			resourceId: 'artifact:2121995548771746002',
			actor: {
				name: 'alertThreeButton',
				parentId: app.anchorActor.id,
				transform: { 
					local: { 
						position: { x: -1.6, y: 1.2, z: .15 }, 
						scale: { x: .6, y: .6, z: .6},
						rotation: { x: 0, y: 1, z: 0 }
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
			}
		});
		alertThreeButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
			startAlertThree(app);
			miniWarehouse.destroy();
			alertThreeButton.destroy();
		});
	}

}