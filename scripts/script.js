/*  ------------------------------------------------------------
    "hit me!"-button counts clicks.
    ------------------------------------------------------------  */
    
let count = 0;
/**
 * @param {HTMLElement} e - the element
 */
function counter(e) {
    e.innerHTML = "clicked " + ++count + " times" ;
}

/*  ------------------------------------------------------------
    collect information on trees
    ------------------------------------------------------------  */

/**
 * @type {string[]} locations of tree images
 */ 
const treeImgSrc = [
    'assets/images/tree-fir-1-2.png', 
    'assets/images/tree-fir-2-2.png',
    'assets/images/tree-fir-3-2.png',
    'assets/images/tree-fir-4-2.png',
    'assets/images/tree-fir-5-2.png',
    'assets/images/tree-fir-6-2.png'
]
const totalTreeTypes = treeImgSrc.length

/*  ------------------------------------------------------------
    spawn trees into the forest 
    ------------------------------------------------------------  */

// get parent element
const forest = document.getElementById("forest")

/**
 * @typedef {Object} SettingsObject
 * @property {number} total - total number of trees in the forest
 * @property {number} rows - number of rows to arrange the trees in 
 * @property {number} hSpacing - horizontal spacing between trees (in pixels) 
 * @property {number} vSpacing - vertical spacing between trees (in pixels) 
 */
/** @type {SettingsObject} settings for the forest */
const fSettings = {
    total : 20,
    rows : 5,
    hSpacing : 20,
    vSpacing : 40
}

/*  spawn all trees.
    ps. basic template for the process followed: https://stackoverflow.com/a/66481788 
    */
for (let i = 0 ; i < fSettings.total ; i++) {
    // create new div
    const newDiv = document.createElement("img")
    newDiv.setAttribute('class', 'tree')
    newDiv.setAttribute('id', 'tree-'+(i+1))
    // select tree-image from project directory
    const selectTreeImgSrc = Math.floor(Math.random()*totalTreeTypes)
    // add tres-image into newDiv
    newDiv.setAttribute('src', treeImgSrc[selectTreeImgSrc])
    // position the tree (so that it sits at the correct location within a desired pattern in the forest)
    newDiv.style.top = forest.offsetTop + 20 + 0.7 * fSettings.vSpacing * (i % fSettings.rows) + 'px'
    newDiv.style.left = forest.offsetLeft + 20 + (i * fSettings.hSpacing) + 'px'
    // set z-index, so that lower-placed trees seem to be in front
    newDiv.style.zIndex = (i%fSettings.rows).toString()
    // finally, make the div a child of #forest
    forest.appendChild(newDiv)
}

/*  ------------------------------------------------------------
    register whenever a tree is clicked on,
    and update div#newsTicker
    ------------------------------------------------------------  */

// whenever a click happens, this triggers didClickHappenOnTree()
document.addEventListener("click", didClickHappenOnTree);

function didClickHappenOnTree(e) {

    // get coordinates of mouseclick
    const x = e.clientX
    const y = e.clientY

    // get array of all elements that are present where the mouseclick happened ...
    let c = []
    c = document.elementsFromPoint(x,y) 

    // ... and, in that array, find those elements which were SVGPaths (i.e., svg > g > path )
    for(const i in c) {
            if ( 
                // here, we are checking if c[i] is an "SVG Path Element", i.e., the <path> (within the DOM, you will find it at: svg > g > path)
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
                c[i].constructor.toString().indexOf("SVGPathElement()") > -1 
                ) {
                const SVGElementOfClickedTree = c[i]
                // offer some kind of feedback to show which tree was clicked on
                changeOpacity(SVGElementOfClickedTree)
                updateNewsTicker(SVGElementOfClickedTree)
            }
    }

    function changeOpacity(t) {
        const currentOpacity = Number(window.getComputedStyle(t).opacity)
        let factor = 1
        if ( currentOpacity <= 0.5 ) 
            factor = 2 
        else 
            factor = .5
        t.style.opacity = currentOpacity * factor
    }

    function updateNewsTicker(svgelement) {
        document.getElementById("newsTicker").innerHTML += " " + svgelement.parentElement.parentElement.parentElement.id[5]
    }
}