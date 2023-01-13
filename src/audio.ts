import * as MRE from '@microsoft/mixed-reality-extension-sdk';


export const startIntroPart1String = "startIntroPart1";
export const startIntroPart2String = "startIntroPart2";
export const startIntroPart3String = "startIntroPart3";

export const endAudioString = 'endAudio';
export const cakeAudioString = 'cakeAudio';
export const robotArmString = 'robotArm';

export const instructionAccessString = "instructionAccess";
export const instructionConnectivityString = "instructionConnectivity";
export const instructionVulnerabilitiesString = "instructionVulnerabilities";


function play(assets: MRE.AssetContainer, actor: MRE.Actor, name: string, volume_out: number, rolloffStartDistance_val: number, loopingVal: boolean){
	let sound = assets.sounds.find(x => x.name === name);
	actor.startSound(sound.id, {
		volume: volume_out,
		looping: loopingVal,
		doppler: 0.0,
		spread: 0.7,
		rolloffStartDistance: rolloffStartDistance_val
	});
}

export function preloadAudio(assets: MRE.AssetContainer) {
	assets.createSound(
		startIntroPart1String, { uri: 'audio-intro-part-1.mp3'}
	);
	assets.createSound(
		startIntroPart2String, { uri: 'audio-intro-part-2.mp3'}
	);
	assets.createSound(
		startIntroPart3String, { uri: 'audio-intro-part-3.mp3'}
	);
	assets.createSound(
		endAudioString, { uri: 'audio-outro.mp3'}
	);
	assets.createSound(
		cakeAudioString, { uri: 'cake_audio.mp3'}
	);
	assets.createSound(
		robotArmString, { uri: 'factory_sound.mp3'}
	);
	assets.createSound(
		instructionAccessString, { uri: 'audio-instructions-access.mp3'}
	);
	assets.createSound(
		instructionConnectivityString, { uri: 'audio-instructions-connectivity.mp3'}
	);
	assets.createSound(
		instructionVulnerabilitiesString, { uri: 'audio-instructions-vulnerabilities.mp3'}
	);
}

export function getAudioLength(assets: MRE.AssetContainer, audioString: string){
	return assets.sounds.find(x=> x.name == audioString).duration;
}

export function playIntroAudioPart1(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, startIntroPart1String, 1, 10000, false)
}

export function playIntroAudioPart2(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, startIntroPart2String, 1,10000, false)
}
export function playIntroAudioPart3(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, startIntroPart3String, 1,10000, false)
}

export function playEndAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, endAudioString, 0.6,10000, false)
}

export function playCakeAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, cakeAudioString, 0.5, .09, true)
}

export function playRobotArmAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, robotArmString, 0.8, .1, true)
}

export function playInstructionAccessAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, instructionAccessString, 1, 10000, false)
}
export function playInstructionConnectivityAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, instructionConnectivityString, 1, 10000, false)
}
export function playInstructionVulnerabilitiesAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, instructionVulnerabilitiesString, 1, 10000, false)
}

