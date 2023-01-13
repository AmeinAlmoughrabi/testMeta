import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { start } from 'repl';
import ColorMaterials from './colorMaterials';

import StoryBoard from "./app";
import { alertMenuTable}  from "./ui";
import { playStartAudio } from './audio';
import { Actor, Appearance, Color3 } from '@microsoft/mixed-reality-extension-sdk';
import { Team } from './telemetry';
import { ConnectedUsers } from './telemetry';


export const FONT = MRE.TextFontFamily.SansSerif;

let onClickMachineStatus = 0;
let alertPhase = 0;

let shift_leaderboard_x = -1;
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
					scale: { x: .06, y: .06, z: .06 }
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

	

	const leaderboardScreen = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1338743673998803669',
		actor: {
			name: 'leaderboardScreen',
			// rotate 90 degrees around the x axis
			transform: { local: { position: { x: -3.6 + shift_leaderboard_x, y: 1.8, z: .7 }, rotation: MRE.Quaternion.FromEulerAngles(0, 0, -Math.PI / 2), scale: { x: 0, y: 0, z: 0 } } },
			parentId: app.anchorActor.id
		}
	});

	MRE.Animation.AnimateTo(app.context, leaderboardScreen, {
		destination: { transform: { local: { scale: { x: .25, y: .25, z: .25 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// create texture from image asset in public folder
	let leaderboardtexture = app.assets.createTexture("bgText", { uri: './public/leaderboard.png' });
	let leaderboardMaterial = app.assets.createMaterial("bgMaterial", {
		mainTextureId: leaderboardtexture.id,
		mainTextureScale: { x: 1, y: 1 },
		emissiveTextureId: leaderboardtexture.id,
		emissiveTextureScale: { x: 1, y: 1 },
		emissiveColor: new MRE.Color3(1, 1, 1)
	});
	let background2 = MRE.Actor.Create(app.context, {
		actor: {
			name: "leaderboardbackground",
			transform: { local: { position: { x: 0, y: 0, z: -0.02 } } }, // -Z is towards you when looking at the screen
			appearance: {
				meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id, // X is width, Y is height, Z is depth when looking at screen
				materialId: leaderboardMaterial.id
			},
			parentId: leaderboardScreen.id
		}
	});

	createAlertOneMachine(app);
	alertOnePhase(app);
}	

function createAlertOneMachine(app: StoryBoard) {
	// create a text box
	const text = MRE.Actor.Create(app.context, {
		actor: {
			name: 'LeaderBoard',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.58 + shift_leaderboard_x, y: 2.6, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "LeaderBoard",
				height: 0.2,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the text box
	MRE.Animation.AnimateTo(app.context, text, {
		destination: { transform: { local: { scale: { x: .7, y: .7, z: .7 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// create another text box
	const text2 = MRE.Actor.Create(app.context, {
		actor: {
			name: 'LeaderBoard',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.5 + shift_leaderboard_x, y: 2.35, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "Team              Money Saved",
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the text box
	MRE.Animation.AnimateTo(app.context, text2, {
		destination: { transform: { local: { scale: { x: .68, y: .68, z: .68 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// create another text box
	const text3 = MRE.Actor.Create(app.context, {
		actor: {
			name: 'LeaderBoard',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.5 + shift_leaderboard_x, y: 2.1, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "Team 1              $1,000,000",
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the text box
	MRE.Animation.AnimateTo(app.context, text3, {
		destination: { transform: { local: { scale: { x: .68, y: .68, z: .68 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// create another text box
	const text4 = MRE.Actor.Create(app.context, {
		actor: {
			name: 'LeaderBoard',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.5 + shift_leaderboard_x, y: 1.85, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "Team 2              $1,000,000",
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the text box
	MRE.Animation.AnimateTo(app.context, text4, {
		destination: { transform: { local: { scale: { x: .68, y: .68, z: .68 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// create another text box
	const text5 = MRE.Actor.Create(app.context, {
		actor: {
			name: 'LeaderBoard',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.5 + shift_leaderboard_x, y: 1.6, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "Team 3              $1,000,000",
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the text box
	MRE.Animation.AnimateTo(app.context, text5, {
		destination: { transform: { local: { scale: { x: .68, y: .68, z: .68 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// create another text box
	const text6 = MRE.Actor.Create(app.context, {
		actor: {
			name: 'LeaderBoard',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.8 + shift_leaderboard_x, y: 1.1, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "Funds: $1,000,000",
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the text box
	MRE.Animation.AnimateTo(app.context, text6, {
		destination: { transform: { local: { scale: { x: .6, y: .6, z: .6 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// make the funds go down by 1000 every second 
	let money = 1000000;
	setInterval(() => {
	setInterval(function () {
		money = money - 1000;
		text6.text.contents = "Funds: $" + money;
	}, 1000);
	}, 10000);

	// create a timer that counts down
	let timer = 10;
	const timerActor = MRE.Actor.Create(app.context, {
		actor: {
			name: 'Timer',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.5 + shift_leaderboard_x, y: 3, z: .5 },
					scale: { x: 1.5, y: 1.5, z: 1.5 }
				}
			},
			text: {
				contents: "Countdown to losing money: " + timer,
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 1, g: 0, b: 0 }
			}
		}
	});

	// decrease the timer every second
	setInterval(() => {
		timer--;
		timerActor.text.contents = "Countdown to losing money: " + timer;
	}, 1000);

	// destory the timer after 5 seconds
	setTimeout(() => {
		timerActor.destroy();
	}, 10000);

	// create a counter
	const counter = MRE.Actor.Create(app.context, {
		actor: {
			name: 'Counter',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: -3.8 + shift_leaderboard_x, y: 1, z: .5 },
					scale: { x: 0, y: 0, z: 0 }
				}
			},
			text: {
				contents: "Money Lost: $0",
				height: 0.1,
				anchor: MRE.TextAnchorLocation.MiddleCenter,
				color: { r: 0, g: 0, b: 0 }
			}
		}
	});

	// transform the counter
	MRE.Animation.AnimateTo(app.context, counter, {
		destination: { transform: { local: { scale: { x: .6, y: .6, z: .6 } } } },
		duration: 6,
		easing: MRE.AnimationEaseCurves.EaseOutSine
	});

	// increment the counter by 1000 every second
	let count = 0;
	setTimeout(() => {
		setInterval(() => {
			count = count + 1000;
			counter.text.contents = "Money Lost: $" + count;
		}, 1000);
	}, 10000);

	let alertMachineLocation = { x: 1.6, y: 1.2, z: .15 };
	
	let alertMachine = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2112700092199731767',
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

	alertMachineConnectivity(app, alertMachine, alertMachineLocation);
	
	const menuOption1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:1579238405710021245',
		actor: {
			name: 'menuOption1', // left/right, front/back up/down
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

	menuOption1.setBehavior(MRE.ButtonBehavior).onClick(user => {

			alertOnePhase(app);

		});

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
		// destory the alert machine
		alertMachine.destroy();
		// destory the menu options
		menuOption1.destroy();
		menuOption2.destroy();
		menuOption3.destroy();
		menuOption4.destroy();
		
		// save the value of the counter and money 
		let moneyLost = count;
		let moneySaved = money;
		// destory the count
		counter.destroy();
		// destory timer
		text6.destroy();

		// create text box with user score
		let score = MRE.Actor.Create(app.context, {
			actor: {
				name: 'score',
				parentId: app.anchorActor.id,
				transform: {
					local: {
							position: { x: -3.6, y: 1.1, z: .5 },
							scale: { x: 0.2, y: 0.2, z: 0.2 }
					}
				},
				text: {
					contents: "You lost $" + moneyLost + " but you saved the company!",
					height: 0.2,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 0, g: 0, b: 0 }
				}
			}
		});

		// create text box with user score
		let score2 = MRE.Actor.Create(app.context, {
			actor: {
				name: 'score2',
				parentId: app.anchorActor.id,
				transform: {
					local: {
							position: { x: -3.7, y: .9, z: .5 },
							scale: { x: 0.3, y: 0.3, z: 0.3 }
					}
				},
				text: {
					contents: "Money Saved: $" + moneySaved,
					height: 0.2,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 0, g: 0, b: 0 }
				}
			}
		});
		

		// create a clickable text box
		const menuOption1Text = MRE.Actor.Create(app.context, {
			actor: {
				name: 'menuOption1Text',
				parentId: app.anchorActor.id,
				transform: {
					local: {
						position: { x: 3, y: 1.7, z: .15 },
						scale: { x: 2, y: 2, z: 2 }
					}
				},
				text: {
					contents: "Congrats! You solved it! View your status on the leaderboard.\n click next to continue when you are ready.",

					height: 0.1,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 0, g: 0, b: 0 }
				}
			}
		});

		// create a new text box
		const menuOption1Text2 = MRE.Actor.Create(app.context, {
			actor: {
				name: 'menuOption1Text2',
				parentId: app.anchorActor.id,
				transform: {
					local: {
						position: { x: 3, y: 1.2, z: .15 },
						scale: { x: 2, y: 2, z: 2 }
					}
				},
				text: {
					contents: "Next Phase",
					height: 0.1,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 0, g: 0, b: 0 }
				}
			}
		});


		// when you click the text box, it disappears
		menuOption1Text2.setBehavior(MRE.ButtonBehavior).onClick(user => {
			finishAlertOne(app);
			menuOption1Text.destroy();
			menuOption1Text2.destroy();
		});
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

	let menuOption1label = MRE.Actor.Create(app.context, {
		actor: {
		  transform: { local: { position: { x: 0.2, y: 0, z: 0 } } },
		  text: {
			contents: 'More Info',
			height: 0.2,
			anchor: MRE.TextAnchorLocation.MiddleLeft,
			justify: MRE.TextJustify.Left,
			font: FONT
		  },
		  parentId: menuOption1.id
		}
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
				MRE.Animation.AnimateTo(app.context, menuOption1, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x + 1, y: alertMachineLocation.y + 1, z: alertMachineLocation.z },
								scale: { x: 1, y: 1, z: 1 }
							}
						}
					},
					duration: 3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
				MRE.Animation.AnimateTo(app.context, menuOption2, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineLocation.x + 1, y: alertMachineLocation.y + .5, z: alertMachineLocation.z },
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
								position: { x: alertMachineLocation.x + 1, y: alertMachineLocation.y, z: alertMachineLocation.z },
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
								position: { x: alertMachineLocation.x + 1, y: alertMachineLocation.y - .5, z: alertMachineLocation.z },
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
				MRE.Animation.AnimateTo(app.context, menuOption1, {
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
}

function alertMachineConnectivity(app: StoryBoard, alertMachine: Actor, alertMachineLocation: { x: number; y: number; z: number; }) {

	let alertMachineIntruder = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2119898008060428501',
		actor: {
			name: 'alertMachineIntruder',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: 1.6, y: 1.5, z: -1.5 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .3, y: .3, z: .3 }
				}
			},
		}
	});

	let alertMachinePC1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2119898008186257622',
		actor: {
			name: 'alertMachinePC1',
			parentId: app.anchorActor.id,
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
		resourceId: 'artifact:2119898008186257622',
		actor: {
			name: 'alertMachinePC2',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: .2, y: 1, z: -.6 },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .15, y: .15, z: .15 }
				}
			},
		}
	});

	// use artifact ID 989569762738569432 to get the 3D model of the ball with a collider
	let alertMachineBall1 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289302236168721',
		actor: {
			name: 'alertMachineBall1',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall2 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289302236168721',
		actor: {
			name: 'alertMachineBall2',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall3 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289302236168721',
		actor: {
			name: 'alertMachineBall3',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall4 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289302236168721',
		actor: {
			name: 'alertMachineBall4',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall5 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289302236168721',
		actor: {
			name: 'alertMachineBall5',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall6 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289302236168721',
		actor: {
			name: 'alertMachineBall6',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall7 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall7',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall8 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall8',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall9 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall9',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall10 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall10',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall11 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall11',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall12 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall12',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall13 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall13',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall14 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall14',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall15 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall15',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall16 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall16',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall17 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall17',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				}
			},
		}
	});

	let alertMachineBall18 = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: 'artifact:2126289315867656728',
		actor: {
			name: 'alertMachineBall18',
			parentId: app.anchorActor.id,
			transform: {
				local: {
					position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					rotation: { x: 0, y: 90, z: 0 },
					scale: { x: .08, y: .08, z: .08 }
				},
			},
		}
	});
	

	// animate the balls moving towards alertMachine and teleporting back to their original position
	function animateAlertMachineBall1() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall1, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
					},
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall1, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall1();
			});
		});
	}

	function animateAlertMachineBall2() {
			MRE.Animation.AnimateTo(app.context, alertMachineBall2, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 1.5,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				MRE.Animation.AnimateTo(app.context, alertMachineBall2, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
							}
						}
					},
					duration: 0.01,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				}).then(() => {
					animateAlertMachineBall2();
				});
			});
		
	}

	function animateAlertMachineBall3() {
			MRE.Animation.AnimateTo(app.context, alertMachineBall3, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 1.5,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				MRE.Animation.AnimateTo(app.context, alertMachineBall3, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
							}
						}
					},
					duration: 0.01,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				}).then(() => {
					animateAlertMachineBall3();
				});
			});

	}

	function animateAlertMachineBall4() {
			MRE.Animation.AnimateTo(app.context, alertMachineBall4, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 1.5,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				MRE.Animation.AnimateTo(app.context, alertMachineBall4, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
							}
						}
					},
					duration: 0.01,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				}).then(() => {
					animateAlertMachineBall4();
				});
			});
	
	}

	function animateAlertMachineBall5() {
			MRE.Animation.AnimateTo(app.context, alertMachineBall5, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 1.5,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				MRE.Animation.AnimateTo(app.context, alertMachineBall5, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
							}
						}
					},
					duration: 0.01,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				}).then(() => {
					animateAlertMachineBall5();
				});
			});

	}

	function animateAlertMachineBall6() {
			MRE.Animation.AnimateTo(app.context, alertMachineBall6, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 1.5,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				// teleport the ball to the intruder
				MRE.Animation.AnimateTo(app.context, alertMachineBall6, {
					destination: {
						transform: {
							local: {
								position: { x: alertMachineIntruder.transform.local.position.x, y: alertMachineIntruder.transform.local.position.y, z: alertMachineIntruder.transform.local.position.z },
							}
						}
					},
					duration: 0.01,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				}).then(() => {
					animateAlertMachineBall6();
				});
			});	
	}

	function animateAlertMachineBall7() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall7, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall7, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall7();
			});
		});
	}

	function animateAlertMachineBall8() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall8, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall8, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall8();
			});
		});
	}

	function animateAlertMachineBall9() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall9, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall9, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall9();
			});
		});
	}

	function animateAlertMachineBall10() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall10, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall10, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall10();
			});
		});
	}

	function animateAlertMachineBall11() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall11, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall11, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall11();
			});
		});
	}

	function animateAlertMachineBall12() {
			MRE.Animation.AnimateTo(app.context, alertMachineBall12, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC1.transform.local.position.x, y: alertMachinePC1.transform.local.position.y, z: alertMachinePC1.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall12, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall12();
			});
		});
	}

	function animateAlertMachineBall13() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall13, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall13, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall13();
			});
		});
	}

	function animateAlertMachineBall14() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall14, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall14, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall14();
			});
		});
	}

	function animateAlertMachineBall15() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall15, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall15, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall15();
			});
		});
	}

	function animateAlertMachineBall16() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall16, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall16, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall16();
			});
		});
	}

	function animateAlertMachineBall17() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall17, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall17, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall17();
			});
		});
	}

	function animateAlertMachineBall18() {
		MRE.Animation.AnimateTo(app.context, alertMachineBall18, {
			destination: {
				transform: {
					local: {
						position: { x: alertMachinePC2.transform.local.position.x, y: alertMachinePC2.transform.local.position.y, z: alertMachinePC2.transform.local.position.z },
					}
				}
			},
			duration: 1.5,
			easing: MRE.AnimationEaseCurves.EaseOutSine
		}).then(() => {
			MRE.Animation.AnimateTo(app.context, alertMachineBall18, {
				destination: {
					transform: {
						local: {
							position: { x: alertMachine.transform.local.position.x, y: alertMachine.transform.local.position.y, z: alertMachine.transform.local.position.z },
						}
					}
				},
				duration: 0.01,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			}).then(() => {
				animateAlertMachineBall18();
			});
		});
	}

	// run the animations one after the other with a delay between them
	function animateAlertMachine() {
		setTimeout(() => {
			animateAlertMachineBall1();
		}, 0);
		
		setTimeout(() => {
			animateAlertMachineBall7();
		}, 0);
		
		setTimeout(() => {
			animateAlertMachineBall13();
		}, 0);	
		
		setTimeout(() => {
			animateAlertMachineBall2();
		}, 250);
		
		setTimeout(() => {
			animateAlertMachineBall8();
		}, 250);

		setTimeout(() => {
			animateAlertMachineBall14();
		}, 
		250);

		setTimeout(() => {
			animateAlertMachineBall3();
		}
			, 500);

		setTimeout(() => {
			animateAlertMachineBall9();
		}, 500);

		setTimeout(() => {
			animateAlertMachineBall15();
		}, 500);

		setTimeout(() => {
			animateAlertMachineBall4();
		}
			, 750);

		setTimeout(() => {
			animateAlertMachineBall10();
		}, 750);

		setTimeout(() => {
			animateAlertMachineBall16();
		}, 750);

		setTimeout(() => {
			animateAlertMachineBall5();
		}
			, 1000);
		
		setTimeout(() => {
			animateAlertMachineBall11();
		}
			, 1000);
		
		setTimeout(() => {
			animateAlertMachineBall17();
		}
			, 1000);

		setTimeout(() => {
			animateAlertMachineBall6();
		}
			, 1250);

		setTimeout(() => {
			animateAlertMachineBall12();
		}
			, 1250);
		
		setTimeout(() => {
			animateAlertMachineBall18();
		}
			, 1250);

	}

	// run the animations
	animateAlertMachine();


	// Red 2119898008060428501
	// Green 2119898008186257622

	
}

