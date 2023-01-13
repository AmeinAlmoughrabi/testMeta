import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import * as ARTIFACT from "./artifact";
import * as IMAGES from "./images";
import * as UTIL from "./util";
import * as EXCLUDE from "./excludeVotingList";
import * as SCOREBOARD from './scoreboard';
import { createTimer, stopTimer, startTimer } from './timer';
import { ppid } from 'process';

export const FONT = MRE.TextFontFamily.SansSerif;


function displayImage(app: StoryBoard, image: string, location: any, size: any): MRE.Actor {
	let displayScreentexture = app.assets.createTexture(image , { uri: image });
    let displayScreenMaterial = app.assets.createMaterial(image, {
        mainTextureId: displayScreentexture.id,
        mainTextureScale: { x: 1, y: 1 },
        emissiveTextureId: displayScreentexture.id,
        emissiveTextureScale: { x: 1, y: 1 },
        emissiveColor: new MRE.Color3(1, 1, 1),
        alphaMode: MRE.AlphaMode.Blend,
        
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
            parentId: app.decisonAccessManagementAncor.id
        }
    });

	return backgroundImage
}

function checkIfEveryoneVoted(app: StoryBoard, ELIGIBLE_VOTERS: MRE.User[], 
    ELIGIBLE_VOTES: {[key: string] : number}): boolean {
    // Define Eligible Voters
    let everyoneVoted = true;

    for (let i = 0; i < ELIGIBLE_VOTERS.length; i++) {
        if(ELIGIBLE_VOTES[ELIGIBLE_VOTERS[i].name] == 0){
            everyoneVoted = false
        }
    }
    return everyoneVoted
}

function impact(app: StoryBoard, image: string, 
    waitingTime: number, decisonLocation : any, finishDecison: (app: StoryBoard) => void){

    let accessManagementImpactLoc = { x: 2.5, y: decisonLocation.y - .2, z: decisonLocation.z };
    let accessManagementImpact = displayImage(app, image, 
        accessManagementImpactLoc, {x: .29, y: .33, z: .01})

    setTimeout(() => {
        decisionScreenEnd(app);
        finishDecison(app);
    }, 1000 * waitingTime);
}

function impactOnVote(app: StoryBoard, 
    OPTION1Count: number, OPTION2Count: number, OPTION3Count: number,
    decisonLocation : any, waitingTime: number, finishDecison: (app: StoryBoard) => void){

        let duration: number;
        let score: number;

        if ((OPTION1Count == 0) && (OPTION2Count == 0) && (OPTION3Count == 0) ){
            //Default third option
            duration = 74999;
            score = 0;
            app.teamScore = app.teamScore + 0;
            SCOREBOARD.showScoreIncrement(app, 0)
            impact(app, IMAGES.PopUp_Access_ImpactIgnore,
                waitingTime, decisonLocation, finishDecison)
        }else{
            let voteDuration = stopTimer("accessManagement");
            duration = Math.min(74999,voteDuration);
            if (OPTION1Count > OPTION2Count){
                if(OPTION1Count > OPTION3Count){
                    // checklist 1 wins
                    score = 500;
                    app.teamScore = app.teamScore + 500;
                    SCOREBOARD.showScoreIncrement(app, 500)
                    impact(app, IMAGES.PopUp_Access_ImpactRevoke, 
                        waitingTime, decisonLocation, finishDecison)
                }
                else{
                    // checklist 3 wins
                    score = 100;
                    app.teamScore = app.teamScore + 100;
                    SCOREBOARD.showScoreIncrement(app, 100)
                    impact(app, IMAGES.PopUp_Access_ImpactIgnore, 
                        waitingTime, decisonLocation, finishDecison)
                }
            }else{
                if(OPTION2Count > OPTION3Count){
                    // checklist 2 wins
                    score = 300;
                    app.teamScore = app.teamScore + 300;
                    SCOREBOARD.showScoreIncrement(app, 300);
                    impact(app, IMAGES.PopUp_Access_ImpactFlag, 
                        waitingTime, decisonLocation, finishDecison)
                }else{
                    //checklist 3 wins
                    score = 100;
                    app.teamScore = app.teamScore + 100;
                    SCOREBOARD.showScoreIncrement(app, 100)
                    impact(app, IMAGES.PopUp_Access_ImpactIgnore, 
                        waitingTime, decisonLocation, finishDecison)
                }
            }
        }
        SCOREBOARD.updateScoreBoard(app);

        setTimeout(() => {
            let decisionTimeScore = Math.round(((75000 - duration) * 2) / 1000);
            console.log(decisionTimeScore);
            app.teamScore = app.teamScore + decisionTimeScore;
            SCOREBOARD.showScoreIncrement(app, decisionTimeScore);
            SCOREBOARD.updateScoreBoard(app);
            app.teamScoreAccessManagement = score;
            app.teamScoreAccessManagemenTimeBonus = decisionTimeScore;
        }, 3500);
}

