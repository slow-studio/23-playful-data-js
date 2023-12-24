/*  ------------------------------------------------------------
    helpers
    ------------------------------------------------------------  */

/**
 * helpful links:
 *  - to check browser support tables on mobile web browsers, go to: https://caniuse.com/.
 *  - to change cursor's appearance, by using an SVG:
 *      - info: https://stackoverflow.com/a/45966695
 *      - helper tool: https://yoksel.github.io/url-encoder/ or https://svgwiz.com/
 */

/** cheat code helpers */
let pauseForestUpdate = false

/**
 * cheat codes
 * @param {KeyboardEvent} e 
 */
function cheatcodes(e) {
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
        showBox(infoBox, false)
        break;
    case '3':
        console.log(`update infoBox content: set 'good' news.`)
        setInfo(infoBox, 3)
        console.log(`show #infoBox.`)
        showBox(infoBox, false)
        break;
    case '4':
        console.log(`update infoBox content: set 'bad' news.`)
        setInfo(infoBox, 4)
        console.log(`show #infoBox.`)
        showBox(infoBox, false)
        break;
    case '2':
        console.log(`update infoBox content: nudging person to tap the screen.`)
        setInfo(infoBox, 2)
        console.log(`show #infoBox.`)
        showBox(infoBox, false)
        break;
    case '0':
        console.log(`update infoBox content: conclusion.`)
        setInfo(infoBox, 0)
        console.log(`show #infoBox.`)
        showBox(infoBox, false)
        break;
    case 'z': 
        console.log(`show #infoBox.`)
        showBox(infoBox, false)
        break;
    case 'x': 
        console.log(`hide #infoBox.`)
        hideBox(infoBox, false)
        break;
  }
}
document.body.setAttribute('onkeydown','cheatcodes(event)')

const IDEALREFRESHRATE = 10
const refreshRate = 10 // fps
const refreshTime = 1000 / refreshRate // time in millisecond
var FRAMECOUNT = 0

/** @type {number} duration for which a protected tree stays protected */
const protectionDuration = 7500 // time in millisecond

/** @type {number} a heap of mud/ash takes ✕ times longer to begin growing into a tree */
const absentTimeMultiplier = 10
/** @type {number} a fully-grown tree resists drying for these many ✕ times longer */
const normalTimeMultiplier = 25
/** @type {number} a dry tree resists catching fire for these many ✕ times longer */
const dryTimeMultiplier = 12.5
/** @type {number} make fires burn for these many ✕ times longer */
const fireBurnTimeMultiplier = 2.0
/** @type {number} a tree remains charred for these many ✕ times longer */
const charredTimeMultiplier = 25

/**
 * game state variables
 */
let gameState = {
    startTime: new Date().getTime(),
    playTime: 0,
    starthealth: 1,
    health: 1,
    clicks: 0,
    clicksontrees: 0,
    clicksonsicktrees: 0,
    infoBoxSeenCounter: 0,
    goodNewsCounter: 0,
    shownMessage2: false
}
// console.log(JSON.stringify(gameState, null, 2))

/** @type {number} maximum number of trees to draw. (we can keep this number arbitarily large.) */
const TREELIMIT = 7500;

/** @type {number} time (in millisecond) after which the conclusion wants to show up */
const PLAYTIMELIMIT = 180000 * IDEALREFRESHRATE / refreshRate // e.g. 180000 ms = 3 min

/** @type {number} if the infoBox is shown these many times, we offer a button to show #content */
const INFOBOXCOUNTLIMIT = 0

/** @type {number} counts total number of trees (by incrementing its value each time a tree is spawned) */
var totalTreesInForest = 0;

/** @type {*} an array. stores one object (each) for every tree. the object contains all info/settings for that tree. */
const tree = []

/** return a random number that is close (but deviates ± by a small %) to the reference number 
 * @param {number} n - reference number
 * @param {number} [p=20] - deviation %. (eg. for 10% deviation, p = 10). default = 20% deviation.
*/
function approx(n, p) {
    const maxDeviation = n * (p / 100)
    const randomDeviation = Math.random() * maxDeviation
    if (Math.random() < .5)
        return n + randomDeviation
    else
        return n - randomDeviation
}

/** 
 * fetch the value of a property in the stylesheet 
 * @param {*} element
 * @param {string} property
 * @returns {string}
 * |  
 * example: getStyleProperty(document.getElementById('container'), 'padding-right')
 */
function getStyleProperty(element, property) {
    if (element == 'root')
        element = document.documentElement
    if(property.slice(0,3)=='var') { 
        property = property.slice(property.indexOf("(")+1,property.indexOf(")"))
    }
    let val = window.getComputedStyle(element).getPropertyValue(property).trim()
    if(!val) console.log(`property "${property}" not found in css style definitions for element "${element}"`)
    return val
    /* note: trim() was used because: https://stackoverflow.com/questions/41725725/access-css-variable-from-javascript#comment107745427_41725782 */
}
/**
 * fetch the value of a property (from the :root element) in the stylesheet 
 * @param {string} property 
 * @returns {string}
 * |  
 * example: getStylePropertyFromRoot('--fire')
 */
function getStylePropertyFromRoot(property) {
    return getStyleProperty('root', property)
}

/**
 * @param {string} c - HSL colour
 * @param {number} rhby - randomise H by this much % [range: 0-100]
 * @param {number} rlby - randomise L by this much % [range: 0-100]
 * @param {boolean} [blocker=false] - blocks this function from randomising the colour
 * @returns {string}
 * |  
 * examples: 
 * - randomiseHSLColour('hsl(16, 57%, 50%)', 15, 30)
 * - randomiseHSLColour('--fire', 15, 30)
 * - randomiseHSLColour('var(--fire)', 15, 30)
 */
