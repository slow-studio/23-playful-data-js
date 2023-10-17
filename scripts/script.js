let count = 0;
function counter(e) {
    e.innerHTML = "clicked " + ++count + " times" ;
}

svgtree = '<svg width="100%" height="100%" viewBox="0 0 687 1367" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/"><g transform="matrix(1,0,0,1,-1368.93,-443.942)"><path d="M1641.54,1628.76L1369.43,1628.76L1711.97,444.442L2054.51,1628.76L1782.41,1628.76L1782.41,1810.05L1641.54,1810.05L1641.54,1628.76Z"/></g></svg>'

/*  ------------------------------------------------------------
    spawn trees into the scene 
    ------------------------------------------------------------  */

// get parent element
trees = document.getElementById("trees")
// set constant-variables
const totalTrees = 10
const spaceBetweenTrees = 37.5
/*  spawn all trees.
    ps. basic template for the process followed: https://stackoverflow.com/a/66481788 
    */
for (i = 0 ; i < totalTrees ; i++) {
    // create new div
    newDiv = document.createElement("div")
    newDiv.setAttribute('class', 'tree')
    newDiv.setAttribute('id', 'tree-'+(i+1))
    // add svg tree into the div
    newDiv.innerHTML = svgtree
    // position the tree in the desired pattern
    newDiv.style.top = trees.offsetTop + 20 + 0.7*spaceBetweenTrees*(i%2) + 'px' 
    newDiv.style.left = trees.offsetLeft + 20 + (i*spaceBetweenTrees) + 'px'
    // set z-index, so that lower-placed seem to be in front
    if(i%2) {newDiv.style.zIndex = "1"}
    // finally, make the div a child of #trees
    trees.appendChild(newDiv)
}

/*  ------------------------------------------------------------
    register whenever a tree is clicked on
    ------------------------------------------------------------  */

// whenever a click happens, this triggers didClickHappenOnTree()
document.addEventListener("click", didClickHappenOnTree);

function didClickHappenOnTree(e) {

    // get coordinates of mouseclick
    x = e.clientX
    y = e.clientY

    // get array of all elements that are present where the mouseclick happened ...
    c = []
    c = document.elementsFromPoint(x,y) 

    // ... and, in that array, find those elements which were SVGPaths (i.e., svg > g > path )
    for(i in c) {
            if ( 
                // here, we are checking if c[i] is an "SVG Path Element", i.e., the <path> (within the DOM, you will find it at: svg > g > path)
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
                c[i].constructor.toString().indexOf("SVGPathElement()") > -1 
                ) {
                SVGElementOfClickedTree = c[i]
                // offer some kind of feedback to show which tree was clicked on
                changeOpacity(SVGElementOfClickedTree)
                updateNewsTicker(SVGElementOfClickedTree)
            }
    }

    function changeOpacity(t) {
        currentOpacity = window.getComputedStyle(t).opacity
        factor = 1
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