/* placeholder javascript file */

const treeLifecycle = [
    "tree frames/01.png",
    "tree frames/02.png",
    "tree frames/03.png",
    "tree frames/04.png",
    "tree frames/05.png",
    "tree frames/06.png",
    "tree frames/07.png",
    "tree frames/08.png",
    "tree frames/09.png",
    "tree frames/10.png",
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