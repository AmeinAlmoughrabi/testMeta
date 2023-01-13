import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import * as MainMenu from './mainMenu';
import * as Audio from './audio';
import * as Texture from './texture';
import * as TalkingActor from './talkingActor';
import * as ARTIFACT from './artifact';
import { playCakeAudio, playRobotArmAudio } from './audio';
import { User } from '@microsoft/mixed-reality-extension-sdk';

export const FONT = MRE.TextFontFamily.SansSerif;

/**
 * The main class of this app. All the logic goes here.
 */
export default class StoryBoard {
	public assets: MRE.AssetContainer;

	public resetLeaderBoardAnchor: MRE.Actor;

	public avatarAnchor: MRE.Actor;
	public tableWarehouseAnchor: MRE.Actor;
	public frontWallAnchor: MRE.Actor;
	public musicBox1: MRE.Actor;
	public musicBox2: MRE.Actor;

	public mainMenuAnchor: MRE.Actor;
	public connectivityAnchor: MRE.Actor;
	public accessManagementAnchor: MRE.Actor;
	public vulnerabilityAnchor: MRE.Actor;

	public connectivityAnchorScreen: MRE.Actor;
	public accessManagementAnchorScreen: MRE.Actor;
	public vulnerabilityAnchorScreen: MRE.Actor;

	public teamNameAnchor: MRE.Actor;

	public decisionConnectivityAncor: MRE.Actor;
	public decisionVulnerabilityOrangeAncor: MRE.Actor;
	public decisionVulnerabilityRedAncor: MRE.Actor;
	public decisonAccessManagementAncor: MRE.Actor;

	public decisionAccessManagementLeftBottomAncor: MRE.Actor;
	public decisionAccessManagementRightBottomAncor: MRE.Actor;
	public decisionAccessManagementLeftTopAncor: MRE.Actor;
	public decisionAccessManagementRightTopAncor: MRE.Actor;

	public leaderboardAnchor: MRE.Actor;
	public leaderboardTextAnchor: MRE.Actor;
	public scoreboardAnchor: MRE.Actor;

	public alertAccessManagementCompletionStatus = false;
	public alertConnectivityCompletionStatus = false;
	public alertVulnerabilityCompletionStatus = false;

	public teamName: string;
	public teamScore: number;
	public teamScoreAccessManagement: number;
	public teamScoreConnectivity: number;
	public teamScoreVulnerability: number;
	public teamScoreAccessManagemenTimeBonus: number;
	public teamScoreConnectivityTimeBonus: number;
	public teamScoreVulnerabilityTimeBonus: number;

	constructor(public context: MRE.Context) {
		this.assets = new MRE.AssetContainer(context);
		this.context.onStarted(() => this.started());
		//MainMenu.displayMainMenu(this);
	}

	private async started() {
		console.log("avatar load.....");
		TalkingActor.setupAvatarAnchor(this);
		console.log("audio load......");
		Audio.preloadAudio(this.assets);
		console.log("image load......");
		Texture.preloadImages(this.assets);
		console.log("mesh load.......")
		Texture.preloadMesh(this.assets);
		console.log("start background music");
		this.playBackgroundMusic();
		console.log("start display main menu");
		MainMenu.displayMainMenu(this);
		//this.test();
	}

	private playBackgroundMusic(){
		this.musicBox1 = MRE.Actor.CreateFromLibrary(this.context, {
			resourceId: 'artifact:1143049292521407317',
			actor: {
				name: 'checkbox3',
				transform: {
					local: {position: {x:23.4, y:-6.38, z:-44.5}}
				}
			}
		});

		this.musicBox2 = MRE.Actor.CreateFromLibrary(this.context, {
			resourceId: 'artifact:1143049334246343528',
			actor: {
				name: 'checkbox3',
				transform: {
					local: {position: {x:0, y:-6.333, z:-31}}
				}
			}
		});
		let musicBox1Behavior = this.musicBox1.setBehavior(MRE.ButtonBehavior);
		let musicBox2Behavior = this.musicBox2.setBehavior(MRE.ButtonBehavior);

		musicBox1Behavior.onClick(user => {
			user.prompt("Get your hands off my Cake!")
		  });

		musicBox2Behavior.onClick(user => {
			user.prompt("Take a slice, leave some for the others!")
		  });

		playCakeAudio(this.assets, this.musicBox1);
		playRobotArmAudio(this.assets, this.musicBox2);

	}

	private test(){
		let x = MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI/2);
		let y = MRE.Quaternion.RotationAxis(MRE.Vector3.Up(), Math.PI/2);
		let z = MRE.Quaternion.RotationAxis(MRE.Vector3.Forward(), Math.PI/2);
		console.log("Print X Rotation");
		console.log(x);
		console.log("Print Y Rotation");
		console.log(y);
		console.log("Print Z Rotation");
		console.log(z);
		console.log("Print SUM Rotation");
		console.log(x.add(y).add(z));
	}
}
