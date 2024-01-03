console.log("script.js loaded.")

// variables and helpers
let scrollFactor = 0.1
console.log(`scrollFactor (at start): ${scrollFactor}`)
const windowHeight = window.innerHeight
function documentHeight() { return parseInt(document.documentElement.scrollHeight) }
function scrollableHeight() { return parseInt(documentHeight() - windowHeight) }
console.log(`documentHeight: \t\t${documentHeight()}\nwindowHeight: \t\t\t ${windowHeight}\n∴ scrollableHeight: \t${scrollableHeight()}`)

/* function to define custom scroll-behaviour on mouse/tap events */
function preventDefault(e) {
  console.log(e)

  // prevent default scroll/touchmove behaviour
  e.preventDefault();
  
  // calculate where the person is currentlyAt
  let currentlyAt = document.documentElement.scrollTop
  
  // calculate scroll factor
  scrollFactor = /*the 0.01 is there so that scrollFactor never becomes 0*/ 0.09 + (/* the 0.3 is what replicates normal scrolling speed */ 0.5 * /* this is the basic calculation for scrollFactor */ ((scrollableHeight() - currentlyAt) / scrollableHeight()) )

  // and: scroll slowly (reduced by the scrollFactor variable)
  window.scrollBy({ top: e.deltaY * scrollFactor/*, behavior: 'smooth'*/ });

  console.log(`currentlyAt: ${Math.round(currentlyAt)}px | custom scrollFactor: ${scrollFactor}`)
}


// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = { 32: 1, 37: 1, 38: 1, 39: 1, 40: 1 };

/* function to define custom scroll-behaviour (when keyboard keys are pressed) */
function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// (not sure, but we think this) checks if the current browser is a Chrome browser.
// ∵ modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; }
  }));
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Enable
function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

/* this function attached eventListeners to the window. whenever a scroll (or similar) event is detected, these eventListeners call the preventDefault() funtion.
*/
function disableScroll() {
  console.log(`disableScroll() has worked its magic.`)
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// when the script loads, call the disableScroll() function
disableScroll();