import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import * as ARTIFACT from './artifact';
import { endAudioString, getAudioLength, playIntroAudioPart1, playIntroAudioPart2, playIntroAudioPart3, playEndAudio, startIntroPart1String, startIntroPart2String, startIntroPart3String } from './audio';

export const FONT = MRE.TextFontFamily.SansSerif;

let floorLightLocation = { x: 3.2, y: -.5, z: 0 };
let startAvatarLocation = { x: 3.2, y: 0, z: 0 };

export function setupAvatarAnchor(app: StoryBoard) {
    app.avatarAnchor = MRE.Actor.Create(app.context);

    let floorLight = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.floorLight,
		actor: {
			name: 'floorLight',
			parentId: app.avatarAnchor.id,
			transform: { 
				local: { 
					position: floorLightLocation, 
					scale: { x: .8, y: .5, z: .8 },
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});
}

export function startExperienceAvatarPartOne(app: StoryBoard) {
    let wayOfWorkingAvatar = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.christineTalking,
		actor: {
			name: 'wayOfWorkingAvatar',
			parentId: app.avatarAnchor.id,
			transform: { 
				local: { 
					position: startAvatarLocation, 
					rotation:  {x: 0, y: -1.8, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

    playIntroAudioPart1(app.assets, app.avatarAnchor);
    setTimeout(() => {
            wayOfWorkingAvatar.destroy()
        }, getAudioLength(app.assets, startIntroPart1String) * 1000);
}

export function startExperienceAvatarPartTwo(app: StoryBoard) {
    let wayOfWorkingAvatar = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.christineTalking,
		actor: {
			name: 'wayOfWorkingAvatar',
			parentId: app.avatarAnchor.id,
			transform: { 
				local: { 
					position: startAvatarLocation, 
					rotation:  {x: 0, y: -1.8, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

    playIntroAudioPart2(app.assets, app.avatarAnchor);
    setTimeout(() => {
            wayOfWorkingAvatar.destroy()
        }, getAudioLength(app.assets, startIntroPart2String) * 1000);
}

export function startExperienceAvatarPartThree(app: StoryBoard) {
    let wayOfWorkingAvatar = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.christineTalking,
		actor: {
			name: 'wayOfWorkingAvatar',
			parentId: app.avatarAnchor.id,
			transform: { 
				local: { 
					position: startAvatarLocation, 
					rotation:  {x: 0, y: -1.8, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

    playIntroAudioPart3(app.assets, app.avatarAnchor);
    setTimeout(() => {
            wayOfWorkingAvatar.destroy()
        }, getAudioLength(app.assets, startIntroPart3String) * 1000);
}

export function endExperienceAvatar(app: StoryBoard) {
    let wayOfWorkingAvatar = MRE.Actor.CreateFromLibrary(app.context, {
		resourceId: ARTIFACT.aahilTalking,
		actor: {
			name: 'wayOfWorkingAvatarEnd',
			parentId: app.avatarAnchor.id,
			transform: { 
				local: { 
					position: startAvatarLocation, 
					rotation:  {x: 0, y: -1.8, z: 0 }
				}
			},
			collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: .2, y: .2, z: .2 } } }
		}
	});

    playEndAudio(app.assets, app.avatarAnchor);
    setTimeout(() => {
            wayOfWorkingAvatar.destroy()
        }, getAudioLength(app.assets, endAudioString) * 1000);

}

