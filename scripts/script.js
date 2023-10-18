/* placeholder javascript file */

const treeStates = {
    normal : '<svg class="normal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 246.56 529.56"><defs><style></style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M102.54,466V519.5s20.74,17,48,0V466Z"/><path class="cls-2" d="M109.54,14.5s13.74-27,30,0l104,422s5,22-16,21c0,0-113,19.07-209,0,0,0-17-3-16-19Z"/></g></g></svg>',
    safe : '<svg class="safe" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 246.56 529.56"><defs><style></style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M102.54,466V519.5s20.74,17,48,0V466Z"/><path class="cls-2" d="M109.54,14.5s13.74-27,30,0l104,422s5,22-16,21c0,0-113,19.07-209,0,0,0-17-3-16-19Z"/><path class="cls-3" d="M179.43,85.9l7.67,22.37a34.77,34.77,0,0,0,16.2,19.21l10.2,5.58-9.43,5.16a34.75,34.75,0,0,0-16.65,20.66l-8,27.11-8-27.11a34.75,34.75,0,0,0-16.65-20.66l-9.43-5.16,10.2-5.58a34.77,34.77,0,0,0,16.2-19.21Z"/><path class="cls-3" d="M50.75,268.2l7.67,22.37a34.77,34.77,0,0,0,16.2,19.21l10.2,5.58-9.43,5.16a34.75,34.75,0,0,0-16.65,20.66l-8,27.11-8-27.11a34.75,34.75,0,0,0-16.65-20.66l-9.43-5.16,10.2-5.58a34.77,34.77,0,0,0,16.2-19.21Z"/></g></g></svg>',
    burning : '<svg class="burning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 246.56 549.58"><defs><style></style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M102.54,486v53.52s20.74,17,48,0V486Z"/><path class="cls-2" d="M109.54,34.52s13.74-27,30,0l104,422s5,22-16,21c0,0-113,19.07-209,0,0,0-17-3-16-19Z"/><path class="cls-3" d="M44,304.31s-32.69-27.58,0-65.88c0,0,38.8-39.31,0-47.48,0,0,33.19-10.22,26,42.38,0,0-16.37,22.47,1,36.25,0,0,32.18,6.64,21-54.12S38.36,132.22,82.27,80.65c0,0,33.19-20.43,40.85-38.3s18.39-37.28,0-37.28c0,0,25.54-13.78,26.56,22.47,0,0-1,21.45-13.28,38.81s5.11,27.57,5.11,27.57,30.64,2,16.85-31.14c0,0,26-7.66,20.42,34.21s-42.89,87.32-7.66,104.68c0,0,13.79,5.62,13.28-11.75a42.47,42.47,0,0,1,10.21-28.59s11.75-7.15,16.85-5.11c0,0-23.48,29.62,0,41.36,0,0,10.22.51,6.64-17.36,0,0,19.92,29.11-15.83,65.36,0,0-9.7,15.32,2.56,80.68,0,0-10.22-39.31-26.56-32.68s-43.4-5.1-49.53-26.55-1-41.87-20.93-48.51c0,0,19.4,69.45-44.94,89.36,0,0-18.89-1.53-20.94-30.13l2,28.6Z"/></g></g></svg>'
}
let burnSound = new Audio('/assets/sound/lighting-a-fire.mp3');
let safeSound = new Audio('/assets/sound/twinkle.mp3');

//var trees = [tree1,tree2,tree3,tree4,tree5]

// document.getElementById("forest").innerHTML = treeStates.normal

//creating the forest with multiple trees
let trees = 3;
for (let i = 0; i < trees; i++) {
    newTree = document.createElement('div')
    newTree.setAttribute('class','tree')
    newTree.setAttribute('id', 'tree-'+i)
    newTree.innerHTML = treeStates.normal
    
    //setting on click events to call functions
    newTree.setAttribute('onclick','burnTree(this)')
    newTree.setAttribute('oncontextmenu','protectTree(this)')
    
    forest = document.getElementById('forest')
    forest.appendChild(newTree)
}

//changes tree state to burning, actively on fire
function burnTree(e)
{
  //console.log (e)
  e.innerHTML = treeStates.burning
  burnSound.play()
}

//changes tree state to protected, cannot be affected by fire
function protectTree(e)
{
    e.innerHTML = treeStates.safe
    safeSound.play()
}