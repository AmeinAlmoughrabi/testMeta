// Function for kalabe being a rad dude
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import StoryBoard from './app';
import * as ARTIFACT from './artifact';


export function drawLineBetweenTwoPointsinXY(app: StoryBoard, tag: MRE.Actor, name: string, pointA: any, pointB: any, color: string): MRE.Actor{
    // create a cylinder between two points
    let capsule: string;
    if(color == "white"){
        capsule = ARTIFACT.CapsulePointer1
    }else{
        capsule = ARTIFACT.CapsulePointer2
    }

    let scaleTemp = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
    let scaleTempReduced = scaleTemp * .45;

    let cylinder = MRE.Actor.CreateFromLibrary(app.context, {
        resourceId: capsule,
        actor: {
            name: name,
            transform: {
                local: {
                    // midpoint between pointA and pointB
                    position: { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2, z: pointA.z },
                    // set height of cylinder to be the distance between pointA and pointB
                    //scale: { x: 0.1, y: Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)), z: 0.1 },
                    scale: { x: 0.02, y: scaleTempReduced, z: 0.02 },
                    // rotate the cylinder to touch pointA and pointB in the XY plane
                    rotation: MRE.Quaternion.FromEulerAngles(0, 0, Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) - Math.PI / 2)
                }
            },
            parentId: tag.id
        }
    });
    return(cylinder)
}