export function decisionScreenAccessManagement(app: StoryBoard, decisonLocation: {x:number, y: number, z: number},
    finishDecison: (app: StoryBoard) => void) {

    let decisionTimer = 75;
    createTimer("accessManagement");
	startTimer("accessManagement");

    app.decisonAccessManagementAncor = MRE.Actor.Create(app.context);
    
    let itemsToDestroy: MRE.Actor [] = [];
    let ELIGIBLE_VOTERS: MRE.User[] = [];
    let ELIGIBLE_VOTES: {[key: string] : number} = {};
    
    let OPTION1Count: number;
    let OPTION2Count: number;
    let OPTION3Count: number;

    // Define Eligible Voters
    let TEMP_ELIGIBLE_VOTERS = app.context.users;
    
    console.log(TEMP_ELIGIBLE_VOTERS);

    //ELIGIBLE_VOTERS = TEMP_ELIGIBLE_VOTERS;
    
    ELIGIBLE_VOTERS = TEMP_ELIGIBLE_VOTERS.filter(function(item) {
        return !EXCLUDE.EXCLUDE_VOTING_IDS.includes(item.name);
    });

    for (let i = 0; i < ELIGIBLE_VOTERS.length; i++) {
        ELIGIBLE_VOTES[ELIGIBLE_VOTERS[i].name] = 0;
    }
    OPTION1Count = 0;
    OPTION2Count = 0;
    OPTION3Count = 0;

    let popupConnectivityScale = {x:.2, y: .525, z:.001 }

	let popVulnerability = displayImage(app, IMAGES.PopUp_Access_RecommendedActions, 
		decisonLocation, popupConnectivityScale)

    let decisonLocationImpact = {x: decisonLocation.x - 2, y:decisonLocation.y, z: decisonLocation.z }
    let popupConnectivityScaleImpact = {x:.23, y: .35, z:.001 }

    let popVulnerabilityImpact = displayImage(app, IMAGES.PopUp_Access_ImpactRed, 
        decisonLocationImpact, popupConnectivityScaleImpact)

    let decisonLocationKnown = {x: decisonLocation.x - 4, y:decisonLocation.y, z: decisonLocation.z }
    let popupConnectivityScaleKnown = {x:.23, y: .4, z:.001 }
    let popVulnerabilityKnown = displayImage(app, IMAGES.PopUp_Access_Mismatch, 
        decisonLocationKnown, popupConnectivityScaleKnown)

    itemsToDestroy.push(popVulnerability);
    itemsToDestroy.push(popVulnerabilityImpact);
    itemsToDestroy.push(popVulnerabilityKnown);

    let checkboxLoc1 = {x: decisonLocation.x - .198, y: decisonLocation.y + .469, z: decisonLocation.z}
    let checkboxLoc2 = {x: decisonLocation.x - .198, y: decisonLocation.y + .049, z: decisonLocation.z}
    let checkboxLoc3 = {x: decisonLocation.x - .198, y: decisonLocation.y - .379, z: decisonLocation.z}

    let checkboxVoteBackLoc1 = {x: decisonLocation.x + .47, y: decisonLocation.y + .469, z: decisonLocation.z - .005}
    let checkboxVoteBackLoc2 = {x: decisonLocation.x + .47, y: decisonLocation.y + .049, z: decisonLocation.z - .005}
    let checkboxVoteBackLoc3 = {x: decisonLocation.x + .47, y: decisonLocation.y - .379, z: decisonLocation.z - .005}

    let checkboxVoteLoc1 = {x: decisonLocation.x + .47, y: decisonLocation.y + .469, z: decisonLocation.z - .01}
    let checkboxVoteLoc2 = {x: decisonLocation.x + .47, y: decisonLocation.y + .049, z: decisonLocation.z - .01}
    let checkboxVoteLoc3 = {x: decisonLocation.x + .47, y: decisonLocation.y - .379, z: decisonLocation.z - .01}
    

    let countdownBackLoc = {x: decisonLocation.x + .287, y: decisonLocation.y - .773, z: decisonLocation.z - .005}
    let countdownLoc = {x: decisonLocation.x + .287, y: decisonLocation.y - .773, z: decisonLocation.z - .01}
    
    let checkbox1 = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox1',
            parentId: app.decisonAccessManagementAncor.id,
            appearance: {enabled: false},
            transform: {
                local: {
                    position: checkboxLoc1,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .1, y: .07, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(checkbox1);
    let checkbox1label = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox1',
            parentId: app.decisonAccessManagementAncor.id,
            //appearance: {enabled: false},
            transform: {
                local: {
                    position: checkboxVoteBackLoc1,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .023, y: .045, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(checkbox1label);
    let checkbox1labelVotes = MRE.Actor.Create(app.context, {
        actor: {
        transform: { local: { position: checkboxVoteLoc1 } },
        text: {
            contents: "0",
            height: 0.2,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.White()
        },
        parentId: app.decisonAccessManagementAncor.id
        }
    });
    itemsToDestroy.push(checkbox1labelVotes);
    let checkbox2 = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox2',
            parentId: app.decisonAccessManagementAncor.id,
            appearance: {enabled: false},
            transform: {
                local: {
                    position: checkboxLoc2,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .1, y: .07, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(checkbox2);
    let checkbox2label = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox2',
            parentId: app.decisonAccessManagementAncor.id,
            //appearance: {enabled: false},
            transform: {
                local: {
                    position: checkboxVoteBackLoc2,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .023, y: .045, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(checkbox2label);
    let checkbox2labelVotes = MRE.Actor.Create(app.context, {
        actor: {
        transform: { local: { position: checkboxVoteLoc2 } },
        text: {
            contents: "0",
            height: 0.2,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.White()
        },
        parentId: app.decisonAccessManagementAncor.id,
        }
    });
    itemsToDestroy.push(checkbox2labelVotes);
    let checkbox3 = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox3',
            parentId: app.decisonAccessManagementAncor.id,
            appearance: {enabled: false},
            transform: {
                local: {
                    position: checkboxLoc3,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .1, y: .07, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(checkbox3);
    let checkbox3label = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox3',
            parentId: app.decisonAccessManagementAncor.id,
            //appearance: {enabled: false},
            transform: {
                local: {
                    position: checkboxVoteBackLoc3,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .023, y: .045, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(checkbox3label);
    let checkbox3labelVotes = MRE.Actor.Create(app.context, {
        actor: {
        transform: { local: { position: checkboxVoteLoc3 } },
        text: {
            contents: "0",
            height: 0.2,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.White()
        },
        parentId: app.decisonAccessManagementAncor.id,
        }
    });
    itemsToDestroy.push(checkbox3labelVotes);
    let countdownBack = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: ARTIFACT.screen,
        actor: {
            name: 'checkbox3',
            parentId: app.decisonAccessManagementAncor.id,
            //appearance: {enabled: false},
            transform: {
                local: {
                    position: countdownBackLoc,
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: .023, y: .045, z: .1 }
                }
            },
        }
    });
    itemsToDestroy.push(countdownBack);
    let countdownShow = MRE.Actor.Create(app.context, {
        actor: {
        transform: { local: { position: countdownLoc } },
        text: {
            contents: "X",
            height: 0.1,
            anchor: MRE.TextAnchorLocation.MiddleCenter,
            justify: MRE.TextJustify.Center,
            font: FONT,
            color: MRE.Color3.Yellow()
        },
        parentId: app.decisonAccessManagementAncor.id
        }
    });
    itemsToDestroy.push(countdownShow);

    let counter = decisionTimer;
    countdownShow.text.contents = counter + "";
    let decisionInterval = setInterval(() => {
        counter = counter - 1;
        countdownShow.text.contents = counter + "";
        if(counter === 0){
            itemsToDestroy.forEach( (element) => {
                element.destroy();
            });
            clearInterval(decisionInterval);
            impactOnVote(app, 
                OPTION1Count, OPTION2Count, OPTION3Count, decisonLocation,10,
                finishDecison)
        }
    }, 1000); 

    // Define Button Action
    checkbox1.setBehavior(MRE.ButtonBehavior).onClick(user => {
        ELIGIBLE_VOTES[user.name] = ELIGIBLE_VOTES[user.name] + 1;
        if(ELIGIBLE_VOTES[user.name] == 1){
            OPTION1Count = OPTION1Count + 1;
            checkbox1labelVotes.text.contents = "" + OPTION1Count;
            if(checkIfEveryoneVoted(app, ELIGIBLE_VOTERS, ELIGIBLE_VOTES)){
                clearInterval(decisionInterval);
                setTimeout(() => {
                    itemsToDestroy.forEach( (element) => {
                        element.destroy();
                    });
                    impactOnVote(app,
                        OPTION1Count, OPTION2Count, OPTION3Count, decisonLocation, 10,
                        finishDecison)
                },2000);
            }
        }

    });
    checkbox2.setBehavior(MRE.ButtonBehavior).onClick(user => {
        ELIGIBLE_VOTES[user.name] = ELIGIBLE_VOTES[user.name] + 1;
        if(ELIGIBLE_VOTES[user.name] == 1){
            OPTION2Count = OPTION2Count + 1;
            checkbox2labelVotes.text.contents = "" + OPTION2Count;
            if(checkIfEveryoneVoted(app, ELIGIBLE_VOTERS, ELIGIBLE_VOTES)){
                clearInterval(decisionInterval);
                setTimeout(() => {
                    itemsToDestroy.forEach( (element) => {
                        element.destroy();
                    });
                    impactOnVote(app,
                        OPTION1Count, OPTION2Count, OPTION3Count, decisonLocation, 10,
                        finishDecison)
                },2000);
            }
        }
    });
    checkbox3.setBehavior(MRE.ButtonBehavior).onClick(user => {
        ELIGIBLE_VOTES[user.name] = ELIGIBLE_VOTES[user.name] + 1;
        if(ELIGIBLE_VOTES[user.name] == 1){
            OPTION3Count = OPTION3Count + 1
            checkbox3labelVotes.text.contents = "" + OPTION3Count;
            if(checkIfEveryoneVoted(app, ELIGIBLE_VOTERS, ELIGIBLE_VOTES)){
                clearInterval(decisionInterval);
                setTimeout(() => {
                    itemsToDestroy.forEach( (element) => {
                        element.destroy();
                    });
                    impactOnVote(app,
                        OPTION1Count, OPTION2Count, OPTION3Count, decisonLocation, 10,
                        finishDecison)
                },2000);
            }
        }
    });
}

export function decisionScreenEnd(app: StoryBoard) {
    app.decisonAccessManagementAncor.destroy();
}