/* placeholder javascript file */


let burnSound = new Audio('/assets/sound/lighting-a-fire.mp3');
let safeSound = new Audio('/assets/sound/twinkle.mp3');
let bgBurn = new Audio('/assets/sound/burningAmbience.mp3');
let bgForest = new Audio('/assets/sound/forestAmbience.mp3');

let volume = 0;
let buttons = 1;
let percentage

function stateChanger(b) {
    console.log("toggling 'yellow' class.")
    b.classList.toggle("yellow");
    console.log("toggling 'orange' class.")
    b.classList.toggle("orange")  
    console.log(b.className)

    switch(b.className)
    {
        case "yellow":
            b.innerText = "normal tree"
            bgForest.play()
            percentage = parseFloat((buttons - (document.getElementsByClassName("yellow").length+1))/buttons)
            bgForest.volume = 1- percentage
            break;
        
        case "orange":
            b.innerText = "burning tree"
            percentage = parseFloat((buttons - (document.getElementsByClassName("orange").length+1))/buttons)
            bgBurn.volume = 1- percentage
            break;
    }
}
