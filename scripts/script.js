// get audio files
const src = "/assets/sound/"
let burnSound = new Audio(src + 'lighting-a-fire.mp3');
let safeSound = new Audio(src + 'twinkle.mp3');
let bgBurn = new Audio(src + 'burningAmbience.mp3');
let bgForest = new Audio(src + 'forestAmbience.mp3');
let eagleSound = new Audio(src + 'eagle.mp3');

// start playing sounds, on loop, but muted.
bgForest.loop = true
bgForest.volume = 0
bgBurn.loop = true
bgBurn.volume = 0

// vairables for counting number of trees 
function countTotalTrees() {
    return /* a number */ document.getElementsByTagName("button").length;
}
function percentageOfTrees(c) {
    return parseFloat((document.getElementsByClassName(c).length) / countTotalTrees())
}

function stateChanger(b) {

    bgForest.play()
    bgBurn.play()

    // toggle classes when a tree is affected
    console.log("toggling 'normal' class.")
    b.classList.toggle("normal");
    console.log("toggling 'burning' class.")
    b.classList.toggle("burning")
    console.log(b.className)

    // depending on the class in a button, its innerHTML changes
    switch (b.className) {
        case "normal":
            b.innerText = "normal tree"
            break;
        case "burning":
            b.innerText = "burning tree"
            burnSound.currentTime = 0
            burnSound.play()
            break;
    }

    setVolume()
}


/* set the columes of the audio */
function setVolume() {
    bgBurn.volume = percentageOfTrees("burning")
    bgForest.volume = percentageOfTrees("normal")
}

function randomSound() {
    eagleSound.volume = Math.random() * Math.random() *.75
    eagleSound.play(); // playing the audio
}

setInterval(function () {
    randomSound(); // calling the loop function again to make it infinite
}, Math.round(Math.random() * (40000 - 25000)) + 25000 /* random value between 25s and 40s */);
