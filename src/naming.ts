import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from "./app";
import fs from 'fs';    

let colors: Array<string> = [
	'Aqua',
	'Azure',
	'Black',
	'Blue',
	'Bronze',
	'Brown',
	'Chocolate',
	'Cyan',
	'Gold',
	'Green',
	'Grey',
	'Lime',
	'Maroon',
	'Navy',
	'Olive',
	'Orange',
	'Pink',
	'Purple',
	'Red',
	'Salmon',
	'Silver',
	'Teal',
	'Tomato',
	'Turquoise',
	'Violet',
	'Wheat',
	'White',
	'Yellow'
]

let animals: Array<string> = [
	'Bear',
	'Bison',
	'Leopard',
	'Cheetah',
	'Chimpanzee',
	'Chipmunk',
	'Cougar',
	'Deer',
	'Elephant',
	'Fox',
	'Giraffe',
	'Gorilla',
	'Hedgehog',
	'Hippopotamus',
	'Hyena',
	'Jackal',
	'Jaguar',
	'Kangaroo',
	'Koala',
	'Lion',
	'Meerkat',
	'Mongoose',
	'Monkey',
	'Otter',
	'Porcupine',
	'Possum',
	'Raccoon',
	'Red panda',
	'Rhinoceros',
	'Oryx',
	'Squirrel',
	'Tiger',
	'Wolf',
	'Wombat',
	'Zebra'
]

function randomInterval(max: number) {
	return Math.floor(Math.random() * max)
}

export function genName(app: StoryBoard) {
	let getColor = colors[randomInterval(colors.length)].toString();
	let getAnimal = animals[randomInterval(animals.length)].toString();

	return getColor + " " + getAnimal;
}
