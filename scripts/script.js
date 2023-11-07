svgtag = '<svg width="100%" height="100%" viewBox="0 0 100 100">'

treeGrowth = [
    '<svg id="tree1"><path class="cls-1" d="M50.36,86.52l-2.89-7.07a2.23,2.23,0,0,1,.49-2.4l2.78-2.79s3.06,0,2.3-3.82c0,0-3.83,0-2.3,3.82"/></svg>',

    '<svg id="tree2"><path class="cls-1" d="M50.5,85.5s0-4,.51-8.53c.43-3.75.49-6.47.49-6.47s4.93-2.21,3-8c0,0-5.58,2.21-3,8"/><path class="cls-1" d="M47.18,73.67s-4.59-.76-3.06-4.58c0,0,3.83,0,3.06,4.58L50.5,78.5"/><path class="cls-1" d="M54.65,75.35s.15-4.65,4.14-3.64c0,0,.51,3.79-4.14,3.64l-4.34,3.93"/></svg>',

    '<svg id="tree3"><path class="cls-1" d="M45.5,79.5s-14,0-11-7l7-15s5.5-16,9,0l5,14S61.5,82.5,45.5,79.5Z"/><path class="cls-1" d="M43.78,79.42V82.6s2.93,2.09,4.33,0V80Z"/></svg>',

    '<svg id="tree4"><path class="cls-1" d="M49.26,79.62S34.5,81.27,37.5,71.5l7.76-22.58S52,26.17,55.5,48.5l6,23S65.5,81.5,49.26,79.62Z"/><path class="cls-2" d="M47.54,79.75v3.18s2.93,2.09,4.32,0V80.35Z"/></svg>',

    '<svg id="tree5"><path class="cls-1" d="M49.92,79.45s-19.42,0-14.42-10l9.55-31.63s8.22-30.82,12.48-.58l7,31.21S70.5,79.5,49.92,79.45Z"/><path class="cls-2" d="M47.54,79.75v3.18s2.93,2.09,4.32,0V80.35Z"/></svg>',

    '<svg id="tree6"><path class="cls-1" d="M48.17,79.23S26.5,80.5,29.5,66.5L42.16,23.57s10.14-41.26,15.4-.77L68.5,64.5S77.5,80.5,48.17,79.23Z"/><path class="cls-2" d="M47.54,79.75v3.18s2.93,2.09,4.32,0V80.35Z"/></svg>'
]

shape = 0

changeShape(0)

function changeShape(start) {
    /* sanity check: if the tree is currently actively changing, don't let a "click" event start it from scratch */
    if(shape!=0) {
        start=shape
    }

    /* at the start of this loop, shape takes whatever value (i.e., start) was passed to this function */
    shape = start
    
    // console.log(shape)

    document.getElementById("svg").innerHTML = svgtag + treeGrowth[shape] + '</svg>'

    /* let the tree grow */
    if(shape < treeGrowth.length-1) {
        shape++
        setTimeout(function() {changeShape(shape)},1000)
    } else 
        shape=0

}