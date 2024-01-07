import { setInfo, infoBox, showBox, hideBox } from "./infoBox.js";
import { pauseSimulation, playPauseSwitch, showcontent } from "./script.js";

/**
 * cheat codes
 * @param {KeyboardEvent} e 
 */
export function cheatcodes(e) {
  let key = e.key;
  console.log(`the ${key}-key was pressed on the keyboard.`)
  switch(key) {
    case ' ': 
        playPauseSwitch()
        break;
    case '1':
        setInfo(infoBox, 1)
        showBox(infoBox)
        break;
    case '8':
        setInfo(infoBox, 8)
        showBox(infoBox)
        break;
    case '2':
        setInfo(infoBox, 2)
        showBox(infoBox)
        break;
    case '0':
        setInfo(infoBox, 0)
        showBox(infoBox)
        break;
    case 'z': 
        console.log(`pressed key ${key} to show #infoBox.`)
        showBox(infoBox)
        break;
    case 'x': 
        console.log(`pressed key ${key} hide #infoBox.`)
        hideBox(infoBox)
        break;
  }
}

export const playPauseButton = document.getElementById('playPauseButton')
playPauseButton.addEventListener('click', playPauseSwitch)

const showContentButton = document.getElementById('showContentButton')
showContentButton.addEventListener('click', () => {
    pauseSimulation(true)
    showcontent(true)
})