import { cheatcodes, playPauseButton } from "./cheatcodes.js";
import { infoBox, infoBoxTransitionDuration, setInfo, showBox, boxDisplayAttrIs } from "./infoBox.js";
import { gainNode } from "./sound.js";
import { svgtree } from "./svgtree.js";

/*  ------------------------------------------------------------
    varialbles
    ------------------------------------------------------------  */

/**
 * helpful links:
 *  - to check browser support tables on mobile web browsers, go to: https://caniuse.com/.
 *  - to change cursor's appearance, by using an SVG:
 *      - info: https://stackoverflow.com/a/45966695
 *      - helper tool: https://yoksel.github.io/url-encoder/ or https://svgwiz.com/
 */

// parent element for all tree in the forest
export const divForest = document.getElementById("forest")
// status bars
export const divBarPlanted = document.getElementById('barPlanted')
export const divBarTime = document.getElementById('barTime')
export const divBarClicks = document.getElementById('barClicks')

const REFRESH_RATE = 10 // fps
const REFRESH_TIME = 1000 / REFRESH_RATE // time in millisecond
let FRAMECOUNT = 0

/** time (in millisecond) after which the conclusion wants to show up */
const PLAYTIMELIMIT = 60000 // e.g. 90000ms = 90s = 1½ min

/** @type {{upper: number; lower: number}} clicks (on sick trees) after which the conclusion wants to show up */
const CLICKLIMIT = { upper: 120, lower: 10 }

/** duration for which a protected tree stays protected */
const PROTECTIONDURATION = 7500 // time in millisecond
/** steps a tree takes to dry out */
const STEPSTODRYOUT = 20

/** a heap of mud/ash takes ✕ times longer to begin growing into a tree */
const ABSENT_TIME_MULTIPLIER = 10
/** a fully-grown tree resists drying for these many ✕ times longer */
const NORMAL_TIME_MULTIPLIER = 25
/** a dry tree resists catching fire for these many ✕ times longer */
const DRY_TIME_MULTIPLIER = 12.5
/** make fires burn for these many ✕ times longer */
const FIRE_BURN_TIME_MULTIPLIER = 2.0
/** a tree remains charred for these many ✕ times longer */
const CHARRED_TIME_MULTIPLIER = 25

/**
 * game state variables
 */
export const gameState = {
    pauseForestUpdate: false,
    print: false, // should this gameState object be printed to the console?
    userHasBeenActive: false,
    lastUpdatedAt: 0, // time (in milliseconds) when updateForest was last run
    startTime: Date.now(), // milliseconds
    playTime: 0, // milliseconds
    starthealth: 1,
    health: 1,
    clicks: {
        total: 0,
        ontrees: 0,
        onsicktrees: 0,
        ondrytrees: 0,
        onburningtrees: 0,
        onabsenttrees: 0,
    },
    shownInfoBox: {
        _1: false,
        _2: false,
        _8: false,
        _0: false,
    },
    statusBars: {
        update: false, // should statusBars update?
    },
}
// console.log(JSON.stringify(gameState, null, 2))

/** once the person plants this much of the forest, the challenge (to protect it) will begin. */
const READINESS_THRESHOLD = 0.33

/** @type {number} maximum number of trees to draw. (we can keep this number arbitarily large.) */
const TREELIMIT = 2500;

/* variables used while spawning each tree into the forest */
let rowID = 0
let treeIDinRow = 0
let maxTreeIDinRow = treeIDinRow
let loopRunner = true

/** @type {number} counts total number of trees (by incrementing its value each time a tree is spawned) */
export var totalTreesInForest = 0

/** an array. stores one object (each) for every tree. the object contains all info/settings for that tree. */
export const tree = []


/*  ------------------------------------------------------------
	1. spawn trees into the forest
	2. kick-start updateForest
	3. addEventListener to handleClicks
	------------------------------------------------------------  */

