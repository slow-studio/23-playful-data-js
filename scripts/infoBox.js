import { divBarClicks, gameState, seedDryTrees, showcontent, startExperience, updateStyle } from "./script.js"

/** @type {HTMLElement} */
export const infoBox = document.getElementById('infoBox')

export const infoBoxTransitionDuration = 600
export const showBoxDelayDuration = 600

/**
 * @param {HTMLElement} box
 * @param {number} infotype - 1: intro | 2: display task | 8: instructions to tap | 0: conclusion
 */
export function setInfo(box, infotype) {
    box.setAttribute('infotype', infotype.toString())
    // first, empty-out the box
    box.innerHTML = ``
    // populate the box
    switch(infotype) {
        case 1:
            // console.log(`update infoBox content: set introductory info.`)
            // introduction
            let i1 = addChildTag(box, 'h3')
            i1.innerHTML = `plant your forest.`
            let i2 = addChildTag(box, 'p')
            i2.innerHTML = `tap on the earth to help nurture a tree.`
            break
        case 2:
            // console.log(`update infoBox content: display goal.`)
            // display task
            let g1 = addChildTag(box, 'h3')
            g1.innerHTML = `take care of your forest.`
            let g2 = addChildTag(box, 'p')
            g2.innerHTML = `tap on a dry or burning tree to save it.`
            break
        case 8:
            // console.log(`update infoBox content: nudging person to tap the screen.`)
            // instructions to tap
            let t1 = addChildTag(box, 'h3')
            t1.innerHTML = `you can save the forest.`
            let t2 = addChildTag(box, 'p')
            t2.innerHTML = `please tap on a dry or burning tree to save it.`
            break
        case 0:
            // console.log(`update infoBox content: conclusion.`)
            // conclusion
            let c1 = addChildTag(box, 'h3')
            c1.innerHTML = `thank you for playing.`
            let c2 = addChildTag(box, 'p')
            c2.innerHTML = `please read about why we made this.`
            break
    }
    // add close-button to dismiss box
    if(
        true    
        // && infotype!=0
    ) {
        let closeBtn = addChildTag(box, 'button')
        closeBtn.innerHTML = infotype==1?'<p>go to the forest:</p>':'<p>return to the forest.</p>'
        closeBtn.setAttribute('id', 'closeInfoBox')
        closeBtn.addEventListener('click', () => {
            hideBox(infoBox)
            showcontent(false)
        })
    }
    // add button to reveal essay
    if(
        true
        && (
            infotype==0 
            || infotype==1
        )
    ) {
        let readBtn = addChildTag(box, 'button')
        readBtn.innerHTML = `<p>read today's news.</p>`
        readBtn.setAttribute('id', 'read')
        readBtn.addEventListener('click', () => showcontent(true))
    }

    /** 
     * @param {string} tag  
     */
    function addChildTag(parent, tag) {
        let child = document.createElement(tag)
        parent.appendChild(child)
        return child
    }
}

/**
 * @returns {boolean} tracks whether the element is displayed or not 
 * @param {HTMLElement} box
 */
export function boxDisplayAttrIs(box) {
    const attr = box.getAttribute('display')
    switch(attr) {
        case "true": return true
        case "false": return false
    }
}

/**
 * @param HTMLElement} box 
 */
export function showBox(box) {
    box.setAttribute('display', true) // note: keep this statement outside the setTimeout(), to prevent showBox() from being called multiple times before the delayed actions (below) happen.
    const infotype = Number(box.getAttribute('infotype'))
    setTimeout(function() {
        // sound:
        if(gameState.userHasBeenActive) {
            // console.log(`show #infoBox ${infotype}.`)
            switch(infotype) {
                case 1: 
                    updateStyle(document.getElementById("status"),"top","-5rem")
                    gameState.statusBars.update = false
                    break
                case 2: 
                    updateStyle(document.getElementById("status"),"top","-5rem")
                    // can playSound here
                    gameState.statusBars.update = false
                    break
                case 8: 
                    gameState.statusBars.update = true
                    // can playSound here
                    break
                case 0:
                    updateStyle(document.getElementById("status"),"top","-5rem")
                    gameState.statusBars.update = false
                    break
            }
        }
        // visual:
        box.style.height = `fit-content`
        box.style.height = `${box.offsetHeight}px` //`calc(100vh - 2rem)`
        box.style.bottom = `1rem` //`calc(100vh - 1rem)`
    }, showBoxDelayDuration)
}

/**
 * @param {HTMLElement} box 
 */
export function hideBox(box) {
    box.setAttribute('display', 'false')
    console.log(`hide infoBox.`)
    box.style.bottom = `-100vh`
    box.style.height = "0"
    const infotype = Number(box.getAttribute('infotype'))
    switch(infotype) {
        case 1: 
            updateStyle(document.getElementById("status"),"top","1rem")
            updateStyle(document.getElementById("statusPlanted"),"display","block")
            updateStyle(document.getElementById("statusTime"),"display","none")
            updateStyle(document.getElementById("statusClicks"),"display","none")
            updateStyle(document.getElementById("statusInfo"),"display","none")
            gameState.statusBars.update = true
            startExperience() 
            gameState.shownInfoBox._1 = true 
            gameState.shownInfoBox._2 = false
            // console.log(`seen info #1.`) 
            // gameState.print == true 
            break
        case 2: 
            updateStyle(document.getElementById("status"),"top","1rem")
            updateStyle(document.getElementById("statusPlanted"),"display","none")
            updateStyle(document.getElementById("statusTime"),"display","block")
            updateStyle(document.getElementById("statusClicks"),"display","block")
            updateStyle(document.getElementById("statusInfo"),"display","none")
            gameState.statusBars.update = true
            startExperience() 
            gameState.shownInfoBox._2 = true 
            // console.log(`seen info #2.`) 
            // gameState.print == true 
            break
        case 8: 
            gameState.statusBars.update = true
            gameState.shownInfoBox._8 = true 
            // console.log(`seen info #8.`) 
            // gameState.print == true 
            break
        case 0: 
            updateStyle(document.getElementById("status"),"top","1rem")
            updateStyle(document.getElementById("statusPlanted"),"display","none")
            updateStyle(document.getElementById("statusTime"),"display","none")
            updateStyle(document.getElementById("statusClicks"),"display","none")
            updateStyle(document.getElementById("statusInfo"),"display","block")
            gameState.statusBars.update = false
            gameState.shownInfoBox._0 = true 
            // console.log(`seen info #0.`) 
            // gameState.print == true 
            break
    }
}