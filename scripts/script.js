/**
 * to check browser support tables on mobile web browsers, 
 * go to: https://caniuse.com/
 * */

window.addEventListener('load', function () {

    /*  ------------------------------------------------------------
        collect information before drawing tree
        ------------------------------------------------------------  */

    const svgtree = {
        src: {
            starttag: '<svg width="100%" height="100%" viewBox="0 0 134 382" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">',
            foliage: {
                default: '<path class="foliage" d="M40.695,345.956c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-95.673 21.939,-166.478c1.993,-14.2 14.902,-76.508 28.401,-76.508c13.498,0 19.325,56.249 27.506,126.547c6.551,56.295 16.154,87.73 16.154,116.124c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
                sway: {
                    left: '<path class="foliage" d="M40.695,345.956c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-90.003 21.939,-160.808c1.993,-14.2 6.398,-82.178 19.897,-82.178c13.498,0 27.829,53.415 36.01,123.713c6.551,56.295 16.154,90.564 16.154,118.958c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
                    right: '<path class="foliage" d="M40.695,343.122c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 14.837,-95.673 24.774,-166.478c1.993,-14.2 23.406,-73.674 36.905,-73.674c13.498,0 7.986,59.084 16.167,129.382c6.551,56.295 16.154,84.895 16.154,113.289c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,0.21 -48.987,1.022Z"/>',
                }
            },
            stump: '<path class="stump" d="M78.599,343.603l-0,30.056l-4.484,5.341l-14.596,0l-3.834,-4.884l-0,-28.913l22.914,-1.6Z"/>',
            fire: '<path class="fire" d="M55.889,74.322c3.005,-5.038 6.083,-11.872 4.708,-18.707c-3.06,-15.32 13.79,-28.09 13.79,-28.09c9.68,-6.27 9.366,-17.66 8.466,-23.27c-0.087,-0.726 1.123,-1.254 1.123,-1.254c-0,-0 0.875,0.402 0.987,0.73c1.854,5.7 3.784,16.352 -0.066,22.964c-1.186,2.037 -3,6.51 -3.71,8.22c-1.4,3.46 -2.52,7.77 -2.95,21l0.067,4.954c1.711,6.895 2.653,12.701 2.653,16.696c-0.035,4.892 -1.498,9.668 -4.21,13.74l-5.43,8.22c-4.73,11.03 -4.03,19.18 2.12,24.52l5.376,1.984c0.339,-0.318 4.245,-2.045 4.924,-2.724c4.16,-4.15 7.34,-8.79 5.87,-15.56c-1.53,-7.1 7.11,-13 10.28,-13.84c0.623,-0.162 1.205,-0.452 1.71,-0.85c2.39,-1.85 8.6,-7.59 6.52,-15.49c0,0 4.5,12.91 -2.44,18.28c-0.447,0.347 -0.887,0.707 -1.32,1.08c-3.533,3.079 -5.649,7.478 -5.85,12.16l-0.15,2.74c0.058,8.914 -8.57,19.88 -8.57,19.88c-1.7,2.53 7.707,7.53 7.937,9.53c0.306,2.553 0.333,5.131 0.08,7.69c-0.191,1.885 -1.083,3.631 -2.5,4.89c0,0 -2.519,4.355 -2.93,6.64l-0.18,4.91c-0.51,1.02 1.49,4.6 4.49,5.33c0,0 3.219,1.587 6.45,0.485c4.875,-4.016 1.671,-10.168 0.873,-17.195c-1.53,-13.54 11.74,-18.64 11.74,-18.64c0,0 5.34,-6.76 5,-12c0.91,3.83 1.39,11.12 -4.52,19.12c-3.491,4.635 -4.441,10.63 -2.744,16.018c1.407,-0.462 3.189,-1.425 3.684,-3.548c1.003,-4.35 3.575,-8.183 7.22,-10.76c1.09,-0.77 3.59,-1.14 5.68,-1.4c0.041,-0.005 0.083,-0.007 0.124,-0.007c0.587,-0 0.809,0.483 0.809,1.07c0,0.284 -0.419,0.556 -0.62,0.757c-3.24,3.08 -7.743,9.35 -6.433,21.35c2.12,19.45 -5.61,14.3 -36.76,45.45c-31.15,31.15 -58.52,-6.67 -58.52,-6.67c0,0 -5.198,-3.565 -10.64,-7.865c-4.837,-2.199 -9.177,-5.549 -12.06,-10.525c-2.154,-3.707 -2.977,-7.499 -2.943,-11.168c0.132,-14.29 11.623,-25.092 11.623,-25.092c0,0 -5.241,16.539 -1.213,26.21c0.031,0.044 0.062,0.091 0.093,0.14c2.18,3.43 5.91,4.37 14.1,6.3c2.239,0.527 10.13,1.253 3.18,-8.37c-2.995,-4.148 -3.584,-12.591 -3,-19.11c0.53,-5.75 4,-12.18 7.31,-16.45c1.501,-1.952 5.061,-3.802 7.981,-5.731c1.58,-2.312 2.174,-5.184 1.609,-7.959l-0.499,-6.531c-0.059,-0.1 -0.117,-0.197 -0.171,-0.289c-3.018,-5.159 -4.454,-11.092 -4.13,-17.06l0,-0.69c0.313,-5.917 2.327,-11.62 5.8,-16.42l5.08,-5.77c1.69,-1.38 3.451,-2.754 5.102,-4.023Z"/>',
            burned: '<path class="burned" d="M60.67,380.299l-6.203,-71.311l8.765,-48.949l-1.22,-11.17l-10.36,-26.59l-8.08,-7.49l-17.79,1.87l18.654,-2.525l-12.664,-14.295l20.595,22.139l9.41,22.697l-4.475,-47.256l12.58,-60.01l-2.882,-10.779l0.142,-9.274l-0.142,-18.858l1.684,21.933l3.158,17.011l-11.853,56.776l22.614,-26.26l4.995,-17.914l-3.238,18.689l-23.304,31.16l5.944,60.361l-5.572,47.798l14.054,-35.733l19.14,-11.5l-1.621,-21.767l3.188,20.26l12.313,-11.843l-11.532,14.279l-19.179,12.356l-15.142,39.016l11.791,67.179l-13.77,0Z"/>',
            endtag: '</svg>'
        },
        dim: {
            width: 134/3, // known to us, from when we created the svg
            height: 382/3 // known to us, from when we created the svg
        }
    }

    // apply tree dimensions to CSS file
    function updateVariablesInCSSFile() {
        document.documentElement.style.setProperty('--treewidth', svgtree.dim.width+'px')  
    }
    updateVariablesInCSSFile()

    /*  ------------------------------------------------------------
        spawn trees into the forest 
        ------------------------------------------------------------  */

    // get parent element
    const forest = document.getElementById("forest")

    /**
     * @typedef {Object} SettingsObject
     * @property {object} padding - padding inside the #forest div
     * @property {number} padding.h - horizontal padding inside the #forest div
     * @property {number} padding.v - vertical padding inside the #forest div
     * @property {object} spacing - spacing between trees (in pixels) 
     * @property {number} spacing.h - horizontal spacing between trees (in pixels) 
     * @property {number} spacing.v - vertical spacing between trees (in pixels) 
     * @property {object} orderly - defines how uniformly is everything drawn for each specified key
     * @property {boolean} orderly.positionally - spawn trees randomly in front or behind each other (by making sure every tree's zIndex is +1 than the previous tree's zIndex)
     * @property {boolean} orderly.shape - are all trees uniformly shaped?
     */
    /** @type {SettingsObject} settings for the forest */
    const forestSettings = {
        padding: {
            h: 20,
            v: 10
        },
        spacing: {
            h: svgtree.dim.width * 2 / 3,
            v: 30
        },
        orderly: {
            positionally: true,
            shape: true
        }
    }

    /** @type {number} counts total number of trees (by incrementing its value each time a tree is spawned) */
    var totalTreesInForest = 0;

    /*  spawn all trees. */

    let rowID = 0
    let treeIDinRow = 0
    let maxTreeIDinRow = treeIDinRow
    let loopRunner = true

    const tree = []

    for (let i = 0 ; loopRunner ; i++) { 
        // sanity check
        if(i>1000 /*an arbitarily large number*/ ) { /* bug out, because otherwise this for-loop will hang stuff */ break; }
        // create new div
        /** @type {HTMLDivElement} */
        const newDiv = document.createElement("div")
        // store the tree's information in its own object
        tree[i] = {
            div: newDiv,
            id: 'tree-'+i,
            class: 'tree',
            zindex: i + (forestSettings.orderly.positionally ? 0 : Math.pow(-1, Math.floor(2 * Math.random())) * 2),
            shape: {
                foliage: {
                    default: svgtree.src.foliage.default,
                    previous: svgtree.src.foliage.default,
                    now: forestSettings.orderly.shape ? svgtree.src.foliage.default : (Math.random() < .5 ? svgtree.src.foliage.sway.left : svgtree.src.foliage.sway.right)
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
                }
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
                }
            },
            dimensions: {
                l: forest.offsetLeft + forestSettings.padding.h + (treeIDinRow * forestSettings.spacing.h) + ( rowID % 2 === 0 ? (forestSettings.spacing.h/4) : (-forestSettings.spacing.h/4) ),
                t: forest.offsetTop + forestSettings.padding.v + forestSettings.spacing.v * rowID,
                w: svgtree.dim.width,
                h: svgtree.dim.height,
                /** @type {{ x: number, y: number }} */
                heart: { 
                    /* will be filled correctly when the tree is spawned */
                    x: svgtree.dim.width/2,
                    y: svgtree.dim.height/2
                }
            }
        }
        // set id and class
        newDiv.setAttribute('class', tree[i].class)
        newDiv.setAttribute('id', tree[i].id)
        // add tree-image into newDiv
        newDiv.innerHTML = svgtree.src.starttag + tree[i].shape.foliage.now + tree[i].shape.stump.now + svgtree.src.endtag

        // style the tree
        const svgelement = newDiv.getElementsByTagName("svg")[0] // the first (and only) child is an <svg>
        const foliages = svgelement.getElementsByClassName('foliage')
        const wood = svgelement.getElementsByClassName('stump')
        /** @ts-ignore */ 
        for(const f of foliages) { f.style.fill = tree[i].colour.foliage.now }
        /** @ts-ignore */ 
        for(const w of wood) { w.style.fill = tree[i].colour.stump.now }

        // newDiv should be as large as the tree-image
        newDiv.style.width = tree[i].dimensions.w + 'px'
        // position the tree (so that it sits at the correct location within a desired pattern in the forest)
        newDiv.style.left = tree[i].dimensions.l + 'px'
        newDiv.style.top = tree[i].dimensions.t + 'px'
        tree[i].dimensions.heart = { x: tree[i].dimensions.l + tree[i].dimensions.w/2, y: tree[i].dimensions.t + tree[i].dimensions.h/2 }
        // draw trees on the next line if you exceed #forest's right-most bounds
        if (forest.offsetWidth - 2 * forestSettings.padding.h < (treeIDinRow + 1) * forestSettings.spacing.h + tree[i].dimensions.w ) {
            rowID++
            treeIDinRow = 0
        } else {
            treeIDinRow++
            // update counter that counts the max number of trees on the longest row
            maxTreeIDinRow = treeIDinRow >= maxTreeIDinRow ? treeIDinRow : maxTreeIDinRow
        }
        // stop drawing trees if you exceed #forest's bottom-most bounds
        if (forest.offsetHeight - 2 * forestSettings.padding.v < rowID * forestSettings.spacing.v +  tree[i].dimensions.h)
            loopRunner = false
        // set z-index, so that lower-placed trees seem to be in front
        newDiv.style.zIndex = (tree[i].zindex).toString()
        // finally, make the div a child of #forest
        forest.appendChild(newDiv)
        // update the value for total number of trees spawned in the forest
        totalTreesInForest += 1
    }

    console.log(totalTreesInForest + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow+1) + " or fewer trees per row.") 

    /*  ------------------------------------------------------------
        register whenever a tree is clicked on,
        and update div#newsTicker
        ------------------------------------------------------------  */

    // whenever a click happens, this triggers didClickHappenOnTree()
    document.addEventListener("click", didClickHappenOnTree);

    var g
    function didClickHappenOnTree(e) {

        // get coordinates of mouseclick
        const x = e.clientX
        const y = e.clientY
        console.log("clicked on: (" + x + ", " + y + ")")

        // get array of all elements that are present where the mouseclick happened ...
        let c = []
        c = document.elementsFromPoint(x,y) 
        // console.log("here are all clicked-on elements:")
        // console.log(c)

        c = c.map(function (x) { 
            // in the array, we are checking which element is an "SVG Path Element" (i.e., is a <path> element).
            // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
            if (x.constructor.toString().indexOf("SVGPathElement()") > -1 )
                // return <path>'s parent (which is an <svg>)
                return x.parentNode 
            else return -1
        } );
        // console.log("gathered parent svg-nodes for path elements:")
        // console.log(c)
        
        // filter out all non-svg elements (which we'd already replaced with -1)
        c = c.filter(function(e) { return e != -1; })
        // console.log("removed -1's:")
        // console.log(c)

        // ensure that all elements in the array are unique
        c = c.filter(function(x,i,a) {return a.indexOf(x) == i})
        // console.log("removed duplicates:")
        // console.log(c)
        
        for(const i in c) {
            const SVGElementOfClickedTree = c[i]
            treeProvidesClickFeedback(
                SVGElementOfClickedTree, 
                {
                    foliageColour: 'var(--autumn)',
                    stumpColour: 'var(--wood)',
                    changeShape: ( Math.random() < .5 ? svgtree.src.foliage.sway.left : svgtree.src.foliage.sway.right ),
                    fire: true
                },
                3000
            )
        }
    }

    /**
     * @typedef {Object} TreeChangeSettings
     * @property {string|boolean} [foliageColour=false] - the tree's foliage changes to this colour
     * @property {string|boolean} [stumpColour=false] - the tree's stump changes to this colour
     * @property {string|boolean} [changeShape=false] - the tree's foliage changes to this shape
     * @property {boolean} [fire=false] - fire is added to the tree (using this shape)
     */

    /**
     * @param {*} svgelement 
     * @param {TreeChangeSettings} settings
     * @param {number} [changeBackTime=5000]
     */
    function treeProvidesClickFeedback(svgelement, settings, changeBackTime) {

        // helper variables
        const id = Number(svgelement.parentNode.id.substring("tree-".length,svgelement.parentNode.id.length))
        const foliages = svgelement.getElementsByClassName('foliage')
        const wood = svgelement.getElementsByClassName('stump')
        const fires = svgelement.getElementsByClassName('fire')

        /* tree memorises its present state */
        tree[id].colour.foliage.previous = tree[id].colour.foliage.now
        tree[id].colour.stump.previous = tree[id].colour.stump.now
        tree[id].shape.foliage.previous = tree[id].shape.foliage.now
        tree[id].shape.fire.previous = tree[id].shape.fire.now

        /* tree decides what its new appearance will be */
        if( settings.foliageColour ) tree[id].colour.foliage.now = settings.foliageColour
        if( settings.stumpColour ) tree[id].colour.stump.now = settings.stumpColour
        if( settings.changeShape ) tree[id].shape.foliage.now = settings.changeShape
        if( settings.fire ) tree[id].shape.fire.now = svgtree.src.fire

        /* tree changes appearance: */
        console.log("change t# " + id)
        // console.log(tree[id])
        // -- first, it animates a little, by updating its svg shape
        svgelement.innerHTML = tree[id].shape.foliage.now + (settings.fire ? tree[id].shape.stump.now : '') + ( settings.fire ? tree[id].shape.fire.now : '' )
        // -- and then, it sets the colour of its foliage
        for(const f of foliages) { f.style.fill = tree[id].colour.foliage.now }
        for(const w of wood) { w.style.fill = tree[id].colour.stump.now }
        for(const f of fires) { f.style.fill = tree[id].colour.fire.now }

        if(changeBackTime>0) {
            /* after some time, the tree goes back to its original appearance */
            setTimeout(function(){
                treeProvidesClickFeedback(
                    svgelement,
                    {
                        foliageColour: 'var(--autumn)',
                        stumpColour: tree[id].colour.stump.previous,
                        changeShape: settings.fire ? svgtree.src.burned : tree[id].shape.foliage.previous,
                        fire: !settings.fire
                    },
                    /* do not change: */ 0
                )
            }, changeBackTime);
        }
    }
})