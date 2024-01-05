import { updateStyle, setInfo, infoBox, showBox, hideBox } from "./script.js";

/** cheat code helpers */
export let pauseForestUpdate = false

/**
 * cheat codes
 * @param {KeyboardEvent} e 
 */
export function cheatcodes(e) {
  let key = e.key;
  console.log(`the ${key}-key was pressed on the keyboard.`)
  switch(key) {
    case ' ': 
        pauseForestUpdate = !pauseForestUpdate
        // offer visual feedback:
        if(pauseForestUpdate) updateStyle(document.body,"background-color","var(--body-bg-colour-paused)") 
        else updateStyle(document.body,"background-color","var(--body-bg-colour-running)") 
        // write to console:
        console.log(`pause forestUpdate: ${pauseForestUpdate}`)
        break;
    case '1':
        console.log(`update infoBox content: set introductory info.`)
        setInfo(infoBox, 1)
        console.log(`show #infoBox.`)
        showBox(infoBox)
        break;
    case '8':
        console.log(`update infoBox content: nudging person to tap the screen.`)
        setInfo(infoBox, 8)
        console.log(`show #infoBox.`)
        showBox(infoBox)
        break;
    case '2':
        console.log(`update infoBox content: display goal.`)
        setInfo(infoBox, 2)
        console.log(`show #infoBox.`)
        showBox(infoBox)
        break;
    case '0':
        console.log(`update infoBox content: conclusion.`)
        setInfo(infoBox, 0)
        console.log(`show #infoBox.`)
        showBox(infoBox)
        break;
    case 'z': 
        console.log(`show #infoBox.`)
        showBox(infoBox)
        break;
    case 'x': 
        console.log(`hide #infoBox.`)
        hideBox(infoBox)
        break;
  }
}