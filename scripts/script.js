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


const refreshRate = 10 // fps
const refreshTime = 1000 / refreshRate // time in millisecond

/** @type {number} duration for which a protected tree stays protected */
const protectionDuration = 7500 // time in millisecond

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
    return window.getComputedStyle(element).getPropertyValue(property).trim()
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
        c = c.slice(c.indexOf("(")+1,c.indexOf(")"))
    }
    if(c.slice(0,2)=='--') {
        c = getStylePropertyFromRoot(c)
    }
    let hsl = c.split(",")
    if(hsl[0].split("(")[0]!="hsl") {
        console.log(`supplied colour is not in HSL format. so, randomiseHSLColour() can not randomise colour. so: returning colour {string} as-is: ${c}.`)
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

/** make fires crackle */
const fireCrackleTime = 600
setInterval(function () {
    /** @type {any} */
    let fires = document.getElementsByClassName("fire")
    for (let i = 0; i < fires.length; i++) {
        if (fires[i]) {
            fires[i].style.fill = randomiseHSLColour('--firedarker', 0, 5),
            // console.log("fire gets darker")
            setTimeout(function () {
                if (fires[i]) {
                    fires[i].style.fill = randomiseHSLColour('--fire', 0, 5)
                    // console.log("fire gets less dark") 
                }
            }, approx(fireCrackleTime, 50));
        }
    }
}, fireCrackleTime);

/**
 * randomly convert some "normal" trees to their "dry" state
 * @param {number} [n=1] - number of trees to seed
 */
function seedDryTrees(n) {

    /* if there's at-least 1 "normal"/"protected" tree in the forest... */
    if (document.getElementsByClassName("normal").length + document.getElementsByClassName("protected").length > 0) {
        /* ...then, select a random "normal"/"protected" tree to turn "dry". */
        if (n <= 1) n = 1
        // console.log("trying to seed " + n + " dry trees")
        for (let i = 0; i < n; i++) {
            updateTree(selectRandomTree(), "dry")
        }

        function selectRandomTree() {
            const treeid = (Math.floor(Math.random() * totalTreesInForest))
            const treediv = document.getElementById('tree-' + treeid)
            const svgelementintree = treediv.getElementsByTagName("svg")[0]
            if (
                svgelementintree.classList.contains("absent")
                ||
                svgelementintree.classList.contains("burning")
                ||
                svgelementintree.classList.contains("charred")
            ) {
                return selectRandomTree()
            }
            return svgelementintree
        }
    }
}

/**
 * tree changes as instructed
 * @typedef {Object} TreeChangeSettings
 * @property {object} shape
 * @property {string|boolean} [shape.foliage=false] 
 * @property {string|boolean} [shape.stump=false] 
 * @property {string|boolean} [shape.fire=false] 
 * @property {string|boolean} [shape.burned=false] 
 * @property {object} colour
 * @property {string|boolean} [colour.outline=false] 
 * @property {string|boolean} [colour.foliage=false] 
 * @property {string|boolean} [colour.stump=false] 
 * @property {string|boolean} [colour.fire=false] 
 * @property {string|boolean} [colour.burned=false] 
 */
/**
 * @param {*} svgelement 
 * @param {string} state - the state of the tree
 */
function updateTree(svgelement, state) {

    // helper variables
    const id = Number(svgelement.parentNode.id.substring("tree-".length, svgelement.parentNode.id.length))
    const foliages = svgelement.getElementsByClassName('foliage')
    const wood = svgelement.getElementsByClassName('stump')
    const fires = svgelement.getElementsByClassName('fire')
    const burnedses = svgelement.getElementsByClassName('burned')

    if (tree[id].stateSettings.protected.isProtected == true) {
        // if the tree is protected, we can do nothing
    } else {
        /* tree memorises its present state */
        tree[id].state.previous = tree[id].state.now
        tree[id].shape.foliage.previous = tree[id].shape.foliage.now
        tree[id].shape.stump.previous = tree[id].shape.stump.now
        tree[id].shape.fire.previous = tree[id].shape.fire.now
        tree[id].shape.burned.previous = tree[id].shape.burned.now
        tree[id].colour.outline.previous = tree[id].colour.outline.now
        tree[id].colour.foliage.previous = tree[id].colour.foliage.now
        tree[id].colour.stump.previous = tree[id].colour.stump.now
        tree[id].colour.fire.previous = tree[id].colour.fire.now
        tree[id].colour.burned.previous = tree[id].colour.burned.now

        /* tree decides what its new appearance will be */
        tree[id].state.now = state
        // console.log(`updateTree # ${id}: ${tree[id].state.previous} -> ${tree[id].state.now}`)
        const classes = svgelement.classList
        for (let i = 0; i < classes.length; i++) {
            svgelement.classList.remove(classes[i])
        }
        svgelement.classList.add(tree[id].state.now)
        const settings = tree[id].stateSettings[state]
        tree[id].shape.foliage.now = settings.shape.foliage
        tree[id].shape.stump.now = settings.shape.stump
        tree[id].shape.fire.now = settings.shape.fire 
        tree[id].shape.burned.now = settings.shape.burned 
        tree[id].colour.outline.now = settings.colour.outline 
        tree[id].colour.foliage.now = settings.colour.foliage 
        tree[id].colour.stump.now = settings.colour.stump 
        tree[id].colour.fire.now = settings.colour.fire 
        tree[id].colour.burned.now = settings.colour.burned 

        // console.log("change t# " + id)
        // console.log(tree[id])

        /* tree changes appearance: */
        // -- 1. it updates its svg shape
        svgelement.innerHTML =
            tree[id].shape.foliage.now
            + tree[id].shape.stump.now
            + tree[id].shape.fire.now
            + tree[id].shape.burned.now
        // -- 2. it sets the colour for those svg-shapes
        for (const p of foliages) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.foliage.now
        }
        for (const p of wood) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.stump.now
        }
        for (const p of fires) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.fire.now
        }
        for (const p of burnedses) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.burned.now
        }
        // -- 3. sound feedback:
        //      -- a. tree catches fire (i.e., was not burning before, but is now)
        if (tree[id].state.previous != "burning" && tree[id].state.now == "burning") {
            playSound(sCatchFire, volumeScaler.sCatchFire)
        }
        //      -- b. tree is protected
        if (tree[id].state.previous != "protected" && tree[id].state.now == "protected") {
            forcePlaySound(sMakeTreeSafe, volumeScaler.sMakeTreeSafe)
        }

        /*  state-specific behaviour:
            if the tree just got protected...
            */
        if (tree[id].state.previous != "protected" && tree[id].state.now == "protected") {
            tree[id].stateSettings.protected.isProtected = true
            // remains protected for 'protectionDuration' time
            setTimeout(function () {
                // console.log(`protected tree-${id} is preparing to become "normal" (automatically).\n(protectionDuration: ${protectionDuration}ms)\nchecking status...\nisProtected: ${tree[id].stateSettings.protected.isProtected}`)
                if (tree[id].stateSettings.protected.isProtected = true) {
                    tree[id].stateSettings.protected.isProtected = false
                    // console.log(`protected tree-${id} is now ready to become "normal" (automatically).\nupdating status...\nisProtected: ${tree[id].stateSettings.protected.isProtected}`)
                    updateTree(svgelement, "normal")
                }
            }, approx(protectionDuration, 20))
        }
    }

    // let protecteds = document.getElementsByClassName("protected")

    // just to be extra careful...
    if (tree[id].state.now != "protected") {
        tree[id].stateSettings.protected.isProtected = false
    }
}

