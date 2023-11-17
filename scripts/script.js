/* placeholder javascript file */

const treeLifecycle = [
    "assets/treeFrames/1.svg",
    // "assets/treeFrames/2.svg",
    "assets/treeFrames/3.svg",
    // "assets/treeFrames/4.svg",
    "assets/treeFrames/5.svg",
    // "assets/treeFrames/6.svg",
    "assets/treeFrames/7.svg",
    // "assets/treeFrames/8.svg",
    "assets/treeFrames/9.svg",
    // "assets/treeFrames/10.svg",
    "assets/treeFrames/11.svg",
    "assets/treeFrames/12.svg",
    ]  
    
const time = [
    
]

//const container = document.getElementById('content');
let i = 1
let growtree = function grow()
{
    if(i>=treeLifecycle.length)
        i = 0

    /** @type {*} */
    let img = document.getElementById('tree')
    img.src = treeLifecycle[i]
    i++
}

setInterval(growtree,600)