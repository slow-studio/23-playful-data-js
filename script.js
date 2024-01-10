console.log("script.js loaded.")

// variables and helpers
let scrollFactor = 0.1
console.log(`scrollFactor (at start): ${scrollFactor}`)
const windowHeight = window.innerHeight
function documentHeight() { return parseInt(document.documentElement.scrollHeight) }
function scrollableHeight() { return parseInt(documentHeight() - windowHeight) }
console.log(`documentHeight: \t\t${documentHeight()}\nwindowHeight: \t\t\t ${windowHeight}\n∴ scrollableHeight: \t${scrollableHeight()}`)

// during a touchmove event, these record the y position of a touch 
let oldy = 0
let oldtime = 0
let newy = 0
let newtime = 0
let delta = newy - oldy

/* function to define custom scroll-behaviour on mouse/tap events */
function preventDefault(e) {

	// calculate where the person is currentlyAt
	let currentlyAt = document.documentElement.scrollTop

	// calculate scroll factor
	const scrollFactorAtTop = 0.8
	const scrollFactorAtBottom = 0.08
	const rateOfScrollFactorChange = 2
	scrollFactor = 
		scrollFactorAtBottom
		+ 
		(
			(scrollFactorAtTop - scrollFactorAtBottom)
			* 
			/* this is the basic calculation for scrollFactor */ 
			Math.pow(
				(scrollableHeight() - currentlyAt) / scrollableHeight(),rateOfScrollFactorChange
			)
		)
	// round the value to make it readable in the console
	const decimalPlaces = 4
	scrollFactor = Math.round(Math.pow(10,decimalPlaces)*(scrollFactor))/Math.pow(10,decimalPlaces)

	// and: scroll slowly (reduced by the scrollFactor variable)
	switch (e.type) {
		case ('keydown'):
			e.preventDefault(); // prevent default scroll/touchmove behaviour
			const keyPressed = e.keyCode
			switch (keyPressed) {
				case 32: // spacebar to move down
					scrollFactor *= 20
					break
				case 38:
					scrollFactor *= -2
					break
				case 40:
					scrollFactor *= 2
					break
			}
			window.scrollBy({ top: 10 * scrollFactor, behavior: 'smooth' })
			console.log(`${keyPressed} was pressed.`)
			break;
		case ('wheel'):
			console.log(e.type)
			e.preventDefault(); // prevent default scroll/touchmove behaviour
			window.scrollBy({ top: e.deltaY * scrollFactor/*, behavior: 'smooth'*/ });
			break;
		case ('touchmove'):
			newy = e.touches[0].clientY
			newtime = e.timeStamp
			delta = newy - oldy
			if(Math.abs(delta)>=120) delta = 0
			e.preventDefault()
			window.scrollBy({ top: -delta * scrollFactor/*, behavior: 'smooth'*/ })
			oldy = newy
			oldtime = newtime
			break;
	}

	console.log(`currentlyAt: ${Math.round(currentlyAt)}px | scrollFactor: ${scrollFactor}`)
}


// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
// shift: 16
var keys = { 32: 1, 38: 1, 40: 1 };

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