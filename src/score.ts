import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import fs from 'fs';    


export function isAvailableTeamName(app: StoryBoard, teamname: string){
    let dataArray = JSON.parse(fs.readFileSync('./telemetry/leaderboard.json', 'utf-8'))
    // create an array from dataArray
    let leaderboardArray: { team: string; score: number; time: string; }[] = [];
    for (let i = 0; i < dataArray.length; i++) {
        if(dataArray[i] == teamname){
            return false
        }
    }
    return true
}
export function saveFinalScoreInit(app: StoryBoard, teamName: string, score: number){

    let dataArray = JSON.parse(fs.readFileSync('./telemetry/leaderboard.json', 'utf-8'))
    // create an array from dataArray
    let leaderboardArray: { team: string; score: number; time: string;}[] = [];
    for (let i = 0; i < dataArray.length; i++) {
        leaderboardArray.push(dataArray[i]);
    }

    let currentTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        });
    //let tempTeamScore = { team: teamName, score: score, time: new Date().toLocaleString() };
    //leaderboardArray = leaderboardArray.map(u => u.team !== tempTeamScore.team ? u : tempTeamScore);
    leaderboardArray.push({ team: teamName, score: score, time: currentTime });
    // write the array to the file
    fs.writeFile('./telemetry/leaderboard.json', JSON.stringify(leaderboardArray), function writeJSON(err: any) {
        if (err) return console.log(err);
        console.log(JSON.stringify(dataArray));
        console.log('writing to ' + './telemetry/leaderboard.json');
    });
    // write the array to the file
    fs.writeFile('./public/leaderboard.json', JSON.stringify(leaderboardArray), function writeJSON(err: any) {
        if (err) return console.log(err);
        console.log(JSON.stringify(dataArray));
        console.log('writing to ' + './public/leaderboard.json');
    });
}

export function saveFinalScore(app: StoryBoard, teamName: string, score: number){

    let dataArray = JSON.parse(fs.readFileSync('./telemetry/leaderboard.json', 'utf-8'))
    // create an array from dataArray
    let leaderboardArray: { team: string; score: number; time: string;}[] = [];
    for (let i = 0; i < dataArray.length; i++) {
        leaderboardArray.push(dataArray[i]);
    }
    let currentTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        });
    let tempTeamScore = { team: teamName, score: score, time: currentTime };
    leaderboardArray = leaderboardArray.map(u => u.team !== tempTeamScore.team ? u : tempTeamScore);
    //leaderboardArray.push({ team: teamName, score: score, time: currentTime });
    // write the array to the file
    fs.writeFile('./telemetry/leaderboard.json', JSON.stringify(leaderboardArray), function writeJSON(err: any) {
        if (err) return console.log(err);
        console.log(JSON.stringify(dataArray));
        console.log('writing to ' + './telemetry/leaderboard.json');
    });
    // write the array to the file
    fs.writeFile('./public/leaderboard.json', JSON.stringify(leaderboardArray), function writeJSON(err: any) {
        if (err) return console.log(err);
        console.log(JSON.stringify(dataArray));
        console.log('writing to ' + './telemetry/leaderboard.json');
    });
}