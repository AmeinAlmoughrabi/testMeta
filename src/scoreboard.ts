import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import * as ARTIFACT from "./artifact";
import { count } from "console";
import fs from 'fs';
import { Actor, Context } from "@microsoft/mixed-reality-extension-sdk";

let scoreText: MRE.Actor;
export const FONT = MRE.TextFontFamily.SansSerif;

export function createTeamNameDisplay(app: StoryBoard){
    app.teamNameAnchor = MRE.Actor.Create(app.context);

	let displayScreentexture = app.assets.createTexture("teamName" , { uri: "PopUp_TeamNameAndScore.png" });
    let displayScreenMaterial = app.assets.createMaterial("teamName", {
        mainTextureId: displayScreentexture.id,
        mainTextureScale: { x: 1, y: 1 },
        emissiveTextureId: displayScreentexture.id,
        emissiveTextureScale: { x: 1, y: 1 },
        emissiveColor: new MRE.Color3(1, 1, 1),
        alphaMode: MRE.AlphaMode.Mask
    });
    let backgroundImage = MRE.Actor.Create(app.context, {
        actor: {
            name: "teamName",
            transform: { local: { 
                    position: {x:9, y: 4.5, z: 4}, 
                    scale: {x: .5, y: .3, z: .001},
                    rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI / 8)
                } },
            collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
            appearance: {
                meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id,
                materialId: displayScreenMaterial.id
            },
            parentId: app.teamNameAnchor.id
        }
    });
    let teamName = MRE.Actor.Create(app.context, {
        actor: {
            transform: { local: { 
                position: {x:8.2, y: 4.35, z: 3.999}, 
                rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI / 8)
            } },
        text: {
            contents: app.teamName,
            height: 0.2,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.White()
        },
        parentId: app.teamNameAnchor.id
        }
    });
    scoreText = MRE.Actor.Create(app.context, {
        actor: {
            transform: { local: { 
                position: {x:10.02, y: 4.35, z: 3.999}, 
                rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI / 8)
            } },
        text: {
            contents: "0",
            height: 0.2,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.White()
        },
        parentId: app.teamNameAnchor.id
        }
    });
}

export function updateScoreBoard(app: StoryBoard){
    scoreText.text.contents = app.teamScore + ""
}

export function showScoreIncrement(app: StoryBoard, score: number){
    let scoreText = MRE.Actor.Create(app.context, {
        actor: {
            transform: { local: { 
                position: {x:10.02, y: 4, z: 3.999}, 
                rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI / 8)
            } },
        text: {
            contents: "+ " + score,
            height: 0.2,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.White()
        },
        parentId: app.teamNameAnchor.id
        }
    });
    setTimeout(() => {scoreText.destroy()}, 3000);
}