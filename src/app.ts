import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import * as UI from './ui';
import { startAlertOne } from './alertOne';
import { startAlertTwo } from './alertTwo'
import { startAlertThree } from './alertThree';
import ColorMaterials from './colorMaterials';

import * as Audio from './audio';
import internal from 'assert';
import { startScoreboard } from './assets';

export const FONT = MRE.TextFontFamily.SansSerif;



/**
 * The main class of this app. All the logic goes here.
 */
export default class StoryBoard {
	public assets: MRE.AssetContainer;
	public anchorActor: MRE.Actor;
	public scoreboardActor: MRE.Actor;
	public leaderboardActor: MRE.Actor;
	public startAudioLength: number;
	public myRestartButton: MRE.Actor;
	public myStartStoryButton: MRE.Actor;
	public colors: ColorMaterials;

	public alertOneCompletionStatus = false;
	public alertTwoCompletionStatus = false;
	public alertThreeCompletionStatus = false;
	public currentActiveMemebers = 0;
	
	public avatarLocation = { x: 3.5, y: 0, z: 0 };
	public avatarRotation = { x: 0, y: 180, z: 0 };
	public wayOfWorkingAvatarRotation =  { x: 0, y: -1.8, z: 0 };

	constructor(public context: MRE.Context) {
		this.assets = new MRE.AssetContainer(context);
		this.context.onStarted(() => this.started());
		//this.context.onUserLeft(user => this.userLeft(user));
		//this.context.onUserJoined(user => this.userJoined(user));
		
	}
	
	private async started() {
		this.myRestartButton = this.restartButton();
		this.myStartStoryButton = this.startStoryButton();
		Audio.preloadAudio(this.assets);
		//this.testFunction();
	}

	private testFunction(){
		const anchorActor = MRE.Actor.Create(this.context);
		this.anchorActor = anchorActor;
		startAlertOne(this);
	}

	private restartExperience() {
		this.anchorActor.destroy();
		this.assets.unload();
		this.myRestartButton.destroy();
		this.myStartStoryButton.destroy();
		this.leaderboardActor.destroy();
		this.scoreboardActor.destroy();
		//this.miniWarehouse = null;
		this.alertOneCompletionStatus = false;
		this.alertTwoCompletionStatus = false;
		this.alertThreeCompletionStatus = false;
		this.assets = new MRE.AssetContainer(this.context);
		this.started();
	}

	private startStoryButton(){
		const startStoryButton = MRE.Actor.CreateFromLibrary(this.context, {
			resourceId: 'artifact:1807790962953420963',
			actor: {
				name: 'startStoryButton',
				transform: { 
					local: { 
						position: { x: 6, y: 1.7, z: 0 }, 
						scale: { x: 1.1, y: 1.1, z: 1.1 } 
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
			}
		});
		let startStoryButtonLabel = MRE.Actor.Create(this.context, {
			actor: {
			  transform: { local: { position: { x: 0.2, y: 0, z: 0 } } },
			  text: {
				contents: 'Start Button\nAlways Restart before Starting',
				height: 0.2,
				anchor: MRE.TextAnchorLocation.MiddleLeft,
				justify: MRE.TextJustify.Left,
				font: FONT
			  },
			  parentId: startStoryButton.id
			}
		});
		startStoryButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
			this.anchorActor = UI.startIntroduction(this);
			startScoreboard(this);
			startStoryButton.destroy();
		});
		return startStoryButton;
	}

	private restartButton() {
		const restartButton = MRE.Actor.CreateFromLibrary(this.context, {
			resourceId: 'artifact:1579239194507608147',
			actor: {
				name: 'restartButton',
				transform: { 
					local: { 
						position: { x: 6, y: .8, z: 0 }, 
						scale: { x: 1.1, y: 1.1, z: 1.1 } 
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
			}
		});
		let restartButtonLabel = MRE.Actor.Create(this.context, {
			actor: {
			  transform: { local: { position: { x: 0.2, y: 0, z: 0 } } },
			  text: {
				contents: 'Restart Button',
				height: 0.2,
				anchor: MRE.TextAnchorLocation.MiddleLeft,
				justify: MRE.TextJustify.Left,
				font: FONT
			  },
			  parentId: restartButton.id
			}
		});
		restartButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
			this.restartExperience()
		});
		return restartButton;
	}

}
