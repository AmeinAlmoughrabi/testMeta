import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export const startAudioString = 'startAudio';
export const startNewWayOfWorkingString = 'startNewWayOfWorking'
export const endAudioString = 'endAudio';
export const alertThreeAudioString = 'alertThreeAudio';

function play(assets: MRE.AssetContainer, actor: MRE.Actor, name: string, volume_out: number){
	let sound = assets.sounds.find(x => x.name === name);
	actor.startSound(sound.id, {
		volume: volume_out,
		//volume: .0000000001,
		looping: false,
		doppler: 0.0,
		spread: 0.7,
		rolloffStartDistance: 10000
	});
}

export function preloadAudio(assets: MRE.AssetContainer) {
	assets.createSound(
		startAudioString, { uri: 'audio-setup.ogg'}
	);
	assets.createSound(
		startNewWayOfWorkingString, { uri: 'audio-intro.mp3'}
	);
	assets.createSound(
		endAudioString, { uri: 'audio-outro.mp3'}
	);
	assets.createSound(
		alertThreeAudioString, { uri: 'audio-nokia-tune.ogg'}
	);
}

export function getAudioLength(assets: MRE.AssetContainer, audioString: string){
	return assets.sounds.find(x=> x.name == audioString).duration;
}

export function playStartAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, startAudioString, 0.5)
}

export function playStartNewWayOfWorkingAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, startNewWayOfWorkingString, 0.9)
}

export function playEndAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, endAudioString, 0.5)
}

export function playAlertThreeAudio(assets: MRE.AssetContainer, actor: MRE.Actor){
	play(assets, actor, alertThreeAudioString, 0.04)
}