window.onload = () => {

	// don't show #content at the start : show the #playarea (and #forest) only.
	showcontent(false)

	// sets #infoBox's transition-duration 
	updateStyle(infoBox,"transition-duration",infoBoxTransitionDuration+'ms')

	/** updates :root definitions in the stylesheet */
	updateStyle(/* :root */ document.documentElement, /* variable */ '--treewidth', svgtree.dim.width + 'px')

	/*  ------------------------------------------------------------
		spawn trees into the forest 
		------------------------------------------------------------  */

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
	const maxWidthOfForest = divForest.offsetWidth - (forestSettings.padding.l + forestSettings.padding.r)
	let widthOfTreesInRow = /* starting value */ svgtree.dim.width
	while(widthOfTreesInRow + svgtree.dim.width <= maxWidthOfForest ) {
		widthOfTreesInRow += forestSettings.spacing.h
	}
	forestSettings.padding.l += (maxWidthOfForest-widthOfTreesInRow)/2
	forestSettings.padding.r += (maxWidthOfForest-widthOfTreesInRow)/2

	/** @type {number} keeps track of the highest z-index assigned to any tree */
	var highestZIndexOnTree = 0

	/*  spawn all trees. */

	for (let i = 0; loopRunner; i++) {
		// sanity check
		if (i >= TREELIMIT /*an arbitarily large number*/) { /* bug out, because otherwise this for-loop will hang stuff */ break }
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
				l: divForest.offsetLeft + forestSettings.padding.l + (treeIDinRow * forestSettings.spacing.h) + (rowID % 2 === 0 ? (forestSettings.spacing.h / 4) : (-forestSettings.spacing.h / 4)) + (forestSettings.orderly.positionally ? 0 : ((Math.random() < .5 ? -1 : 1) * Math.random()*svgtree.dim.width/4)),
				t: divForest.offsetTop + forestSettings.padding.t + forestSettings.spacing.v * rowID,
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
				default:    /* [state, substate] */ [0,0],
				previous:   /* [state, substate] */ [0,0],
				now:        /* [state, substate] */ [0,0],
				/* state-specific parameters */
				drySubstateCounter: 1, // when a tree is drying out, this helps us keep track of how dry it is. (it helps us assign a suitable colour to the tree.)
				totalProtectionTime: approx(PROTECTIONDURATION, 20), 
				protectionTime: 0, // how much time has this tree been protected for
			},
			properties: {
				resilience: /*  must be an integer (i.e., min value = 1). the value here is a placeholder. actual value set by updateTree(). */ 1, 
				colour: {
					foliageProtected: 	randomiseCustomHSLColourProperty( "--protected"	, 	5, 15, forestSettings.orderly.colour ),
					foliageNormal: 		randomiseCustomHSLColourProperty( "--green"		,	3, 15, forestSettings.orderly.colour ),
					foliageDry: 		randomiseCustomHSLColourProperty( "--autumn"		,	3, 20, forestSettings.orderly.colour ),
					stump: 				randomiseCustomHSLColourProperty( "--wood"		,	0,  5, forestSettings.orderly.colour ),
				}
			},
			behaviour: 0, // -1: move backward | 0: stay as-is | 1: move forward (in the tree's life-cycle)
			isProtected: false,
		}
		// set id and class
		newDiv.setAttribute('class', tree[i].class)
		newDiv.setAttribute('id', tree[i].id)

		// add the placeholder svg-element into newDiv
		newDiv.innerHTML = svgtree.src.starttag + svgtree.src.innerhtml[tree[i].state.now[0]][tree[i].state.now[1]] + svgtree.src.endtag
		// then, grab the svg-element...
		const svgelement = newDiv.getElementsByTagName("svg")[0] // ∵ the first (and only) child is an <svg>
		svgelement.setAttribute('tree-id',`${i}`)
		svgelement.setAttribute('data-pos', `${tree[i].positionInForestGrid.x},${tree[i].positionInForestGrid.y}`)
		// ... and, finally, draw the tree (within the svg-element):
		updateTree(svgelement)

		// newDiv should be as large as the tree-image
		newDiv.style.width = tree[i].dimensions.w + 'px'
		// position the tree (so that it sits at the correct location within a desired pattern in the forest)
		newDiv.style.left = tree[i].dimensions.l + 'px'
		newDiv.style.top = tree[i].dimensions.t + 'px'
		tree[i].dimensions.heart = { x: tree[i].dimensions.l + tree[i].dimensions.w / 2, y: tree[i].dimensions.t + tree[i].dimensions.h / 2 }
		// draw trees on the next line if you exceed #forest's right-most bounds
		if (divForest.offsetWidth - (forestSettings.padding.l + forestSettings.padding.r) < (treeIDinRow + 1) * forestSettings.spacing.h + tree[i].dimensions.w) {
			rowID++
			treeIDinRow = 0
		} else {
			treeIDinRow++
			// update counter that counts the max number of trees on the longest row
			maxTreeIDinRow = treeIDinRow >= maxTreeIDinRow ? treeIDinRow : maxTreeIDinRow
		}
		// stop drawing trees if you exceed #forest's bottom-most bounds
		if (divForest.offsetHeight - (forestSettings.padding.t + forestSettings.padding.b) < rowID * forestSettings.spacing.v + tree[i].dimensions.h)
			loopRunner = false
		// set z-index, so that lower-placed trees seem to be in front
		newDiv.style.zIndex = (tree[i].zindex).toString()
		// keep track of the highest z-index assigned to any tree
		if (i > 0) if (tree[i].zindex > tree[i - 1].zindex) highestZIndexOnTree = tree[i].zindex
		// finally, make the div a child of #forest
		divForest.appendChild(newDiv)
		// update the value for total number of trees spawned in the forest
		totalTreesInForest += 1
	}

	console.log(totalTreesInForest + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow + 1) + " or fewer trees per row.")

	/** #infoBox should have a z-index higher than all spawned trees */
	updateStyle(infoBox.parentElement, "z-index", (highestZIndexOnTree + forestSettings.orderly.maxZIndexDeviation + 1).toString())

	updateForest()

	document.body.addEventListener('keydown', function(event) {cheatcodes(event)})
	document.addEventListener("click", handleClicks)
	
}


/*  ------------------------------------------------------------
	helpers
	------------------------------------------------------------  */

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


export function startExperience() {
    gameState.startTime = Date.now()
    gameState.playTime = Date.now() - gameState.startTime
    gameState.starthealth = document.getElementsByClassName("normal").length / totalTreesInForest
    gameState.health = gameState.starthealth
    gameState.clicks.ontrees = 0
    gameState.clicks.onsicktrees = 0
    gameState.clicks.ondrytrees = 0
    gameState.clicks.onburningtrees = 0
    gameState.clicks.onabsenttrees = 0
    // gameState.print = true // will print gameState.playTime at the next time that updateForest() runs
}

/**
 * show or hide #content div. (it appears below the #forest div, and has the project writeup in it.)
 * @param {boolean} show 
 */
export function showcontent(show) {
    const contentdiv = document.getElementById('content')
    updateStyle(contentdiv, 'border-top', show ? '.5rem solid black' : 'none')
    updateStyle(contentdiv, 'height', show ? 'fit-content' : '0')
    updateStyle(contentdiv, 'padding', show ? '1rem' : '0')
    updateStyle(contentdiv, 'overflow', show ? 'visible' : 'hidden')
    window.scroll({
        top: show ? window.innerHeight * 4 / 5 : 0,
        left: 0,
        behavior: "smooth",
    })
}

/**
 * randomly convert some "normal" trees to their "dry" state
 * @param {number} [n=1] - number of trees to seed
 */
