import StoryBoard from "./app";
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { count } from "console";
import fs from 'fs';
import { Actor, Context } from "@microsoft/mixed-reality-extension-sdk";

let moneyInterval: NodeJS.Timeout;
let money = 1000000;
let moneyLost = 0;
let moneyLocal = 0;
let moneyLostLocal = 0;

// read data from a leaderboard.json to an array
const dataArray = JSON.parse(fs.readFileSync('./telemetry/leaderboard.json', 'utf-8'))
// create an array from dataArray
let leaderboardArray: { team: string; moneySaved: number; time: string; moneyLost: number; }[] = [];
for (let i = 0; i < dataArray.length; i++) {
    leaderboardArray.push(dataArray[i]);
}




// function to start interval
function startInterval(app: StoryBoard) {
    moneyInterval = setInterval(function () {
        money -= 1000;
        moneyLost += 1000;

    }, 1000);
}

export function stopScorebard(app: StoryBoard) {

    function countItems() {
        let counts = 1;
        for (let i in dataArray) {
            counts++;
        }
        return counts;
    }

    let counts = countItems();

    clearInterval(moneyInterval);
    moneyLocal = money;
    moneyLostLocal = moneyLost;

    money = 1000000;
    moneyLost = 0;


    // call leaderboard outside, but modify its values when stopScoardboard is called
    // give leaderboard its own anchor as well


    //save the list of users, their scores, and the current time with a unique id
    leaderboardArray.push({ team: "Team " + counts, moneySaved: moneyLocal, moneyLost: moneyLostLocal, time: new Date().toLocaleString() });


    // write the array to the file
    fs.writeFile('./telemetry/leaderboard.json', JSON.stringify(leaderboardArray), function writeJSON(err: any) {
        if (err) return console.log(err);
        console.log(JSON.stringify(dataArray));
        console.log('writing to ' + './telemetry/leaderboard.json');
    });

    // get the top 3 scores
    let top3scores = leaderboardArray.sort((a, b) => b.moneySaved - a.moneySaved).slice(0, 3);

    // destroy scoreboard anchor
    app.scoreboardActor.destroy();

    function createLeaderboard(app: StoryBoard) {

        const leaderboardScreen = MRE.Actor.CreateFromLibrary(app.context, {
            resourceId: 'artifact:1338743673998803669',
            actor: {
                name: 'leaderboardScreen',
                // rotate 90 degrees around the x axis
                transform: { local: { position: { x: -5.6, y: 1.88, z: 1 }, rotation: MRE.Quaternion.FromEulerAngles(0, 0, -Math.PI / 2), scale: { x: 0, y: 0, z: 0 } } },
                parentId: app.scoreboardActor.id
            }
        });

        animateText(leaderboardScreen, app, .25);

        let leaderboardtexture = app.assets.createTexture("bgText", { uri: 'leaderboard-background.jpeg' });
        let leaderboardMaterial = app.assets.createMaterial("bgMaterial", {
            mainTextureId: leaderboardtexture.id,
            mainTextureScale: { x: 1, y: 1 },
            emissiveTextureId: leaderboardtexture.id,
            emissiveTextureScale: { x: 1, y: 1 },
            emissiveColor: new MRE.Color3(1, 1, 1)
        });
        let leaderboardBackground = MRE.Actor.Create(app.context, {
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

        // set delay of 2 seconds
        setTimeout(function () {
            // create a text box
            let leaderboardTitle = createTextBox(app, "Leaderboard", -5.6, 2.75, .97, 0.2, MRE.Color3.Black());
            animateText(leaderboardTitle, app, .7);

            let instructions = createTextBox(app, "Team               Money Saved", -5.58, 2.5, .97, 0.1, MRE.Color3.Black());
            animateText(instructions, app, .68);

            let Team1 = createTextBox(app, top3scores[0].team + "             $" + top3scores[0].moneySaved, -5.58, 2.25, .97, 0.1, MRE.Color3.Black());
            animateText(Team1, app, .68);

            let Team2 = createTextBox(app, top3scores[1].team + "             $" + top3scores[1].moneySaved, -5.58, 2, .97, 0.1, MRE.Color3.Black());
            animateText(Team2, app, .68);

            let Team3 = createTextBox(app, top3scores[2].team + "             $" + top3scores[2].moneySaved, -5.58, 1.75, .97, 0.1, MRE.Color3.Black());
            animateText(Team3, app, .68);

            let congrats = createTextBox(app, "Congratulations!", -5.58, 1.25, .97, 0.2, MRE.Color3.Black());
            animateText(congrats, app, .6);


            let money = 1000000;

            let youSaved = createTextBox(app, "You saved your company", -5.58, 1.125, .97, 0.125, MRE.Color3.Black());
            animateText(youSaved, app, .6);

            let moneySaved = createTextBox(app, "$" + moneyLocal + "!", -5.58, 1, .97, 0.125, MRE.Color3.Black());
            animateText(moneySaved, app, .6);

            // if moneyLocal is greater than top3scores[2].moneySaved
            if (moneyLocal > top3scores[2].moneySaved) {
                // set delay of 4 seconds
                let youWon = createTextBox(app, "You made it to the Leaderboard!", -5.58, 0.75, .97, 0.2, MRE.Color3.Green());
                animateText(youWon, app, .6);

            }
            // if moneyLocal matches one of the top3scores, set that text to green
            if (moneyLocal == top3scores[0].moneySaved) {
                Team1.text.color = MRE.Color3.Green();
            }
            else if (moneyLocal == top3scores[1].moneySaved) {
                Team2.text.color = MRE.Color3.Green();
            }
            else if (moneyLocal == top3scores[2].moneySaved) {
                Team3.text.color = MRE.Color3.Green();
            }

        }, 2000);



    }

    createLeaderboard(app);

}




function createTextBox(app: StoryBoard, text: string, x: number, y: number, z: number, height: number, color: MRE.Color3) {
    let textBox = MRE.Actor.Create(app.context, {
        actor: {
            name: 'scoreBoard',
            parentId: app.scoreboardActor.id,
            transform: {
                local: {
                    position: { x: x, y: y, z: z },
                    scale: { x: 0, y: 0, z: 0 }
                }
            },
            text: {
                contents: text,
                height: height,
                anchor: MRE.TextAnchorLocation.MiddleCenter,
                color: color
            }
        }
    });
    return textBox;
}

function animateText(text: MRE.Actor, app: StoryBoard, scale: number) {
    MRE.Animation.AnimateTo(app.context, text, {
        destination: { transform: { local: { scale: { x: scale, y: scale, z: scale } } } },
        duration: 6,
        easing: MRE.AnimationEaseCurves.EaseOutSine
    });
}


function createScoreboard(app: StoryBoard) {



    const scoreboardScreen = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: 'artifact:1338743673998803669',
        actor: {
            name: 'scoreboardScreen',
            // rotate 90 degrees around the x axis
            transform: { local: { position: { x: -4.375, y: 2.55, z: 1 }, rotation: MRE.Quaternion.FromEulerAngles(0, 0, -Math.PI), scale: { x: 0, y: 0, z: 0 } } },
            parentId: app.scoreboardActor.id
        }
    });

    animateText(scoreboardScreen, app, .15);

    let countdownTimer = 10;

    let scoreBoard = createTextBox(app, "Scoreboard!", -4.375, 2.75, .97, 0.2, MRE.Color3.Black());
    let startingFunds = createTextBox(app, "Starting Funds: $1,000,000", -4.375, 2.55, .97, 0.1, MRE.Color3.Black());
    let currentFunds = createTextBox(app, "Current Funds: $" + money, -4.375, 2.45, .97, 0.1, MRE.Color3.Black());
    let Moneylost = createTextBox(app, "Money Lost: $" + moneyLost, -4.375, 2.35, .97, 0.1, new MRE.Color3(.5, 0, 0));
    let countdown = createTextBox(app, "Countdown Begins in: " + countdownTimer, -4.375, 3.1, .97, 0.33, MRE.Color3.Yellow());

    let waited = setTimeout(function () {
        animateText(startingFunds, app, 0.6)
        animateText(scoreBoard, app, 0.6);
        animateText(currentFunds, app, 0.6)
        animateText(Moneylost, app, 0.6)
        animateText(countdown, app, 0.6)
    }
        , 2000);



    let warningSign = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: 'artifact:1150512916215103929',
        actor: {
            name: 'warningSign',
            transform: { local: { position: { x: -5.775, y: 3.1, z: 1 }, rotation: MRE.Quaternion.FromEulerAngles(-Math.PI, 0, -Math.PI), scale: { x: 0, y: 0, z: 0 } } },
            parentId: app.scoreboardActor.id
        }
    });
    let warningSign2 = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: 'artifact:1150512916215103929',
        actor: {
            name: 'warningSign2',
            transform: { local: { position: { x: -2.975, y: 3.1, z: 1 }, rotation: MRE.Quaternion.FromEulerAngles(-Math.PI, 0, -Math.PI), scale: { x: 0, y: 0, z: 0 } } },
            parentId: app.scoreboardActor.id
        }
    });

    animateText(warningSign, app, .5);
    animateText(warningSign2, app, .5);

    /* countdown timer */

    setTimeout(function () {
        let countInterval = setInterval(function () {
            countdownTimer--;
            countdown.text.contents = "Countdown Begins in: " + countdownTimer;
        }, 1000);
        setTimeout(function () {
            clearInterval(countInterval);
            warningSign.destroy();
            warningSign2.destroy();
            countdown.destroy();
            // countdown has started!
            let countdownStarted = createTextBox(app, "Countdown has started!", -4.375, 3.1, .97, 0.33, MRE.Color3.Yellow());
            animateText(countdownStarted, app, 0.6)
            // destroy countdown started after 3 seconds
            setTimeout(function () {
                countdownStarted.destroy();
            }, 6000);
        }, 11000);
    }, 4000);


    // function to decrease money by 1000 every second after 10 seconds
    setTimeout(function () {
        startInterval(app);
    }, 13000);

    // setinterval function to update current funds
    let updateInterval = setInterval(function () {
        currentFunds.text.contents = "Current Funds: $" + money;
        Moneylost.text.contents = "Money Lost: $" + moneyLost;
    }, 1000);

    // add logic to stop at 0 and 1000000 respectively


    /* 
    let scoreboardTexture = app.assets.createTexture("bgText", { uri: 'scoreboardBackground.jpeg' });
    let leaderboardMaterial = app.assets.createMaterial("bgMaterial", {
        mainTextureId: scoreboardTexture.id,
        mainTextureScale: { x: 1, y: 1 },
        emissiveTextureId: scoreboardTexture.id,
        emissiveTextureScale: { x: 1, y: 1 },
        emissiveColor: new MRE.Color3(1, 1, 1)
    });
    let scoreboardBackground = MRE.Actor.Create(app.context, {
        actor: {
            name: "scoreboardBackground",
            transform: { local: { position: { x: 0, y: 0, z: -0.02 }} }, // -Z is towards you when looking at the screen
            appearance: {
                meshId: app.assets.createBoxMesh("cube2", 7.8, 4.38, 0.02).id, // X is width, Y is height, Z is depth when looking at screen
                materialId: leaderboardMaterial.id
            },
            parentId: scoreboardScreen.id
        }
    });
    */

}

export function startScoreboard(app: StoryBoard) {

    console.log(app.scoreboardActor)
    //create scoreboardActor.id
    app.scoreboardActor = MRE.Actor.Create(app.context, {
        actor: {
            name: 'Anchor',
            transform: {
                local: {
                    position: { x: 0, y: 0, z: 0 }
                }
            }
        }
    });   

    createScoreboard(app);
}

