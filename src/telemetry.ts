import * as MRE from '@microsoft/mixed-reality-extension-sdk';

import fs from 'fs';


const dataArray = JSON.parse(fs.readFileSync('./telemetry/leaderboard.json', 'utf-8'))

//const file = require(fileName);

dataArray.key = "new value";


export class ConnectedUsers {
    public connectedUsers: MRE.User[] = [];
	public user: MRE.User;

	public userJoined(user: MRE.User) {
		console.log(`user-joined: ${user.name}, ${user.id}`);
		this.connectedUsers.push(user);
		console.log(`Players Connected: ${this.connectedUsers.length}`);
		console.log(this.connectedUsers);
		user.groups.add('notJoined');
	}
	public userLeft(user: MRE.User) {
		console.log(`user-left: ${user.name}, ${user.id}`);
		this.connectedUsers.splice(this.connectedUsers.findIndex(u => u.id === user.id), 1);
		console.log(`Players Connected: ${this.connectedUsers.length}`);
	}
}

// make a team class with a list of all connected users
export class Team {
	public teamName: string;
	public teamUsers: ConnectedUsers[] = [];
	public teamScore: number = 0;
	public teamColor: MRE.Color3;
	public teamColorHex: string;

	constructor(teamName: string, teamColor: MRE.Color3, teamColorHex: string) {
		this.teamName = teamName;
		this.teamColor = teamColor;

		this.teamColorHex = teamColorHex;
	}
}








export function addvalue() {
    fs.writeFile('./telemetry/leaderboard.json', JSON.stringify(dataArray), function writeJSON(err: any) {
        if (err) return console.log(err);
        console.log(JSON.stringify(dataArray));
        console.log('writing to ' + './telemetry/leaderboard.json');

    
    });
    return true;
}