export function seedDryTrees(n) {

    console.log(`seedDryTrees(${n}) was called`)

    /* if there's at-least 1 "normal" tree in the forest... */
    let allnormaltrees = document.getElementsByClassName("normal") // HTMLCollection
    // console.log(`seedDryTrees: before seeding dry trees, healthyTrees = ${normalTrees}`)
    if (allnormaltrees.length == 0) {
        console.log(`seedDryTrees: no normal trees available.`)
    } else /* if (allnormaltrees.length > 0) */ 
    {
        // collect all healthy trees (svg elements)
        let seedableTrees = []
        // console.log(`seedDryTrees: found ${allnormaltrees.length} "normal" trees.`)
        let arrayofallnormaltrees = Array.from(allnormaltrees) // convert HTMLCollection to Array
        seedableTrees.push(...Array.from(arrayofallnormaltrees))
        // remove "protected" trees from this array
        for (let i = 0; i < seedableTrees.length; i++) {
            if(seedableTrees[i].classList.contains("protected")) {
                // remove this tree from the array 
                seedableTrees.splice(i,1)
                // console.log(`seedDryTrees: removed 1 protected tree.`)
            }
        }
        // console.log(`${allnormaltrees.length} normal (but unprotected) trees available to seed dryness.`)
        if (seedableTrees.length == 0) {
            console.log(`seedDryTrees: no normal ( + unprotected ) trees available.`)
        } else {
        
            // keep n within sensible bounds
            if (n >= allnormaltrees.length) n = Math.floor(Math.random() * allnormaltrees.length)
            if (n <= 1) n = 1
            console.log(`seedDryTrees: trying to seed ${n} dry tree${n!=1?'s':''}...`)
    
            // fraction of trees to turn from normal to dry
            let fr = n / allnormaltrees.length
            // a counter which will track how many trees we do make dry
            let conversioncounter = 0

            // for each healthy tree, decide whether it turns dry
            for(let i=0 ; i<seedableTrees.length ; i++) {
                if(conversioncounter<n) {
                    if(Math.random()<fr) {
                        const treeid = seedableTrees[i].getAttribute('tree-id')
                        const treestate = tree[treeid].state.now
                        // if the tree is fully grown AND not protected
                        if (
                            treestate[1] >= (svgtree.src.innerhtml[treestate[0]]).length - 1
                            // the second check (below) is unnecessary (because we've already removed all protected trees from the seedableTrees array), but, just double-checking anyway:
                            && tree[treeid].isProtected == false
                        ) {
                            // it turns dry
                            tree[treeid].behaviour = 1
                            conversioncounter++
                        }
                    }
                }
                else break
            }
            console.log(`seedDryTrees: seeded ${conversioncounter} dry tree${n!=1?'s':''}.`)
        }
    }
}

/**
 * fire, dryness, health, etc can spread from one tree to its neighbours
 * @param {*} trees - a collection of trees-svg's
 * @param {number} state - the state that the trees (which are trying to spread their condition to their neighbours) are in
 * @param {number} immunity - the immunity of their neighbouring trees, so that they don't get infected easily.
 * @param {number} [spreadDistance=1]
 * @param {boolean} [spreadUniformly=true]
 */
export function spreadInfection(trees, state, immunity, spreadDistance, spreadUniformly) {
    for (let i = 0; i < trees.length; i++) {
        const id = Number(trees[i].getAttribute('tree-id'))
        const _x = tree[id].positionInForestGrid.x
        const _y = tree[id].positionInForestGrid.y
        if (Math.random() > (spreadUniformly ? immunity : 0)) {
            for(let j=_x-spreadDistance ; j<=_x+spreadDistance ; j++) {
                for(let k=_y-spreadDistance ; k<=_y+spreadDistance ; k++) {
                    const neighbourSvg = document.querySelector(`[data-pos="${j},${k}"]`)
                    if (
                        true
                        && neighbourSvg
                        // and we're not selecting the tree itself
                        && (j == _x && k == _y) == false
                        // and we"re within bounds
                        && j >= 0
                        && j <= maxTreeIDinRow
                        && k >= 0
                        && k <= rowID
                        // and to handle the staggered arangement of trees
                        && (_y%2==0 ? j>=_x : j<=_x)
                    ) {
                        const n_id = neighbourSvg.getAttribute('tree-id')
                        const probablyhappens = Math.random() > (spreadUniformly ? 0 : immunity)
                        switch(state) {
                            case 1: // tree is normal, and so is trying to spread its normal'ness to neighbours
                                if (neighbourSvg.classList.contains("absent") && probablyhappens) {
                                    // console.log(`spreading health. tree-${n_id} is seeded.`)
                                    tree[n_id].behaviour = 1
                                }
                                // if (neighbourSvg.classList.contains("dry") && probablyhappens) {
                                //     // console.log(`spreading health. dry tree-${n_id} becomes healthy again.`)
                                //     tree[n_id].behaviour = -1
                                // }
                                break
                            case 2: // tree is dry, and so is trying to dry-out its neighbours
                                if (
                                    neighbourSvg.classList.contains("charred")
                                    ||
                                    neighbourSvg.classList.contains("absent")
                                    ||
                                    neighbourSvg.classList.contains("protected")
                                ) {
                                    // can't do anything
                                } 
                                else if (neighbourSvg.classList.contains("normal") && probablyhappens) {
                                    // console.log(`spreading dryness. making tree-${n_id} dry.`)
                                    tree[n_id].behaviour = 1
                                }
                                break
                            case 3: // tree is on fire, and is affecting neighbouring trees
                                if (
                                    neighbourSvg.classList.contains("charred")
                                    ||
                                    neighbourSvg.classList.contains("absent")
                                    ||
                                    neighbourSvg.classList.contains("protected")
                                ) {
                                    // can't do anything
                                }
                                else {
                                    /* logic: when a tree is on fire, its neighbours all dry out (probability = 1). if they are already dry, they may (i.e., probability < 1) start burning themselves. */
                                    if (neighbourSvg.classList.contains("normal")) {
                                        // console.log(`spreading fire. making tree-${n_id} dry.`)
                                        tree[n_id].behaviour = 1
                                    }
                                    if (neighbourSvg.classList.contains("dry") && probablyhappens) {
                                        // console.log(`spreading fire. tree-${n_id} catches fire.`)
                                        tree[n_id].behaviour = 1
                                    }
                                }
                                break
                        }
                    }
                }
            }
        }
    }
}

/**
 * @param {*} svgelement 
 */
