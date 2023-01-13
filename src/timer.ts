import {
	Actor,
	AssetContainer,
	Context
} from '@microsoft/mixed-reality-extension-sdk';

interface timer {
	name: string;
	startTime: number;
	endTime: number;
	duration: number;
	running: boolean;
}

const dict = new Map<number, timer>();

// global index variable for new timers
let i = 0;

// create new timer in dict at current i value
export function createTimer(timerName: string) {
	let obj: timer = {
		name: timerName,
		startTime: 0,
		endTime: 0,
		duration: 0,
		running: false
	};

	dict.set(i, obj);
	i++;
}

// search dictionary based on timer name string, return dictionary index
function dictSearch(timerName: string): number {
	let result: number = null;
	for (const [key, value] of dict) {
		if (value.name.includes(timerName)) {
			result = key;
		}
	}
	return result;
}

export function startTimer(timerName: string) {
	if (dict.get(dictSearch(timerName)).running == true) {
		console.log('timer already running.');
		return;
	} else {
		dict.set(
			dictSearch(timerName),
			Object.assign({}, dict.get(dictSearch(timerName)), {
				startTime: Date.now(),
				running: true
			})
		);
	}
}

export function stopTimer(timerName: string): number {
	let endTime = Date.now();
	let tempobj: timer = dict.get(dictSearch(timerName));
	let duration = endTime - tempobj.startTime;

	if (dict.get(dictSearch(timerName)).running == false) {
		console.log('timer already stopped.');
		return;
	} else if (dict.get(dictSearch(timerName)).duration != 0) {
		// if duration > 0 previously, concat new duration onto previous duration
		duration += dict.get(dictSearch(timerName)).duration;
		dict.set(
			dictSearch(timerName),
			Object.assign({}, dict.get(dictSearch(timerName)), {
				endTime: Date.now(),
				duration: duration,
				running: false
			})
		);
		return dict.get(dictSearch(timerName)).duration;
	} else {
		// else first run no concat
		dict.set(
			dictSearch(timerName),
			Object.assign({}, dict.get(dictSearch(timerName)), {
				endTime: Date.now(),
				duration: duration,
				running: false
			})
		);
		
		return dict.get(dictSearch(timerName)).duration;
	}
}

