/*  ------------------------------------------------------------
    collect information on trees
    ------------------------------------------------------------  */

const dir = 'assets/images/'
/** @type {string} location of tree image */ 
const treeImgSrc = 'tree-fir-2.png'
const treeImgSrcP = 'tree-fir-2-p.png'

/** @type {{width: number, height: number}} dimensions of the tree image */
const treeImgDim = { 
    width: 123, 
    height: 253 
}

/*  ------------------------------------------------------------
    spawn trees into the forest 
    ------------------------------------------------------------  */

// get parent element
const forest = document.getElementById("forest")

/**
 * @typedef {Object} SettingsObject
 * @property {number} total - a counter: counts total number of trees as they keep getting spawned in the forest. (ps. it starts counting at 0.)
 * @property {number} hSpacing - horizontal spacing between trees (in pixels) 
 * @property {number} vSpacing - vertical spacing between trees (in pixels) 
 * @property {number} hpadding - horizontal padding inside the #forest div
 * @property {number} vpadding - vertical padding inside the #forest div
 */
/** @type {SettingsObject} settings for the forest */
const fSettings = {
    total : 0,
    hSpacing : 40,
    vSpacing : 40,
    hpadding : 60,
    vpadding : 20
}

/*  spawn all trees. */

let rowID = 0
let treeIDinRow = 0
let maxTreeIDinRow = treeIDinRow

for (let i = 0 ; true ; i++) {
    // create new div
    const newDiv = document.createElement("img")
    newDiv.setAttribute('class', 'tree')
    newDiv.setAttribute('id', 'tree-'+(i+1))
    // add tres-image into newDiv
    newDiv.setAttribute('src', dir+treeImgSrc)
    // position the tree (so that it sits at the correct location within a desired pattern in the forest)
    newDiv.style.left = forest.offsetLeft + fSettings.hpadding + (treeIDinRow * fSettings.hSpacing) + ( rowID % 2 === 0 ? (fSettings.hSpacing/4) : (-fSettings.hSpacing/4) ) + 'px'
    newDiv.style.top = forest.offsetTop + fSettings.vpadding + fSettings.vSpacing * rowID + 'px'
    // newDiv.style.left += ((rowID%2) ? (-fSettings.hpadding/2) : (fSettings.hpadding/2))
    // calculate the bottom-right point of the tree
    /** @type {number} */
    const x = Number((newDiv.style.left).substring(0,newDiv.style.left.length-2)) + treeImgDim.width
    /** @type {number} */
    const y = Number((newDiv.style.top).substring(0, newDiv.style.top.length - 2)) + treeImgDim.height
    // draw trees on the next line if you exceed #forest's right-most bounds
    if (x >= forest.offsetLeft + forest.offsetWidth - fSettings.hpadding) {
        rowID++
        treeIDinRow = 0
    } else {
        treeIDinRow++
        // update counter that counts the max number of trees per row
        maxTreeIDinRow = treeIDinRow >= maxTreeIDinRow ? treeIDinRow : maxTreeIDinRow
    }
    // stop drawing trees if you exceed #forest's bottom-most bounds
    if (y >= forest.offsetTop + forest.offsetHeight - fSettings.vpadding)
        break;
    // set z-index, so that lower-placed trees seem to be in front
    newDiv.style.zIndex = (i).toString()
    // finally, make the div a child of #forest
    forest.appendChild(newDiv)
    // update the value for total number of trees spawned in the forest
    fSettings.total = i+1
}

console.log(fSettings.total + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow+1) + " or fewer trees per row.") 

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
    console.log(c)

    let C = []

    // ... and, in that array, find those elements which were of the type 'HTMLImageElement'
    for(const i in c) {
            if ( 
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
                c[i].constructor.toString().indexOf("HTMLImageElement()") > -1 
                ) {
                C.push(c[i])
                const ImageElementOfClickedTree = c[i]
                // offer some kind of feedback to show which tree was clicked on
                changeOpacity(ImageElementOfClickedTree)
            } 
    }

    // from the many 'HTMLImageElement' elements, pick one, and change its state to 'protected'
    makeTreeProtected(document.getElementById(C[Math.floor(C.length/2)].id))

    // helper functions

    function makeTreeProtected(imgelement) {
        const root = imgelement.src.substring(0,imgelement.src.indexOf(dir))
        const currentsrc = imgelement.src.substring(imgelement.src.indexOf(dir),imgelement.src.length)

        if (currentsrc == dir+treeImgSrc) {
            imgelement.src = root+dir+treeImgSrcP
            console.log("tree id #" + imgelement.id + " set to 'protected' status")
        }
        else {
            imgelement.src = root+dir+treeImgSrc
            console.log("tree id #" + imgelement.id + " set to 'unprotected' status")
        }
    }

    function changeOpacity(t) {
        const currentOpacity = Number(window.getComputedStyle(t).opacity)
        let factor = 1
        if ( currentOpacity <= 0.5 ) 
            factor = 2 
        else 
            factor = .9
        t.style.opacity = currentOpacity * factor
    }
}