export function updateTree(svgelement) {

    // helper variables
    const id = Number(svgelement.getAttribute('tree-id'))
    const foliages = svgelement.getElementsByClassName('foliage')
    const stumps = svgelement.getElementsByClassName('stump')
    const fires = svgelement.getElementsByClassName('fire')
    const stepstodryout = STEPSTODRYOUT *  tree[id].properties.resilience

    /* tree memorises its previous state */
    tree[id].state.previous[0] = tree[id].state.now[0]
    tree[id].state.previous[1] = tree[id].state.now[1]

    /*  handle protection */
    // 1. if the tree just got protected:
    if (
        // tree has been marked as to-be-protected
        (tree[id].isProtected == true)
        && 
        // but it is not currently "protected"
        svgelement.classList.contains("protected") == false
    )
    {
        // console.log(`protecting tree-${id}`)
        // can playSound here
        svgelement.classList.add("protected")
        // it remains protected for 'protectionDuration' time only
        setTimeout(function() {
            // console.log(`un-protecting tree-${id}`)
            if(tree[id].isProtected == true) {
                tree[id].isProtected = false
                svgelement.classList.remove("protected")
                tree[id].state.protectionTime = 0
            }
        }, tree[id].state.totalProtectionTime)
    }
    // 2. if the tree is about to lose its protection:
    if (
        // tree has been marked as not-to-be-protected
        (tree[id].isProtected == false) 
        && 
        // but it is currently in a "protected" state
        svgelement.classList.contains("protected")
    ) 
    {
        svgelement.classList.remove("protected")
    }
    // 3. if the tree is within the protected state:
    if (
        // tree has been marked as to-be-protected
        (tree[id].isProtected == true)
        && 
        // and it is currently "protected"
        svgelement.classList.contains("protected") == true
    ) {
        // console.log(`the tree is within the protected state. protectionTime ${tree[id].state.protectionTime} out of ${tree[id].state.totalProtectionTime}`)
        tree[id].state.protectionTime += REFRESH_TIME
        if (tree[id].state.protectionTime <= 0) 
            tree[id].state.protectionTime = 0
        if (tree[id].state.protectionTime >= tree[id].state.totalProtectionTime) 
            tree[id].state.protectionTime = tree[id].state.totalProtectionTime
    }


    /* tree calculates what its new appearance will be */

    // 0. protected trees don't change their state
    if (svgelement.classList.contains("protected") || tree[id].isProtected == true) 
        tree[id].behaviour = 0
    
    // 1. cycle within a state:
    switch(tree[id].state.now[0]) {
        case 0:
            // the next tree that will grow there will have these properties:
            tree[id].properties.resilience = 1 //+ Math.floor(3 * Math.random())
            // the next statement seems unnecessary, but i've written it, just, to be double-sure.
            tree[id].state.now[1] = 0
            break
        case 1:
            /* state-specific stuff */
                // the tree should grow, till it reaches full size.
                if (tree[id].state.now[1] < svgtree.src.innerhtml[1].length - 1) 
                {
                    if (FRAMECOUNT % tree[id].properties.resilience == 0 && Math.random() > .15)
                    tree[id].state.now[1]++
                    // and, at this time, don't let the tree progress to another state
                    tree[id].behaviour = 0
                }
                // once it is at full size, the tree should stop growing
                else // if (tree[id].state.now[1] == svgtree.src.innerhtml[1].length - 1) 
                    tree[id].state.now[1] = svgtree.src.innerhtml[1].length - 1
            /* other stuff */
                // if the tree were to start drying, this variable helps the tree start at its least dry state
                tree[id].state.drySubstateCounter = 0
            break
        case 2:
            // calculate how dry the tree is, i.e., its dryness-substate
            tree[id].state.drySubstateCounter++
            // keep drySubstateCounter within bounds
            if (tree[id].state.drySubstateCounter <= 0) tree[id].state.drySubstateCounter = 0
            if (tree[id].state.drySubstateCounter >= stepstodryout) tree[id].state.drySubstateCounter = stepstodryout
            break
        case 3:
            /* state-specific stuff */
                // keep cycling through all fire levels:
                if (tree[id].state.now[1] < svgtree.src.innerhtml[3].length - 1) 
                    tree[id].state.now[1]++
                else // if (tree[id].state.now[1] == svgtree.src.innerhtml[3].length - 1) 
                    tree[id].state.now[1] = 0
            /* other stuff */
                // if/when the tree stops burning, this variable sets it to its dryest state
                tree[id].state.drySubstateCounter = stepstodryout
            break
        case 4:
            break
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
            break
    }
    
    // 2. update state based on set-behaviour
    if (tree[id].behaviour != 0) {
        tree[id].state.now[0] += tree[id].behaviour
        // console.log(`updated tree-${id}'s state to ${tree[id].state.now[0]}.`)
        if(tree[id].state.now[0] < 0 || tree[id].state.now[0] > svgtree.src.innerhtml.length - 1)
            tree[id].state.now[0] = 0
        switch(tree[id].behaviour) {
            case 1:
                tree[id].state.now[1] = 0
                break
            case -1:
                tree[id].state.now[1] = (svgtree.src.innerhtml[tree[id].state.now[0]]).length -1
                break
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
                && Math.random() > 1 / (ABSENT_TIME_MULTIPLIER * tree[id].properties.resilience)
            )
            ||
            (
                // if it is a normal tree
                tree[id].state.now[0] == 1
                // and is also a resilient tree (i.e., likely to take some time to dry-out)
                && Math.random() > 1 / (NORMAL_TIME_MULTIPLIER * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is dry
                tree[id].state.now[0] == 2
                // and is also a resilient tree (i.e., likely to resist catching fire)
                && Math.random() > 1 / (DRY_TIME_MULTIPLIER * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is burning
                tree[id].state.now[0] == 3
                // and, if it is a resilient tree (e.g., would burn for a longer time before getting charred)
                && Math.random() > 1 / (FIRE_BURN_TIME_MULTIPLIER * tree[id].properties.resilience)
            )
            ||
            (
                // if the tree is charred
                tree[id].state.now[0] == 4
                // and is also a resilient tree (i.e., likely to take some time to disintegrate)
                && Math.random() > 1 / (CHARRED_TIME_MULTIPLIER * tree[id].properties.resilience)
            )
        ) { 
            // then, do nothing (i.e., let it stay in its current state)
        } 
        else {
            // move it to the next state
            tree[id].behaviour = 1
            // console.log(`(auto-cycle) tree[id].behaviour: ${tree[id].behaviour}`)
        }
    }

    /* update the class attached to the tree's svg-element  */
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
            break
        case 1:
            classs.push("normal")
            break
        case 2:
            classs.push("dry")
            break
        case 3:
            classs.push("burning")
            break
        case 4:
            classs.push("charred")
            break
        case 5:
            classs.push("charred")
            break
    }
    if (tree[id].isProtected == true)
        classs.push("protected")
    if(classs.length>0) // this condition should always evaluate to true, but it's good to still check
        svgelement.classList.add(...classs)
    else console.log(`warning!: tree-${id} did not get assigned a state-class. please check source-code.`)

    /* tree changes appearance: */
    // -- 1. it updates its svg shape
    if(tree[id].state.now[0]!=tree[id].state.previous[0] || tree[id].state.now[1]!=tree[id].state.previous[1])
        svgelement.innerHTML = svgtree.src.innerhtml[tree[id].state.now[0]][tree[id].state.now[1]]
    // -- 2. it sets the colour for those svg-shapes
    for (const p of foliages) {
        if (tree[id].isProtected) {
            p.style.fill = interpolateHSLColour(
                tree[id].properties.colour.foliageProtected, 
                tree[id].properties.colour.foliageNormal, 
                tree[id].state.totalProtectionTime, 
                tree[id].state.protectionTime, 
                1, 1, 1
            )
        }
        else if (tree[id].state.now[0] == 2) {
            p.style.fill = interpolateHSLColour(
                tree[id].properties.colour.foliageNormal, // start colour. e.g. "hsl(41, 65%, 39%)"
                tree[id].properties.colour.foliageDry, // end colour.
                stepstodryout,
                tree[id].state.drySubstateCounter,
                1/8, 1/2, 2
            )
        }
        else if (tree[id].state.now[0] > 2) {
            p.style.fill = tree[id].properties.colour.foliageDry
        }
        else /* tree is normal */ p.style.fill = tree[id].properties.colour.foliageNormal
    }
    for (const p of stumps) { p.style.fill = tree[id].properties.colour.stump }
    // -- 3. sound feedback:
    //      -- tree catches fire (i.e., was not burning before, but is now)
    if (tree[id].state.previous[0] != 3 && tree[id].state.now[0] == 3) { 
        // can playSound here
    }

    /*  state-specific behaviour:
        if the tree is on fire, make the fire crackle (visually)
        */
    const fireCrackleTime = 600
    for (let i = 0; i < fires.length; i++) {
        if((new Date()).getMilliseconds()%2==(id%2))
            // fire gets darker
            fires[i].style.fill = randomiseCustomHSLColourProperty('--firedarker', 0, 5)
        else // fire gets less dark
            fires[i].style.fill = randomiseCustomHSLColourProperty('--fire', 0, 5)
    }
}

