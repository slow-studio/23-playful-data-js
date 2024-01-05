import { gameState, seedDryTrees, showcontent, startExperience } from "./script.js"

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
            // introduction
            let i1 = addChildTag(box, 'h3')
            i1.innerHTML = `plant your forest.`
            let i2 = addChildTag(box, 'p')
            i2.innerHTML = `tap on the earth to help nurture a tree.`
            break
        case 2:
            // display task
            let g1 = addChildTag(box, 'h3')
            g1.innerHTML = `take care of your forest.`
            let g2 = addChildTag(box, 'p')
            g2.innerHTML = `tap on a dry or burning tree to save it.`
            break
        case 8:
            // instructions to tap
            let t1 = addChildTag(box, 'h3')
            t1.innerHTML = `you can save the forest.`
            let t2 = addChildTag(box, 'p')
            t2.innerHTML = `please tap on a dry or burning tree to save it.`
            break
        case 0:
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
        && infotype!=0
    ) {
        let closeBtn = addChildTag(box, 'button')
        closeBtn.innerHTML = infotype==1?'<p>go to the forest:</p>':'<p>return to the forest.</p>'
        closeBtn.setAttribute('id', 'closeInfoBox')
        closeBtn.addEventListener('click', () => {
            hideBox(infoBox, true)
            showcontent(false)
        })
    }
    // add button to reveal essay
    if(
        infotype==0 
        || infotype==1 
        || gameState.playTime>=1000*60
    ) {
        let readBtn = addChildTag(box, 'button')
        readBtn.innerHTML = '<p>read about this project.</p>'
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
            switch(infotype) {
                case 0:
                case 1: 
                case 8: 
                    // can playSound here
                    break
                case 2: 
                    // can playSound here
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
 * @param {boolean} [seed=true] - seedDryTrees when box closes?
 */
export function hideBox(box, seed) {
    box.setAttribute('display', 'false')
    console.log(`hiding infoBox.`)
    box.style.bottom = `-100vh`
    box.style.height = "0"
    if (seed) {
        let seeds = 1
        const infotype = Number(box.getAttribute('infotype'))
        if (infotype==2) {
            console.log(`goal-task displayed. will now seed ${seeds} dry tree${seeds==1?'':'s'}.`)
            seedDryTrees(Math.max(seeds, 1))
        }
    } else console.log(`dry-trees will *not* be seeded.`)
    const infotype = Number(box.getAttribute('infotype'))
    switch(infotype) {
        case 1: 
            startExperience() 
            gameState.shownInfo1 = true 
            gameState.shownInfo2 = false
            console.log(`seen info #1.`) 
            gameState.print == true 
            break
        case 2: 
            startExperience() 
            gameState.shownInfo2 = true 
            console.log(`seen info #2.`) 
            gameState.print == true 
            break
        case 8: 
            gameState.shownInfo8 = true 
            console.log(`seen info #8.`) 
            gameState.print == true 
            break
        case 0: 
            gameState.shownInfo0 = true 
            console.log(`seen info #0.`) 
            gameState.print == true 
            break
    }
}