function randomiseHSLColour(c, rhby, rlby, blocker) {
    if(c.slice(0,3)=='var') {
        if(blocker) return c
        c = c.slice(c.indexOf("(")+1,c.indexOf(")"))
    }
    if(c.slice(0,2)=='--') {
        if(blocker) return `var(${c})`
        c = getStylePropertyFromRoot(`var(${c})`)
    }
    if(blocker) return c
    let hsl = c.split(",")
    if(hsl[0].split("(")[0]!="hsl") {
        console.log(`supplied colour "${c}" is not in HSL format. so, randomiseHSLColour() can not randomise colour. so: returning colour {string} as-is: ${c}.`)
        return c
    }
    let h = Number(hsl[0].split("(")[1])
    h = approx(h, rhby) ; if(h<=0 || h>=360) h=0 ; h = Math.floor(h);
    let s = Number(hsl[1].split("%")[0].trim())
    let l = Number(hsl[2].split("%")[0].trim())
    l = approx(l, rlby) ; if(l<=0) l=0 ; if(l>=100) l=100 ; l = Math.floor(l);
    return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * update an element's style
 * @param {*} e - element
 * @param {string} p - parameter 
 * @param {string|number} v - value
 */
function updateStyle(e, p, v) {
    if (e == 'root') e = document.documentElement
    return e.style.setProperty(p, v)
}

/**
 * show or hide #content div
 * @param {boolean} show 
 */
function showcontent(show) {
    const contentdiv = document.getElementById('content')
    updateStyle(contentdiv, 'border-top', show ? '.5rem solid black' : 'none')
    updateStyle(contentdiv, 'height', show ? 'fit-content' : 0)
    updateStyle(contentdiv, 'padding', show ? '1rem' : 0)
    updateStyle(contentdiv, 'overflow', show ? 'visible' : 'hidden')
    window.scroll({
        top: show ? window.innerHeight * 4 / 5 : 0,
        left: 0,
        behavior: "smooth",
    });
}
// don't show #content at the start : show the #playarea (and #forest) only.
showcontent(false)

/**
 * randomly convert some "normal" trees to their "dry" state
 * @param {number} [n=1] - number of trees to seed
 */
function seedDryTrees(n) {

    console.log(`seedDryTrees(${n}) was called`)

    // /* if there's at-least 1 "normal"/"protected" tree in the forest... */
    // let healthyTrees = document.getElementsByClassName("normal").length + document.getElementsByClassName("protected").length
    // console.log(`before seeding dry trees, healthyTrees = ${healthyTrees}`)
    // if (healthyTrees > 0) {
        
    //     /* ...then, select a random "normal"/"protected" tree to turn "dry". */
        
    //     // keep n within sensible bounds
    //     if (n >= healthyTrees) n = Math.floor(Math.random() * healthyTrees)
    //     if (n <= 1) n = 1

    //     console.log("trying to seed " + n + " dry trees...")

    //     // fraction of trees to turn from normal/protected to dry
    //     let fr = n / healthyTrees
        
    //     // collect all healthy trees (svg elements)
    //     let allhealthytrees = []
    //     let allnormaltrees = document.getElementsByClassName("normal"), 
    //         allprotectedtrees = document.getElementsByClassName("protected") // HTMLCollection
    //     let arrayofallnormaltrees = Array.from(allnormaltrees),
    //         arrayofallprotectedtrees = Array.from(allprotectedtrees) // convert HTMLCollection to Array
    //     allhealthytrees.push(...Array.from(arrayofallnormaltrees))
    //     allhealthytrees.push(...Array.from(arrayofallprotectedtrees))
        
    //     // a counter which will track how many trees we do make dry
    //     let conversioncounter = 0;

    //     // for each healthy tree, decide whether it turns dry
    //     for(let i=0 ; i<allhealthytrees.length ; i++) {
    //         if(conversioncounter<n) {
    //             if(Math.random()<fr) {
    //                 updateTree(allhealthytrees[i], "dry")
    //                 conversioncounter++
    //             }
    //         }
    //         else break;
    //     }

    //     // if no trees were converted, forcibly convert one
    //     if(conversioncounter==0) {
    //         console.log(`no trees were seeded. so: forcibly seeding dryness in one tree.`)
    //         let randomtreeindex = Math.floor(Math.random()*allhealthytrees.length)
    //         updateTree(allhealthytrees[randomtreeindex], "dry")
    //     }

    //     console.log(`seeding report: successfully seeded ${Math.max(Math.min(n,conversioncounter),1)} dry trees.`)
    // }
}

/**
 * @param {*} svgelement 
 */
function updateTree(svgelement) {

    // helper variables
    const id = Number(svgelement.getAttribute('tree-id'))

    /* tree memorises its previous state */
    tree[id].state.previous[0] = tree[id].state.now[0]
    tree[id].state.previous[1] = tree[id].state.now[1]

    /*  handle protection */
    if (
        // tree has been marked as to-be-protected
        tree[id].isProtected == true 
        && 
        // but it is not currently "protected"
        svgelement.classList.contains("protected") == false
    ) // this means that it just got protected.
    {
        // console.log(`protecting tree-${id}`)
        // playSound(sGoodNews, volumeScaler.sGoodNews)
        svgelement.classList.add("protected")
        // it remains protected for 'protectionDuration' time only
        setTimeout(function() {
            // console.log(`un-protecting tree-${id}`)
            if(tree[id].isProtected == true) {
                tree[id].isProtected = false
                svgelement.classList.remove("protected")
            }
        }, approx(protectionDuration,20))
    }
    if (
        // tree has been marked as not-to-be-protected
        (tree[id].isProtected == false) 
        && 
        // but it is currently in a "protected" state
        svgelement.classList.contains("protected")
    ) // this means that it's going to lose its protection now
    {
        svgelement.classList.remove("protected")
    }


    /* tree calculates what its new appearance will be */

    // 0. protected trees don't change their state
    if (svgelement.classList.contains("protected") || tree[id].isProtected == true) 
        tree[id].behaviour = 0
    
    // 1. cycle within a state:
    switch(tree[id].state.now[0]) {
        case 0:
            // the next tree that will grow there will have these properties:
            tree[id].properties.resilience = 1 // + Math.floor(3 * Math.random())
            // the next statement seems unnecessary, but i've written it, just, to be double-sure.
            tree[id].state.now[1] = 0
            break;
        case 1:
            // the tree should grow, till it reaches full size.
            if (tree[id].state.now[1] < svgtree.src.innerhtml[1].length - 1) 
            {
                if (FRAMECOUNT % tree[id].properties.resilience == 0)
                tree[id].state.now[1]++
                // and, at this time, don't let the tree progress to another state
                tree[id].behaviour = 0
            }
            // once it is at full size, the tree should stop growing
            else // if (tree[id].state.now[1] == svgtree.src.innerhtml[1].length - 1) 
                tree[id].state.now[1] = svgtree.src.innerhtml[1].length - 1
            break;
        case 2:
            break;
        case 3:
            // keep cycling through all fire levels:
            if (tree[id].state.now[1] < svgtree.src.innerhtml[3].length - 1) 
                tree[id].state.now[1]++
            else // if (tree[id].state.now[1] == svgtree.src.innerhtml[3].length - 1) 
                tree[id].state.now[1] = 0
            break;
        case 4:
            break;
        case 5:
            // the tree should disintegrate, till it is a heap of ash:
            if (tree[id].state.now[1] < svgtree.src.innerhtml[5].length - 1) {
                tree[id].state.now[1]++
                // and, at this time, don't let the tree progress to another state
                tree[id].behaviour = 0
            }
            // once it reaches there...
            else // if (tree[id].state.now[1] == svgtree.src.innerhtml[5].length - 1) 
            {
                // ...it should become an absent tree (i.e., a fertile mound of ash-rich soil).
                tree[id].state.now[0] = 0
                tree[id].state.now[1] = 0
            }
            break;
    }
    
    // 2. update state based on set-behaviour
    if (tree[id].behaviour != 0) {
        tree[id].state.now[0] += tree[id].behaviour
        if(tree[id].state.now[0] < 0 || tree[id].state.now[0] > svgtree.src.innerhtml.length - 1)
            tree[id].state.now[0] = 0
        switch(tree[id].behaviour) {
            case 1:
                tree[id].state.now[1] = 0
                break;
            case -1:
                tree[id].state.now[1] = (svgtree.src.innerhtml[tree[id].state.now[0]]).length -1
                break;
        }
        tree[id].behaviour = 0
    }
    
    // 3. automatically cycle through states:
    const allowautomaticcycling = false
    if( 
        allowautomaticcycling
        &&
        // if the tree is at the last sub-stage within its state:
        tree[id].state.now[1] >= (svgtree.src.innerhtml[tree[id].state.now[0]]).length - 1 
        &&
        // tree is not "protected"
        ! svgelement.classList.contains("protected")
    ) {
        if (
            (
                // if there's a heap of fertile ash/mud
                tree[id].state.now[0] == 0
                // and is also a slow-growing tree (i.e., likely to take some time to start growing)
                && Math.random() > 1 / (absentTimeMultiplier * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is fully-grown
                tree[id].state.now[0] == 1
                // and is also a resilient tree (i.e., likely to take some time to dry-out)
                && Math.random() > 1 / (normalTimeMultiplier * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is dry
                tree[id].state.now[0] == 2
                // and is also a resilient tree (i.e., likely to resist catching fire)
                && Math.random() > 1 / (dryTimeMultiplier * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is burning
                tree[id].state.now[0] == 3
                // and, if it is a resilient tree (e.g., would burn for a longer time before getting charred)
                && Math.random() > 1 / (fireBurnTimeMultiplier * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is charred
                tree[id].state.now[0] == 4
                // and is also a resilient tree (i.e., likely to take some time to disintegrate)
                && Math.random() > 1 / (charredTimeMultiplier * tree[id].properties.resilience)
            )
        ) { 
            // then, do nothing (i.e., let it stay in its current state)
        } 
        else {
            // move it to the next state
            tree[id].state.now[0]++ 
            // but if the next state exceeds the total states, then reset the tree to state-0.
            if ( tree[id].state.now[0] >= svgtree.src.innerhtml.length )
                tree[id].state.now[0] = 0
            // and: whatever stage the tree moves to, set its sub-stage to be 0
            tree[id].state.now[1] = 0 
        }
    }

    /* update the class attached to the tree's html-element  */
    // 1. erase all previous classes:
    const classes = svgelement.classList
    for (let i = 0; i < classes.length; i++) {
        svgelement.classList.remove(classes[i])
    }
    // 2. add a class specifying the tree's newly assigned state:
    let classs =[]
    switch (tree[id].state.now[0]) {
        case 0:
            classs.push("absent")
            break;
        case 1:
            classs.push("normal")
            break;
        case 2:
            classs.push("dry")
            break;
        case 3:
            classs.push("burning")
            break;
        case 4:
            classs.push("charred")
            break;
        case 5:
            classs.push("charred")
            break;
    }
    if (tree[id].isProtected == true)
        classs.push("protected")
    if(classs.length>0) // this condition should always evaluate to true, but it's good to still check
        svgelement.classList.add(...classs)
    else console.log(`warning!: tree-${id} did not get assigned a state-class. please check source-code.`)

    // console.log("change t# " + id)
    // console.log(tree[id])

    /* tree changes appearance: */
    // -- 1. it updates its svg shape
    svgelement.innerHTML = svgtree.src.innerhtml[tree[id].state.now[0]][tree[id].state.now[1]]
    // -- 2. it sets the colour for those svg-shapes

    // -- 3. sound feedback:
    //      -- tree catches fire (i.e., was not burning before, but is now)
    if (tree[id].state.previous[0] != 3 && tree[id].state.now[0] == 3) { 
        playSound(sCatchFire, volumeScaler.sCatchFire)
    }

    /*  state-specific behaviour:
        if the tree is on fire, make the fire crackle (visually)
        */
    const fireCrackleTime = 600
    /** @type {any} */
    let fires = svgelement.getElementsByClassName("fire")
    for (let i = 0; i < fires.length; i++) {
        if((new Date()).getMilliseconds()%2==(id%2))
            // fire gets darker
            fires[i].style.fill = randomiseHSLColour('--firedarker', 0, 5)
        else // fire gets less dark
            fires[i].style.fill = randomiseHSLColour('--fire', 0, 5)
    }
}

/*  ------------------------------------------------------------
    sound
    ------------------------------------------------------------  */

const soundsrc = "assets/sound/"
let sCatchFire = new Audio(soundsrc + 'catchfire.mp3');
let sGoodNews = new Audio(soundsrc + 'twinkle.mp3');
let sBurning = new Audio(soundsrc + 'ambient-burning.mp3');
let sForest = new Audio(soundsrc + 'ambient-forest.mp3');
let sEagle = new Audio(soundsrc + 'eagle.mp3');

const volumeScaler = {
    sCatchFire: .03125,
    sGoodNews: .03125,
    sBurning: 1,
    sForest: .25,
    sEagle: .125
}

// count the number of trees in any particular state
/** @param {string} state */
function percentageOfTrees(state) {
    let trees = document.getElementsByClassName(state)
    return Number(trees.length / totalTreesInForest)
}

/**
 * even if the sound is currently playing, stop it and play it again.
 * @param {*} sound 
 * @param {number} [volume=1] 
 */
function forcePlaySound(sound, volume) {
    sound.currentTime = 0
    playSound(sound, volume)
}

/**
 * @param {*} sound 
 * @param {number} [volume=1] 
 */
function playSound(sound, volume) {
    // if(sound.ended) {
    // sound.currentTime = 0
    // note: mute audio if the document loses focus (e.g., if the person switches tabs)
    sound.volume = document.hasFocus() ? volume : 0
    sound.play()
    // }
}

/*  ------------------------------------------------------------
    infoBox
    ------------------------------------------------------------  */

const headlines = {
    good: [
        /**
         * note: generated by openai's chatgpt in 202311
         * prompt ~ 
         * news headlines describing human activities that are helpful for the environment and mitigate climate change (5–12 words in length). with each "headline", add a longer "byline" (which is 90–120 words long), that better explains the activity; it can also include names of ministers, companies, organisations; it can also refer to specific regions or countries in the world. in the byline, try to include some statistics about the issue being described. also: for each item, please include a "source", which is a name of a newspaper, journal, or publication. also include an "author", which can be the name of a single person, or multiple (2–3) people. and, finally, include a "date" which comprises a month and a date (but do not specify a year). an example of the typical date format is "Sep 17".
         */
        {
            "headline": "Solar Revolution Powers India's Green Future",
            "byline": "India's Ministry of New and Renewable Energy, in collaboration with leading solar companies, has installed over 35 gigawatts of solar capacity across the nation. This ambitious initiative aims to reduce greenhouse gas emissions by 30% in 10 years, helping combat climate change. The solar industry now employs over 300,000 people, providing a substantial boost to the economy while contributing to India's commitment to cleaner energy sources. This transition to solar power has already saved the country 55 million tons of CO2 emissions annually, making it a crucial step in India's commitment to environmental sustainability and a greener future.",
            "source": "The Times of Bharat",
            "author": "Priya Sharma",
            "date": "Mar 15"
        },
        {
            "headline": "Urban Forests Thrive: London Plants One Million Trees",
            "byline": "London's Mayor, Boris Khan, has launched a city-wide initiative to plant one million trees within 5 years. These trees will capture an estimated 2,500 tons of CO2 annually and enhance urban biodiversity. The effort involves community engagement, schools, and partnerships with environmental organizations, demonstrating that cities can be part of the solution to climate change. London's urban forest initiative, which has already planted 500,000 trees, is expected to reduce the city's annual CO2 emissions by an impressive 150,000 tons, providing a greener and healthier future for its residents.",
            "source": "The British Guardian",
            "author": "John Smith and Emma Wilson",
            "date": "Apr 22"
        },
        {
            "headline": "Electric Car Sales Soar, Norway Leads the Charge",
            "byline": "Norway has become a global leader in electric vehicle adoption, with 85% of new car sales being electric or hybrid vehicles. Government incentives, including tax breaks and toll exemptions, have encouraged this shift, reducing carbon emissions and air pollution. As a result, Norway's CO2 emissions from the transportation sector have significantly decreased. This transition to electric cars has led to a remarkable 40% reduction in urban air pollution levels, contributing to better public health and quality of life.",
            "source": "Energy Watch",
            "author": "Maria Andersen",
            "date": "Jul 9"
        },
        {
            "headline": "Plastic Waste Declines as Global Cleanup Campaign Gains Traction",
            "byline": "Environmental organizations and companies worldwide have organized massive cleanup efforts, removing millions of tons of plastic waste from oceans and coastlines. The United Nations reports a 30% reduction in ocean plastic pollution, highlighting the success of these campaigns. This collective action has contributed to the protection of marine ecosystems and mitigated climate change impacts. The reduction in ocean plastic pollution has led to a 15% decrease in harm to marine wildlife, preserving fragile ecosystems and ensuring a healthier planet.",
            "source": "International Geographic",
            "author": "David Wilson",
            "date": "Oct 4"
        },
        {
            "headline": "Reforestation Boom in Brazil's Amazon Rainforest",
            "byline": "Brazil's government, in partnership with international conservation organizations, is investing in large-scale reforestation projects in the Amazon. They aim to restore 100 million acres of rainforest in 10 years, with a focus on preserving biodiversity and absorbing CO2. This effort is critical in combating deforestation and safeguarding the planet's vital carbon sinks. Reforestation in the Amazon is already showing results, with a 25% reduction in deforestation rates and the preservation of countless species in one of the world's most biodiverse regions.",
            "source": "BARC News",
            "author": "Maria Santos and Juan Hernandez",
            "date": "Nov 20"
        },
        {
            "headline": "Renewable Energy Surpasses Fossil Fuels in Germany",
            "byline": "Germany has reached a milestone in its transition to clean energy. Renewable energy sources, including wind and solar, now produce more electricity than fossil fuels. This shift has significantly reduced carbon emissions and is a major step towards Germany's goal of becoming carbon-neutral within 25 years. With renewable energy contributing to 52% of the country's electricity supply, Germany sets an example for a sustainable energy future.",
            "source": "Der Spiel",
            "author": "Hans Müller",
            "date": "May 8"
        },
        {
            "headline": "China's Green Belt Initiative Aims to Combat Desertification",
            "byline": "China's Ministry of Ecology and Environment is leading a nationwide effort to combat desertification through its Green Belt initiative. By planting trees and vegetation in arid regions, the program aims to restore 50 million acres of land in 10 years, reducing soil erosion and sequestering carbon. This initiative is crucial in the fight against desertification and its adverse effects on climate and agriculture.",
            "source": "Southern Chinese Morning Post",
            "author": "Li Wei",
            "date": "Jun 14"
        },
        {
            "headline": "Netherlands Invests in Coastal Protection to Counter Rising Sea Levels",
            "byline": "The Netherlands is implementing an extensive coastal protection plan to adapt to rising sea levels. Investments in dikes, storm surge barriers, and beach nourishment aim to safeguard the low-lying country from the threats of climate change. These measures are part of the Dutch Delta Program, which is considered one of the world's most comprehensive strategies to address sea level rise and protect coastal communities.",
            "source": "Scandinavian News Network",
            "author": "Sophie van der Meer",
            "date": "Aug 30"
        },
        {
            "headline": "Australia's Great Barrier Reef Shows Signs of Recovery",
            "byline": "Efforts to protect and restore Australia's Great Barrier Reef are showing progress. Coral restoration projects and reductions in pollution have led to an increase in coral cover. While challenges persist, including climate change impacts, these conservation initiatives provide hope for the world's largest coral reef system and the diverse marine life it supports.",
            "source": "The Sydney Morning Owl",
            "author": "James Cooper",
            "date": "Sep 12"
        },
        {
            "headline": "Kenya's Reforestation Efforts Combat Deforestation and Boost Economy",
            "byline": "Kenya's government, in partnership with organizations and local communities, is planting millions of trees to combat deforestation and promote sustainable forestry. The initiative has led to increased forest cover, reduced soil erosion, and the creation of jobs in the forestry sector. In 10 years, Kenya aims to restore 5.1 million acres of degraded land and enhance its natural carbon sequestration capacity.",
            "source": "Press Office, UNAfrica",
            "author": "Alice Mwangi",
            "date": "Jul 27"
        },
        {
            "headline": "Green Buildings on the Rise Worldwide",
            "byline": "The construction industry is increasingly adopting sustainable building practices, with a growing number of green buildings and eco-friendly construction materials. This trend is reducing the carbon footprint of the built environment and improving energy efficiency. Green buildings not only help mitigate climate change but also offer cost savings and enhanced quality of life for occupants.",
            "source": "Green Architectural Digest",
            "author": "Michael Chen",
            "date": "Apr 5"
        },
        {
            "headline": "Sweden's Carbon Tax Encourages Emissions Reduction",
            "byline": "Sweden's carbon tax, introduced in the early 1990s, has played a significant role in curbing greenhouse gas emissions. The tax incentivizes businesses and individuals to reduce their carbon footprint by taxing emissions from fossil fuels. This policy has led to a substantial decrease in emissions and demonstrates the potential of carbon pricing as a tool to combat climate change.",
            "source": "Swedish Fika Times",
            "author": "Eva Eriksson",
            "date": "Oct 19"
        },
        {
            "headline": "Eco-Friendly Agriculture Practices Flourish in India",
            "byline": "Indian farmers are embracing eco-friendly agriculture practices, including organic farming and sustainable crop rotation. These methods reduce the use of chemical pesticides and fertilizers, preserving soil health and biodiversity. Such practices contribute to mitigating the environmental impact of agriculture while promoting food security and sustainability.",
            "source": "The Non-Fascist Hindu",
            "author": "Rajesh Patel",
            "date": "Feb 11"
        },
        {
            "headline": "Costa Rica Achieves Carbon Neutrality and Sets New Goals",
            "byline": "Costa Rica has become one of the first countries to achieve carbon neutrality. This accomplishment was reached through a combination of renewable energy sources, reforestation efforts, and sustainable land use practices. The country's commitment to sustainability is evident in its plans to become fully fossil fuel-free and achieve even greater carbon neutrality in the coming years.",
            "source": "CR Times",
            "author": "Ana Rodriguez",
            "date": "Nov 7"
        },
        {
            "headline": "Innovative Water Recycling Solutions Combat Drought in California",
            "byline": "California is tackling water scarcity and drought with innovative water recycling technologies. These systems purify wastewater to make it safe for drinking and irrigation, reducing the strain on traditional water sources. As California faces increasingly severe droughts due to climate change, these solutions are crucial for ensuring water sustainability in the state.",
            "source": "The Greater Floridian Times",
            "author": "Daniel Martinez",
            "date": "Jun 3"
        },
        {
            "headline": "Green Transportation Initiatives Transform New York City",
            "byline": "New York City is undergoing a green transportation revolution, with expanded bike lanes, electric buses, and incentives for carpooling. These initiatives are reducing congestion, air pollution, and greenhouse gas emissions. New York City aims to create a more sustainable and accessible urban environment while mitigating the impacts of climate change.",
            "source": "The NNY Times",
            "author": "Jennifer Lee",
            "date": "Aug 9"
        },
        {
            "headline": "Indonesia's Mangrove Reforestation Fights Coastal Erosion",
            "byline": "Indonesia is investing in mangrove reforestation to combat coastal erosion and protect communities from rising sea levels. Mangrove forests act as natural buffers, absorbing wave energy and reducing the impact of storms. This effort not only helps mitigate climate change but also safeguards the livelihoods of coastal residents.",
            "source": "Djakarta News Network",
            "author": "Rizki Pratama",
            "date": "Sep 28"
        },
        {
            "headline": "South Africa's Renewable Energy Boom Reduces Coal Dependency",
            "byline": "South Africa is experiencing a renewable energy boom, with significant investments in wind and solar power. This transition reduces the country's dependency on coal and decreases carbon emissions. South Africa's commitment to green energy aligns with global efforts to combat climate change and transition to cleaner energy sources.",
            "source": "The Times of South African",
            "author": "Lungelo Nkosi",
            "date": "Jul 17"
        },
        {
            "headline": "Ecuador's Yasuni-ITT Initiative Protects Amazon Rainforest",
            "byline": "Ecuador's Yasuni-ITT initiative pledges to keep oil reserves beneath the Amazon rainforest untapped, protecting one of the world's most biodiverse regions. This initiative aims to reduce carbon emissions by preserving the rainforest and preventing deforestation. By doing so, Ecuador contributes to global climate change mitigation and sets an example for conservation efforts worldwide.",
            "source": "The Ecuadorian Times",
            "author": "Carlos Lopez",
            "date": "Dec 2"
        },
        {
            "headline": "Efforts to Reduce Food Waste Gain Momentum Worldwide",
            "byline": "Efforts to reduce food waste are gaining momentum globally, with governments, businesses, and individuals taking action to prevent food loss. Reducing food waste not only conserves resources and reduces methane emissions from landfills but also addresses food insecurity and contributes to sustainability.",
            "source": "World Foods Journal",
            "author": "Lucia Rodriguez",
            "date": "Mar 19"
        },
        {
            "headline": "Japan's Green Roofs Initiative Enhances Urban Biodiversity",
            "byline": "Japan's green roofs initiative promotes the installation of vegetation on rooftops, enhancing urban biodiversity and mitigating the urban heat island effect. These green roofs improve air quality, reduce energy consumption, and provide habitat for wildlife. Japan's efforts in urban greening align with global goals to create more sustainable cities.",
            "source": "So-so Tokyo",
            "author": "Yuki Nakamura",
            "date": "Jun 27"
        },
        {
            "headline": "Clean Energy Transforms Portugal into a Renewable Powerhouse",
            "byline": "Portugal has become a renewable energy powerhouse, with over 50% of its electricity coming from wind, solar, and hydropower. This transition has significantly reduced carbon emissions and made Portugal a leader in clean energy production. The country's efforts to transition to green energy are instrumental in mitigating climate change.",
            "source": "Portuguese e-Gazette",
            "author": "Carlos Silva",
            "date": "Oct 14"
        },
        {
            "headline": "Green Technology Spurs Sustainable Farming in the Netherlands",
            "byline": "The Netherlands is embracing green technology in agriculture, using precision farming, drones, and sustainable practices. These innovations reduce the environmental impact of farming, lower pesticide use, and enhance crop yields. The Netherlands sets an example for sustainable agriculture practices and climate-conscious farming.",
            "source": "Dutch Agriculturalists Today",
            "author": "Marta van den Berg",
            "date": "Apr 30"
        },
        {
            "headline": "Chile's Protected Marine Areas Preserve Ocean Ecosystems",
            "byline": "Chile is expanding its network of protected marine areas to safeguard ocean ecosystems and combat overfishing. These conservation efforts help maintain biodiversity and mitigate climate change by protecting vital marine habitats. Chile's commitment to marine preservation is vital for the health of the world's oceans.",
            "source": "Associated Press Chile",
            "author": "Diego Rodriguez",
            "date": "Aug 16"
        }
    ],
    bad: [
        /** 
         * note: generated by openai's chatgpt in 202311
         * prompt ~ 
         * news headlines describing human activities that are ultimately harmful for the environment and cause climate change. with a longer byline for each headline, that better explains the issue (and can also includes names of ministers, companies, organisations). try to include some statistics about the issue being described. also: for each item, please include a "source", which is a name of a newspaper, journal, or publication. also include an "author", which can be the name of a single person, or multiple (2–3) people.
        */
        {
            "headline": "Brazil's Deforestation Spurs Climate Crisis",
            "byline": "Rising deforestation rates in the Amazon, led by Environment Minister Carlos Silva, have resulted in a concerning 30% increase in greenhouse gas emissions. Environmental organizations like GreenWatch urge Brazil to take immediate action to combat climate change, as the country's deforestation is contributing to the loss of 50,000 square kilometers of forest each year.",
            "source": "EcoWorld News",
            "author": "Maria Santos",
            "date": "Jul 10"
        },
        {
            "headline": "Caribbean Plastics Imperil Marine Life and Climate",
            "byline": "The plastic waste crisis engulfs the Caribbean as islands grapple with 8 million tons of plastic pollution yearly. Oceanographer Dr. Maria Rodriguez warns that this environmental disaster not only threatens marine life but also contributes to the region's escalating climate issues. Approximately 1,000 marine species are affected, and the plastic pollution contributes to a 1.5% annual increase in the Caribbean's sea surface temperature.",
            "source": "Oceanic Observer",
            "author": "John Martinez",
            "date": "Sep 18"
        },
        {
            "headline": "Southeast Asia's Rapid Urban Growth Intensifies Climate Challenges",
            "byline": "In the face of unprecedented urban expansion, cities in Southeast Asia are grappling with the consequences. Climate experts, like Professor James Chen, highlight how the region's urban sprawl leads to habitat fragmentation, increased energy consumption, and heightened climate challenges. With urban populations set to reach 455 million in 10 years, this rapid growth results in a 35% increase in carbon emissions.",
            "source": "Urban Insights",
            "author": "Lisa Chang",
            "date": "Mar 5"
        },
        {
            "headline": "Emissions Surge Tied to Unregulated Chinese Industries",
            "byline": "A recent study, led by climate scientist Dr. Li Wei, reveals the alarming role of unregulated industries in China. These sectors have contributed to a sharp rise in global emissions, accounting for 30% of the world's carbon footprint. Calls for international cooperation to mitigate climate change intensify. China's unregulated industries are responsible for a 40% increase in CO2 emissions in the past 15 years.",
            "source": "Climate Impact Journal",
            "author": "David Wang and Emily Liu",
            "date": "Nov 14"
        },
        {
            "headline": "Global Meat Supply Chain Linked to Methane Emissions",
            "byline": "The global meat supply chain, controlled by fast-food giants like BurgerDeluxe, is under scrutiny as methane emissions from cattle rearing reach concerning levels. Environmentalists and experts, including Sarah Anderson, warn that these emissions are a significant contributor to climate change, demanding a reevaluation of food production practices. The meat industry alone is responsible for 14.5% of global greenhouse gas emissions.",
            "source": "Sustainable Living Gazette",
            "author": "Sophia Reynolds",
            "date": "Jun 27"
        },
        {
            "headline": "Indonesia's Forest Fires Stoke Climate Crisis",
            "byline": "Annual forest fires in Indonesia, worsened by palm oil companies, release staggering amounts of carbon dioxide. Dr. Adi Kusumo, a leading environmental scientist, asserts that urgent action is needed to protect both the country's rich biodiversity and global climate stability. Indonesia's forest fires contribute to 1.8 gigatons of CO2 emissions annually.",
            "source": "Environmental Pulse",
            "author": "Liam Brown",
            "date": "Oct 8"
        },
        {
            "headline": "Plastic Pollution in Southeast Asian Rivers Amplifies Climate Concerns",
            "byline": "Southeast Asia grapples with plastic waste suffocating its rivers, with a shocking 80% originating from corporations like PlastiCorp. Environmental advocates, including Dr. Priya Sharma, raise alarms as this plastic onslaught negatively impacts ecosystems and climate change. It's estimated that over 3 million metric tons of plastic are dumped into Southeast Asian waters each year.",
            "source": "EcoWatch Asia",
            "author": "Anna Nguyen and Daniel Smith",
            "date": "Apr 19"
        },
        {
            "headline": "African Mining Boom Fuels Carbon Emissions Crisis",
            "byline": "The mining industry's rapid expansion across Africa, supported by major players like GoldEx, contributes to an alarming surge in carbon emissions. Climate researchers, including Professor Mohammed Diop, emphasize the urgent need to address this growing environmental threat. The mining sector in Africa has witnessed a 20% increase in emissions in the last decade.",
            "source": "African Environmental Review",
            "author": "Kwame Nkrumah",
            "date": "Jul 12"
        },
        {
            "headline": "European Aviation's Carbon Footprint Soars Amidst Low-Cost Travel Boom",
            "byline": "Low-cost airlines, including FlyGreen, drive a dramatic rise in Europe's aviation carbon emissions. Experts like Dr. Elena Petrov highlight the connection between affordable air travel and increased climate impact, urging airlines to adopt greener practices. The aviation industry accounts for 2.5% of global carbon emissions, and Europe's low-cost carriers are among the fastest-growing contributors.",
            "source": "Air Travel Insights",
            "author": "Sophie Brown",
            "date": "Feb 4"
        },
        {
            "headline": "Overfishing in the North Atlantic Threatens Ecosystems and Climate Stability",
            "byline": "The North Atlantic faces a severe overfishing crisis, with fisheries driven by corporations like SeaHarvest. Marine biologists, such as Dr. Maria Vargas, stress the repercussions on marine ecosystems and the broader impact on climate change. Overfishing has led to a 30% decline in North Atlantic fish populations in the past decade.",
            "source": "Marine Life Monitor",
            "author": "Mark Roberts",
            "date": "Sep 21"
        },
        {
            "headline": "Permafrost Thaw in Russia Accelerates Methane Release",
            "byline": "As Russia's permafrost continues to thaw due to warming temperatures, methane emissions surge, according to the findings of Dr. Ivan Petrov. This vicious cycle intensifies climate concerns, calling for immediate action to mitigate the consequences. The thawing permafrost releases over 2 million metric tons of methane annually.",
            "source": "Climate Science Digest",
            "author": "Olga Ivanova",
            "date": "May 15"
        },
        {
            "headline": "Mining in the Amazon Basin Spurs Mercury Pollution and Climate Impact",
            "byline": "Illegal gold mining operations in the Amazon Basin, linked to companies like GoldRush Ltd., have resulted in mercury pollution. Climate scientist Dr. Sofia Ramirez underscores how this toxic element amplifies environmental and climate crises. Mercury pollution from mining is responsible for a 10% increase in Amazonian water toxicity and a 5% rise in regional temperatures.",
            "source": "Rainforest Watch",
            "author": "Carlos Martinez",
            "date": "Nov 9"
        },
        {
            "headline": "Melting Glaciers in the Himalayas Trigger Water Scarcity and Climate Anxiety",
            "byline": "Himalayan glaciers are melting at an alarming rate, causing water scarcity in the region. Dr. Raj Patel, a glaciologist, warns that this alarming trend is not only a threat to the livelihoods of millions but also a contributor to global climate concerns. The melting glaciers result in a 20% reduction in freshwater availability in the Himalayan region.",
            "source": "Mountain Times",
            "author": "Nina Gupta",
            "date": "Apr 30"
        },
        {
            "headline": "South American Cattle Ranching Expands, Contributing to Methane Emissions",
            "byline": "The expansion of cattle ranching in South America, driven by meat industry giants like BeefWorld, leads to a surge in methane emissions. Environmentalists, including Maria Alvarez, emphasize the urgent need for sustainable farming practices. Methane emissions from cattle ranching contribute to a 15% increase in overall South American greenhouse gas emissions.",
            "source": "Agricultural Insight",
            "author": "Pedro Rodriguez",
            "date": "Jul 7"
        },
        {
            "headline": "Oil and Gas Extraction in the Arctic Amplifies Climate Crisis",
            "byline": "Arctic oil and gas extraction operations, led by companies like ArcticDrill Corp, escalate greenhouse gas emissions. Climate scientists, including Dr. Emma Larsson, stress the dire consequences of Arctic resource exploitation on global climate stability. Arctic oil and gas extraction is responsible for a 12% increase in overall global carbon emissions.",
            "source": "Polar Energy Review",
            "author": "Olivia White",
            "date": "Oct 11"
        },
        {
            "headline": "Coal Mining in India's Heartland Fuels Air Pollution and Climate Change",
            "byline": "Extensive coal mining in India's heartland, largely driven by companies such as CoalPower Ltd., results in severe air pollution and greenhouse gas emissions. Environmental advocates and health experts, including Dr. Anika Verma, call for cleaner energy alternatives. Coal mining in India contributes to a 7% rise in air pollution levels and a 6% increase in the country's greenhouse gas emissions.",
            "source": "Indian Environmental News",
            "author": "Rajesh Sharma and Priya Gupta",
            "date": "Mar 3"
        },
        {
            "headline": "Agricultural Intensive in the American Midwest Aggravates Climate Change",
            "byline": "Intensive agriculture in the American Midwest, under the influence of agribusiness giants like AgriCo, contributes to soil degradation and greenhouse gas emissions. Soil scientist Dr. Mark Thompson underscores the critical need for sustainable farming practices. The extensive agricultural activities in the American Midwest lead to a 10% decrease in soil quality and an 8% increase in regional greenhouse gas emissions.",
            "source": "Midwest Farming Gazette",
            "author": "Michael Johnson",
            "date": "Aug 20"
        },
        {
            "headline": "Illegal Wildlife Trade Across Southeast Asia Poses Threat to Biodiversity and Climate",
            "byline": "Illegal wildlife trade across Southeast Asia, aided by underground networks, threatens both biodiversity and global climate stability. Conservationist Dr. Leanne Nguyen highlights the profound ecological and climate impacts. The illegal wildlife trade leads to a 5% decrease in Southeast Asia's biodiversity and a 3% rise in wildlife-related carbon emissions.",
            "source": "Wildlife Watch Weekly",
            "author": "Emily Wilson and James Chen",
            "date": "Apr 2"
        },
        {
            "headline": "Australia's Expanding Coal Industry Sparks Climate Controversy",
            "byline": "Australia's coal industry expansion, supported by major companies like OzCoal Ltd., raises climate concerns. Environmentalists, including Dr. James Turner, argue that Australia's commitment to combating climate change is at odds with its coal exports. The expansion of Australia's coal industry contributes to a 10% increase in the country's carbon emissions and a 7% rise in global coal consumption.",
            "source": "Australian Climate Herald",
            "author": "Sophia Reynolds",
            "date": "Jun 29"
        },
        {
            "headline": "Microplastics in European Waterways Compound Marine Ecosystem Stress and Climate Impact",
            "byline": "The presence of microplastics in European waterways, largely attributed to industries like PlastiTech, deepens the stress on marine ecosystems and contributes to the climate crisis. Researchers, including Dr. Elena Petrov, emphasize the need for comprehensive solutions to tackle this issue. The microplastics in European waterways are responsible for a 5% increase in marine ecosystem stress and a 2% rise in regional temperatures.",
            "source": "Waterway Watch Europe",
            "author": "Lucas Martinez and Maria Andersen",
            "date": "Dec 13"
        }
    ]
};

/** @type {HTMLElement} */
const infoBox = document.getElementById('infoBox')

const infoBoxTransitionDuration = 600
const showBoxDelayDuration = 600
updateStyle(infoBox,"transition-duration",infoBoxTransitionDuration+'ms')

// sets the content and display-position of the infoBox at startup
setInfo(infoBox, 0)
hideBox(infoBox, true)

/** 
 * @returns {object} 
 * @param {number} infotype
*/
function fetchHeadline(infotype) {
    let newstype = /* placeholder */ ""
    switch(infotype) {
        case 3: newstype = "good"; break;
        case 4: newstype = "bad"; break;
    }
    return headlines[newstype][Math.floor(headlines[newstype].length * Math.random())]
}

/**
 * @param {*} box
 * @param {number} infotype - 1: intro | 2: instructions to tap | 3: good news | 4: bad news | 0: conclusion
 */
function setInfo(box, infotype) {
    box.setAttribute('infotype', infotype)
    // first, empty-out the box
    box.innerHTML = ``
    // populate the box
    switch(infotype) {
        case 1:
            // add info
            let i1 = addChildTag("h3")
            i1.innerHTML = `our world is like a forest.<br>what we do in our world,<br>we do to the forest too.`
            let i2 = addChildTag("p")
            i2.innerHTML = `when needed, please nurture a tree by tapping on it.`
            break;
        case 2:
            // add instructions
            let p1 = addChildTag("h3")
            p1.innerHTML = `you can save the forest.`
            let p2 = addChildTag("p")
            p2.innerHTML = `please tap on a dry or burning tree to save it.`
            break;
        case 3:
        case 4:
            // add message
            let message = addChildTag('h3')
            message.innerHTML = `this news, just in!`
            // add news
            let newHeadline = fetchHeadline(infotype)
            let headline = addChildTag('p')
            headline.classList.add('quote')
            let date = newHeadline.date + ", " + (Number((new Date()).getFullYear()) + gameState.infoBoxSeenCounter + 1)
            headline.innerHTML = `
                <span class="headline">
                    ${newHeadline.headline}
                </span> 
                <br>
                ${newHeadline.source} 
                <br>
                <span class="date">${date}</span>
            `
            break;
        case 0:
            // add info
            let c1 = addChildTag('h3')
            c1.innerHTML = `thank you for playing.`
            let c2 = addChildTag('p')
            c2.innerHTML = `please read about why we made this.`
            break;
    }
    // add close-button to dismiss box
    if(infotype!=0) {
        let closeBtn = addChildTag('button')
        closeBtn.innerHTML = infotype==1?'<p>go to the forest:</p>':'<p>return to the forest.</p>'
        closeBtn.setAttribute('id', 'closeInfoBox')
        closeBtn.addEventListener('click', () => {
            hideBox(infoBox, true)
            showcontent(false)
        })
    }
    // add button to reveal article
    if(
        infotype==0 
        || infotype==1 
        || (gameState.infoBoxSeenCounter>=INFOBOXCOUNTLIMIT && gameState.playTime>=1000*60)
    ) {
        let readBtn = addChildTag('button')
        readBtn.innerHTML = '<p>read about this project.</p>'
        readBtn.setAttribute('id', 'read')
        readBtn.addEventListener('click', () => showcontent(true))
    }

    /** 
     * @param {string} tag  
     */
    function addChildTag(tag) {
        let child = document.createElement(tag)
        box.appendChild(child)
        return child
    }
}

/**
 * @returns {boolean} tracks whether the element is displayed or not 
 * @param {*} box
 */
function boxDisplayAttrIs(box) {
    const attr = box.getAttribute('display')
    switch(attr) {
        case "true": return true;
        case "false": return false;
    }
}

/**
 * @param {*} box 
 * @param {boolean} [count=true] - increment gameState.infoBoxSeenCounter?
 */
function showBox(box, count) {
    box.setAttribute('display', true) // note: keep this statement outside the setTimeout(), to prevent showBox() from being called multiple times before the delayed actions (below) happen.
    const infotype = Number(box.getAttribute('infotype'))
    setTimeout(function() {
        // sound:
        switch(infotype) {
            case 0: 
            case 3: 
                forcePlaySound(sGoodNews, volumeScaler.sGoodNews); 
                break;
            case 4: forcePlaySound(sCatchFire, volumeScaler.sCatchFire); break;
        }
        // visual:
        box.style.height = `fit-content`
        box.style.height = `${box.offsetHeight}px` //`calc(100vh - 2rem)`
        box.style.bottom = `1rem` //`calc(100vh - 1rem)`
    }, showBoxDelayDuration)
    if(count) gameState.infoBoxSeenCounter++
    // console.log(`infoBoxSeenCounter: ${gameState.infoBoxSeenCounter}`)
}

/**
 * @param {*} box 
 * @param {boolean} [seed=true] - seedDryTrees when box closes?
 */
function hideBox(box, seed) {
    box.setAttribute('display', false)
    console.log(`hiding infoBox.`)
    box.style.bottom = `-100vh`
    box.style.height = "0"
    if (seed) {
        let seeds = 1
        const infotype = Number(box.getAttribute('infotype'))
        switch (infotype) {
            case 3: // good news
                seeds = Math.round(gameState.infoBoxSeenCounter / 2)
                console.log(`good news. will now call seedDryTrees(${seeds})`)
                seedDryTrees(Math.max(seeds, 1))
                break;
            case 4: // bad news
                seeds = Math.round(gameState.infoBoxSeenCounter * 1.5)
                console.log(`bad news. will now call seedDryTrees(${seeds})`)
                seedDryTrees(Math.max(seeds, 1))
                break;
            default:
                console.log(`neither good nor bad news. will *not* seed dry trees.`)
                break;
        }
    } else console.log(`dry-trees will *not* be seeded.`)
}

/*  ------------------------------------------------------------
    collect information before drawing tree
    ------------------------------------------------------------  */

const svgtree = {
    src: {
        starttag: '<svg viewBox="0 0 50 150">',
        innerhtml: [
            // 0: fertile earth
            [
                /* dead 10 */ '<polygon class="stump" points="24.89 147.04 25.21 145.96 25.87 146.15 26.94 147.34 24.02 147.34 24.89 147.04"/>',
            ],
            // 1: growing tree
            [
                /* 1: shoot */ '<path class="foliage" d="M24.91,149.48c-2.72,0-4-1.44-4.08-3.5-.08-1.81,1.4-1.75,2.66-1.45a14.89,14.89,0,0,1-.94-5c.09-1.93,1-3.23,1.67-3.15s1.21.86,1.42,6.55c.37-.51,1.28-2.32,2.36-2,1.53.46.07,2.5-.51,3.18a3,3,0,0,1,1.42,2C29.22,147.58,27,149.48,24.91,149.48Z"/>',
                /* 2 */ '<path class="foliage" d="M24.76,144.4l0,2.89.33,0v-2.88a3.1,3.1,0,0,0,2.55-1.25,3.46,3.46,0,0,0,.31-2.55A1.72,1.72,0,0,0,29,138.72a1.67,1.67,0,0,0-1.34-1.27c1.05-.51,2.23-2.81,1.4-3.45-1.23-.95-2,.64-2.74,1.21,0-2.52.19-4.27-1.53-4.27-2,0-1.76,4.11-1.22,5.68,0,0-2.36-.19-2.68,1.53A2.86,2.86,0,0,0,22,141.09c.16.06-.58,1.18-.16,2.13S23.66,144.4,24.76,144.4Z"/>',
                /* 3 */ '<path class="foliage" d="M21.07,141a2.66,2.66,0,0,1,2-2.08c-1.46-1.09-2.65-2.08-2.53-3.64a3.84,3.84,0,0,1,1.9-2.74c-1.79-2.17-1.23-3.51-.6-3.92s2.28.41,2.51.6c-.51-4.07-.58-5.8.64-5.92,2-.19,1.83,1.92,1.4,6.13,1.47-2,2.6-3.38,3.45-2.09.36.56-.58,1.88-2.34,4.56,1.06.11,2.13.4,2.47,1.22.5,1.24-.13,2.93-2.13,4.37a2,2,0,0,1,1,2.24,1.4,1.4,0,0,1-1.17,1.15,2,2,0,0,1,.08,2.29c-.48.75-1.59.91-2.62,1v3.45l-.48,0,0-3.53C22.55,143.5,20.9,142.3,21.07,141Z"/>',
                /* 4 */ '<path class="foliage" d="M24.81,147.24h.51l-.06-5.39a3.44,3.44,0,0,0,3-2.26,3.06,3.06,0,0,0-1.52-3.76c1.5,0,2.7-.43,2.9-2.3.15-1.39-.14-2-1.19-2.55,1.4-.55,1.28-1.89,1.19-3.15-.11-1.51-.84-1.69-1.62-2.34,1.3-1.44,1.64-2.86,1.19-3.32s-1.43-.16-2.47.43c0-1.56-.13-4.09-1.36-4.09-1.43,0-1.47,2.92-1.44,5.15a1.49,1.49,0,0,0-2.13.21c-.69.68-.58,2.42.89,3.7a3.3,3.3,0,0,0-2.9,3.05c0,1.55,1.31,2,2.94,2.78-.8.44-1.73,1-1.28,2.58.19.67,1,.81,1.67,1a3.64,3.64,0,0,0-.78,2.61c.18,1.6,2.35,2.22,2.46,2.26Z"/>',
                /* 5 */ '<path class="foliage" d="M24.59,140.86v6.76l.7,0v-6.8c2.72-.05,4.26-1.67,4.25-3,0-1-1.19-1.45-1.54-1.69a4.64,4.64,0,0,0,1.09-4,4.42,4.42,0,0,0-1.92-3c1.88-.68,2.78-2,2.54-4.41-.16-1.52-1.22-2.08-2.54-2.49,1.85-1.78,2.09-3.86,1.31-4.56-.44-.4-.67-.65-2.11-.56.07-2.06.33-4.71-1.08-4.71s-1.5,2.27-1.28,5a3.3,3.3,0,0,0-1.81,2.84A6.65,6.65,0,0,0,24,125c-2,.36-4.28,2.23-4.67,4-1,4.53,1.19,5.64,3.24,5.93a2.71,2.71,0,0,0-1.38,2.68C21.27,139.15,22.67,140,24.59,140.86Z"/>',
                /* 6 */ '<path class="foliage" d="M24.64,137.79l-.11,9.49h.83l0-9.54c2-.32,3.9-.64,4.45-2.46.49-1.62-.06-3.45-1.66-5.37,1.63-.81,2.41-1.77,2.2-3.46a6.18,6.18,0,0,0-2.2-3.94,1.44,1.44,0,0,0,1.21-1.72,1.42,1.42,0,0,0-1.47-1,3.65,3.65,0,0,0-1.08-7c1.08-1,1.49-2.06.7-2.74a1.67,1.67,0,0,0-1.66,0c.19-1.7-.66-4.51-1.64-4.51-1.36,0-1.06,3.66-.91,6.87-.92.4-2.7.45-3.43,2.45-.9,2.5,1.06,4.67,2.05,5.4-.11,0-2.34,0-2.34,1.79,0,1.37,1.09,2.8,2.16,2.84a5.54,5.54,0,0,0-3.1,5.2,4.16,4.16,0,0,0,3.1,4.05c-.21.16-1,1.5-.55,2.27S22.87,137.49,24.64,137.79Z"/>',
                /* 7 */ '<path class="foliage" d="M24.44,137v10.65h.92V137c4.08-.8,4.72-1.27,4.78-3.38a3.7,3.7,0,0,0-1.88-3.1,2.18,2.18,0,0,0,2.46-1.31,1.55,1.55,0,0,0-1.34-1.46c.26-.1,2.47-.35,2.45-2.14s-1.81-3.29-4.34-4.85c1.53-.72,2.17-2.08,2.08-4.31a4.06,4.06,0,0,0-2.68-3.58,2.51,2.51,0,0,0,.76-2.55,2.4,2.4,0,0,0-1.08-1.34c1.34-1.44,1.53-2.43,1.24-3.29-.12-.38-1.21-.67-1.94-.19-.1-3.73-.32-5.46-1.79-5.3-.94.11-1,1-.58,3.1a2.42,2.42,0,0,0-2.55,1.63c-.5,1.75-.57,4.59,1.72,5.65a1.72,1.72,0,0,0-2.1,1,2.65,2.65,0,0,0,.89,3c-2,.66-3.26,2.58-3.25,5.23,0,2.25,2.45,3.58,4.27,3.7a2.8,2.8,0,0,0-1.82,2.65,5.27,5.27,0,0,0,2.08,3.48c-1.88.44-3.6.7-3.67,3.16C19,135,20.94,136.07,24.44,137Z"/>',
                /* 8 */ '<path class="foliage" d="M24.65,135v12.32h1V135a4.17,4.17,0,0,0,2.11-.9,4,4,0,0,0,1.08-1.34,2.64,2.64,0,0,0,2-1.78c.35-1.16-.3-2.08-1.4-3.13,2.57-.07,3.65-1.4,3.77-3.13.12-2-.9-4.3-2.56-5a2.19,2.19,0,0,0,1.41-2c0-1-.81-1.53-1.6-2.49a4.49,4.49,0,0,0,3.06-5c-.36-2.53-2.23-3.47-4.4-4.66a2.13,2.13,0,0,0,1-2.13c-.19-1.1-1-1.61-2.18-2.12a2.45,2.45,0,0,0,.62-3.15,2,2,0,0,0-2.77.41c-.22-1.05-.4-5.65-2-5.65-2,0-.87,5.11-.61,6.13-1.86-.92-4.05-1.14-4.64-.08-.77,1.36.31,3.38,2.51,4.29-3.28-.38-3.85,1.32-4.17,3.24-.37,2.17,1.29,3.63,3.15,4a2.79,2.79,0,0,0-1.07,2,3.08,3.08,0,0,0,1.7,2.36c-2.38.2-3.64.16-4.08,3.71a4.76,4.76,0,0,0,3.64,5.29,2.07,2.07,0,0,0-.77,1.54,2,2,0,0,0,1,1.72,2.86,2.86,0,0,0-2.55,3,2.73,2.73,0,0,0,3.17,2.38,9.53,9.53,0,0,0,1.43,1.39A9.55,9.55,0,0,0,24.65,135Z"/>',
                /* 9 */ '<path class="foliage" d="M24.65,135v12.32h1V135a4.17,4.17,0,0,0,2.11-.9,4,4,0,0,0,1.08-1.34,2.64,2.64,0,0,0,2-1.78c.35-1.16-.3-2.08-1.4-3.13,2.57-.07,3.65-1.4,3.77-3.13.12-2-.9-4.3-2.56-5a2.19,2.19,0,0,0,1.41-2c0-1-.81-1.53-1.6-2.49a4.49,4.49,0,0,0,3.06-5c-.36-2.53-2.23-3.47-4.4-4.66a2.13,2.13,0,0,0,1-2.13c-.19-1.1-1-1.61-2.18-2.12a2.45,2.45,0,0,0,.62-3.15,2,2,0,0,0-2.77.41c-.22-1.05-.4-5.65-2-5.65-2,0-.87,5.11-.61,6.13-1.86-.92-4.05-1.14-4.64-.08-.77,1.36.31,3.38,2.51,4.29-3.28-.38-3.85,1.32-4.17,3.24-.37,2.17,1.29,3.63,3.15,4a2.79,2.79,0,0,0-1.07,2,3.08,3.08,0,0,0,1.7,2.36c-2.38.2-3.64.16-4.08,3.71a4.76,4.76,0,0,0,3.64,5.29,2.07,2.07,0,0,0-.77,1.54,2,2,0,0,0,1,1.72,2.86,2.86,0,0,0-2.55,3,2.73,2.73,0,0,0,3.17,2.38,9.53,9.53,0,0,0,1.43,1.39A9.55,9.55,0,0,0,24.65,135Z"/>',
                /* 10 */ '<path class="foliage" d="M24.64,133.82v13.85h.83l.07-13.85a3.09,3.09,0,0,0,1.78-1.15,3.2,3.2,0,0,0,.58-2.36c2.17-.57,4.05-2,4.08-3.06a2.37,2.37,0,0,0-.89-2,2,2,0,0,0,1.53-2,2,2,0,0,0-1.53-1.85c1.95-.83,3.76-2.06,3.89-6,0-1.21-.67-5.45-4.34-6,2.18-1,2.36-3.71,2-5.56-.44-2.58-2.85-4.2-5.23-4.54a1.88,1.88,0,0,0,.45-1.91A1.92,1.92,0,0,0,26.11,96C29,94.89,30.05,92.81,29,91.34c-.86-1.18-2.11-1-4.34-.16.19-5.93-.16-8.29-1.59-8.29-1.22,0-2,2.84-1.54,5.29-.53-.05-3.05-.82-3.83,1-1.11,2.65.1,4.74,3.64,7.27-3.1.38-5.54,1.71-6.32,4.34-1.24,4.22,1.22,7,5.68,9.51a2.65,2.65,0,0,0-2.29,2,2.71,2.71,0,0,0,2.23,3.07c-1.72.09-4.6-.42-5.33,2.07-.82,2.77,1.34,4.18,3.61,5.46-1.83.64-2.74,1.81-2.72,3,0,1.54,2.27,3.32,5.46,3.51a3.59,3.59,0,0,0,1,2.94A5,5,0,0,0,24.64,133.82Z"/>',
                /* 11 */ '<path class="foliage" d="M24.43,134.7v12.39h.89V134.7c1-.49,2.58-.16,3.25-1.08a2.83,2.83,0,0,0,.52-1.47c2,.06,4.19.34,5-1.28.7-1.34-.07-3.64-1.22-5.87a2.62,2.62,0,0,0,.32-4.09c2.71-2.4,4.67-4.4,4.47-9.12-.15-3.67-4.6-4.85-5-5,2.15-2.34,3.21-5.43,2.18-8.08C34,96.48,32.11,96,29.53,95.32a3.94,3.94,0,0,0,2.68-5.17c-.8-2-3-3.51-5.42-1.85.17-2.3,1-3.48.19-4a2,2,0,0,0-1.72,0c-.06-3.86.72-5.88-.83-5.88-1.17,0-.93,1.11-1.6,3.45C22,80,21.24,79.52,20.69,80.11s-1.31,2.23.42,6.72c-.52,0-2.75,0-3.43,1-1.11,1.7,0,5.77,1.62,7.19-4.56,1.43-5.69,2.54-6,3.74a8.64,8.64,0,0,0,5.34,10.37,3,3,0,0,0-2.3,2.81,3,3,0,0,0,1.53,2.55c-2.55.45-4.53,1.7-4.72,3.77a4.3,4.3,0,0,0,2.17,4c-.73,2-2.1,3.62-1.34,5.42A4.91,4.91,0,0,0,20,130.3a7.52,7.52,0,0,0,4.41,4.4Z"/>',
                /* 12 */ '<path class="foliage" d="M24.32,135.7v11.53H25l-.26-11.44h.52l-.05,11.44h.43v-11.5a6.4,6.4,0,0,0,2.89-.37A6.31,6.31,0,0,0,30.66,134c3.68,0,5-1.83,5.53-2.78,1.44-2.69.43-5.69-1.57-6.66.82-.3,1.71-.42,1.74-1.66a2.78,2.78,0,0,0-1.15-2.51c3.7-1.2,6.06-4.47,6-7.41,0-4.64-2.52-6.55-5.54-7.15,2.06-1.28,3.88-2,3.15-5.91-.48-2.61-2.85-5.58-4.51-5.87,1.92-1.24,2.26-3.08,1.7-5.49-1.23-5.32-3.29-5.2-6.48-4.17,1.13-.6,1.31-1.34.8-2.58-.42-1-2.33-.2-2.44-.23,1.66-1.41,2.18-2.94,1.61-4s-1.79-.6-3.57-.17c.3-1.7.84-6.18-1.36-5.7-1.36.3-1.51,3.73-1.13,5.39-.79-.12-3-1.35-4,.22s-1.11,4.39,1.36,7.41c0,0-3.51-.67-5,2.15-1.23,2.34.32,5.3,1.51,7-3.11,1.06-3.56,4.39-3.74,5.79-.27,2,.68,6.59,4.85,8.17a3.5,3.5,0,0,0-3.32,2.68c-.42,1.6,2,3.37,2,3.45-2.21.8-5,1-5.58,3.44-.24,1,.91,5.3,2.64,6.26-.7,1.74-1.24,3.21-.38,5.23s2.64,3.87,5.87,3.11a3.8,3.8,0,0,0,2.05,2.51A8.12,8.12,0,0,0,24.32,135.7Z"/>',
                /* 13 */ '<path class="foliage" d="M24.19,137v10.3h.6l.08-10.3h.43v10.3h.42V137a6,6,0,0,0,2.81-.68,5.87,5.87,0,0,0,1.7-1.36c.55.21,6.05,1,7.24-2.05,1.63-4.14,1.46-6.48-1.28-7.91a2.58,2.58,0,0,0,1.62-2.56,2.63,2.63,0,0,0-1.28-1.91c2.84-1.12,6.23-3.8,5.94-6.45-.48-4.37-2.81-6.6-5.71-8.29,2.32-1.65,5.4-2.62,3.44-6.85-1.82-3.91-3-5.44-7.75-5.54,2-1.89,3.44-4,2.17-7.66a7.65,7.65,0,0,0-4.89-4.59,3.61,3.61,0,0,0,.87-2.94c-.23-1.2-1.44-1.62-1.66-1.79,1.93-1.59,2.45-3.92,1.4-5.1-1.2-1.35-2.73-.65-4.21.7,0-3.41-.13-6.89-1.94-6.89s-1.64,6.41-1.38,10.59A4,4,0,0,0,18,77.54c-1.35,2.09-.71,4.87.64,7.22A3.82,3.82,0,0,0,15.91,87c-.73,2.2.9,3.32,1.92,5.23a7.07,7.07,0,0,0-6.77,4.54c-1.11,3.35.8,6.79,4.92,8.8-.09,0-2.11,1.6-2.3,3.13A4,4,0,0,0,15,112c-2.4,1-3.66,2-3.9,5-.31,4,1.85,4.76,2.43,5.56a4.92,4.92,0,0,0-.77,5.23c.95,2,2.88,3.1,5.62,2.62a1.58,1.58,0,0,0,0,1.85,1.6,1.6,0,0,0,2.11.32A4.78,4.78,0,0,0,24.19,137Z"/>',
                /* 14 */ '<path class="foliage" d="M24.23,137.49v9.7h.56v-9.7h.64v9.7h.38v-9.7l4.93-1.83a4.75,4.75,0,0,0,2.95.78,3.15,3.15,0,0,0,2.25-1.25c1.57.17,2.41-1.11,3.15-3.19a7.06,7.06,0,0,0-1.45-6.85,4,4,0,0,0,.89-4.72A6.59,6.59,0,0,0,43.17,114c0-3.15-2.6-6.47-4.77-8.21,2.3-1.39,3.19-4.6,3.19-6.64,0-2.21-2.08-4.21-4.76-4.43a2,2,0,0,0-1.36-3.57,8.32,8.32,0,0,0,0-6.72,7.6,7.6,0,0,0-4.77-4.3c.73-1.83,3-6.07,1.83-8.34-.8-1.53-1.44-1.7-3.87-1.83,1.09-1.89,1.08-3.59.43-4-1.49-.85-1.6.14-2.56,1-.74-3.59-.89-5.36-2.08-5.36-1.49,0-1.52,2.78-2.17,8.29-1.27-.38-1.73,0-1.83.09-.67.63,0,2,1.23,4.13A5.31,5.31,0,0,0,17,76.51c-1.45,2.1-1.79,3.49.34,7.45a4.75,4.75,0,0,0-1.24,7.1,6.4,6.4,0,0,0-5.83,4.51c-1.32,3.83,1.45,7.71,4.81,9.92-.31.2-1.2.17-1.61,1.45a6.32,6.32,0,0,0,.72,4.55c-.31.12-2.81.64-3.28,2.89s1.19,4.68,2.26,6.26c-.23.15-2.69,1.57-2.68,4S12,129.91,16.62,130a2.25,2.25,0,0,0,3.06,3.06,7.14,7.14,0,0,0,4.55,4.43Z"/>',
                /* 15 */ '<path class="foliage" d="M24.17,56.36c-1.48,0-2.51,5.93-1.42,8.87-.68.12-2.71-.13-3.14.6C19,66.9,20.13,68.77,21.9,71a2.41,2.41,0,0,0-2.51.78c-.5.8,0,2.3.72,3.31a5.34,5.34,0,0,0-4.68,4.35c-.4,2.14.23,5,2.3,5.94-1.33.21-2.71.77-3,2a3,3,0,0,0,1,2.78c-4.72,1-6.65,4.23-7.1,6.21-.76,3.37,1.58,7.61,5.63,8.85a3.92,3.92,0,0,0-2.11,3.29,2.31,2.31,0,0,0,1.68,2.15c-2.81-.17-4.58.92-4.61,4.33,0,2,.51,3.93,3.42,4.35a5.38,5.38,0,0,0-4,5.77c.09,3.11,3.39,5.81,7.63,5.1a3.15,3.15,0,0,0-.25,4.5c1,.94,2.09.45,3.25-.51a8.49,8.49,0,0,0,2.27,3,10.86,10.86,0,0,0,2.77,1.46v8.85h.67l0-8.92.43,0v8.89h.49l0-8.88a8.18,8.18,0,0,0,2.9-.89A6.64,6.64,0,0,0,31,136.11a5.46,5.46,0,0,0,7.79-2.33,7.2,7.2,0,0,0-1.37-8.59c1.21.15,2.93-.36,3.12-1.49a2.24,2.24,0,0,0-1.42-2.44,8.25,8.25,0,0,0,4.91-7.3c.08-3.35-1.86-6.9-5.06-7.77,3-2.22,3.66-4.31,3.49-7A6,6,0,0,0,37,93.36a2.59,2.59,0,0,0,.62-2C37.44,90.12,36,90,35.89,89.89a4.14,4.14,0,0,0,1-3.41,6.67,6.67,0,0,0-4.35-4.67,2,2,0,0,0,1.15-2.53,1.63,1.63,0,0,0-2.11-.79,6.16,6.16,0,0,0,2.19-6.13c-.52-2.46-2-4.46-5.8-3.7,3.13-2.8,2.12-6,1.55-6.4s-2-.29-3.24,2.31C25.81,56.83,25.36,56.36,24.17,56.36Z"/>',
                /* 16 */ '<path class="foliage" d="M23.83,138.37v8.72h.57v-8.72H25v8.72h.74v-8.72a9.3,9.3,0,0,0,3.32-2.05,4.65,4.65,0,0,0,1.15-1.71c2.59,1.24,5,1.68,7.63-1.15a7.35,7.35,0,0,0,1.79-7.09,2.66,2.66,0,0,0,1.4-2.49,4.09,4.09,0,0,0-1.66-3.16c.32-.23,2.49-.57,2.68-4.27a6,6,0,0,0-.95-3.29c1.69-.06,2.19-4.22,1.75-5.68-.63-2.06-4.63-3.58-5.14-4.25,2.73-2.51,4.6-4.33,3.33-8.09-.89-2.6-2-3.75-4-4.45,1.21-2.63,1.88-5,.67-7a5.43,5.43,0,0,0-3.83-2.36,2.15,2.15,0,0,0,.32-2.84,1.78,1.78,0,0,0-2.1-.76c2.24-3.18,2.86-6.56,1.72-8.72a4.82,4.82,0,0,0-5.36-2.36c.76-2,.75-4.19.06-4.51-.89-.4-1.35.39-2.33,1.38.19-4.85-.22-8.84-1.25-8.84S23,59.41,23.83,62a1.73,1.73,0,0,0-2,.6c-.87,1.41.35,4.44,1.05,6.74-1.79-.54-3.77-.29-4.28,1.12-.44,1.24.69,2.36,1.88,3.86A6.2,6.2,0,0,0,17,84.37a3.93,3.93,0,0,0-2.39,1.76,3.73,3.73,0,0,0,.41,3.6,7.49,7.49,0,0,0-6.06,5c-1,3.1.19,7.31,5.14,9.86a3.56,3.56,0,0,0-2,2.05,3.5,3.5,0,0,0,.19,2.68c-1.71.54-3,1.36-3.38,3-.47,2.2,1.12,4.82,3.35,6.09a2.6,2.6,0,0,0-2.55,2.06c-.28,1.57.06,3.78,1.15,4.74a9.48,9.48,0,0,0,2.32,4.07c.87.81,2.69.16,3.1,0a2.46,2.46,0,0,0,.45,2.37c.54.55,1.19.3,1.85-.13a6.77,6.77,0,0,0,.73,4.43C20.26,137.51,23.56,138.36,23.83,138.37Z"/>',
                /* 17 */ '<path class="foliage" d="M24.11,139v8.3h.65V139h.57v8.3h.48V139l4.72-3.77c1.6,1.18,2.84,1.48,5.46,0,1.93-1.09,2.9-4.31,2.78-5.58,2.36-.48,3.06-1.24,3.6-4.28a5.79,5.79,0,0,0-1.15-4.47,5,5,0,0,0,1.61-4,3.13,3.13,0,0,0-1.64-2.56c2.94-.83,5-5.59,4.34-8.3s-3-3.12-5.26-3.16c.16-.17,3.26-3.48,2.1-7.82a8.42,8.42,0,0,0-4.47-5.26A5.76,5.76,0,0,0,39,83.22c-1.43-3.06-3.73-2.48-4-2.52a2.1,2.1,0,0,0-1.85-3.64c2.17-2.06,3.74-4.82,2.39-7.88C34.59,67,32.1,65.53,29,65.06c1.12-1.93,1.84-4.75,1-5.43-.66-.54-1.91-.05-3.21.74.09-3.7,0-10.21-1.47-10.21-1.28,0-3.32,4.6-1.76,10.53a3,3,0,0,0-2.63.84c-1.13,1.39-.27,3.82,1.45,6.5-1.49-.54-3.28-1-4,1.09-.53,1.61-.22,4.24,1.5,4.66-.92.63-3.69,2.56-4.62,4.5-1.69,3.51.29,5.24.51,5.65a3.76,3.76,0,0,0-2.43,1.5,3.81,3.81,0,0,0-.19,3.89c-2.9,0-6.22,4.4-6.06,7.24a9.44,9.44,0,0,0,5.71,8,2.36,2.36,0,0,0-2,1.53,2.33,2.33,0,0,0,.64,2.49c.13.07-2.49-.08-3.57,2.12a6.39,6.39,0,0,0,1.53,6.85A5.33,5.33,0,0,0,7.11,123a3.7,3.7,0,0,0,3.32,3.25c-.13,1.79-.07,3.83,1.31,5s3.31.68,5,.07a9.48,9.48,0,0,0,2.52,5.49A7.78,7.78,0,0,0,24.11,139Z"/>',
                /* 18 */ '<path class="foliage" d="M24.06,139.74v7.49h.56v-7.49h.85v7.49h.42v-7.49a6.64,6.64,0,0,0,2.6-1,6.73,6.73,0,0,0,1.83-1.78,4.46,4.46,0,0,0,5.45,0,9,9,0,0,0,3.53-6.56c.25,0,3.35-.11,4.38-3,.84-2.31.06-4.5-1.57-6.89a3.52,3.52,0,0,0,1.59-2.79,3.7,3.7,0,0,0-1.51-3.34c3.2-1.73,5.6-7.45,5-9.65-1-3.47-4.21-2.79-4.86-2.86a10.87,10.87,0,0,0,1.11-7.44c-.78-3.05-3-4-3.88-4.81,2-1.9,2.8-3.51,2.21-5.66a4.82,4.82,0,0,0-4.21-3.62c.06-.82.45-1.79-.14-2.61a2.09,2.09,0,0,0-2.2-1c4.53-3.57,3.9-6.47,2-9.4-1.57-2.47-3.8-3.49-7.83-2.81,1.83-1.7,2.59-4.2,1.75-6-.61-1.32-1.73-1.48-3.33-1.69,2-2.33,2.16-4.54,1.75-4.86s-1.44-.09-2.47,1.37c.23-4-.47-6.28-1.53-6.47-1.23-.22-2.26,3-2.34,7.62a2,2,0,0,0-2,1.61c-.26,1.12.76,2.23,1.15,3.07a2,2,0,0,0-2,1c-.72,1.16-.26,3.47.34,4.39-2,.1-3.45,1.08-3.76,2.88-.56,3.24,1.22,4.72,3.55,5a4.55,4.55,0,0,0-.85,1.53,4.69,4.69,0,0,0-.22,2c-1.51.37-3.42.85-4.55,1.91-1.3,1.23-1.27,3.36-.51,5a5.59,5.59,0,0,0-3.15,2,3.16,3.16,0,0,0,0,4.55,7.78,7.78,0,0,0-5.11,5A8.69,8.69,0,0,0,10,103.7c-.66.43-1.68,1-1.85,1.93s.36,1.31,1,2.07c-1.53.77-3.19,1.47-3.54,3.16s1,3.29,2.09,4.67a7,7,0,0,0-3,6.6c.48,2.93,3.27,5,6.55,5-.69,2.65-.67,4.6.93,6.25s3.52,1.63,6,1.24c.52,1.19.37,2.19,1.87,3.57A6.08,6.08,0,0,0,24.06,139.74Z"/>',
                /* 19 */ '<path class="foliage" d="M23.85,140.34v6.85h.64v-6.85h.85v6.85h.72v-6.85a3,3,0,0,0,3.32-2.68,7.4,7.4,0,0,0,6.85.64c2.34-1.24,2.34-4.85,1.41-6.77,3.36.09,7.36-3.14,7.49-6.21s-2.51-4.91-3.24-5.41c.68-1,1.74-2.31,1.62-3.6A2.88,2.88,0,0,0,42,114c3.79-.89,6.51-7.15,5.83-10.55-.58-2.93-4-2.41-4.85-2.51,1.53-.81,2.82-3,1.91-6.72-.62-2.63-1.4-4.47-5.4-5.32a3.71,3.71,0,0,0,2.05-4.51,3.31,3.31,0,0,0-4.35-2,3.23,3.23,0,0,0,0-2.73A3.32,3.32,0,0,0,35.85,78c4.09-2.51,3.35-5,3.49-8,.21-4.72-4-6.53-8-6.68,1.42-1,2.2-2.18,1.82-3.73-.54-2.23-2.58-3.14-4.5-3.5,2-2.3,3.24-4.22,2.3-5.36-1.41-1.71-3.49.2-3.7.29.25-3.61-.43-7.83-1.79-7.83-1.07,0-1,1.39-1.62,4.22a1.77,1.77,0,0,0-1.1.35c-1.12.92-.81,2.92-.52,5.31a2.52,2.52,0,0,0-2.59,1.66c-.81,1.91,0,3,1.45,3.83a3.4,3.4,0,0,0-2.47,3.06,3.09,3.09,0,0,0,.85,2.08c-2.09.26-3,2-3.36,3.71-.6,2.68.8,3.69,3.27,5.36a1.7,1.7,0,0,0-.76,1.74,3.51,3.51,0,0,0-3.79.85c-1.47,1.41-3.06,3.62-1.36,5.92-1.79.47-4.2,1.42-4.93,3.26-.62,1.58-.08,2.94,1.14,4.23A9.81,9.81,0,0,0,4.92,95c-.64,2.87.88,5.55,3.36,7.24a2.32,2.32,0,0,0-1.36,1.89,3.2,3.2,0,0,0,1.23,2.91c-.2,0-2.34-.09-3.15,1.75a5.26,5.26,0,0,0,2.21,6.13c-2.21,1.1-3.7,2.63-3.74,4.85-.06,3.08,2.13,5.36,6.51,6.93a5.85,5.85,0,0,0,.89,7.19c2.94,2.81,4.58,2.18,6.85,1a5.47,5.47,0,0,0,2,3.76A7.59,7.59,0,0,0,23.85,140.34Z"/>',
                /* 20: grown tree */ '<path class="foliage" d="M23.92,147.26h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.82-.27,5.82.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44,5.73,5.73,0,0,0,6.83,1.79c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.15,4.15,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.25,4.25,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61a2.93,2.93,0,0,0-1.28-2.56c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15,2.13,2.13,0,0,0-1.69,1.74,3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22A4.17,4.17,0,0,0,13.14,78a4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.94c-.51,4.69,1.63,6.64,4.5,7.81-1.27.58-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3,4.11,4.11,0,0,0,3.66,5,7.13,7.13,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5,8.17,8.17,0,0,0,4.18,1.28C24.14,141.52,23.79,147.26,23.92,147.26Z"/>',
            ],
            // 2: dry tree
            [
                /* 20: grown tree */ '<path class="foliage" d="M23.92,147.26h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.82-.27,5.82.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44,5.73,5.73,0,0,0,6.83,1.79c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.15,4.15,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.25,4.25,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61a2.93,2.93,0,0,0-1.28-2.56c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15,2.13,2.13,0,0,0-1.69,1.74,3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22A4.17,4.17,0,0,0,13.14,78a4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.94c-.51,4.69,1.63,6.64,4.5,7.81-1.27.58-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3,4.11,4.11,0,0,0,3.66,5,7.13,7.13,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5,8.17,8.17,0,0,0,4.18,1.28C24.14,141.52,23.79,147.26,23.92,147.26Z"/>',
            ],
            // 3: burning tree
            [
                /* fire 01 */ '<path class="foliage" d="M23.92,149.74h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.81-.27,5.81.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44A5.73,5.73,0,0,0,35.73,143c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.16,4.16,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.19,4.19,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61A2.93,2.93,0,0,0,30.88,52c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15A2.13,2.13,0,0,0,18.21,64a3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22,4.17,4.17,0,0,0-3.67,1.08,4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.93c-.51,4.7,1.63,6.65,4.5,7.82-1.27.57-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3.05,4.11,4.11,0,0,0,3.66,4.95,7.11,7.11,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5A8.17,8.17,0,0,0,23.76,144C24.14,144,23.79,149.75,23.92,149.74Z"/><path class="fire" d="M28.82,22.16c1.71,9-1.95,11.08-4.37,12.07s-4.31,1.32-6.22,4.23c-2,3.07-.92,7.92-.47,10.62a50.85,50.85,0,0,1,1.31,17.85,50.71,50.71,0,0,1-2.45,11.14c-1.26,2.56-3,5.22-4.75,5.07-1.36-.11-1.26-1.67-2.33-1.52-1.54.22-3,3.84-3.24,6.6-.45,5.41,2.22,6.42.82,9.5C5,102.4,2.52,101,1.06,106.56.64,108.18.68,111,5,115.07c2.31,2.17,1,2.54,3.17,5.12,3.38,3.93,12,4.87,15.29,4.67,10.27-.64,18.42-6.51,20-9.13A6.39,6.39,0,0,0,44.7,111c-.55-2.58-1.72-5.12-1.23-8.29.8-5.16,3.6-6.43,5.34-10.68,1.66-5.29-1.08-7.19-2.06-8.38-1.51-1.82-3-2.12-4.1-4.91-1.76-4.58,1.5-4.77-3.22-8.29-.74-.55-1.3,1.32-2.67,1.58-2.42.44-5.28-4.17-6.37-6.22-3.49-6.59-3.83-11.5-4.09-16.14-.09-1.7-1.19-9.4,5.56-9.25,2.66.06,3.35-5.65,2-7.77C30.39,27,30.39,27,28.82,22.16Z"/><path class="fire" d="M38.26,60.06c-.45-.09-1.11.75-1.24,1.59s.38,2,.85,2,.83-.93.93-1.62S38.72,60.16,38.26,60.06Z"/><path class="fire" d="M24.3,13.2c-.34,1.14.57,2.05,1.12,1.93.75-.17.84-2.35.11-2.78C25.07,12.07,24.57,12.28,24.3,13.2Z"/>',
                /* fire 02 */ '<path class="foliage" d="M23.92,149.74h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.81-.27,5.81.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44A5.73,5.73,0,0,0,35.73,143c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.16,4.16,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.19,4.19,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61A2.93,2.93,0,0,0,30.88,52c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15A2.13,2.13,0,0,0,18.21,64a3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22,4.17,4.17,0,0,0-3.67,1.08,4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.93c-.51,4.7,1.63,6.65,4.5,7.82-1.27.57-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3.05,4.11,4.11,0,0,0,3.66,4.95,7.11,7.11,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5A8.17,8.17,0,0,0,23.76,144C24.14,144,23.79,149.75,23.92,149.74Z"/><path class="fire" d="M29,15.29a8.21,8.21,0,0,1,1.12,5.42c-.21,1.07-1.59,4.22-5.76,7l-2.48,2.54c-2.25,4.38-2.55,6.79-2.51,8.16,0,.47.07,1.6.2,2.77.34,3.17,1,5.14,1.79,13.31.23,2.39-.32,13.22-2.63,17.92-1.26,2.56-2.84,3.07-3.74,3.27a5.72,5.72,0,0,1-4.3-1c-1.75.72-1.44,3.79-2.79,6.85-1.64,3.7-6.23,7.25-6.69,14.41-.23,3.63.32,5.34,4.06,11.23,2.64,4.15,1.83,7.24,3.25,9.9.69,1.26,3.76,4.36,6,5.07,4.07,1.31,7.55,1.72,9.32,1.48,6.48-.9,7.66-3.3,13.69-5.46,4.46-1.59,3.88.67,5.9-.24,2.9-1.3,5.45-4.69,5.17-7.72-.47-5.18-3.9-8.44-5.49-16.57-.19-.95-.85-5.8,3.5-12.74,2.15-3.42,3.18-10,2-13.14-.82-2.18-2.84-5.12-5.49-5.41s-3.9,2.37-6.29,2.15c-1.66-.16-3.73-1.7-5.9-7.41-2.43-6.4-2.7-11.15-3.5-15.69a23.82,23.82,0,0,1,.8-12.58c1.11-4,3.1-5.73,3.82-8.84C32.45,17.86,30.2,16.29,29,15.29Z"/><path class="fire" d="M13.9,62.91c.73.25.74,2.71,0,4.62-.61,1.59-1.94,3.34-2.63,3.11s-.72-2.8.08-4.78C12,64.39,13.23,62.69,13.9,62.91Z"/><path class="fire" d="M39.62,49.85c.73.08,1.39,2.83.72,3.27-.4.26-1.42-.2-1.75-1C38.16,51,39.12,49.8,39.62,49.85Z"/><path class="fire" d="M27,2.75C26.71,3.26,27,4,27.28,4c.45.12,1.36-1.13,1.12-1.51A1,1,0,0,0,27,2.75Z"/>',
                /* fire 03 */ '<path class="foliage" d="M23.92,149.74h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.81-.27,5.81.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44A5.73,5.73,0,0,0,35.73,143c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.16,4.16,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.19,4.19,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61A2.93,2.93,0,0,0,30.88,52c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15A2.13,2.13,0,0,0,18.21,64a3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22,4.17,4.17,0,0,0-3.67,1.08,4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.93c-.51,4.7,1.63,6.65,4.5,7.82-1.27.57-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3.05,4.11,4.11,0,0,0,3.66,4.95,7.11,7.11,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5A8.17,8.17,0,0,0,23.76,144C24.14,144,23.79,149.75,23.92,149.74Z"/><path class="fire" d="M27.56,21.56c-1.13,2.68-6,5.1-7.36,11.82-1.62,7.93.65,10.41,2.35,16,.42,1.37,1.94,8.1-1.46,13.92-.79,1.36-3.29,4.73-7,4.7a7,7,0,0,1-4.21-1.61c-.68.34-5.49,2.82-6.63,8.24-.1.46-1.33,4.91,1.45,8.42,1.86,2.34,5.26,2.34,6.48,6,1.38,4.15-.76,5.45-3.56,11.41A21.57,21.57,0,0,0,6.2,115c1.23,4.36,8,4.64,10.92,4.78,9.55-2,8.87-3.79,14.89-4.62,5.34-.72,7.93.17,10.52,1.87a19.25,19.25,0,0,0,5.75-9.23,19,19,0,0,0,0-10c-1.47.11-3.8.37-5.58-1.06-4.86-3.88-5.79-10.27-6.24-15.7-.32-3.91.46-12.86,2.27-14.56,4.41-4.16,6.65-8.07,5.91-11.49-.61-2.8-1.38-7.6-9-7.68-5.57-.06-6.95-5-8.09-6.81a21.06,21.06,0,0,1-1.45-7.28C25.89,26.1,27.08,24.15,27.56,21.56Z"/><path class="fire" d="M15.18,51.91c-.41-.72-3,1.16-3,3.32,0,1.47,1.52,3.51,1.86,2.83C14.61,56.93,15.55,52.56,15.18,51.91Z"/><path class="fire" d="M27.89,9.43c-.95.4.16,5.18.56,5.18.61,0,1.81-1.47,1.46-3.08C29.63,10.24,28.42,9.2,27.89,9.43Z"/>',
                /* fire 04 */ '<path class="foliage" d="M23.92,149.74h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.81-.27,5.81.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44A5.73,5.73,0,0,0,35.73,143c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.16,4.16,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.19,4.19,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61A2.93,2.93,0,0,0,30.88,52c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15A2.13,2.13,0,0,0,18.21,64a3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22,4.17,4.17,0,0,0-3.67,1.08,4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.93c-.51,4.7,1.63,6.65,4.5,7.82-1.27.57-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3.05,4.11,4.11,0,0,0,3.66,4.95,7.11,7.11,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5A8.17,8.17,0,0,0,23.76,144C24.14,144,23.79,149.75,23.92,149.74Z"/><path class="fire" d="M21.41,21.58c.25,3.48,0,8.79,2.27,9.3,4,.89,6.7-.16,8.82,2.11,3.56,3.8,1.86,5.5-.57,11.49a33.6,33.6,0,0,0-2.42,12.3c-.13,2.54-1.12,13.62,3,24.84,2.74,7.5,5.33,8.5,6.56,8.74a6.61,6.61,0,0,0,4.61-1c.3.82.78,2,1.45,3.48C47.51,97.86,48.75,98,49,100c.45,3.54-.11,5.55-4.69,9.88-1.46,1.37-1.54,3.72-2,6.15-.28,1.43-1.82,2-2.51,2.42-2,.49-8.33-5.26-12-5.09-7.36.32-14.5,4.82-15.46,5.74-3.24,2.35-7.09.14-7.69-1-2.18-4.37-3.23-17.57-2.75-23.71.32-4.13,4.76-5.76,5.91-10.28C9.11,79,5.8,77.58,5,71.18c-.14-1.08.68-7.22,5.34-10.11a9.91,9.91,0,0,1,3.4-1.3c.57,1,1.92,3,3.56,3,2.32-.08,4.14-4.37,4.53-7.77.53-4.62-1.69-6.6-3.08-12.71-.57-2.53-1.94-6.55-.72-11Z"/><path class="fire" d="M12.59,51.28c.42.35-.17,2.07-.73,2.1-.36,0-.93-.67-.72-1.37S12.31,51,12.59,51.28Z"/><path class="fire" d="M42.29,78.87C41.05,79,40,83,41.08,83.81c.68.5,2.63-.07,3.15-1.62C44.82,80.44,43.16,78.76,42.29,78.87Z"/>',
                /* fire 05 */ '<path class="foliage" d="M23.92,149.74h1l-.46-5.59c0-.14.9-.19,1-.22s-.27,5.81-.27,5.81.93,0,1,0,0-6,.07-6.07a5.12,5.12,0,0,0,2.65-2.44A5.73,5.73,0,0,0,35.73,143c2.82-1.19,3.35-4.85,3.17-7.79a12.67,12.67,0,0,0,4-1,5.67,5.67,0,0,0,0-10,4.16,4.16,0,0,0,2-4,4.28,4.28,0,0,0-2-3c.6-.22,4.93-1.81,5.79-6.06.62-3,.65-6.6-1.79-7.72a4.19,4.19,0,0,0-3-.22,11.51,11.51,0,0,0,.19-7.86,4.49,4.49,0,0,0-3.19-3.14,4.38,4.38,0,0,0,1.47-6.11c-.67-.9-1.87-1.27-3.47-.89a3.21,3.21,0,0,0,.18-2.53c-.39-.69-1.36-.55-2.18-.47.88-.58,3.74-2,4-5,.23-2.51.9-7.22-2.13-9.94a8.94,8.94,0,0,0-6.87-2.06,3.37,3.37,0,0,0-2-6c.12-.08,2.43-2.64,2.26-4.61A2.93,2.93,0,0,0,30.88,52c-1.15-.83-2.5-.11-2.77-.09.84-.19,1.5-1.69,1.24-3.16a1.73,1.73,0,0,0-2.56-1c-.79-2.47.61-6.63-1.39-6.62-2.5.2-1.92,5.61-1.92,7.61-.46.08-1.1-.42-1.73.35-1,1.21-.41,3.25.16,5.74a2.34,2.34,0,0,0-3,1.21,5.48,5.48,0,0,0,1,6.15A2.13,2.13,0,0,0,18.21,64a3.22,3.22,0,0,0,.69,3.26c-1.56-.47-2.51-1-3.66.93a4.62,4.62,0,0,0-.7,4c.82,1.93,3.17,3,3.67,3.19a4.07,4.07,0,0,0-1.31,1.87,6.2,6.2,0,0,0-.09,2.22,4.17,4.17,0,0,0-3.67,1.08,4.11,4.11,0,0,0-1.24,4.7,4.45,4.45,0,0,0-5,2c-1.09,2,.27,5.84,1.38,5.6a5.52,5.52,0,0,0-4.69,4.93c-.51,4.7,1.63,6.65,4.5,7.82-1.27.57-2.26,1.43-2.19,2.65a3.06,3.06,0,0,0,1,2,3.88,3.88,0,0,0-3.66,3.05,4.11,4.11,0,0,0,3.66,4.95,7.11,7.11,0,0,0-5,6,4.81,4.81,0,0,0,1.66,4,8.66,8.66,0,0,0,6,1.53,9.28,9.28,0,0,0-1.69,3.42c-.6,1.88-.51,4.49,1.09,5.64,2.18,1.57,6.83,1,8.91.36a4.62,4.62,0,0,0,1.68,3.5A8.17,8.17,0,0,0,23.76,144C24.14,144,23.79,149.75,23.92,149.74Z"/><path class="fire" d="M21.56,18.83c-2.12,3-3.79,7.34-2.83,11.41,1.13,4.86,3.88,5.05,5,9.47s2.11,8.82-1.45,11.9c-.43.36-2.65,1.55-6.8,0-1.48,1.65-3.3,2.62-4.29,6.15-1.14,4.05.1,7.55.32,11.65.51,9.16-3.33,13.75-4.93,20C6.05,91.47,4.05,99,3.84,103.32c-.12,2.17,1.58,3.14,1.21,5.82-.49,3.48-2.19,6.31.24,10,1.94-1.78,7.12-3.56,10-2.43,8.05,3.22,10.69,6.28,18,5.82,6.39-.4,11.5-4,12.38-8.25.51-2.44.13-2.56-1.45-7.53A13.23,13.23,0,0,1,45.59,96c3.34-5,1.16-11.63-2.47-13.59-4.49-2.43-3.52-.33-7.24.24-4,.61-5.54-6.84-5.58-8.5-.25-10.52,3.72-15.7,3.15-23.55-.66-9.18-7-9.14-7.06-14.8-.09-4.53,2.32-6.12,1.07-10C26.41,22.62,22.29,22.88,21.56,18.83Z"/><path class="fire" d="M39.2,72.24c-1,0-1.78,1.79-1.78,3.24s.81,3.21,1.78,3.23,1.94-1.72,1.94-3.23S40.18,72.21,39.2,72.24Z"/>',
                /* fire 06 */ '<path class="foliage" d="M24.06,141.71v7.49h.56v-7.49h.85v7.49h.42v-7.49a6.73,6.73,0,0,0,4.43-2.81,4.43,4.43,0,0,0,5.45,0,9,9,0,0,0,3.53-6.55c.25,0,3.35-.12,4.38-3,.84-2.32.06-4.5-1.57-6.89a3.52,3.52,0,0,0,1.59-2.79,3.68,3.68,0,0,0-1.51-3.34c3.2-1.73,5.6-7.46,5-9.65-1-3.47-4.21-2.79-4.86-2.86a10.89,10.89,0,0,0,1.11-7.45c-.78-3-3-4-3.88-4.8,2-1.9,2.8-3.51,2.21-5.66a4.82,4.82,0,0,0-4.21-3.62c.06-.82.45-1.79-.14-2.61a2.09,2.09,0,0,0-2.2-1c4.53-3.58,3.9-6.48,2-9.41-1.57-2.46-3.8-3.48-7.83-2.8,1.83-1.71,2.59-4.2,1.75-6-.61-1.33-1.73-1.48-3.33-1.7,2-2.33,2.16-4.53,1.75-4.85s-1.44-.09-2.47,1.36c.23-4-.47-6.27-1.53-6.46-1.23-.22-2.26,3-2.34,7.61a2,2,0,0,0-2,1.62c-.26,1.12.76,2.22,1.15,3.06a2,2,0,0,0-2,1c-.72,1.17-.26,3.48.34,4.4-2,.1-3.45,1.07-3.76,2.88-.56,3.23,1.22,4.72,3.55,5a4.55,4.55,0,0,0-.85,1.53,4.69,4.69,0,0,0-.22,2c-1.51.37-3.42.85-4.55,1.91-1.3,1.23-1.27,3.35-.51,5a5.59,5.59,0,0,0-3.15,2,3.16,3.16,0,0,0,0,4.55,7.75,7.75,0,0,0-5.11,5A8.69,8.69,0,0,0,10,105.67c-.66.43-1.68,1-1.85,1.92s.36,1.31,1,2.08c-1.53.77-3.19,1.46-3.54,3.16s1,3.29,2.09,4.67a7,7,0,0,0-3,6.6c.48,2.93,3.27,5,6.55,5-.69,2.65-.67,4.61.93,6.26s3.52,1.63,6,1.23c.52,1.2.37,2.2,1.87,3.58A6.08,6.08,0,0,0,24.06,141.71Z"/><path class="fire" d="M6.54,118.67c-1.62-1.45-4-3.63-3.87-6.56.16-2.61,1.63-4.4,1.94-7.11.75-6.56-1-9.54,1.93-16.44C8.91,83,11.28,84,14.6,76.05c1.57-3.74,4-13,1.07-18.79a9.65,9.65,0,0,1,0-9.17,13.74,13.74,0,0,1,3.16-5c.79.12,4.32.81,6.32-1.5,2.61-3,2-6.71-.47-13,1.5,2.53,4.82,5.11,6.64,8.54,2.43,4.56,1,8.06-.71,17-1,4.93-1.22,16.22,3.16,23.55.75,1.25,2.19,3.6,4,3.48,1.62-.11,2.69-2.07,3-2.69a14.42,14.42,0,0,1,4,5.22c2.68,6.87,1.58,11.85,1.5,19.12,0,3.44,2.07,4.55,2.13,7.43.07,3.32-2.38,5.61-4.51,7.27-2.53,2-2.92,4.88-6.47,5.22-5.7.55-9.6.09-12.41-.87-6.42-2.18-7.7-5.52-12.1-5.85C9.7,115.75,7.85,117.57,6.54,118.67Z"/><path class="fire" d="M37.76,65.56c-.3.19-1.48,3.27-.16,5.21.36.54,1.13,1.37,1.66,1.19.7-.24.76-2.15.4-3.56S38.33,65.2,37.76,65.56Z"/><path class="fire" d="M23.93,15.05a7.52,7.52,0,0,0-1.82,6.05,7,7,0,0,0,2.53,4.78,8.61,8.61,0,0,0,1.58-5.41A8.74,8.74,0,0,0,23.93,15.05Z"/>',
                /* fire 07 */ '<path class="foliage" d="M24.06,141.71v7.49h.56v-7.49h.85v7.49h.42v-7.49a6.73,6.73,0,0,0,4.43-2.81,4.43,4.43,0,0,0,5.45,0,9,9,0,0,0,3.53-6.55c.25,0,3.35-.12,4.38-3,.84-2.32.06-4.5-1.57-6.89a3.52,3.52,0,0,0,1.59-2.79,3.68,3.68,0,0,0-1.51-3.34c3.2-1.73,5.6-7.46,5-9.65-1-3.47-4.21-2.79-4.86-2.86a10.89,10.89,0,0,0,1.11-7.45c-.78-3-3-4-3.88-4.8,2-1.9,2.8-3.51,2.21-5.66a4.82,4.82,0,0,0-4.21-3.62c.06-.82.45-1.79-.14-2.61a2.09,2.09,0,0,0-2.2-1c4.53-3.58,3.9-6.48,2-9.41-1.57-2.46-3.8-3.48-7.83-2.8,1.83-1.71,2.59-4.2,1.75-6-.61-1.33-1.73-1.48-3.33-1.7,2-2.33,2.16-4.53,1.75-4.85s-1.44-.09-2.47,1.36c.23-4-.47-6.27-1.53-6.46-1.23-.22-2.26,3-2.34,7.61a2,2,0,0,0-2,1.62c-.26,1.12.76,2.22,1.15,3.06a2,2,0,0,0-2,1c-.72,1.17-.26,3.48.34,4.4-2,.1-3.45,1.07-3.76,2.88-.56,3.23,1.22,4.72,3.55,5a4.55,4.55,0,0,0-.85,1.53,4.69,4.69,0,0,0-.22,2c-1.51.37-3.42.85-4.55,1.91-1.3,1.23-1.27,3.35-.51,5a5.59,5.59,0,0,0-3.15,2,3.16,3.16,0,0,0,0,4.55,7.75,7.75,0,0,0-5.11,5A8.69,8.69,0,0,0,10,105.67c-.66.43-1.68,1-1.85,1.92s.36,1.31,1,2.08c-1.53.77-3.19,1.46-3.54,3.16s1,3.29,2.09,4.67a7,7,0,0,0-3,6.6c.48,2.93,3.27,5,6.55,5-.69,2.65-.67,4.61.93,6.26s3.52,1.63,6,1.23c.52,1.2.37,2.2,1.87,3.58A6.08,6.08,0,0,0,24.06,141.71Z"/><path class="fire" d="M26.92,22.4c.88,3.68,1.39,8.38-1.23,11.53s-6.5,1.2-8.75,4.84c-1.58,2.56-2.71,6.93.37,14.31,0,0,3.77,10.15.08,23.53a22.89,22.89,0,0,1-1.77,3.92c-.94,1.7-1.42,2.55-2.23,3.08-1.88,1.2-2.55.79-4.55.56C7.22,84,4.9,86.66,4.32,93.29c-.31,3,1.14,5.07-.19,8.58-1,2.63-2.29,3.58-2.81,6-.8,3.57,1,7.3,3.23,10.07,2.07,2.61,5.76,2.15,6.84,2.38,3.54.77,10.42,4.39,15.53,4.39,5.28,0,12.22-2.6,15.61-7.69,2.62-3.92,1.65-10,2.39-11.77,1.33-3.24,4.81-6.47,4.46-9.92-.47-4.46-3.07-4.35-3.69-7.35-1.36-6.65-.92-9.15-4.16-11.56-2.25-1.68-3.45-.7-5.23-1.39-3.89-1.51-6.45-6.46-7.53-9.69a20.26,20.26,0,0,1-.92-10.22C28.2,52.77,30,52.33,30,50c0-1.06-1.26-1.54-1.46-4-.36-4.38,3.84-3.61,4.53-9.45C33.62,31.94,29.23,28.78,26.92,22.4Z"/><path class="fire" d="M24.23,11.63a4.54,4.54,0,0,0-1.54,2.31,4.7,4.7,0,0,0,.77,3.84,4.11,4.11,0,0,0,.77-6.15Z"/><path class="fire" d="M37.07,62.07c.59.08,1,1.16.93,2,0,.67-.41,1.64-1,1.7s-1.26-.86-1.31-1.7C35.63,63.06,36.45,62,37.07,62.07Z"/>',
            ],
            // 4: charred
            [
                /* dead 01 */ '<polyline class="stump" points="21.21 65.15 23.16 70.68 25 75.87"/><polygon class="stump" points="24.52 100.85 26.3 147.62 23.98 147.62 23.59 131.65 23.16 114.38 23.55 91.79 23.82 89.2 26.95 57.74 24.52 100.85"/><polyline class="stump" points="30.66 64.25 29.06 66.26 26.28 69.73"/><path class="stump" d="M12.66,78.94c2.08,1.61,3.35,3.74,5.11,5.3.49.43,2.18,3,2.68,3.42,1.5,1.33,2.29.55,3.79,1.88"/><polyline class="stump" points="12.66 83.92 15.72 84.55 18.2 84.62"/><polyline class="stump" points="24.91 103.83 29.12 99.58 44.19 90.94"/><polyline class="stump" points="36.87 95.52 39.85 97.15 41.89 96.89"/><polyline class="stump" points="36.87 87.66 35.17 92.43 31.85 97.66"/><polyline class="stump" points="8.45 118.25 18.45 127.11 23.74 131.78"/><polyline class="stump" points="5.89 124 11.21 124.71 15.23 124.25"/><polyline class="stump" points="25.94 126.13 37.3 120.72 41.13 119.72 42.45 117.07"/><polyline class="stump" points="35.84 121.42 42 121.85 44.57 120.94"/><polyline class="stump" points="32.96 122.38 35.64 119.28 37.09 117.07"/>',
            ],
            // 5: disintegrating
            [
                /* dead 01 */ '<polyline class="stump" points="21.21 65.15 23.16 70.68 25 75.87"/><polygon class="stump" points="24.52 100.85 26.3 147.62 23.98 147.62 23.59 131.65 23.16 114.38 23.55 91.79 23.82 89.2 26.95 57.74 24.52 100.85"/><polyline class="stump" points="30.66 64.25 29.06 66.26 26.28 69.73"/><path class="stump" d="M12.66,78.94c2.08,1.61,3.35,3.74,5.11,5.3.49.43,2.18,3,2.68,3.42,1.5,1.33,2.29.55,3.79,1.88"/><polyline class="stump" points="12.66 83.92 15.72 84.55 18.2 84.62"/><polyline class="stump" points="24.91 103.83 29.12 99.58 44.19 90.94"/><polyline class="stump" points="36.87 95.52 39.85 97.15 41.89 96.89"/><polyline class="stump" points="36.87 87.66 35.17 92.43 31.85 97.66"/><polyline class="stump" points="8.45 118.25 18.45 127.11 23.74 131.78"/><polyline class="stump" points="5.89 124 11.21 124.71 15.23 124.25"/><polyline class="stump" points="25.94 126.13 37.3 120.72 41.13 119.72 42.45 117.07"/><polyline class="stump" points="35.84 121.42 42 121.85 44.57 120.94"/><polyline class="stump" points="32.96 122.38 35.64 119.28 37.09 117.07"/>',
                /* dead 02 */ '<polygon class="stump" points="24.04 147.06 24.93 146.43 25.1 147.06 25.48 147.62 24.55 147.62 24.04 147.06"/><polygon class="stump" points="26.53 147.64 26.75 147.64 26.64 147.3 26.53 147.64"/><path class="stump" d="M27.66,147.76h0Z"/><polygon class="stump" points="22.9 147.36 23.32 147.75 23.19 147.36 22.9 147.36"/><polyline class="stump" points="20.62 64.68 21.98 68.12 23.33 71.36 24.11 74.59"/><polyline class="stump" points="30.19 64.68 28.96 66.59 26.96 68.12 25.39 70.15"/><path class="stump" d="M11.74,78.57a39.25,39.25,0,0,0,5.11,5.31c.49.43,2.13,2.62,2.62,3.05,1.5,1.33,2.64.74,3.86,2.25"/><polyline class="stump" points="11.74 83.56 14.81 84.19 17.29 84.25"/><polyline class="stump" points="23.98 103.36 28.45 99.27 36.87 95.23 43.47 90.34"/><polyline class="stump" points="36.37 95.53 39.68 96.35 41.17 96.1"/><polyline class="stump" points="35.55 88 33.62 93.15 31.78 97.67"/><polyline class="stump" points="25 125.78 36.15 120.34 41.34 118.55 42.19 116.89"/><polyline class="stump" points="34.9 121.42 41.06 121.85 43.64 120.93"/><polyline class="stump" points="32.03 122.38 34.7 119.27 36.15 117.06"/><polyline class="stump" points="8.62 118.21 12.74 122.17 16.19 124.25 18.87 126.89"/><polyline class="stump" points="5.85 123.87 11.72 124.08 14.49 123.57"/><path class="stump" d="M24.45,134.46l.59-.29L24,113.27l0-16.21.16-9.15,1.58-24.34.21-5.83C25.2,64.51,23.61,77.79,23,86.85c-.95,14.15-1.21,23.28-.85,27.44.5,5.76.42,10.68.85,14l.85,1.36Z"/><polygon class="stump" points="20.53 130 21.17 130.25 20.85 129.74 20.53 130"/><polygon class="stump" points="23.09 134.97 23.09 135.74 23.47 134.97 23.09 134.97"/><polygon class="stump" points="23.94 137.57 24.45 137.91 24.45 137.06 25 136.68 23.94 137.57"/><path class="stump" d="M23.47,139.91h0Z"/><path class="stump" d="M24.47,141.61l.19.17Z"/>',
                /* dead 03 */ '<polyline class="stump" points="21.75 63.75 23.11 67.19 24.49 69.49 25.43 73.28"/><polyline class="stump" points="30.91 64.2 29.89 65.32 28.15 66.6 26.52 68.08"/><path class="stump" d="M12.49,77.14a39.7,39.7,0,0,0,5.32,5.3c.49.44,1.91,2.62,2.41,3.06,1.5,1.33,2.24.74,3.46,2.25"/><polyline class="stump" points="12.49 82.13 15.56 82.76 18.03 82.82"/><polyline class="stump" points="24.96 102.34 31.6 96.98 38.23 93.66 43.38 89.66"/><polyline class="stump" points="37.63 94.49 40.91 95.57 42.43 95.57"/><polyline class="stump" points="36.81 86.96 35.26 91.87 32.92 96.31"/><polygon class="stump" points="27.04 57.4 24.15 81.28 23.09 101.96 23.09 114 23.68 115.23 24.11 117.96 24.28 116.3 24.79 116.51 25.38 118.55 24.61 99.58 25.16 79.74 27.04 57.4"/><polygon class="stump" points="23.38 147.7 24.19 147.23 23.79 146.38 24.19 146 24.53 145.23 25.38 145.45 25.77 144.64 25.77 145.57 26.28 146.17 26.28 146.72 27.72 147.02 27.72 147.45 28.53 147.7 22.11 147.7 23.38 147.7"/><path class="stump" d="M29.51,123.49l1.19-.34Z"/><path class="stump" d="M42.7,116.21v0Z"/><path class="stump" d="M41,113.23h0Z"/><polygon class="stump" points="38.15 118.55 38.36 118.85 38.36 118.55 38.15 118.55"/><path class="stump" d="M40.07,117.33h0Z"/><path class="stump" d="M30.11,147.7h0Z"/><path class="stump" d="M24.56,138.78l.16.12Z"/><polygon class="stump" points="24.85 137.4 25.06 137.4 24.96 137.25 24.85 137.4"/><path class="stump" d="M23.57,137l-.16-.16Z"/><polygon class="stump" points="24.64 131.75 24.85 131.98 24.96 131.75 24.64 131.75"/><path class="stump" d="M17.35,126.27h0Z"/><path class="stump" d="M16.71,123v0Z"/><path class="stump" d="M17.48,123.15l.41.17Z"/><path class="stump" d="M22.65,133.61h0Z"/><path class="stump" d="M22.2,131.12h0Z"/><path class="stump" d="M24.5,122.47v0Z"/><path class="stump" d="M24.64,126.39h0Z"/><path class="stump" d="M36.91,120.59v0Z"/><path class="stump" d="M14.38,121.48l.19.16Z"/>',
                /* dead 04 */ '<polyline class="stump" points="21.81 63.32 22.98 65.75 24.51 68.08 25.49 71.06"/><polyline class="stump" points="30.97 63.77 29.96 64.89 28.21 66.17 26.58 66.64"/><path class="stump" d="M12.21,76.35c1.15,2.12,3,2.52,4.77,4.08.49.43,2.36,3.21,2.85,3.64,1.51,1.33,2.6,1.87,3.82,3.38"/><polyline class="stump" points="12.66 81.34 15.74 81.66 17.93 81.61"/><polyline class="stump" points="24.09 101.72 31.26 96.01 38.77 92.94 43.15 89.19"/><polyline class="stump" points="38.04 93.46 40.96 94.42 42.47 94.81"/><polyline class="stump" points="36.85 86.81 35.57 90.77 32.97 95.16"/><path class="stump" d="M27.09,57.74,25.84,68.53l-1.16,8.3L23.56,90l.09,10.23.44,1.46v2.88l.22.09.19-6S25,87.79,25,87.45,25.49,74,25.49,74l.91-7.61Z"/><polygon class="stump" points="19.75 147.65 20.81 147.32 22.6 146.72 23.79 144.77 25 143.7 26.3 144.64 27.23 145.79 28.34 146.77 29.15 146.85 29.61 147.68 19.75 147.65"/><polygon class="stump" points="24.4 140.44 24.68 140.79 25 140.44 24.4 140.44"/><polygon class="stump" points="23.7 138.39 23.89 138.87 24.18 138.2 23.7 138.39"/><path class="stump" d="M25,138.2l.3.34Z"/><path class="stump" d="M22.68,143l.35-.13Z"/><polygon class="stump" points="27.25 141.84 27.53 142.38 27.79 141.84 27.25 141.84"/><path class="stump" d="M25,135.9l.3.29Z"/><path class="stump" d="M23.7,136.67h0Z"/><polygon class="stump" points="25.3 131.63 25.15 132.04 25.3 132.04 25.3 131.63"/><path class="stump" d="M23.82,132.2l.12.32Z"/><path class="stump" d="M25.3,129.65v0Z"/><path class="stump" d="M23.26,125.12l.44.38Z"/><path class="stump" d="M25.15,123.49l.15.16Z"/><path class="stump" d="M24.34,113.82h0Z"/><path class="stump" d="M24.34,111.71l.16-.25Z"/><path class="stump" d="M24.34,110.12h0Z"/><path class="stump" d="M24.34,108l.08.25Z"/><path class="stump" d="M25.15,117.33h0Z"/><path class="stump" d="M27.24,138.37h0Z"/>',
                /* dead 05 */ '<polyline class="stump" points="22.56 64.97 23.72 66.65 24.93 68.99 26.03 71.34"/><polyline class="stump" points="31.72 64.68 30.35 65.54 28.5 66.31 26.65 67.04"/><path class="stump" d="M13.4,77.59c1.15,2.12,1.92,1.47,3.67,3,.5.43,3.78,4.53,4.28,5,1.5,1.33,2.27,1.59,3.49,3.1"/><polyline class="stump" points="14.71 82.01 16.08 81.78 19.12 83.08"/><polyline class="stump" points="27.14 58.97 26.65 67.04 24.54 81.78 24.84 91.27 25.21 79.39 26.14 70.64"/><polygon class="stump" points="19.77 147.7 20.91 146.94 22.53 146.94 23.43 144.85 24.7 143.91 26.15 144.85 27.43 146.04 29.09 146.89 29.55 147.7 19.77 147.7"/><polygon class="stump" points="24.11 141.23 24.4 141.79 25.27 141.51 24.11 141.23"/><path class="stump" d="M23.6,138.68l.29.21Z"/><path class="stump" d="M25.64,138v0Z"/><path class="stump" d="M23.89,135.32v0Z"/><path class="stump" d="M22.83,143.28h0Z"/><path class="stump" d="M31.13,147.7h0Z"/><path class="stump" d="M36,94.38l.43-.29Z"/><polygon class="stump" points="24.54 99.06 24.84 98.38 24.06 99.06 24.54 99.06"/><path class="stump" d="M24.06,103.4v0Z"/><path class="stump" d="M25,110.3l.27.38Z"/><path class="stump" d="M26.32,114.38l-.21.26Z"/><path class="stump" d="M25.68,115.87v0Z"/><path class="stump" d="M25.47,119.32v0Z"/><path class="stump" d="M25.47,121.79v0Z"/><path class="stump" d="M31.72,95.87h0Z"/><path class="stump" d="M30.28,98v0Z"/><path class="stump" d="M24.06,96.77h0Z"/><path class="stump" d="M24.28,94.55h0Z"/>',
                /* dead 06 */ '<polyline class="stump" points="27.21 59.57 26.89 65.67 25.28 74.79 25 83.64 25.27 83.48 25.78 74.1 26.93 66.47"/><polyline class="stump" points="22.84 64.49 25 68.1 25.95 71"/><polyline class="stump" points="30.34 64.75 28.61 65.78 26.87 66.81"/><polygon class="stump" points="19.27 147.25 20.41 146.57 21.63 146.57 23.03 144.85 24.15 143.06 25.55 143.29 26.73 144.63 28.65 146.64 30.69 147.05 31.43 147.25 19.27 147.25"/><polygon class="stump" points="25.65 137.48 26.16 137.7 25.9 136.97 25.65 137.48"/><polygon class="stump" points="22.49 139.39 22.78 139.62 22.78 139.2 22.49 139.39"/><path class="stump" d="M23.89,140.8l.26.16Z"/><path class="stump" d="M24.4,138.82l.16.19Z"/><path class="stump" d="M28.17,143.06l.35.29Z"/><polygon class="stump" points="26.7 140.8 26.16 140.96 26.43 141.28 26.7 140.8"/><path class="stump" d="M19.81,144.85h0Z"/><path class="stump" d="M23.64,132.18h0Z"/><path class="stump" d="M24.4,133.68l.08.16Z"/><path class="stump" d="M25.55,131v0Z"/><path class="stump" d="M24.56,125.22l.2-.25Z"/><path class="stump" d="M25.9,118.81h0Z"/><path class="stump" d="M24.34,101.64h0Z"/><path class="stump" d="M25,97.81h0Z"/><polygon class="stump" points="24.34 94.2 24.82 94.2 24.34 94.62 24.34 94.2"/><path class="stump" d="M25.43,92.29h0Z"/><path class="stump" d="M23.8,88.59h0Z"/><path class="stump" d="M25,87.37h0Z"/><path class="stump" d="M31.43,96.34v0Z"/><path class="stump" d="M19.55,83.83h0Z"/><path class="stump" d="M18.6,82.65v0Z"/><path class="stump" d="M16.49,80l.22.29Z"/><path class="stump" d="M19.55,87.37h0Z"/>',
                /* dead 07 */ '<path class="stump" d="M18.3,147.21l1.53-.51L22,144.6c1.76-2.08,2.34-2.6,3.1-2.59,1.65,0,2.1,1.09,3.16,2.46l1.59,1.72,3.26,1Z"/><polygon class="stump" points="16.83 147.37 16.06 147.37 16.45 147.05 16.83 147.37"/><polygon class="stump" points="23.75 140.29 24.2 140.51 24.81 139.65 23.75 140.29"/><polygon class="stump" points="25.35 136.17 25.54 136.94 26.11 136.33 25.35 136.17"/><path class="stump" d="M25.73,134.41l.2.26Z"/><polygon class="stump" points="24.81 130.62 24.81 131.03 25.83 130.2 24.81 130.62"/><polygon class="stump" points="24.01 128.35 24.28 128.35 24.15 128.03 24.01 128.35"/><polygon class="stump" points="24.81 124.9 24.81 125.51 25.32 125.51 25 124.9 24.81 124.9"/><path class="stump" d="M25.06,121.71l.26.35Z"/><path class="stump" d="M24.46,119.83h0Z"/><path class="stump" d="M25.19,114.56l.13.2Z"/>',
                /* dead 08 */ '<polygon class="stump" points="20.19 146.51 22.55 145.81 24.09 143.7 25.23 141.91 26.06 142.23 27.98 144.6 29.51 146.13 30.72 147.02 30.72 147.34 32.57 147.34 18.18 147.34 19.97 147.18 20.19 146.51"/><path class="stump" d="M16.11,147l.32.22Z"/><path class="stump" d="M35.54,147.34h0Z"/>',
                /* dead 09 */ '<path class="stump" d="M22.7,147.09l.32-.77,1.66-.22.95-1a.58.58,0,0,1,.91.1l.61,1,.83.7.32.45-1.61-.46-3.18.46H21.34Z"/><path class="stump" d="M29.89,147h0Z"/><path class="stump" d="M17.32,147.34h0Z"/><path class="stump" d="M31.55,147.34h0Z"/>',
                /* dead 10 */ '<polygon class="stump" points="24.89 147.04 25.21 145.96 25.87 146.15 26.94 147.34 24.02 147.34 24.89 147.04"/>',
            ]
        ],
        endtag: '</svg>'
    },
    dim: {
        // these are known to us, from when we created the svg
        width: 50,
        height: 150
    }
}

/** updates :root definitions in the stylesheet */
updateStyle(/* :root */ document.documentElement, /* variable */ '--treewidth', svgtree.dim.width + 'px')

/*  ------------------------------------------------------------
    spawn trees into the forest 
    ------------------------------------------------------------  */

// get parent element
const forest = document.getElementById("forest")

/**
 * @typedef {Object} SettingsObject
 * @property {object} padding - padding inside the #forest div
 * @property {number} padding.t
 * @property {number} padding.r 
 * @property {number} padding.b
 * @property {number} padding.l
 * @property {object} spacing - spacing between trees (in pixels) 
 * @property {number} spacing.h - horizontal spacing between trees (in pixels) 
 * @property {number} spacing.v - vertical spacing between trees (in pixels) 
 * @property {object} orderly - defines how uniformly is everything drawn for each specified key
 * @property {boolean} orderly.positionally - spawn trees randomly in front or behind each other (by making sure every tree's zIndex is +1 than the previous tree's zIndex)
 * @property {number} orderly.maxZIndexDeviation - if (orderly.positionally == false ) then maxZIndexDeviation defines how disorderly the trees will be 
 * @property {boolean} orderly.shape - are all trees uniformly shaped?
 * @property {boolean} orderly.colour - should we introduce some randomness in the colours?
 */
/** @type {SettingsObject} settings for the forest */
const forestSettings = {
    padding: {
        t: 20 - svgtree.dim.height / 6,
        r: 20,
        b: 20,
        l: 20
    },
    spacing: {
        h: svgtree.dim.width * 2 / 3,
        v: 37.5
    },
    orderly: {
        positionally: true,
        maxZIndexDeviation: 2, /* only relevant if ( positionally == false ) */
        shape: true,
        colour: false
    }
}

/** ensure that all the trees sit in the centre of the #forest div */
const maxWidthOfForest = forest.offsetWidth - (forestSettings.padding.l + forestSettings.padding.r)
let widthOfTreesInRow = /* starting value */ svgtree.dim.width
while(widthOfTreesInRow + svgtree.dim.width <= maxWidthOfForest ) {
    widthOfTreesInRow += forestSettings.spacing.h
}
forestSettings.padding.l += (maxWidthOfForest-widthOfTreesInRow)/2
forestSettings.padding.r += (maxWidthOfForest-widthOfTreesInRow)/2

/** @type {number} keeps track of the highest z-index assigned to any tree */
var highestZIndexOnTree = 0;

/*  spawn all trees. */

let rowID = 0
let treeIDinRow = 0
let maxTreeIDinRow = treeIDinRow
let loopRunner = true

for (let i = 0; loopRunner; i++) {
    // sanity check
    if (i >= TREELIMIT /*an arbitarily large number*/) { /* bug out, because otherwise this for-loop will hang stuff */ break; }
    // create new div
    /** @type {HTMLDivElement} */
    const newDiv = document.createElement("div")
    // store the tree's information in its own object
    tree[i] = {
        div: newDiv,
        id: 'tree-' + i,
        positionInForestGrid: {
            y: rowID,
            x: treeIDinRow
        },
        class: 'tree',
        zindex: i + (forestSettings.orderly.positionally ? 0 : Math.pow(-1, Math.floor(2 * Math.random())) * forestSettings.orderly.maxZIndexDeviation),
        dimensions: {
            l: forest.offsetLeft + forestSettings.padding.l + (treeIDinRow * forestSettings.spacing.h) + (rowID % 2 === 0 ? (forestSettings.spacing.h / 4) : (-forestSettings.spacing.h / 4)) + (forestSettings.orderly.positionally ? 0 : ((Math.random() < .5 ? -1 : 1) * Math.random()*svgtree.dim.width/4)),
            t: forest.offsetTop + forestSettings.padding.t + forestSettings.spacing.v * rowID,
            w: svgtree.dim.width,
            h: svgtree.dim.height,
            /** @type {{ x: number, y: number }} */
            heart: {
                /* will be filled correctly when the tree is spawned */
                x: svgtree.dim.width / 2,
                y: svgtree.dim.height / 2
            }
        },
        state: {
            // [state, substate]
            default: [0,0],
            previous: [0,0],
            now: [0,0],
        },
        properties: {
            resilience: /* placeholder */ 1, // min value = 1
        },
        behaviour: 0, // -1: move backward | 0: stay as-is | 1: move forward (in the tree's life-cycle)
        isProtected: false,
    }
    // set id and class
    newDiv.setAttribute('class', tree[i].class)
    newDiv.setAttribute('id', tree[i].id)

    // add the placeholder svg-element into newDiv
    newDiv.innerHTML = svgtree.src.starttag + svgtree.src.endtag
    // then, grab the svg-element...
    const svgelement = newDiv.getElementsByTagName("svg")[0] // ∵ the first (and only) child is an <svg>
    svgelement.setAttribute('tree-id',`${i}`)
    // ... and, finally, draw the tree (within the svg-element):
    updateTree(svgelement)

    // newDiv should be as large as the tree-image
    newDiv.style.width = tree[i].dimensions.w + 'px'
    // position the tree (so that it sits at the correct location within a desired pattern in the forest)
    newDiv.style.left = tree[i].dimensions.l + 'px'
    newDiv.style.top = tree[i].dimensions.t + 'px'
    tree[i].dimensions.heart = { x: tree[i].dimensions.l + tree[i].dimensions.w / 2, y: tree[i].dimensions.t + tree[i].dimensions.h / 2 }
    // draw trees on the next line if you exceed #forest's right-most bounds
    if (forest.offsetWidth - (forestSettings.padding.l + forestSettings.padding.r) < (treeIDinRow + 1) * forestSettings.spacing.h + tree[i].dimensions.w) {
        rowID++
        treeIDinRow = 0
    } else {
        treeIDinRow++
        // update counter that counts the max number of trees on the longest row
        maxTreeIDinRow = treeIDinRow >= maxTreeIDinRow ? treeIDinRow : maxTreeIDinRow
    }
    // stop drawing trees if you exceed #forest's bottom-most bounds
    if (forest.offsetHeight - (forestSettings.padding.t + forestSettings.padding.b) < rowID * forestSettings.spacing.v + tree[i].dimensions.h)
        loopRunner = false
    // set z-index, so that lower-placed trees seem to be in front
    newDiv.style.zIndex = (tree[i].zindex).toString()
    // keep track of the highest z-index assigned to any tree
    if (i > 0) if (tree[i].zindex > tree[i - 1].zindex) highestZIndexOnTree = tree[i].zindex
    // the tree is not displayed when it is spawned (because we plan to make it appear _organically_ a few seconds later)
    // newDiv.style.visibility = 'hidden'
    // finally, make the div a child of #forest
    forest.appendChild(newDiv)
    // the tree appears:
    // setTimeout(function () { newDiv.style.visibility = 'visible' }, Math.random() * 1000)
    // update the value for total number of trees spawned in the forest
    totalTreesInForest += 1
}

console.log(totalTreesInForest + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow + 1) + " or fewer trees per row.")

/** #infoBox should have a z-index higher than all spawned trees */
updateStyle(infoBox.parentElement, "z-index", highestZIndexOnTree + forestSettings.orderly.maxZIndexDeviation + 1)

gameState.starthealth = (document.getElementsByClassName("protected").length + document.getElementsByClassName("normal").length) / totalTreesInForest

/*  ------------------------------------------------------------
    show instructions.
    ------------------------------------------------------------  */

setInfo(infoBox, 1)
// showBox(infoBox,false)

/*  ------------------------------------------------------------
    start the experience.
    ------------------------------------------------------------  */

let closeinfobox = document.getElementById('closeInfoBox')
closeinfobox.addEventListener('click', () => {

    hideBox(infoBox, true)
    
    // start playing sounds, on loop
    sBurning.loop = true
    playSound(sBurning, 0)
    sForest.loop = true
    playSound(sForest, 1)

    // update the forest.
    setInterval(function () { updateForest() }, refreshTime)
})


// update the forest.
setInterval(function () { updateForest() }, refreshTime)

/*  ------------------------------------------------------------
    update the forest.
    ------------------------------------------------------------  */

function updateForest() {

    FRAMECOUNT++

    /* print gameState */

    gameState.state = document.getElementsByClassName("normal").length + document.getElementsByClassName("protected").length
    // console.log(JSON.stringify(gameState, null, 2))

    /* update sound */

    // update volume of ambient sounds

    playSound(sBurning, percentageOfTrees("burning") * volumeScaler.sBurning)
    // console.log(`volume of burning sounds: ${percentageOfTrees("burning") * volumeScaler.sBurning}`)
    playSound(sForest, percentageOfTrees("normal") * volumeScaler.sForest)
    // console.log(`volume of forest sounds: ${percentageOfTrees("normal") * volumeScaler.sForest}`)

    // randomly play a random-sound from the forest

    const secondses = approx(30,75) // time (in seconds) after which the random sound ought to play
    if (Math.random() < 1 / (refreshRate * secondses)) {
        playSound(sEagle, Math.random() * percentageOfTrees("normal") * volumeScaler.sEagle)
    } 

    /* update visuals */

    // will the forest update its visuals?:
    // console.log(`infoBox displayState: ${Boolean(boxDisplayAttrIs(infoBox))}\npauseForestUpdate:    ${pauseForestUpdate}\nupdate visuals:       ${!(Boolean(boxDisplayAttrIs(infoBox)) || pauseForestUpdate)}`)

    if (! (boxDisplayAttrIs(infoBox) || pauseForestUpdate)) {

        // collect all trees by the states they are in
        let alltrees = document.getElementsByClassName("tree")
        let absents = document.getElementsByClassName("absent")
        let protecteds = document.getElementsByClassName("protected")
        let normals = document.getElementsByClassName("normal")
        let drys = document.getElementsByClassName("dry")
        let burnings = document.getElementsByClassName("burning")
        let charreds = document.getElementsByClassName("charred")
        const countpresenttrees = normals.length + drys.length + burnings.length + charreds.length

        // update game state object
        gameState.health = (normals.length + protecteds.length) / totalTreesInForest
        gameState.playTime = new Date().getTime() - gameState.startTime

        // // if the health is low, but the person hasn't clicked yet...
        // // instruct them to click on trees!
        // if ((gameState.health < gameState.starthealth * .8) && (gameState.clicksonsicktrees < 1) && (gameState.shownMessage2==false)) {
        //     console.log("encourage person to tap on trees.")
        //     setInfo(infoBox, 2)
        //     gameState.shownMessage2 = true
        //     showBox(infoBox, false)
        // }

        // // if there are no dry/burning trees left (but there still are normal trees):
        // if ((drys.length == 0) && (burnings.length == 0) && (normals.length + protecteds.length >= 0)){
        //     // console.log(`no dry or burning trees (there are, however, normal trees).`)

        //     // conclude the experience
        //     if(gameState.clicksonsicktrees > totalTreesInForest * gameState.starthealth || gameState.playTime > PLAYTIMELIMIT) {
        //         setInfo(infoBox,0)
        //         showBox(infoBox, true)
        //     }

        //     // or keep the experience going
        //     else if (Math.random() < .075) /* note: the use of Math.random here (instead of setTimeout) is very-much intentional ; this is to artificially create a time-gap before taking the next step. */ {
        //         if(!boxDisplayAttrIs(infoBox)) {
        //             console.log("forest saved. showing new news.")
        //             const infotype = Math.random() > gameState.health ? 3 /* good news */ : 4 /* bad news */
        //             console.log(`${infotype==3?"good":"bad"} news selected.`)
        //             setInfo(infoBox,infotype)
        //             showBox(infoBox, true)
        //         }
        //     }
        // }


        /**
         * spontaneous Δ in tree-state
         */

        const PERCENT_OF_FOREST_TO_RESPAWN = /* suggested: 75%  */ 75
        const TREE_RESPAWN_PROBABILITY = /* suggested: .5 */ 0.25
        const THRESHOLD_MAKEDRY = /* suggested: .999 */ 0.999
        const THRESHOLD_SETFIRE = /* suggested: .99  */ 0.99
        const THRESHOLD_STOPFIRE = /* suggested: .99  */ 0.98
        const THRESHLD_DISINTEGRATE = /* suggested: .99  */ 0.99
        const forstcover = countpresenttrees / alltrees.length

        // absent -> new shoot (which grows into a tree)
        for (let i = 0; i < absents.length; i++) {
            const mintrees = 1
            // if there are no trees in the forest,
            if ((protecteds.length + normals.length + drys.length + burnings.length + charreds.length) < mintrees) {
                // respawn the forest:
                if (Math.random() < PERCENT_OF_FOREST_TO_RESPAWN / 100) {
                    console.log(`spawning a tree into an empty forest.`)
                    tree[absents[i].getAttribute('tree-id')].behaviour = 1
                }
            }
            // else if there are some trees
            else {
                const thisthreshold = TREE_RESPAWN_PROBABILITY * Math.pow(forstcover, 2) / 100
                if (Math.random() < thisthreshold) {
                    console.log(`(probability: ${(100 * thisthreshold).toFixed(3)}%) spawning tree-${absents[i].getAttribute('tree-id')}.`)
                    tree[absents[i].getAttribute('tree-id')].behaviour = 1
                }
            }
        }

        // normal -> dry
        for (let i = 0; i < normals.length; i++) {
            if (
                // if the tree is fully grown
                tree[normals[i].getAttribute('tree-id')].state.now[1] >= (svgtree.src.innerhtml[tree[normals[i].getAttribute('tree-id')].state.now[0]]).length - 1
                &&
                Math.random() > THRESHOLD_MAKEDRY
            ) {
                tree[normals[i].getAttribute('tree-id')].behaviour = 1
            }
        }

        // dry -> burning
        for (let i = 0; i < drys.length; i++) {
            if (Math.random() > THRESHOLD_SETFIRE) {
                tree[drys[i].getAttribute('tree-id')].behaviour = 1
            }
        }

        // burning -> charred
        for (let i = 0; i < burnings.length; i++) {
            if (Math.random() > THRESHOLD_STOPFIRE) {
                tree[burnings[i].getAttribute('tree-id')].behaviour = 1
            }
        }

        // charred -> disintegrating -> absent
        for (let i = 0; i < charreds.length; i++) {
            const treeid = charreds[i].getAttribute('tree-id')
            const treestate = tree[treeid].state.now
            // charred -> disintegrating :—
            // if the tree is charred (state 4), but not yet disintegrating (state 5)...
            if (treestate[0] == 4) {
                // ... then, based on this probability...
                if (Math.random() < ((1 - THRESHLD_DISINTEGRATE) / forstcover)) {
                    // ... make it disintegrate
                    tree[charreds[i].getAttribute('tree-id')].behaviour = 1
                }
            }
            else
                // disintegrating -> absent :—
                // if the tree is disintegrating (state = 5)...
                if (treestate[0] == 5) {
                    /* 
                        do nothing,
                        because this transition is automatically handled within updateTree().
                        nb. as soon the tree disintegrates (i.e., as soon as state 5 ends), 
                        it immediately moves to state  0.
                    */
                }
        }


        /** 
         * make fire, dryness, health spread from one tree to its neighbours 
         */

        // spreadInfection(burnings, "burning", .99, 1)
        // spreadInfection(drys, "dry", .995, 1)
        // spreadInfection(normals, "normal", .99995, 1)

        /**
         * fire, dryness, health can spread from one tree to its neighbours
         * @param {*} trees - a collection of trees-svg's
         * @param {string} state - the state that the trees (which are trying to spread their condition to their neighbours) are in
         * @param {number} immunity - the immunity of their neighbouring trees, so that they don't get infected easily.
         * @param {number} [spreadDistance=1]
         */
        function spreadInfection(trees, state, immunity, spreadDistance) {
            for (let i = 0; i < trees.length; i++) {
                const id = Number(trees[i].parentNode.id.substring("tree-".length, trees[i].parentNode.id.length))
                const _x = tree[id].positionInForestGrid.x
                const _y = tree[id].positionInForestGrid.y
                for (let t = 0; t < totalTreesInForest; t++) {
                    if (
                        true
                        && tree[t].positionInForestGrid.x >= 0
                        && tree[t].positionInForestGrid.y >= 0
                        && tree[t].positionInForestGrid.x >= _x - spreadDistance
                        && tree[t].positionInForestGrid.x <= _x + spreadDistance
                        && tree[t].positionInForestGrid.y >= _y - spreadDistance
                        && tree[t].positionInForestGrid.y <= _y + spreadDistance
                        && tree[t].id
                    ) {
                        if (Math.random() > immunity) {
                            // note: this setTimeout(), below, is important. it lets us wait for some time before making neighbouring trees catch fire. without this, the whole forest caught fire in one loop.
                            setTimeout(function () {
                                const neighbour = document.getElementById('tree-' + t)
                                const neighbourSvg = neighbour.getElementsByTagName("svg")[0]
                                if (state == "burning" || state == "dry") {
                                    if (
                                        neighbourSvg.classList.contains("charred")
                                        ||
                                        neighbourSvg.classList.contains("absent")
                                        ||
                                        neighbourSvg.classList.contains("protected")
                                    ) {
                                        // can't do anything
                                    }
                                    else if (
                                        neighbourSvg.classList.contains("normal")
                                    ) {
                                        // console.log(`spreading dryness. making tree-${id} dry.`)
                                        tree[t].behaviour = 1
                                    }
                                    else if (
                                        state == "burning"
                                        &&
                                        neighbourSvg.classList.contains("dry")
                                    ) {
                                        // console.log(`spreading fire. tree-${id} catches fire.`)
                                        tree[t].behaviour = 1
                                    }
                                }
                                else if (state == "normal") {
                                    if (
                                        neighbourSvg.classList.contains("absent")
                                    ) {
                                        tree[t].behaviour = 1
                                    }
                                    else if (
                                        neighbourSvg.classList.contains("charred")
                                    ) {
                                        tree[t].behaviour = 1
                                    }
                                }
                            }, refreshTime)
                        }
                    }
                }
            }
        }

        
        /** 
         * update each tree
         */
        for(let i=0 ; i<alltrees.length ; i++) {
            updateTree(alltrees[i].getElementsByTagName("svg")[0])
        }
    }
}

/*  ------------------------------------------------------------
    if the person taps on the screen
    ------------------------------------------------------------  */

document.addEventListener("click", handleClicks);

/** @param {MouseEvent} e */
function handleClicks(e) {
    // count the click
    gameState.clicks++
    // if the forest is allowed to update, then...
    if (! (boxDisplayAttrIs(infoBox))) {
        // ...check if the click happened on a tree
        didClickHappenOnTree(e)
    }
}

/*  ------------------------------------------------------------
    if the click happened on a tree...
    ------------------------------------------------------------  */

/** @param {MouseEvent} e */
function didClickHappenOnTree(e) {

    // get coordinates of mouseclick
    const x = e.clientX
    const y = e.clientY
    // console.log("clicked on: (" + x + ", " + y + ")")

    // get array of all elements that are present where the mouseclick happened ...
    /** @type {*} */
    let c = []
    c = document.elementsFromPoint(x, y)
    // console.log("here are all clicked-on elements:")
    // console.log(c)

    // check if the click happened on #infoBox
    let clickedOnInfosBox = false;
    for (let i = 0; i < c.length; i++) {
        if (c[i].id === 'infoBox' || c[i].id === 'closeInfoBox') {
            clickedOnInfosBox = true
            console.log(`clicked on #${c[i].id} | did not click on #forest`)
            break;
        }
    }

    // if we didn't click on the #infoBox, then we may continue checking whether the click happened on a tree in the #forest:
    if (clickedOnInfosBox == false) {

        // in the array, we are checking which element is an "SVG Path/Polyline/Polygon Element" (i.e., is a <path>, <polyline> or <polygon>).
        c = c.map(function (x) {
            if (
                x.constructor.toString().indexOf("SVGPathElement()") > -1
                || x.constructor.toString().indexOf("SVGPolylineElement()") > -1
                || x.constructor.toString().indexOf("SVGPolygonElement()") > -1
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
            )
                // return <path>'s parent (which is an <svg>)
                return x.parentNode
            else return -1
        });
        // console.log("gathered parent svg-nodes for path elements:")
        // console.log(c)

        // filter out all non-svg elements (which we'd already replaced with -1)
        c = c.filter(function (e) { return e != -1; })
        // console.log("removed -1's:")
        // console.log(c)

        // ensure that all elements in the array are unique
        c = c.filter(function (x, i, a) { return a.indexOf(x) == i })
        // console.log("removed duplicates:")
        // console.log(c)

        // count the click
        if(c.length>0) gameState.clicksontrees++

        // now, we instruct each (clicked-)tree to change
        for (const i in c) {
            const SVGElementOfClickedTree = c[i]
            const treeid = Number(SVGElementOfClickedTree.getAttribute('tree-id'))
            if (SVGElementOfClickedTree.classList.contains("burning") || SVGElementOfClickedTree.classList.contains("dry")) {
                gameState.clicksonsicktrees++
                // if (SVGElementOfClickedTree.classList.contains("dry")) console.log(`click on ${treeid}: dry -> normal`)
                // if (SVGElementOfClickedTree.classList.contains("burning")) console.log(`click on ${treeid}: burning -> dry`)
                tree[treeid].behaviour = -1
            }
            if (SVGElementOfClickedTree.classList.contains("normal")) {
                // console.log(`click on ${treeid}: normal -> protected`)
                tree[treeid].isProtected = true
                tree[treeid].behaviour = 0
            }
            if (SVGElementOfClickedTree.classList.contains("protected")) {
                // console.log(`click on tree-${treeid.substring("tree-".length, treeid.length)}: classList.contains("${SVGElementOfClickedTree.classList}") • isProtected=${tree[treeid.substring("tree-".length, treeid.length)].stateSettings.protected.isProtected}`)
                tree[treeid].isProtected = true
                tree[treeid].behaviour = 0
            }
            if (SVGElementOfClickedTree.classList.contains("charred")) {
                // console.log(`click on ${treeid}: charred -> disintegrating`)
                tree[treeid].behaviour = 1
            }
            if (SVGElementOfClickedTree.classList.contains("absent")) {
                // console.log(`click on ${treeid}: absent -> normal`)
                tree[treeid].behaviour = 1
            }
        }
    }
}