function alertOnePhase(app: StoryBoard) {

	switch (alertPhase) {
		case 0:
			let backgroundTextureCase0 = app.assets.createTexture("bgTex", { uri: 'alert-take-action.png' });
			let backgroundMaterialCase0 = app.assets.createMaterial("bgMat", {
				mainTextureId: backgroundTextureCase0.id,
				mainTextureScale: { x: 1, y: 1 },
				emissiveTextureId: backgroundTextureCase0.id,
				emissiveTextureScale: { x: 1, y: 1 },
				emissiveColor: new MRE.Color3(1, 1, 1)
			});
			let background = MRE.Actor.Create(app.context, {
				actor: {
					name: "mainScreenBackground",
					transform: { local: { position: { x: 0, y: 0, z: -0.02 } } }, // -Z is towards you when looking at the screen
					appearance: {
						meshId: app.assets.createBoxMesh("cube", 7.8, 4.38, 0.02).id, // X is width, Y is height, Z is depth when looking at screen
						materialId: backgroundMaterialCase0.id
					},
					parentId: app.anchorActor.findChildrenByName("mainScreen", false)[0].id
				}
			});
			break;
		case 1:
			let backgroundTextureCase1 = app.assets.createTexture("bgTexLogo", { uri: 'idea.jpeg' });
			let backgroundMaterialCase1 = app.assets.createMaterial("bgTexLogo", {
				mainTextureId: backgroundTextureCase1.id,
				mainTextureScale: { x: 1, y: 1 },
				emissiveTextureId: backgroundTextureCase1.id,
				emissiveTextureScale: { x: 1, y: 1 },
				emissiveColor: new MRE.Color3(1, 1, 1)
			});
			app.anchorActor.findChildrenByName("mainScreenBackground", true)[0].appearance.materialId = backgroundMaterialCase1.id;
			break;
		case 2:
			let backgroundTextureCase2 = app.assets.createTexture("bgTexLogo2", { uri: 'innovation.jpeg' });
			let backgroundMaterialCase2 = app.assets.createMaterial("bgTexLogo2", {
				mainTextureId: backgroundTextureCase2.id,
				mainTextureScale: { x: 1, y: 1 },
				emissiveTextureId: backgroundTextureCase2.id,
				emissiveTextureScale: { x: 1, y: 1 },
				emissiveColor: new MRE.Color3(1, 1, 1)
			});
			app.anchorActor.findChildrenByName("mainScreenBackground", true)[0].appearance.materialId = backgroundMaterialCase2.id;
			app.anchorActor.findChildrenByName("menuOption1", false)[0].destroy()
			break;
		default:
			//Code Block
	}
	alertPhase = alertPhase + 1;
}

function finishAlertOne(app: StoryBoard) {
	app.alertOneCompletionStatus = true;
	alertMenuTable(app);
}

export function restartAlertOne(app: StoryBoard) {
	onClickMachineStatus = Number(0);
	alertPhase = Number(0);
}


