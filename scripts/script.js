/*  ------------------------------------------------------------
    collect information before drawing tree
    ------------------------------------------------------------  */

const svgtree = {
    src: {
        starttag: '<svg width="100%" height="100%" viewBox="0 0 100 300" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">',
        foliage: {
            default: '<path id="foliage" d="M23.695,264.23c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-95.673 21.939,-166.478c1.993,-14.2 14.902,-76.508 28.401,-76.508c13.498,-0 19.325,56.249 27.506,126.547c6.551,56.295 16.154,87.73 16.154,116.124c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
            sway: {
                left: '<path id="foliage" d="M23.695,264.23c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-91.704 21.939,-162.509c1.993,-14.2 8.099,-80.477 21.597,-80.477c13.499,0 26.129,52.281 34.31,122.578c6.551,56.296 16.154,91.699 16.154,120.093c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
                right: '<path id="foliage" d="M23.695,264.23c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-99.641 21.939,-170.446c1.993,-14.2 18.871,-72.54 32.369,-72.54c13.499,-0 15.357,60.218 23.538,130.515c6.551,56.296 16.154,83.762 16.154,112.156c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
            }
        },
        stump: '<path id="stump" d="M61.599,261.644l0,30.056l-4.484,5.341l-14.596,-0l-3.834,-4.884l0,-28.913l22.914,-1.6Z"/>',
        endtag: '</svg>'
    },
    dim: {
        width: 40,
        height: 120
    }
}

// apply tree dimensions to CSS file
function updateVariablesInCSSFile() {
    document.documentElement.style.setProperty('--treewidth', svgtree.dim.width+'px')    
    document.documentElement.style.setProperty('--treeheight', svgtree.dim.height+'px')    
}
updateVariablesInCSSFile()

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
const forestSettings = {
    total : 0,
    hSpacing : svgtree.dim.width * 2/3,
    vSpacing : 40,
    hpadding : 20,
    vpadding : 20
}

/*  spawn all trees. */

let rowID = 0
let treeIDinRow = 0
let maxTreeIDinRow = treeIDinRow
let loopRunner = true

for (let i = 0 ; loopRunner ; i++) { 
    // create new div
    const newDiv = document.createElement("div")
    newDiv.setAttribute('class', 'tree')
    newDiv.setAttribute('id', 'tree-'+(i+1))
    // add tres-image into newDiv
    newDiv.innerHTML = svgtree.src.starttag + svgtree.src.foliage.default + svgtree.src.stump + svgtree.src.endtag
    // position the tree (so that it sits at the correct location within a desired pattern in the forest)
    newDiv.style.left = forest.offsetLeft + forestSettings.hpadding + (treeIDinRow * forestSettings.hSpacing) + ( rowID % 2 === 0 ? (forestSettings.hSpacing/4) : (-forestSettings.hSpacing/4) ) + 'px'
    newDiv.style.top = forest.offsetTop + forestSettings.vpadding + forestSettings.vSpacing * rowID + 'px'
    // draw trees on the next line if you exceed #forest's right-most bounds
    if (forest.offsetWidth - 2 * forestSettings.hpadding < (treeIDinRow + 1) * forestSettings.hSpacing + svgtree.dim.width ) {
        rowID++
        treeIDinRow = 0
    } else {
        treeIDinRow++
        // update counter that counts the max number of trees on the longest row
        maxTreeIDinRow = treeIDinRow >= maxTreeIDinRow ? treeIDinRow : maxTreeIDinRow
    }
    // stop drawing trees if you exceed #forest's bottom-most bounds
    if (forest.offsetHeight - 2 * forestSettings.vpadding < rowID * forestSettings.vSpacing + svgtree.dim.height)
        loopRunner = false
    // set z-index, so that lower-placed trees seem to be in front
    newDiv.style.zIndex = (i).toString()
    // finally, make the div a child of #forest
    forest.appendChild(newDiv)
    // update the value for total number of trees spawned in the forest
    forestSettings.total = i+1
}

console.log(forestSettings.total + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow+1) + " or fewer trees per row.") 

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
    // console.log(c)

    // ... and, in that array, find those elements which were SVGPaths (i.e., svg > path )
    for(const i in c) {
            if (
                // here, we are checking if c[i] is an "SVG Path Element", i.e., the <path> (within the DOM, you will find it at: svg > path)
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
                c[i].constructor.toString().indexOf("SVGPathElement()") > -1 
                ) {
                const SVGElementOfClickedTree = c[i].parentNode
                // console.log(SVGElementOfClickedTree)
                // offer some kind of feedback to show which tree was clicked on
                changetreeAppearance(SVGElementOfClickedTree)
            } 
    }

    function changetreeAppearance(svgelement) {

        /* tree changes appearance: */
        // -- 1. it animates a little, by changing the svg shape of the #foliage element
        svgelement.innerHTML = (Math.random()<.5?svgtree.src.foliage.sway.left:svgtree.src.foliage.sway.right) + svgtree.src.stump
        // -- 2. it changes the colour of its #foliage
        svgelement.getElementById('foliage').style.fill = 'var(--green)'

        /* after some time, the tree goes back to its original appearance */
        setTimeout(function(){
            // revert to default shape
            svgelement.innerHTML = svgtree.src.foliage.default + svgtree.src.stump
            // revert to original colour
            svgelement.getElementById('foliage').style.fill = 'var(--autumn)'
        }, 5000);
    }
}