// count the number of trees in any particular state
/** @param {string} state */
export function percentageOfTrees(state) {
    let trees = document.getElementsByClassName(state)
    return Number(trees.length / totalTreesInForest)
}

/** calls itself at the end of each animation frame */
export function updateForest() {

    if(Date.now() - gameState.lastUpdatedAt < REFRESH_TIME) {
        // do nothing
    } else {

        if (gameState.pauseForestUpdate) {
            // do nothing
        } else {

            FRAMECOUNT++

            /* print gameState */
            if(gameState.print == true) { 
                console.log(JSON.stringify(gameState, null, 2))
                gameState.print = false
            }

            /* update sound */

            // update volume of ambient sounds:

            if (gameState.userHasBeenActive) {

                // update volumes:
				gainNode[0].gain.value = percentageOfTrees("normal");
				gainNode[1].gain.value = (percentageOfTrees("burning") * 2) + (percentageOfTrees("dry") * 1 / 3);
            
                if(!gameState.pauseForestUpdate) {
                    // randomly play a random-sound from the forest:
                    const secondses = approx(30,75) // time (in seconds) after which the random sound ought to play
                    if (Math.random() < 1 / secondses) {
                        // can playSound here
                    } 
                }
            }

            /* update visuals */

            // collect all trees by the states they are in
            let alltrees = document.getElementsByClassName("tree")
            let absents = document.getElementsByClassName("absent")
            let protecteds = document.getElementsByClassName("protected")
            let normals = document.getElementsByClassName("normal")
            let drys = document.getElementsByClassName("dry")
            let burnings = document.getElementsByClassName("burning")
            let charreds = document.getElementsByClassName("charred")
            
            const countpresenttrees = normals.length + drys.length + burnings.length + charreds.length
            const countalivetrees = normals.length + drys.length + burnings.length
            
            /** 
             * update each tree
             */
            for(let i=0 ; i<alltrees.length ; i++) {
                updateTree(alltrees[i].getElementsByTagName("svg")[0])
            }

            // update gameState object
            gameState.health = normals.length / totalTreesInForest
            gameState.playTime = Date.now() - gameState.startTime

            // update status bars
			const statusPlanted = (normals.length + drys.length) / (READINESS_THRESHOLD * totalTreesInForest)
			const statusTime = gameState.playTime / PLAYTIMELIMIT
			const statusClicks = ((gameState.clicks.onburningtrees * 1.5) + gameState.clicks.ondrytrees + (gameState.clicks.onabsenttrees * 1/3)) / CLICKLIMIT.upper
			if(gameState.statusBars.update == true) {

				// if we're in the planting phase
				if(gameState.shownInfoBox._1 == true && gameState.shownInfoBox._2 == false) {
					updateStyle(divBarPlanted, "width", `${100 * statusPlanted}%`)
				}
				// if we're in the protecting phase
				if(gameState.shownInfoBox._2 == true && gameState.shownInfoBox._0 == false) {
					updateStyle(divBarClicks, "width", `${100 * statusClicks}%`)
					updateStyle(divBarTime, "width", `${100 * statusTime}%`)
					// console.log(`${Math.round(100 * statusTime)}%`)
				}
			}
            
            if (boxDisplayAttrIs(infoBox)) {
                // do nothing
            } else {
							
                /* show instructions */
                // 1.
                if (gameState.shownInfoBox._1 == false) {
                    console.log(`displaying the task: plant your forest.`)
                    setInfo(infoBox, 1)
                    showBox(infoBox)
                }
                // 2.
                if (
                    true
                    && gameState.shownInfoBox._1 == true
                    && gameState.shownInfoBox._2 == false 
                    && gameState.shownInfoBox._0 == false
                    // if the person has spawned a certain-number of trees
                    && countpresenttrees >= totalTreesInForest * READINESS_THRESHOLD
                ) {
                    console.log(`displaying the task: protect your forest.`)
                    setInfo(infoBox, 2)
                    showBox(infoBox)
                    /** 
                     * note: 
                     * when this box is dismissed, startExperience() will be called.
                     * */
                }
                // 8.
                // if the health is getting low, but the person hasn't clicked yet...
                // ...instruct them to click on trees!
                if (
                    true
                    && gameState.shownInfoBox._2 == true 
                    && gameState.shownInfoBox._8 == false 
                    && gameState.shownInfoBox._0 == false
                    && gameState.health < gameState.starthealth * .5
                    && gameState.clicks.onsicktrees < 1
                ) {
                    console.log(`encouraging person to tap on trees.`)
                    setInfo(infoBox, 8)
                    showBox(infoBox)
                }
                // 0.
                if (
                    true
                    && gameState.shownInfoBox._0 == false
                    && gameState.shownInfoBox._2 == true
                    && (
                        statusTime >= 1
                        ||
                        statusClicks >= 1
                    )
                    && burnings.length == 0
                ) {
					let showBoxAfterDelay = false
                    setInfo(infoBox,0)
					setTimeout(() => {
						if(showBoxAfterDelay) pauseSimulation(true)
						console.log(`displaying the conclusion box.`)
						showBox(infoBox)
					}, showBoxAfterDelay?infoBoxTransitionDuration:0)
                }

                /**
                 * spontaneous Δ in tree-state
                 */

                const AUTORESPAWN_EMPTY_FOREST = false
                const PERCENT_OF_FOREST_TO_RESPAWN = /* suggested: 75%  */ READINESS_THRESHOLD * 100
                const TREE_RESPAWN_PROBABILITY = /* suggested: .5 */ 6.25
                let THRESHOLD_MAKEDRY = /* suggested (when seeDryTrees() is disabled): .999 */ gameState.shownInfoBox._2 == false ? .9985 : map(gameState.clicks.onsicktrees, 0, CLICKLIMIT.upper, 0.99967, 1,3)
                const THRESHOLD_SETFIRE = /* suggested: .99  */ normals.length <= countpresenttrees * .1 ? 0.95 : map(normals.length/countpresenttrees, 0, 1, .9925, .995,0)
                const THRESHLD_DISINTEGRATE = /* suggested: .99  */ 0.99
                const forstcover = countpresenttrees / alltrees.length

                // absent -> new shoot (which grows into a tree)
                    /* 
                        note: 
                        this for-loop makes trees respawn at random locations. 
                        if you want them to respawn close to existing trees, 
                        please use spreadInfection() instead.
                    */
                // for (let i = 0; i < absents.length; i++) {
                //     const mintrees = 1
                //     // if there are no trees in the forest
                //     if (
                //         AUTORESPAWN_EMPTY_FOREST
                //         && countpresenttrees < mintrees
                //     ) {
                //         // respawn the forest:
                //         if (Math.random() < PERCENT_OF_FOREST_TO_RESPAWN / 100) {
                //             // console.log(`spawning a tree into an empty forest.`)
                //             tree[absents[i].getAttribute('tree-id')].behaviour = 1
                //         }
                //     }
                //     // else: if there are some trees
                //     else if (gameState.shownInfo._2 == false) {
                //         const thisthreshold = TREE_RESPAWN_PROBABILITY * Math.pow(forstcover, 2) / 100
                //         if (Math.random() < thisthreshold) {
                //             // console.log(`(probability: ${(100 * thisthreshold).toFixed(3)}%) re-spawning tree-${absents[i].getAttribute('tree-id')}.`)
                //             tree[absents[i].getAttribute('tree-id')].behaviour = 1
                //         }
                //     }
                // }

                // normal -> dry
				//   -- method 1: continuously, in several spots:
                for (let i = 0; i < normals.length; i++) {
                    const treeid = normals[i].getAttribute('tree-id')
                    const treestate = tree[treeid].state.now
                    if (
                        // if the tree is fully grown
                        treestate[1] >= (svgtree.src.innerhtml[treestate[0]]).length - 1
                        // and it is not protected
                        && tree[treeid].isProtected == false
                        // and we can overcome this threshold (so that only a few trees starting drying at any given time)
                        && Math.random() > THRESHOLD_MAKEDRY
                    ) {
                        tree[treeid].behaviour = 1
                        // a clump of trees dry out together
                        spreadInfection(document.querySelectorAll(`svg[tree-id='${treeid}']`), 2, 0.75, 1, false)
                    }
                }
                // //   -- method 2: at a specific moment, by calling seedDryTrees():
                // if(drys.length==0) seedDryTrees(3)

                // dry -> burning
                if (gameState.shownInfoBox._2 == true) {
                    for (let i = 0; i < drys.length; i++) {
                        if (Math.random() > THRESHOLD_SETFIRE) {
                            tree[drys[i].getAttribute('tree-id')].behaviour = 1
                        }
                    }
                }

                // burning -> charred
                for (let i = 0; i < burnings.length; i++) {
                    if (Math.random() > THRESHOLD_FIRETOCHARRED) {
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
                    else {
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
                }

                /** 
                 * make fire, dryness, health spread from one tree to its neighbours 
                 */

                const IMMUNITY_TO_FIRE = .99
                const IMMUNITY_TO_DRYING = gameState.shownInfoBox._2?.9933:.999
                const RESISTENCE_TO_RECOVERING = /*suggested: 0.99995 */
                    gameState.shownInfoBox._2 ?
                    // if the person is saving the forest
                    map(
                        normals.length / countpresenttrees,
                        0,
                        1,
                        .999995,
                        .99975,
                        3 // clamp values
                    )
                    :
                    // if person is still planting the forest
                    map(
                        countpresenttrees / totalTreesInForest,
                        0,
                        1,
                        .99,
                        .99999,
                        3  // clamp values
                    )
                if(gameState.shownInfoBox._2 && RESISTENCE_TO_RECOVERING <= IMMUNITY_TO_DRYING) 
                    console.log(`warning: IMMUNITY_TO_RECOVERING (${RESISTENCE_TO_RECOVERING}) should be *much* greater than IMMUNITY_TO_DRYING ${IMMUNITY_TO_DRYING} (which it currently is not).`)

                spreadInfection(burnings, 3, IMMUNITY_TO_FIRE, 1, false)
                spreadInfection(drys, 2, IMMUNITY_TO_DRYING, 1, false)
                spreadInfection(normals, 1, RESISTENCE_TO_RECOVERING, 1, false)
            }
        }
        
        gameState.lastUpdatedAt = Date.now()
    }

    window.requestAnimationFrame(updateForest)
}

/** @param {MouseEvent} e */
function handleClicks(e) {
    // count the click
    gameState.clicks.total++
    // if the forest is allowed to update, then...
    if (! (boxDisplayAttrIs(infoBox))) {
        // ...check if the click happened on a tree
        didClickHappenOnTree(e)
    }
}

/** @param {MouseEvent} e */
function didClickHappenOnTree(e) {

    // get coordinates of mouseclick
    const x = e.clientX
    const y = e.clientY
    // console.log("clicked on: (" + x + ", " + y + ")")

    // get array of all elements that are present where the mouseclick happened ...
    const c = document.elementsFromPoint(x, y)
    // console.log("here are all clicked-on elements:")
    // console.log(c)

    // check if the click happened on #infoBox
    const clickedOnInfosBox = c.some(element => {
        if (element.id === 'infoBox' || element.id === 'closeInfoBox') {
            console.log(`clicked on #${element.id} | did not click on #forest`)
            return true
        }
        return false
    })

    // if we didn't click on the #infoBox, then we may continue checking whether the click happened on a tree in the #forest:
    if (!clickedOnInfosBox) {

        // in the array, we are checking which element is an "SVG Path/Polyline/Polygon Element" (i.e., is a <path>, <polyline> or <polygon>).
        const filteredElements = c.filter(function (x) {
            return (
                x.constructor.toString().indexOf("SVGPathElement()") > -1
                || x.constructor.toString().indexOf("SVGPolylineElement()") > -1
                || x.constructor.toString().indexOf("SVGPolygonElement()") > -1
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
            )
        })
        // console.log("removed -1's:")
        // console.log(c)

        // return <path>'s parent (which is an <svg>)
        .map(function (e) { return e.parentElement })
        // console.log("gathered parent svg-nodes for path elements:")
        // console.log(c)

        // ensure that all elements in the array are unique
        .filter(function (x, i, a) { return a.indexOf(x) === i })
        // console.log("removed duplicates:")
        // console.log(c)

        // count the click
        if(filteredElements.length>0) gameState.clicks.ontrees++

        // now, we instruct each (clicked-)tree to change
        for (const i in filteredElements) {            
            const SVGElementOfClickedTree = filteredElements[i]
            const treeid = Number(SVGElementOfClickedTree.getAttribute('tree-id'))
            if (SVGElementOfClickedTree.classList.contains("burning")) {
                gameState.clicks.onburningtrees++
                gameState.clicks.onsicktrees++
                // console.log(`click on ${treeid}: burning -> dry`)
                tree[treeid].behaviour = -1
            }
            if (SVGElementOfClickedTree.classList.contains("dry")) {
                gameState.clicks.ondrytrees++
                gameState.clicks.onsicktrees++
                // console.log(`click on ${treeid}: dry -> normal`)
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
				// an absent tree can not germinate if the ground is too hot. so:
				// step 1. check if this absent tree was next to any tapped burning-tree (i.e., check if any burning trees were present in the current "tap")
				let burningneighbour = false
				for (let f = 0; f < filteredElements.length; f++) {
					if (filteredElements[f].classList.contains("burning")) {
						burningneighbour = true
						break
					}
				}
				// step 2. if the absent tree was not near any burning tree, it is safe to germinate
				if (burningneighbour == false) {
                    gameState.clicks.onabsenttrees++
					// console.log(`click on ${treeid}: absent -> normal`)
					tree[treeid].behaviour = 1
				}
			}
        }
    }
}

/** return a random number that is close (but deviates ± by a small %) to the reference number 
 * @param {number} n - reference number
 * @param {number} [p=20] - deviation %. (eg. for 10% deviation, p = 10). default = 20% deviation.
*/
export function approx(n, p) {
    const maxDeviation = n * (p / 100)
    const randomDeviation = Math.random() * maxDeviation
    if (Math.random() < .5)
        return n + randomDeviation
    else
        return n - randomDeviation
}

/**
 * map a value from one range to another
 * @returns {number}
 * @param {number} value1 - value within source range
 * @param {number} min1 - lower limit in source range 
 * @param {number} max1 - upper limit in source range
 * @param {number} min2 - lower limit of destination range
 * @param {number} max2 - upper limit of destination range
 * @param {number} [clamp=0] - 0: none | 1: clamp lower only | 2: clamp upper only | 3: clamp both
 */
export function map(value1, min1, max1, min2, max2, clamp) {
    if(min1==max1) {
        console.log(`the source range is invalid. (min and max values in the range must not be equal.) returning unchanged value.`)
        return value1
    }
    const gradient = (max2-min2) / (max1-min1)
    let value2 = min2 + ((value1 - min1) * gradient)
    switch(clamp) {
        case 3: // clamp both
            if(value2<=min2) value2 = min2
            if(value2>=max2) value2 = max2
            break
        case 2: // clamp upper only
            if(value2>=max2) value2 = max2
            break
        case 1: // clamp lower only
            if(value2<=min2) value2 = min2
            break
        case 0: // clamp none
            // do nothing
            break
        default:
            console.log(`map() doesn't know what to do with the supplied clamp-param "${clamp}".`)
    }
    return value2
}
// console.log(map(5,0,10,-1,-.9,0))

/**
 * @param {string} c - name of the (colour-)property defiend within the :root element within the css-stylesheet
 * @param {number} rhby - randomise H by this much % [range: 0-100]
 * @param {number} rlby - randomise L by this much % [range: 0-100]
 * @param {boolean} [blocker=false] - blocks this function from randomising the colour
 * @returns {string}
 * |  
 * examples: 
 * - randomiseCustomHSLColourProperty('--fire', 15, 30)
 */
export function randomiseCustomHSLColourProperty(c, rhby, rlby, blocker) {
    let successflag = false
    let errorcode = 0
    const fallbackcolour = "hsl(0, 0%, 0%)"
    // console.log(`will now run randomiseCustomHSLColourProperty():`)
    const rootStyles = getComputedStyle(document.documentElement)
    // console.log(`step 1: ran getComputedStyle on the root object.`)
    // console.log(rootStyles)
    if(!rootStyles) {
        // console.log(`step 1: getComputedStyle was unable to fetch styles. returning fallback colour: "${fallbackcolour}"`)
        errorcode = 1
    } else {
        let val = rootStyles.getPropertyValue(c).trim()
        // console.log(`step 2: for proprty "${c}", value fetched = "${val}".`)
        if(!val) {
            // console.log(`step 2: unable to get property value. returning fallback colour: "${fallbackcolour}"`)
            errorcode = 2
        } else {
            let hsl = val.split(",")
            if (hsl[0].split("(")[0].localeCompare("hsl")!=0) {
                // console.log(`step 2: property value is not in hsl format. returning fallback colour: "${fallbackcolour}"`)
                errorcode = 3
            } else {
                // console.log(`step 3: randomising hsl-colour "${val}".`)
                let h = Number(hsl[0].split("(")[1])
                h = blocker ? h : approx(h, rhby); if (h <= 0 || h >= 360) h = 0; h = Math.floor(h);
                let s = Number(hsl[1].split("%")[0].trim())
                let l = Number(hsl[2].split("%")[0].trim())
                l = blocker ? l : approx(l, rlby); if (l <= 0) l = 0; if (l >= 100) l = 100; l = Math.floor(l);
                // console.log(`step 3: result: "hsl(${h}, ${s}%, ${l}%)"`)
                successflag = true
                return `hsl(${h}, ${s}%, ${l}%)`
            }
        }
    }
    if(successflag == false) {
        console.log(`failed to randomise colour: ${c} \nerror code: ${errorcode} \nreturning fallback colour: ${fallbackcolour}`)
        return fallbackcolour
    }
}

/**
 * @param {string} start - colour to start with, in hsl() format
 * @param {string} end - colour to end at, in hsl() format
 * @param {number} totalSteps - total number of steps
 * @param {number} currentStep - current step (to calculate colour at)
 * @param {number} [factorForH=1]
 * @param {number} [factorForS=1]
 * @param {number} [factorForL=1] 
 * @returns {string}
 */
export function interpolateHSLColour(start, end, totalSteps, currentStep, factorForH,factorForS, factorForL) {
    /** @param {string} c */
    function splitHSL(c) {
        const hsl = c.split(",")
        let h = Number(hsl[0].split("(")[1])
        if(h<=0 || h>=360) h=0 ; h = Math.floor(h);
        let s = Number(hsl[1].split("%")[0].trim())
        let l = Number(hsl[2].split("%")[0].trim())
        if(l<=0) l=0 ; if(l>=100) l=100 ; l = Math.floor(l);
        return {H: h, S: s, L: l}
    }
    const h = splitHSL(start).H + ((splitHSL(end).H - splitHSL(start).H) * Math.pow(currentStep / totalSteps, factorForH))
    const s = splitHSL(start).S + ((splitHSL(end).S - splitHSL(start).S) * Math.pow(currentStep / totalSteps, factorForS))
    const l = splitHSL(start).L + ((splitHSL(end).L - splitHSL(start).L) * Math.pow(currentStep / totalSteps, factorForL))
    return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * update an element's style
 * @param {'root' | HTMLElement} e - element
 * @param {string} p - parameter 
 * @param {string} v - value
 */
export function updateStyle(e, p, v) {
    if (e == 'root') e = document.documentElement
    return e.style.setProperty(p, v)
}

export function playPauseSwitch() {
    gameState.pauseForestUpdate = !gameState.pauseForestUpdate
    pauseSimulation(gameState.pauseForestUpdate)
    // if simulation is running, don't show the project-essay:
    // if(pauseForestUpdate==false) showcontent(false)
}

export function pauseSimulation(play) {
    gameState.pauseForestUpdate = play
    // update dataset in html element
    playPauseButton.setAttribute('data-playing', (!gameState.pauseForestUpdate).toString())
    // change background colour
    if(gameState.pauseForestUpdate) updateStyle(document.body,"background-color","var(--body-bg-colour-paused)") 
    else updateStyle(document.body,"background-color","var(--body-bg-colour-running)") 
    // write to console:
    console.log(`pauseForestUpdate: ${gameState.pauseForestUpdate}`)
}

/**
 * scale probability with respect to throttled-refresh-rate
 * @param {number} n 
 * @returns {number}
 */
function rr(n) {
    // use this if we throttle refresh-rates:
    return 1 - ((10 * (1 - n)) / (REFRESH_RATE))
}