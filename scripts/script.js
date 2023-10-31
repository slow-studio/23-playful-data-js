/* placeholder javascript file */


let burnSound = new Audio('/assets/sound/lighting-a-fire.mp3');
let safeSound = new Audio('/assets/sound/twinkle.mp3');
let bgBurn = new Audio('/assets/sound/burningAmbience.mp3');
let bgForest = new Audio('/assets/sound/forestAmbience.mp3');

let volume = 0;

function stateChanger(b) {
    console.log("toggling 'yellow' class.")
    b.classList.toggle("yellow");
    console.log("toggling 'orange' class.")
    b.classList.toggle("orange")  
    console.log(b.className)

    switch(b.className)
    {
        case "yellow":
            console.log("this is case yellow")
            bgForest.play()
            break;
        
        case "orange":
            console.log("this is case orange")
            break;
    }
}


// if anything is left clicked(burning) the forest bg fades out and switches to burning bg
function burningBG()
{
    //based on the number of burning trees, the audio will get louder
    let burnStateTrees = document.getElementsByClassName("button").length
    //calculating volume percentage
    let percentage = parseFloat((trees - burnStateTrees)/trees)

    //as soon as a tree is burning we want the nice forest background sound to be replaced with the burning one
    if(percentage > 0)
        bgForest.pause()
    bgBurn.play()
    //setting volume to change and fade in and out within 2 seconds
    bgBurn.volume = 1 - percentage
    console.log("volume should be ", bgBurn.volume)
}
  
//fastSeek function skips to a specific time limit within the audio track- not compatible with many browsers however