/*  ------------------------------------------------------------
    newsBox
    ------------------------------------------------------------  */

/** 
 * @type {array} news headlines 
 * note: generated by openai's chatgpt in 202311 • prompt ~ news headlines about events that are bad for climate change, with fake-but-believable names of news sources for each.
*/
const headlines = [
    {
        "headline": "Greenland's Ice Loss Hits Unprecedented Levels in Single-Day Heatwave",
        "source": "EarthWatch News",
        "date": "August 1, 1995"
    },
    {
        "headline": "Australian Bushfires Release Massive Amounts of Carbon Dioxide into the Atmosphere",
        "source": "Climate Insights Daily",
        "date": "March 12, 2003"
    },
    {
        "headline": "Himalayan Glaciers Continue to Shrink, Posing Water Crisis",
        "source": "Environmental Insights",
        "date": "May 12, 2021"
    },
    {
        "headline": "Mega-Drought in Western US Threatens Critical Water Resources",
        "source": "Climate Alert Digest",
        "date": "June 7, 2012"
    },
    {
        "headline": "Alpine Ski Resorts Grapple with Decreasing Snowfall",
        "source": "Mountain Snow Report",
        "date": "January 5, 2024"
    },
    {
        "headline": "Greenland's Ice Loss Hits Unprecedented Levels in Single-Day Heatwave",
        "source": "EarthWatch News",
        "date": "August 1, 1995"
    },
    {
        "headline": "Massive Wildfires Devastate California, Worsening Climate Crisis",
        "source": "California Climate Watch",
        "date": "October 2, 2023"
    },
    {
        "headline": "Amazon Rainforest Deforestation Skyrockets, Climate Concerns Mount",
        "source": "EcoNews Update",
        "date": "June 17, 2025"
    },
    {
        "headline": "Siberian Heatwave Fuels Massive Wildfires, Raising Carbon Emissions",
        "source": "Environmental Report Hub",
        "date": "July 20, 2015"
    },
    {
        "headline": "Changing Monsoon Patterns in South Asia Impact Agriculture",
        "source": "Monsoon Matters",
        "date": "July 21, 2022"
    },
    {
        "headline": "Fossil Fuel Emissions Rebound Sharply Amidst Pandemic Recovery",
        "source": "Earth Impact Chronicle",
        "date": "December 4, 2028"
    },
    {
        "headline": "Antarctic Ice Sheet Loss Raises Global Sea Level Concerns",
        "source": "Antarctic Watch",
        "date": "November 19, 2028"
    },
    {
        "headline": "Worsening Air Quality in Major Cities Linked to Smog",
        "source": "Air Quality Monitor",
        "date": "January 8, 2030"
    },
    {
        "headline": "Droughts in Southern Africa Threaten Food Security",
        "source": "African Food Watch",
        "date": "March 29, 2031"
    },
    {
        "headline": "Declining Insect Populations Raise Ecosystem Concerns",
        "source": "Insect Watch",
        "date": "February 17, 2025"
    },
    {
        "headline": "Great Barrier Reef Hit by Severe Bleaching Event Due to Warming Waters",
        "source": "Ocean Insights Weekly",
        "date": "March 30, 2040"
    },
    {
        "headline": "Warming Oceans Threaten Marine Life in the Gulf of Mexico",
        "source": "Gulf Marine Report",
        "date": "September 3, 2029"
    },
    {
        "headline": "Global Shipping Industry Faces Pressure to Reduce Emissions",
        "source": "Maritime Emission Monitor",
        "date": "July 3, 2036"
    },
    {
        "headline": "Heat-related Deaths Spike During Summer Heatwaves",
        "source": "Heatwave Health Alert",
        "date": "August 7, 2025"
    },
    {
        "headline": "Record-breaking Heatwave Sweeps Through Europe",
        "source": "Climate News Today",
        "date": "July 5, 2025"
    },
    {
        "headline": "IPCC Report Issues Urgent Warning on Irreversible Climate Consequences",
        "source": "Global Climate Outlook",
        "date": "August 15, 2019"
    },
    {
        "headline": "Ocean Acidification Affects Oyster Fisheries in Pacific Northwest",
        "source": "Aquatic Insights",
        "date": "June 7, 2028"
    },
    {
        "headline": "Melting Glaciers Pose Avalanche Risks in Mountainous Regions",
        "source": "Mountain Safety Report",
        "date": "February 2, 2027"
    },
    {
        "headline": "Greenland's Melting Ice Could Trigger Abrupt Climate Changes",
        "source": "Arctic Climate Update",
        "date": "October 16, 2037"
    },
    {
        "headline": "Deforestation in the Congo Basin Threatens Biodiversity",
        "source": "Rainforest Guardian",
        "date": "March 4, 2026"
    },
    {
        "headline": "Water Scarcity in the Middle East Fuels Regional Tensions",
        "source": "Middle East Water Watch",
        "date": "April 10, 2029"
    }
];

