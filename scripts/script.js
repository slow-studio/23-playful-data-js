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
 * update an element's style
 * @param {*} e - element
 * @param {string} p - parameter 
 * @param {string|number} v - value
 */
function updateStyle(e, p, v) {
    e.style.setProperty(p, v)
}

/** make fires crackle */
const fireCrackleTime = 600
setInterval(function () {
    /** @type {any} */
    let fires = document.getElementsByClassName("fire")
    for (let i = 0; i < fires.length; i++) {
        if (fires[i]) {
            fires[i].style.fill = 'var(--firedarker)'
            // console.log("fire gets darker")
            setTimeout(function () {
                if (fires[i]) {
                    fires[i].style.fill = 'var(--fire)'
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
        tree[id].shape.foliage.now = settings.shape.foliage ? settings.shape.foliage : ''
        tree[id].shape.stump.now = settings.shape.stump ? settings.shape.stump : ''
        tree[id].shape.fire.now = settings.shape.fire ? settings.shape.fire : ''
        tree[id].shape.burned.now = settings.shape.burned ? settings.shape.burned : ''
        tree[id].colour.outline.now = settings.colour.outline ? settings.colour.outline : ''
        tree[id].colour.foliage.now = settings.colour.foliage ? settings.colour.foliage : ''
        tree[id].colour.stump.now = settings.colour.stump ? settings.colour.stump : ''
        tree[id].colour.fire.now = settings.colour.fire ? settings.colour.fire : ''
        tree[id].colour.burned.now = settings.colour.burned ? settings.colour.burned : ''

        // console.log("change t# " + id)
        // console.log(tree[id])

        /* tree changes appearance: */
        // -- 1. it updates its svg shape
        svgelement.innerHTML =
            (settings.shape.foliage ? tree[id].shape.foliage.now : '')
            + (settings.shape.stump ? tree[id].shape.stump.now : '')
            + (settings.shape.fire ? tree[id].shape.fire.now : '')
            + (settings.shape.burned ? tree[id].shape.burned.now : '')
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
    box.style.bottom = "calc(10vh - 2rem)"
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
                '<path class="foliage" id="deci-1" d="M76.813,355.795c0.763,-0.113 1.335,0.175 1.734,0.867c-2.054,9.153 -6.822,16.665 -14.302,22.537c-0.555,-0.961 -0.988,-1.972 -1.301,-3.034c0.997,-5.472 1.864,-10.962 2.601,-16.469c1.751,-3.357 3.771,-3.646 6.068,-0.867c2.427,0.335 4.16,-0.675 5.2,-3.034Zm-10.672,-113.986c-0.053,-0.433 -0.107,-0.866 -0.163,-1.3c-1.811,-1.119 -2.964,-0.541 -3.467,1.734c-2.522,14.086 -4.542,28.244 -6.068,42.474c-0.39,20.367 -0.537,40.593 -0.433,60.676l-0.867,0c-2.123,-0.359 -3.276,0.507 -3.467,2.601c0.659,3.402 2.245,6.291 4.767,8.668c0.581,6.942 0.867,13.877 0.867,20.803c-7.966,-27.537 -13.314,-55.564 -16.036,-84.08c0.399,-7.908 0.399,-15.998 0,-24.271l-2.6,-0c-1.17,4.02 -1.751,8.21 -1.734,12.569c1.04,21.865 4.222,43.391 9.535,64.577c-0.269,0.701 -0.702,1.279 -1.3,1.734c-1.517,-0.977 -3.112,-1.844 -4.768,-2.601c-2.097,4.487 -4.845,8.532 -8.234,12.136c-3.398,-2.298 -4.551,-5.476 -3.468,-9.535c1.977,-1.442 3.996,-2.887 6.068,-4.334c0.581,-0.867 0.581,-1.734 0,-2.601c-3.493,-1.685 -6.094,-0.818 -7.801,2.601c-5.634,-3.233 -7.073,-7.856 -4.334,-13.869c1.326,-1.066 2.34,-2.366 3.034,-3.901c4.429,0.94 6.449,-0.938 6.067,-5.634c-2.045,-0.141 -4.065,0.002 -6.067,0.433c-0.841,1.455 -1.994,2.033 -3.468,1.734c-0.78,-3.857 -1.074,-7.612 -0.866,-11.269c-3.06,-0.043 -5.947,0.101 -8.669,0.434c-5.14,-1.385 -8.607,-4.564 -10.401,-9.535c0.754,-1.658 1.621,-3.248 2.6,-4.768c3.693,1.167 7.593,1.89 11.702,2.167c2.783,0.253 5.244,-0.469 7.368,-2.167c-0.581,-1.155 -1.448,-2.022 -2.6,-2.6c-4.04,-0.817 -8.088,-1.54 -12.136,-2.167c0.217,-7.197 3.979,-9.942 11.269,-8.235c1.499,-1.551 2.08,-3.429 1.733,-5.634c-3.614,-1.306 -7.081,-1.016 -10.401,0.867c-1.396,-0.91 -2.263,-2.21 -2.601,-3.901c0.46,-3.944 1.76,-7.556 3.901,-10.835c2.358,-0.818 4.811,-1.107 7.368,-0.867c0.312,-1.964 -0.269,-3.553 -1.734,-4.767c-2.912,-0.187 -5.799,-0.187 -8.668,-0c-7.203,-5.896 -7.489,-11.963 -0.867,-18.203c5.86,-2.943 9.032,-1.21 9.535,5.2c2.002,0.431 4.022,0.575 6.068,0.434c-0.182,-1.425 0.104,-2.725 0.867,-3.901c-1.483,-1.309 -2.922,-2.609 -4.334,-3.9c0.866,-1.445 2.019,-2.601 3.467,-3.468c3.268,1.489 6.154,1.055 8.668,-1.3c-1.647,-1.567 -2.08,-3.445 -1.3,-5.634c1.655,-2.879 2.956,-5.913 3.9,-9.102c-4.039,-1.295 -6.353,-4.04 -6.934,-8.234c1.794,-3.98 3.823,-7.881 6.068,-11.702c-3.346,-2.209 -4.647,-5.243 -3.901,-9.102c4.542,-2.496 8.729,-1.918 12.569,1.734c-1.101,1.622 -1.101,3.21 -0,4.767c2.487,1.106 4.94,1.251 7.368,0.434c1.014,-2.941 0.286,-5.252 -2.167,-6.935c2.999,-1.22 6.033,-2.376 9.101,-3.467c3.927,1.035 6.813,3.347 8.668,6.934c0.962,-1.049 1.976,-1.049 3.034,0c2.54,-3.715 3.987,-7.904 4.334,-12.568c-0.78,-2.792 -1.933,-5.392 -3.467,-7.802c0.199,-3.955 1.647,-7.277 4.334,-9.968c0.511,0.181 0.945,0.47 1.3,0.867c0.433,2.002 0.572,4.025 0.433,6.068c0.911,0.129 1.777,-0.015 2.601,-0.434c1.343,-3.7 3.805,-5.001 7.368,-3.901c1.751,3.538 2.756,7.294 3.034,11.269c-0.954,4.218 -2.401,8.263 -4.334,12.135l0.433,1.734c1.309,-0.656 2.47,-1.523 3.467,-2.6c3.32,4.033 4.473,8.656 3.467,13.869c-0.676,1.548 -1.69,2.848 -3.033,3.9c-2.566,-0.277 -5.167,-0.277 -7.802,0c-1.118,1.222 -2.123,2.523 -3.033,3.901c-0.408,4.44 0.164,8.774 1.733,13.002c0.962,1.05 1.976,1.05 3.034,-0c0.91,-2.864 1.777,-5.753 2.6,-8.668c1.249,-2.013 2.835,-2.591 4.768,-1.734c0.633,2.626 1.361,5.226 2.167,7.802c-1.361,2.427 -2.956,4.739 -4.768,6.934c-1.031,1.338 -1.317,2.783 -0.866,4.334c1.022,1.067 2.037,1.067 3.033,0c1.933,-2.069 3.667,-4.236 5.201,-6.501c1.907,-0.715 3.494,-0.282 4.768,1.3c1.603,3.461 2.618,7.073 3.034,10.835c-2.922,1.479 -4.941,3.791 -6.068,6.935c0.147,1.3 0.867,2.022 2.167,2.167c1.994,-1.267 3.866,-2.711 5.634,-4.334c1.951,0.653 3.546,1.808 4.768,3.467c-1.344,2.841 -2.358,5.874 -3.034,9.102c-0.269,2.309 0.451,4.186 2.167,5.634c4.499,-3.513 6.38,-8.136 5.634,-13.869c2.904,-0.913 5.79,-0.913 8.668,-0c4.282,13.673 0.815,24.942 -10.401,33.806c4.455,2.842 6.336,6.887 5.634,12.135c-1.5,3.656 -4.248,5.245 -8.235,4.767c-1.447,2.714 -0.581,4.015 2.601,3.901c1.716,0.055 3.163,-0.524 4.334,-1.734c0.511,0.182 0.944,0.471 1.3,0.867c1.482,3.973 1.629,8.017 0.433,12.136c-4.204,-3.492 -7.532,-2.625 -9.968,2.6c-1.56,4.499 -0.121,7.389 4.334,8.668c3.112,-1.092 5.426,-3.114 6.934,-6.068c0.841,1.538 1.561,3.127 2.167,4.768c-1.525,2.706 -2.973,5.451 -4.334,8.235c0.616,1.34 1.63,2.206 3.034,2.6c3.129,-2.019 4.724,-4.909 4.768,-8.668c2.375,-0.464 3.961,0.403 4.767,2.6c0.841,3.712 0.26,7.179 -1.733,10.402c-6.666,4.012 -6.085,6.323 1.733,6.935c1.959,3.142 1.664,6.031 -0.867,8.668c-6.561,4.785 -13.929,6.952 -22.103,6.501c-0.278,1.77 -0.416,3.648 -0.434,5.634c-10.662,6.923 -17.163,4.179 -19.503,-8.235c2.15,-2.083 2.15,-4.105 0,-6.067c1.222,-1.909 2.522,-3.787 3.901,-5.635c0.719,-2.745 -0.286,-3.756 -3.034,-3.033c-3.095,3.306 -5.981,6.774 -8.668,10.401c-1.803,-1.321 -3.832,-2.621 -6.068,-3.9c-3.086,1.202 -5.539,3.224 -7.368,6.067c-0.217,-4.977 0.356,-9.889 1.734,-14.736c3.805,-12.363 6.839,-24.932 9.101,-37.706c-0.39,-1.406 -1.257,-2.416 -2.6,-3.034c-1.404,2.41 -2.41,5.011 -3.034,7.802c-2.652,14.647 -6.12,29.094 -10.402,43.34c-0.095,-13.885 -0.242,-27.754 -0.433,-41.607c0.39,-5.804 0.962,-11.583 1.733,-17.336c-0.546,-15.768 0.616,-31.659 3.468,-47.675c-0.056,-0.433 -0.11,-0.866 -0.163,-1.3l-0.108,-0.867Zm49.679,71.512c3.415,1.746 3.415,3.624 -0,5.635c-1.118,0.424 -2.28,0.569 -3.467,0.433c-0.711,-3.276 0.442,-5.298 3.467,-6.068Z"/>',
                '<path class="foliage" id="dandy-2" d="M67.646,199.234c-0.131,-2.881 2.299,-8.326 7.133,-5.54c0.057,17.051 0.394,23.437 -0.295,40.635c-0.132,3.69 0.076,7.149 0.632,10.379c-0.821,15.571 -1.667,31.139 -2.526,46.704c-0.171,10.794 -0.171,21.515 -0,32.174c-1.061,10.742 -1.27,21.121 -0.632,31.137c-0.246,3.902 -0.669,7.711 -1.263,11.416c0.461,4.359 0.669,9.03 0.632,14.012c-1.826,1.058 -3.619,1.058 -5.369,-0c-1.749,3.03 -2.697,2.335 -2.842,-2.076c0.714,-14.769 1.554,-29.476 2.526,-44.11c-0.391,-1.453 -0.6,-3.01 -0.631,-4.67c1.541,-39.005 2.804,-78.098 3.789,-117.28c-1.124,-7.41 -0.801,-4.969 -1.154,-12.781Zm-4.467,-99.016c3.21,-0.488 6.04,0.179 8.5,2c1.22,7.255 1.89,14.589 2,22c1.25,-2.829 2.75,-5.495 4.5,-8c1.57,-0.809 3.24,-1.143 5,-1c0.09,6.752 -0.08,13.419 -0.5,20c4.54,-9.901 10.71,-18.734 18.5,-26.5c2.18,-1.202 4.51,-1.702 7,-1.5c1.01,5.296 1.18,10.629 0.5,16c-2.07,5.695 -4.23,11.361 -6.5,17c1.9,0.731 3.9,0.731 6,0c0.6,4.016 -0.4,7.516 -3,10.5c2.78,-0.374 5.44,-1.374 8,-3c5.17,-1.5 7,0.333 5.5,5.5c-3.58,3.901 -2.75,4.901 2.5,3c1.41,0.368 2.41,1.201 3,2.5c-4.85,4.258 -10.19,7.758 -16,10.5c3.66,1.493 6.99,3.493 10,6c1.33,2.333 1.33,4.667 0,7c-0.95,0.487 -1.95,0.82 -3,1c-3.95,-1.226 -7.95,-1.726 -12,-1.5c2.89,3.396 6.23,6.229 10,8.5c3.22,4.953 1.89,6.787 -4,5.5c-6.95,-3.721 -13.78,-7.554 -20.5,-11.5c1.45,5.605 2.95,11.272 4.5,17c-1.32,-0.17 -2.49,0.163 -3.5,1c-5.58,-3.24 -10.58,-7.24 -15,-12c-5.691,2.277 -7.449,5.032 -7.679,0.782c1.13,-14.23 -5.761,12.745 -6.321,5.218c-4.7,6.53 -9.2,13.197 -13.5,20c-0.77,1.211 -1.61,1.211 -2.5,0c-0.44,-3.711 -0.11,-7.378 1,-11c1.81,-4.256 3.31,-8.589 4.5,-13c-1.43,-0.079 -2.76,0.254 -4,1c-1.45,-0.671 -2.11,-1.838 -2,-3.5c0.99,-3.822 2.66,-7.322 5,-10.5c-3.77,0.147 -7.61,0.147 -11.5,0c-0.67,-1.333 -0.67,-2.667 0,-4c1.77,-0.804 3.27,-1.971 4.5,-3.5c-4.59,-0.017 -9.09,-0.183 -13.5,-0.5c-0.67,-1.333 -0.67,-2.667 0,-4c2.03,-2.237 4.53,-3.737 7.5,-4.5c-6.91,-0.186 -13.75,-0.686 -20.5,-1.5c-2.52,0.993 -4.36,0.16 -5.5,-2.5c0.32,-1.653 1.32,-2.653 3,-3c8.64,-1.83 17.31,-3.496 26,-5c-4.13,-3.452 -3.46,-5.785 2,-7c-5.63,-1.79 -8.29,-5.623 -8,-11.5c5.66,-1.655 11.16,-1.322 16.5,1c-0.98,-4.538 -1.48,-9.205 -1.5,-14c3.02,0.204 6.02,0.537 9,1c-0.28,-7.426 1.72,-14.093 6,-20Z" />',
                '<path class="foliage" d="M56.733,77.376c3.852,2.057 6.018,5.39 6.5,10c3.262,21.844 5.595,43.511 7,65c0.742,-3.157 2.242,-5.823 4.5,-8c3.418,2.384 5.251,5.718 5.5,10c0.847,6.302 1.681,12.468 2.5,18.5c-0.745,13.675 -1.245,27.508 -1.5,41.5c1.993,-3.965 3.993,-7.965 6,-12c1.684,-1.851 3.517,-3.518 5.5,-5c1.884,0.615 2.884,1.948 3,4c-0.195,9.355 -0.362,18.689 -0.5,28c4.779,-4.784 10.112,-8.784 16,-12c0.945,0.405 1.612,1.072 2,2c0.293,12.247 -1.374,24.247 -5,36c-5.908,14.386 -10.575,29.053 -14,44c3.186,-3.84 7.019,-5.84 11.5,-6c3.696,6.225 4.529,12.558 2.5,19c-3.94,6.936 -8.273,13.603 -13,20c-7.022,6.024 -13.689,12.357 -20,19c-0.811,6.914 -0.645,13.748 0.5,20.5c-2.238,6.593 -5.404,7.426 -9.5,2.5c-0.5,-7.659 -0.666,-15.326 -0.5,-23c-5.094,-1.476 -10.094,-3.143 -15,-5c-5.011,-6.693 -9.511,-13.693 -13.5,-21c-7,-9 -14,-18 -21,-27c-2.754,-5.671 -4.587,-11.671 -5.5,-18c0.763,-3.274 2.763,-4.774 6,-4.5c4.715,5.923 8.549,12.423 11.5,19.5c-0.795,-9.394 -2.295,-18.727 -4.5,-28c1.4,-4.713 3.4,-5.046 6,-1c0.333,-0.333 0.667,-0.667 1,-1c-6.15,-20.216 -8.983,-40.883 -8.5,-62c0.667,-3.333 1.333,-6.667 2,-10c1,-1 2,-2 3,-3c4.915,5.83 8.248,12.496 10,20c1.333,2 2.667,4 4,6c-0.676,-26.321 -1.009,-52.655 -1,-79c0.739,-3.562 2.239,-6.728 4.5,-9.5c2.564,-0.45 4.064,0.716 4.5,3.5c0.661,-13.781 2.161,-27.447 4.5,-41c-0.423,-4.535 0.577,-8.868 3,-13Z"/>'
            ],
            stump: '',
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
            positionally: false,
            maxZIndexDeviation: 2,
            shape: true
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
                    previous: svgtree.src.foliage[0],
                    now: svgtree.src.foliage[0]
                },
                stump: {
                    default: svgtree.src.stump,
                    previous: svgtree.src.stump,
                    now: svgtree.src.stump
                },
                fire: {
                    default: '',
                    previous: '',
                    now: ''
                },
                burned: {
                    default: svgtree.src.burned,
                    previous: svgtree.src.burned,
                    now: svgtree.src.burned
                },
            },
            colour: {
                outline: {
                    default: 'black',
                    previous: '',
                    now: 'black'
                },
                foliage: {
                    default: 'white',
                    previous: '',
                    now: 'var(--green)'
                },
                stump: {
                    default: 'white',
                    previous: '',
                    now: 'var(--wood)'
                },
                fire: {
                    default: 'white',
                    previous: '',
                    now: 'var(--fire)'
                },
                burned: {
                    default: 'black',
                    previous: '',
                    now: 'black'
                }
            },
            dimensions: {
                l: forest.offsetLeft + forestSettings.padding.l + (treeIDinRow * forestSettings.spacing.h) + (rowID % 2 === 0 ? (forestSettings.spacing.h / 4) : (-forestSettings.spacing.h / 4)),
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
                        // stump: 'var(--wood)'
                    }
                },
                protected: {
                    isProtected: false,
                    shape: {
                        foliage: svgtree.src.foliage[0],
                        stump: svgtree.src.stump,
                        fire: false,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: 'var(--protected)',
                        stump: 'var(--wood)'
                    }
                },
                normal: {
                    shape: {
                        foliage: svgtree.src.foliage[0],
                        stump: svgtree.src.stump,
                        fire: false,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: `hsl(163, 100%, ${approx(28,20)}%)`,
                        stump: 'var(--wood)'
                    }
                },
                dry: {
                    shape: {
                        foliage: svgtree.src.foliage[1],
                        stump: svgtree.src.stump,
                        fire: false,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: `hsl(154, 100%, ${approx(25,20)}%)`,
                        stump: 'var(--wood)'
                    }
                },
                burning: {
                    shape: {
                        foliage: svgtree.src.foliage[0],
                        stump: svgtree.src.stump,
                        fire: svgtree.src.fire,
                        burned: false
                    },
                    colour: {
                        outline: 'black',
                        foliage: 'var(--autumn)',
                        stump: 'var(--wood)',
                        fire: 'var(--fire)'
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
        updateTree(svgelement, Math.random()<.02?"charred":Math.random()<.03?"absent":Math.random()<.5?"dry":"normal")

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
            // for (let i = 0; i < drys.length; i++) {
            //     if (Math.random() > .9995)
            //         updateTree(drys[i], "burning")
            // }

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

            // spreadInfection(burnings, "burning", .99, 1)
            // spreadInfection(drys, "dry", .995, 1)

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