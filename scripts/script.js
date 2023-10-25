/*  ------------------------------------------------------------
    "hit me!"-button counts clicks.
    ------------------------------------------------------------  */
    
let count = 0;
function counter(e) {
    e.innerHTML = "clicked " + ++count + " times" ;
}

/*  ------------------------------------------------------------
    spawn trees into the forest 
    ------------------------------------------------------------  */

/**
 * @type {string[]} locations of tree images
 */ 
const treeImgSrc = [
    'media/images/tree-1.png',
    'media/images/tree-2.png',
    'media/images/tree-3.png'
]
const totalTreeTypes = treeImgSrc.length

// get parent element
const forest = document.getElementById("forest")

/*  spawn all trees.
    ps. basic template for the process followed: https://stackoverflow.com/a/66481788 
    */
const totalTrees = 22
const rowsOfTrees = 5
for (let i = 0 ; i < totalTrees ; i++) {
    // create new div
    const newDiv = document.createElement("img")
    newDiv.setAttribute('class', 'tree')
    newDiv.setAttribute('id', 'tree-'+(i+1))
    // add tree into the div
    const selectTreeImgSrc = Math.floor(Math.random()*totalTreeTypes)
    newDiv.setAttribute('src', treeImgSrc[selectTreeImgSrc])
    // position the tree in the desired pattern
    /** @type {number} horizontal spacing between trees (in pixels) */
    const hSpacing = 20
    /** @type {number} vertical spacing between trees (in pixels) */
    const vSpacing = 40
    newDiv.style.top = forest.offsetTop + 20 + 0.7 * vSpacing * (i % rowsOfTrees) + 'px'
    newDiv.style.left = forest.offsetLeft + 20 + (i * hSpacing) + 'px'
    // set z-index, so that lower-placed seem to be in front
    newDiv.style.zIndex = (i%rowsOfTrees).toString()
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