/** @type {number} count the total number of times the newsBox has been shown so far */
let newsSeenCounter = 0

/** @type {HTMLElement} */
const newsBox = document.getElementById('newsBoxContent')

/** @type {boolean} tracks whether the newsBox is displayed or not */
let newsBoxDisplayState = false

const newsBoxTransitionDuration = 300
updateStyle(newsBox,"transition-duration",newsBoxTransitionDuration+'ms')

// sets the content and display-position of the newsBox at startup
changeNews(newsBox, fetchHeadline())
hideBox(newsBox)

/** @type {HTMLElement} */
const xNewsBox = document.getElementById('dismissNewsBoxIcon')
xNewsBox.addEventListener('click', function () {
    hideBox(newsBox)
})

function showBox(box) {
    newsBoxDisplayState = true
    box.style.bottom = "calc(100vh - 2rem)"
}

function hideBox(box) {
    newsBoxDisplayState = false
    box.style.bottom = "-100vh"
    newsSeenCounter++
    // console.log(`newsSeenCounter: ${newsSeenCounter}`)  
    setTimeout(function() {
        const newHeadline = fetchHeadline()
        // console.log(`changing news headline to: ${newHeadline.headline}`)
        changeNews(newsBox, newHeadline)
    }, newsBoxTransitionDuration) // change the headlines only once the box has been hidden completely
    seedDryTrees(Math.max(newsSeenCounter,1))
}

