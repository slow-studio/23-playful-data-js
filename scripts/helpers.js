/** return a random number that is close (but deviates ± by a small %) to the reference number 
 * @param {number} n - reference number
 * @param {number} [p=20] - deviation %. (eg. for 10% deviation, p = 10). default = 20% deviation.
*/
export function approx(n, p) {
    const maxDeviation = n * (p / 100)
    const randomDeviation = Math.random() * maxDeviation
    if (Math.random() < .5)
        return n + randomDeviation
    else
        return n - randomDeviation
}

/**
 * map a value from one range to another
 * @returns {number}
 * @param {number} value1 - value within source range
 * @param {number} min1 - lower limit in source range 
 * @param {number} max1 - upper limit in source range
 * @param {number} min2 - lower limit of destination range
 * @param {number} max2 - upper limit of destination range
 * @param {boolean} [clamp=false] 
 */
export function map(value1, min1, max1, min2, max2, clamp) {
    if(min1==max1) {
        console.log(`the source range is invalid. (min and max values in the range must not be equal.) returning unchanged value.`)
        return value1
    }
    const gradient = (max2-min2) / (max1-min1)
    let value2 = min2 + ((value1 - min1) * gradient)
    if (clamp==true) {
        if(value2>=max2) value2 = max2
        if(value2<=min2) value2 = min2
    }
    return value2
}
// console.log(map(5,0,10,-1,-.9))

/** 
 * fetch the value of a property in the stylesheet 
 * @param {'root' | HTMLElement} element
 * @param {string} property
 * @returns {string}
 * |  
 * example: getStyleProperty(document.getElementById('container'), 'padding-right')
 */
export function getStyleProperty(element, property) {
    if (element == 'root')
        element = document.documentElement
    if(property.slice(0,3)=='var') { 
        property = property.slice(property.indexOf("(")+1,property.indexOf(")"))
    }
    let val = window.getComputedStyle(element).getPropertyValue(property).trim()
    if(!val) console.log(`property "${property}" not found in css style definitions for element "${element}"`)
    return val
    /* note: trim() was used because: https://stackoverflow.com/questions/41725725/access-css-variable-from-javascript#comment107745427_41725782 */
}
/**
 * fetch the value of a property (from the :root element) in the stylesheet 
 * @param {string} property 
 * @returns {string}
 * |  
 * example: getStylePropertyFromRoot('--fire')
 */
export function getStylePropertyFromRoot(property) {
    return getStyleProperty('root', property)
}

/**
 * @param {string} c - HSL colour
 * @param {number} rhby - randomise H by this much % [range: 0-100]
 * @param {number} rlby - randomise L by this much % [range: 0-100]
 * @param {boolean} [blocker=false] - blocks this function from randomising the colour
 * @returns {string}
 * |  
 * examples: 
 * - randomiseHSLColour('hsl(16, 57%, 50%)', 15, 30)
 * - randomiseHSLColour('--fire', 15, 30)
 * - randomiseHSLColour('var(--fire)', 15, 30)
 */
export function randomiseHSLColour(c, rhby, rlby, blocker) {
    if (c.slice(0, 3) == 'var') {
        c = c.slice(c.indexOf("(") + 1, c.indexOf(")"))
    }
    if (c.slice(0, 2) == '--') {
        c = getStylePropertyFromRoot(`var(${c})`)
    }
    let hsl = c.split(",")
    if (hsl[0].split("(")[0] != "hsl") {
        console.log(`supplied colour "${c}" is not in HSL format. so, randomiseHSLColour() can not randomise colour. so: returning colour {string} as-is: ${c}.`)
        return c
    }
    let h = Number(hsl[0].split("(")[1])
    h = blocker ? h : approx(h, rhby); if (h <= 0 || h >= 360) h = 0; h = Math.floor(h);
    let s = Number(hsl[1].split("%")[0].trim())
    let l = Number(hsl[2].split("%")[0].trim())
    l = blocker ? l : approx(l, rlby); if (l <= 0) l = 0; if (l >= 100) l = 100; l = Math.floor(l);
    return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * @param {string} start - colour to start with, in hsl() format
 * @param {string} end - colour to end at, in hsl() format
 * @param {number} totalSteps - total number of steps
 * @param {number} currentStep - current step (to calculate colour at)
 * @param {number} [factorForH=1]
 * @param {number} [factorForS=1]
 * @param {number} [factorForL=1] 
 * @returns {string}
 */
export function interpolateHSLColour(start, end, totalSteps, currentStep, factorForH,factorForS, factorForL) {
    /** @param {string} c */
    function splitHSL(c) {
        const hsl = c.split(",")
        let h = Number(hsl[0].split("(")[1])
        if(h<=0 || h>=360) h=0 ; h = Math.floor(h);
        let s = Number(hsl[1].split("%")[0].trim())
        let l = Number(hsl[2].split("%")[0].trim())
        if(l<=0) l=0 ; if(l>=100) l=100 ; l = Math.floor(l);
        return {H: h, S: s, L: l}
    }
    const h = splitHSL(start).H + ((splitHSL(end).H - splitHSL(start).H) * Math.pow(currentStep / totalSteps, factorForH))
    const s = splitHSL(start).S + ((splitHSL(end).S - splitHSL(start).S) * Math.pow(currentStep / totalSteps, factorForS))
    const l = splitHSL(start).L + ((splitHSL(end).L - splitHSL(start).L) * Math.pow(currentStep / totalSteps, factorForL))
    return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * update an element's style
 * @param {'root' | HTMLElement} e - element
 * @param {string} p - parameter 
 * @param {string} v - value
 */
export function updateStyle(e, p, v) {
    if (e == 'root') e = document.documentElement
    return e.style.setProperty(p, v)
}
