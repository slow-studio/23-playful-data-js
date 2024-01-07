import { divBarClicks, gameState, seedDryTrees, showcontent, startExperience, totalTreesInForest, tree, updateStyle } from "./script.js"

// variables required for the design-fiction
const futuredate = Math.round(((new Date()).getFullYear() + 10)/10)*10

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
            addChildTag(box, 'h3').innerHTML = `hello, cadet #${Math.round(Math.random()*10000000)}:`
            addChildTag(box,'p').innerHTML = `welcome to ${futuredate}.`
            addChildTag(box,'p').innerHTML = `starting with the great <em>take back our future</em> movement (in ${(new Date()).getFullYear()}), revolutions around the world have repossessed thousands of damaged ecosystems over ${futuredate - (new Date()).getFullYear()} remarkable years.`
            addChildTag(box,'p').innerHTML = `now: climate-cadets like you and me can begin working to re-generate and re-wild our oceans, forests, grasslands and deserts.`
            addChildTag(box, 'p').innerHTML = `this is why we're so happy to place <em>this</em> patch of rescued forest-land under your care.`
            addChildTag(box,'p').innerHTML = `let&rsquo;s plant some trees, shall we?`
            addButton_close(box,`start planting your forest:`)
            /* 
                note: 
                do not link to the essay here. 
                people *must* at-least plant the forest to read the news. 
            */
            makeButtonsAppear(box, 4000)
            break
        case 2:
            // console.log(`update infoBox content: display goal.`)
            // display task
            let g1 = addChildTag(box, 'h3')
            g1.innerHTML = `take care of your forest.`
            let g2 = addChildTag(box, 'p')
            g2.innerHTML = `tap on a dry or burning tree to save it.`
            addButton_close(box,`tend to the forest:`)
            makeButtonsAppear(box, 4000)
            break
        case 8:
            // console.log(`update infoBox content: nudging person to tap the screen.`)
            // instructions to tap
            let t1 = addChildTag(box, 'h3')
            t1.innerHTML = `you can save the forest.`
            let t2 = addChildTag(box, 'p')
            t2.innerHTML = `please tap on a dry or burning tree to save it.`
            addButton_close(box,`return to the forest:`)
            makeButtonsAppear(box, infoBoxTransitionDuration)
            break
        case 0:
            // console.log(`update infoBox content: conclusion.`)
            // conclusion
            let c1 = addChildTag(box, 'h3')
            c1.innerHTML = `thank you for playing.`
            let c2 = addChildTag(box, 'p')
            c2.innerHTML = `please read about why we made this.`
            // addButton_close(box,`return to the forest.`)
            addButton_showcontent(box,`read today's news.`)
            makeButtonsAppear(box, 4000)
            break
    }
}

/**
 * @param {HTMLElement} box 
 * @param {number} time 
 */
function makeButtonsAppear(box, time) {
    // buttons appear later, and fade into view when they do
    let buttons = box.getElementsByTagName('button')
    for (let i = 0; i < buttons.length; i++) {
        updateStyle(buttons[i], 'display', 'none')
        updateStyle(buttons[i], 'opacity', '0')
        setTimeout(()=>{
            updateStyle(buttons[i], 'display', 'block')
            updateStyle(buttons[i], 'transition-duration', `${infoBoxTransitionDuration}ms`)
            updateStyle(buttons[i], 'opacity', '1')
        },time)
        setTimeout(()=>{
            let heighttoadd = `0px`
            for(let i=0 ; i< buttons.length ; i++) {
                heighttoadd += ` + ${getComputedStyle(buttons[i]).marginBottom} + ${getComputedStyle(buttons[i]).height}`
            }
            updateStyle(box, 'height', `calc(${heighttoadd} + ${getComputedStyle(box).height})`)
        },time)
    }
}

/** 
 * @param {string} tag  
 */
function addChildTag(parent, tag) {
    let child = document.createElement(tag)
    parent.appendChild(child)
    return child
}

/**
 * @param {HTMLElement} box 
 * @param {string} label
 */
function addButton_close(box, label) {
    let closeBtn = addChildTag(box, 'button')
    closeBtn.innerHTML = `<p>${label}</p>`
    closeBtn.setAttribute('id', 'closeInfoBox')
    closeBtn.addEventListener('click', () => {
        hideBox(box)
        showcontent(false)
    })
}

/** 
 * @param {HTMLElement} box 
 * @param {string} label 
 */
function addButton_showcontent(box, label) {
    let readBtn = addChildTag(box, 'button')
    readBtn.innerHTML = `<p>${label}</p>`
    readBtn.setAttribute('id', 'read')
    readBtn.addEventListener('click', () => showcontent(true))
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
            // pick a random tree and spawn it:
            tree[Math.floor(Math.random()*totalTreesInForest)].behaviour = 1
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