function changeNews(box, content) {
    box.getElementsByTagName('h3')[0].innerHTML = content.headline
    box.getElementsByTagName('p')[0].innerHTML = content.source + ' (' + content.date + ')'
}

/** @returns {object} */
function fetchHeadline() {
    return headlines[Math.floor(headlines.length * Math.random())]
}

/*  ------------------------------------------------------------
    forest & trees
    ------------------------------------------------------------  */

const startButton = document.getElementById('startButton')
startButton.addEventListener('click', function () {

    startButton.style.display = 'none'
    
    // start playing sounds, on loop, but muted.
    sBurning.volume = 0
    sBurning.loop = true
    sBurning.play()
    sForest.volume = 1
    sForest.loop = true
    sForest.play()

    /*  ------------------------------------------------------------
        collect information before drawing tree
        ------------------------------------------------------------  */

    const svgtree = {
        src: {
            starttag: '<svg width="100%" height="100%" viewBox="0 0 134 382" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">',
            foliage: [
                /* default */ '<path class="foliage" d="M40.695,345.956c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-95.673 21.939,-166.478c1.993,-14.2 14.902,-76.508 28.401,-76.508c13.498,0 19.325,56.249 27.506,126.547c6.551,56.295 16.154,87.73 16.154,116.124c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
                /* sway left */ '<path class="foliage" d="M40.695,345.956c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-90.003 21.939,-160.808c1.993,-14.2 6.398,-82.178 19.897,-82.178c13.498,0 27.829,53.415 36.01,123.713c6.551,56.295 16.154,90.564 16.154,118.958c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
                /* sway right */ '<path class="foliage" d="M40.695,343.122c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 14.837,-95.673 24.774,-166.478c1.993,-14.2 23.406,-73.674 36.905,-73.674c13.498,0 7.986,59.084 16.167,129.382c6.551,56.295 16.154,84.895 16.154,113.289c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,0.21 -48.987,1.022Z"/>'
            ],
            stump: '<path class="stump" d="M78.599,343.603l-0,30.056l-4.484,5.341l-14.596,0l-3.834,-4.884l-0,-28.913l22.914,-1.6Z"/>',
            fire: '<path class="fire" d="M55.889,74.322c3.005,-5.038 6.083,-11.872 4.708,-18.707c-3.06,-15.32 13.79,-28.09 13.79,-28.09c9.68,-6.27 9.366,-17.66 8.466,-23.27c-0.087,-0.726 1.123,-1.254 1.123,-1.254c-0,-0 0.875,0.402 0.987,0.73c1.854,5.7 3.784,16.352 -0.066,22.964c-1.186,2.037 -3,6.51 -3.71,8.22c-1.4,3.46 -2.52,7.77 -2.95,21l0.067,4.954c1.711,6.895 2.653,12.701 2.653,16.696c-0.035,4.892 -1.498,9.668 -4.21,13.74l-5.43,8.22c-4.73,11.03 -4.03,19.18 2.12,24.52l5.376,1.984c0.339,-0.318 4.245,-2.045 4.924,-2.724c4.16,-4.15 7.34,-8.79 5.87,-15.56c-1.53,-7.1 7.11,-13 10.28,-13.84c0.623,-0.162 1.205,-0.452 1.71,-0.85c2.39,-1.85 8.6,-7.59 6.52,-15.49c0,0 4.5,12.91 -2.44,18.28c-0.447,0.347 -0.887,0.707 -1.32,1.08c-3.533,3.079 -5.649,7.478 -5.85,12.16l-0.15,2.74c0.058,8.914 -8.57,19.88 -8.57,19.88c-1.7,2.53 7.707,7.53 7.937,9.53c0.306,2.553 0.333,5.131 0.08,7.69c-0.191,1.885 -1.083,3.631 -2.5,4.89c0,0 -2.519,4.355 -2.93,6.64l-0.18,4.91c-0.51,1.02 1.49,4.6 4.49,5.33c0,0 3.219,1.587 6.45,0.485c4.875,-4.016 1.671,-10.168 0.873,-17.195c-1.53,-13.54 11.74,-18.64 11.74,-18.64c0,0 5.34,-6.76 5,-12c0.91,3.83 1.39,11.12 -4.52,19.12c-3.491,4.635 -4.441,10.63 -2.744,16.018c1.407,-0.462 3.189,-1.425 3.684,-3.548c1.003,-4.35 3.575,-8.183 7.22,-10.76c1.09,-0.77 3.59,-1.14 5.68,-1.4c0.041,-0.005 0.083,-0.007 0.124,-0.007c0.587,-0 0.809,0.483 0.809,1.07c0,0.284 -0.419,0.556 -0.62,0.757c-3.24,3.08 -7.743,9.35 -6.433,21.35c2.12,19.45 -5.61,14.3 -36.76,45.45c-31.15,31.15 -58.52,-6.67 -58.52,-6.67c0,0 -5.198,-3.565 -10.64,-7.865c-4.837,-2.199 -9.177,-5.549 -12.06,-10.525c-2.154,-3.707 -2.977,-7.499 -2.943,-11.168c0.132,-14.29 11.623,-25.092 11.623,-25.092c0,0 -5.241,16.539 -1.213,26.21c0.031,0.044 0.062,0.091 0.093,0.14c2.18,3.43 5.91,4.37 14.1,6.3c2.239,0.527 10.13,1.253 3.18,-8.37c-2.995,-4.148 -3.584,-12.591 -3,-19.11c0.53,-5.75 4,-12.18 7.31,-16.45c1.501,-1.952 5.061,-3.802 7.981,-5.731c1.58,-2.312 2.174,-5.184 1.609,-7.959l-0.499,-6.531c-0.059,-0.1 -0.117,-0.197 -0.171,-0.289c-3.018,-5.159 -4.454,-11.092 -4.13,-17.06l0,-0.69c0.313,-5.917 2.327,-11.62 5.8,-16.42l5.08,-5.77c1.69,-1.38 3.451,-2.754 5.102,-4.023Z"/>',
            burned: '<path class="burned" d="M60.67,380.299l-6.203,-71.311l8.765,-48.949l-1.22,-11.17l-10.36,-26.59l-8.08,-7.49l-17.79,1.87l18.654,-2.525l-12.664,-14.295l20.595,22.139l9.41,22.697l-4.475,-47.256l12.58,-60.01l-2.882,-10.779l0.142,-9.274l-0.142,-18.858l1.684,21.933l3.158,17.011l-11.853,56.776l22.614,-26.26l4.995,-17.914l-3.238,18.689l-23.304,31.16l5.944,60.361l-5.572,47.798l14.054,-35.733l19.14,-11.5l-1.621,-21.767l3.188,20.26l12.313,-11.843l-11.532,14.279l-19.179,12.356l-15.142,39.016l11.791,67.179l-13.77,0Z"/>',
            endtag: '</svg>'
        },
        dim: {
            // these are known to us, from when we created the svg
            width: 134 / 2.5,
            height: 382 / 2.5
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
            t: -50,
            r: 0,
            b: 0,
            l: 0
        },
        spacing: {
            h: svgtree.dim.width * 2 / 3,
            v: 37.5
        },
        orderly: {
            positionally: true,
            maxZIndexDeviation: 2,
            shape: true,
            colour: true
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
        if (i > 1000 /*an arbitarily large number*/) { /* bug out, because otherwise this for-loop will hang stuff */ break; }
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
            shape: {
                foliage: {
                    default: svgtree.src.foliage[0],
                    previous: '',
                    now: ''
                },
                stump: {
                    default: svgtree.src.stump,
                    previous: '',
                    now: ''
                },
                fire: {
                    default: svgtree.src.fire,
                    previous: '',
                    now: ''
                },
                burned: {
                    default: svgtree.src.burned,
                    previous: '',
                    now: ''
                },
            },
            colour: {
                outline: {
                    default: 'black',
                    previous: '',
                    now: ''
                },
                foliage: {
                    default: 'white',
                    previous: '',
                    now: ''
                },
                stump: {
                    default: 'white',
                    previous: '',
                    now: ''
                },
                fire: {
                    default: 'white',
                    previous: '',
                    now: ''
                },
                burned: {
                    default: 'black',
                    previous: '',
                    now: ''
                }
            },
            dimensions: {
                l: forest.offsetLeft + forestSettings.padding.l + (treeIDinRow * forestSettings.spacing.h) + (rowID % 2 === 0 ? (forestSettings.spacing.h / 4) : (-forestSettings.spacing.h / 4)) + (forestSettings.orderly.positionally ? ((Math.random() < 5 ? -1 : 1) * Math.random()*svgtree.dim.width/4) : 0),
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
                default: 'normal',
                previous: '',
                now: 'normal'
            },
            stateSettings: {
                absent: {
                    shape: {
                        // stump: svgtree.src.stump
                    },
                    colour: {
                        stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                    }
                },
                protected: {
                    isProtected: false,
                    shape: {
                        foliage: forestSettings.orderly.shape ? svgtree.src.foliage[0] : (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                        stump: svgtree.src.stump,
                        fire: false,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: randomiseHSLColour('--protected', 3, 10, forestSettings.orderly.colour),
                        stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                    }
                },
                normal: {
                    shape: {
                        foliage: forestSettings.orderly.shape ? svgtree.src.foliage[0] : (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                        stump: svgtree.src.stump,
                        fire: false,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: randomiseHSLColour('--green', 3, 10, forestSettings.orderly.colour),
                        stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                    }
                },
                dry: {
                    shape: {
                        foliage: (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                        stump: svgtree.src.stump,
                        fire: false,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: randomiseHSLColour('--autumn', 10, 20, forestSettings.orderly.colour),
                        stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                    }
                },
                burning: {
                    shape: {
                        foliage: (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                        stump: svgtree.src.stump,
                        fire: svgtree.src.fire,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: randomiseHSLColour('--autumn', 10, 20, forestSettings.orderly.colour),
                        stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour),
                        fire: randomiseHSLColour('--fire', 0, 5),
                    }
                },
                charred: {
                    shape: {
                        foliage: false,
                        stump: false,
                        fire: false,
                        burned: svgtree.src.burned
                    },
                    colour: {
                        outline: 'black',
                        burned: 'black'
                    }
                }
            }
        }
        // set id and class
        newDiv.setAttribute('class', tree[i].class)
        newDiv.setAttribute('id', tree[i].id)

        // add the placeholder svg-element into newDiv
        newDiv.innerHTML = svgtree.src.starttag + svgtree.src.endtag
        // then, grab the svg-element...
        const svgelement = newDiv.getElementsByTagName("svg")[0] // ∵ the first (and only) child is an <svg>
        // ... and, finally, draw and style the tree (within the svg-element):
        //  — spawn all normal trees:
        // updateTree(svgelement,"normal")
        //  or
        //  - spawn a more organic-looking forest:
        updateTree(svgelement, Math.random()<.02?"charred":Math.random()<.03?"absent":"normal")

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
        newDiv.style.visibility = 'hidden'
        // finally, make the div a child of #forest
        forest.appendChild(newDiv)
        // the tree appears:
        setTimeout(function () { newDiv.style.visibility = 'visible' }, Math.random() * 1000)
        // update the value for total number of trees spawned in the forest
        totalTreesInForest += 1
    }

    console.log(totalTreesInForest + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow + 1) + " or fewer trees per row.")

    /*  ------------------------------------------------------------
        update the forest.
        ------------------------------------------------------------  */

    setInterval(function () { updateForest() }, refreshTime)

    function updateForest() {

        /* update sound */

        // update volume of ambient sounds

        sBurning.volume = percentageOfTrees("burning") * volumeScaler.sBurning
        // console.log(`volume of burning sounds: ${percentageOfTrees("burning") * volumeScaler.sBurning}`)
        sForest.volume = percentageOfTrees("normal") * volumeScaler.sForest
        // console.log(`volume of forest sounds: ${percentageOfTrees("normal") * volumeScaler.sForest}`)
    
        // randomly play a random-sound from the forest

        const secondses = approx(30,75) // time (in seconds) after which the random sound ought to play
        if (Math.random() < 1 / (refreshRate * secondses)) {
            sEagle.volume = Math.random() * percentageOfTrees("normal") * volumeScaler.sEagle
            sEagle.play();
        } 

        /* update visuals */

        if (!newsBoxDisplayState) {

            // collect all trees by the states they are in
            let absents = document.getElementsByClassName("absent")
            let protecteds = document.getElementsByClassName("protected")
            let normals = document.getElementsByClassName("normal")
            /** @type {*} */
            let drys = document.getElementsByClassName("dry")
            /** @type {*} */
            let burnings = document.getElementsByClassName("burning")
            let charreds = document.getElementsByClassName("charred")

            // if there are no dry/burning trees left (but there still are normal trees):
            if (drys.length == 0 && burnings.length == 0 && (normals.length + protecteds.length >= 0)) {
                // console.log(`no dry or burning trees (there are, however, normal trees).`)
                if (Math.random() < .075) /* note: the use of Math.random here (instead of setTimeout) is very-much intentional ; this is to artificially create a time-gap before taking the next step. */ {        
                    setTimeout(function() {
                        showBox(newsBox)
                    }, approx(2000, 50))
                }
            }

            // dry -> burning
            for (let i = 0; i < drys.length; i++) {
                if (Math.random() > .9995)
                    updateTree(drys[i], "burning")
            }

            // burning -> charred
            for (let i = 0; i < burnings.length; i++) {
                if (Math.random() > .983)
                    updateTree(burnings[i], "charred")
            }

            // charred -> absent
            for (let i = 0; i < charreds.length; i++) {
                if (Math.random() > .9999)
                    updateTree(charreds[i], "absent")
            }
            for (let i = 0; i < charreds.length; i++) {
                if ((protecteds.length + normals.length + drys.length) < 1)
                    if (Math.random() > .95)
                        updateTree(charreds[i], "absent")
            }

            // absent -> new forest
            for (let i = 0; i < absents.length; i++) {
                if (
                    ((protecteds.length + normals.length + drys.length) < (.1 * totalTreesInForest))
                    &&
                    (absents.length >= .8 * totalTreesInForest)
                ) {
                    if (Math.random() < .67) {
                        setTimeout(function () {
                            updateTree(absents[i], "normal")
                        }, Math.random() * 5000)
                    }
                }
            }

            /** make fires & dryness spread from one tree to its neighbours */

            spreadInfection(burnings, "burning", .99, 1)
            spreadInfection(drys, "dry", .995, 1)

            /**
             * make fires & dryness spread from one tree to its neighbours
             * @param {*} trees
             * @param {string} state - the state that the trees (which are trying to spread their condition to their neighbours) are in
             * @param {number} immunity - the immunity of their neighbouring trees, so that they don't get infected easily.
             * @param {number} spreadDistance
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
                                        updateTree(neighbourSvg, "dry")
                                    }
                                    else if (
                                        state == "burning"
                                        &&
                                        neighbourSvg.classList.contains("dry")
                                    ) {
                                        // console.log(`spreading fire. tree-${id} catches fire.`)
                                        updateTree(neighbourSvg, "burning")
                                    }
                                }, refreshTime)
                            }
                        }
                    }
                }
            }
        }
    }

    /*  ------------------------------------------------------------
        if the person taps on the screen
        ------------------------------------------------------------  */

    let clickCounter = 0

    // whenever a click happens:
    document.addEventListener("click", handleClicks);

    /** @param {MouseEvent} e */
    function handleClicks(e) {
        // count the click
        clickCounter++
        // check if the click happened on a tree
        didClickHappenOnTree(e)
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

        // check if the click happened on #newsBoxContent
        let clickedOnNewsBoxContent = false;
        for (let i = 0; i < c.length; i++) {
            if (c[i].id === 'newsBoxContent' || c[i].id === 'dismissNewsBoxIcon') {
                clickedOnNewsBoxContent = true
                console.log(`clicked on #${c[i].id} | did not click on #forest`)
                break;
            }
        }

        // if we didn't click on the #newsBox, then we may continue checking whether the click happened on a tree in the #forest:
        if (clickedOnNewsBoxContent == false) {

            // in the array, we are checking which element is an "SVG Path Element" (i.e., is a <path> element).
            c = c.map(function (x) {
                if (
                    x.constructor.toString().indexOf("SVGPathElement()") > -1
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

            // now, we instruct each (clicked-)tree to change
            for (const i in c) {
                const SVGElementOfClickedTree = c[i]
                if (SVGElementOfClickedTree.classList.contains("burning")) {
                    // console.log(`click on ${SVGElementOfClickedTree.parentNode.id}: burning -> dry`)
                    updateTree(SVGElementOfClickedTree, "dry")
                }
                else if (SVGElementOfClickedTree.classList.contains("dry")) {
                    // console.log(`click on ${SVGElementOfClickedTree.parentNode.id}: dry -> normal`)
                    updateTree(SVGElementOfClickedTree, "normal")
                }
                else if (SVGElementOfClickedTree.classList.contains("normal")) {
                    // console.log(`click on ${SVGElementOfClickedTree.parentNode.id}: normal -> protected`)
                    updateTree(SVGElementOfClickedTree, "protected")
                }
                else if (SVGElementOfClickedTree.classList.contains("protected")) {
                    // console.log(`click on tree-${SVGElementOfClickedTree.parentNode.id.substring("tree-".length, SVGElementOfClickedTree.parentNode.id.length)}: classList.contains("${SVGElementOfClickedTree.classList}") • isProtected=${tree[SVGElementOfClickedTree.parentNode.id.substring("tree-".length, SVGElementOfClickedTree.parentNode.id.length)].stateSettings.protected.isProtected}`)
                    updateTree(SVGElementOfClickedTree, "protected")
                }
            }
        }
    }

    /** #newsBox should have a z-index higher than all spawned trees */
    updateStyle(document.getElementById("newsBox"), "z-index", highestZIndexOnTree + forestSettings.orderly.maxZIndexDeviation + 1)

})

/*  ------------------------------------------------------------
    sound
    ------------------------------------------------------------  */

const soundsrc = "assets/sound/"
let sCatchFire = new Audio(soundsrc + 'catchfire.mp3');
let sMakeTreeSafe = new Audio(soundsrc + 'twinkle.mp3');
let sBurning = new Audio(soundsrc + 'ambient-burning.mp3');
let sForest = new Audio(soundsrc + 'ambient-forest.mp3');
let sEagle = new Audio(soundsrc + 'eagle.mp3');

const volumeScaler = {
    sCatchFire: .03125,
    sMakeTreeSafe: .0078125,
    sBurning: 1,
    sForest: 1,
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
    sound.volume = volume
    sound.play()
    // }
}