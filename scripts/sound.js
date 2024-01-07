import { gameState, totalTreesInForest } from "./script.js";

/*  ------------------------------------------------------------
    work with sound.
    using the Web Audio API. 
    tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API.
    ------------------------------------------------------------  */

/* create an instance of the audio context, to get access to all the features and functionality of the Web Audio API */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = [new AudioContext(), new AudioContext()]

// get the audio element
/** @type HTMLAudioElement[] */
const audioElement = [
    document.querySelector("audio[data-type='ambience'][data-name='forest']"),
    document.querySelector("audio[data-type='ambience'][data-name='burning']")
];

// pass it into the audio context
const track = [
    audioCtx[0].createMediaElementSource(audioElement[0]),
    audioCtx[1].createMediaElementSource(audioElement[1])
];
// add the play and pause functionality
document.body.addEventListener('click', () => {
    
    // ensure that gameState.userHasBeenActive is set to be true
    gameState.userHasBeenActive = true

    // Check if context is in suspended state (autoplay policy)
    if (audioCtx[0].state === "suspended") {
        audioCtx[0].resume();
    }
	if (audioCtx[1].state === "suspended") {
        audioCtx[1].resume();
    }
    // Play track
    audioElement[0].play();
	audioElement[1].play();
})

// what to do when the track finishes playing. Our HTMLMediaElement fires an ended event once it's finished playing, so we can listen for that and run code accordingly:
audioElement[0].addEventListener("ended", () => {
    // Play track. essentially, looping it.
    audioElement[0].play();
});
audioElement[1].addEventListener("ended", () => {
    // Play track. essentially, looping it.
    audioElement[1].play();
});

// volume
export const gainNode = []
gainNode[0] = audioCtx[0].createGain();
gainNode[1] = audioCtx[1].createGain();

gainNode[0].gain.value = /*starting value*/ 0
gainNode[1].gain.value = /*starting value*/ 0

// connect our audio graph from the audio source/input node to the destination
track[0].connect(gainNode[0]).connect(audioCtx[0].destination)
track[1].connect(gainNode[1]).connect(audioCtx[1].destination)