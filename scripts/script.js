/*  ------------------------------------------------------------
    helpers
    ------------------------------------------------------------  */

/**
 * helpful links:
 *  - to check browser support tables on mobile web browsers, go to: https://caniuse.com/.
 *  - to change cursor's appearance, by using an SVG:
 *      - info: https://stackoverflow.com/a/45966695
 *      - helper tool: https://yoksel.github.io/url-encoder/ or https://svgwiz.com/
 */

/** cheat code helpers */
let pauseForestUpdate = false

/**
 * cheat codes
 * @param {KeyboardEvent} e 
 */
function cheatcodes(e) {
  let key = e.key;
  console.log(`the ${key}-key was pressed on the keyboard.`)
  switch(key) {
    case ' ': 
        pauseForestUpdate = !pauseForestUpdate
        // offer visual feedback:
        if(pauseForestUpdate) updateStyle(document.body,"background-color","var(--body-bg-colour-paused)") 
        else updateStyle(document.body,"background-color","var(--body-bg-colour-running)") 
        // write to console:
        console.log(`pause forestUpdate: ${pauseForestUpdate}`)
        break;
    case 'b': 
        goodnews = !goodnews
        console.log(`show #newsBox.`)
        changeNews(newsBox,goodnews)
        showBox(newsBox, false, false)
        break;
    case 'B': 
        console.log(`hide #newsBox.`)
        hideBox(newsBox, false)
        break;
  }
}

const refreshRate = 10 // fps
const refreshTime = 1000 / refreshRate // time in millisecond

/** @type {number} duration for which a protected tree stays protected */
const protectionDuration = 7500 // time in millisecond

/** @type {number} maximum number of trees to draw. (we can keep this number arbitarily large.) */
const TREELIMIT = 2500;

/** @type {number} counts total number of trees (by incrementing its value each time a tree is spawned) */
var totalTreesInForest = 0;

/** @type {*} an array. stores one object (each) for every tree. the object contains all info/settings for that tree. */
const tree = []

/** return a random number that is close (but deviates ± by a small %) to the reference number 
 * @param {number} n - reference number
 * @param {number} [p=20] - deviation %. (eg. for 10% deviation, p = 10). default = 20% deviation.
*/
function approx(n, p) {
    const maxDeviation = n * (p / 100)
    const randomDeviation = Math.random() * maxDeviation
    if (Math.random() < .5)
        return n + randomDeviation
    else
        return n - randomDeviation
}

/** 
 * fetch the value of a property in the stylesheet 
 * @param {*} element
 * @param {string} property
 * @returns {string}
 * |  
 * example: getStyleProperty(document.getElementById('container'), 'padding-right')
 */
function getStyleProperty(element, property) {
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
function getStylePropertyFromRoot(property) {
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
function randomiseHSLColour(c, rhby, rlby, blocker) {
    if(c.slice(0,3)=='var') {
        if(blocker) return c
        c = c.slice(c.indexOf("(")+1,c.indexOf(")"))
    }
    if(c.slice(0,2)=='--') {
        if(blocker) return `var(${c})`
        c = getStylePropertyFromRoot(`var(${c})`)
    }
    if(blocker) return c
    let hsl = c.split(",")
    if(hsl[0].split("(")[0]!="hsl") {
        console.log(`supplied colour "${c}" is not in HSL format. so, randomiseHSLColour() can not randomise colour. so: returning colour {string} as-is: ${c}.`)
        return c
    }
    let h = Number(hsl[0].split("(")[1])
    h = approx(h, rhby) ; if(h<=0 || h>=360) h=0 ; h = Math.floor(h);
    let s = Number(hsl[1].split("%")[0].trim())
    let l = Number(hsl[2].split("%")[0].trim())
    l = approx(l, rlby) ; if(l<=0) l=0 ; if(l>=100) l=100 ; l = Math.floor(l);
    return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * update an element's style
 * @param {*} e - element
 * @param {string} p - parameter 
 * @param {string|number} v - value
 */
function updateStyle(e, p, v) {
    if (e == 'root') e = document.documentElement
    return e.style.setProperty(p, v)
}

/** make fires crackle */
const fireCrackleTime = 600
setInterval(function () {
    /** @type {any} */
    let fires = document.getElementsByClassName("fire")
    for (let i = 0; i < fires.length; i++) {
        if (fires[i]) {
            fires[i].style.fill = randomiseHSLColour('--firedarker', 0, 5),
            // console.log("fire gets darker")
            setTimeout(function () {
                if (fires[i]) {
                    fires[i].style.fill = randomiseHSLColour('--fire', 0, 5)
                    // console.log("fire gets less dark") 
                }
            }, approx(fireCrackleTime, 50));
        }
    }
}, fireCrackleTime);

/**
 * randomly convert some "normal" trees to their "dry" state
 * @param {number} [n=1] - number of trees to seed
 */
function seedDryTrees(n) {

    /* if there's at-least 1 "normal"/"protected" tree in the forest... */
    let healthyTrees = document.getElementsByClassName("normal").length + document.getElementsByClassName("protected").length
    if (healthyTrees > 0) {
        
        /* ...then, select a random "normal"/"protected" tree to turn "dry". */
        
        // keep n within sensible bounds
        if (n >= healthyTrees) n = Math.floor(Math.random() * healthyTrees)
        if (n <= 1) n = 1

        console.log("trying to seed " + n + " dry trees")

        // fraction of trees to turn from normal/protected to dry
        let fr = n / healthyTrees
        
        // collect all healthy trees (svg elements)
        let allhealthytrees = []
        let allnormaltrees = document.getElementsByClassName("normal"), 
            allprotectedtrees = document.getElementsByClassName("protected") // HTMLCollection
        let arrayofallnormaltrees = Array.from(allnormaltrees),
            arrayofallprotectedtrees = Array.from(allprotectedtrees) // convert HTMLCollection to Array
        allhealthytrees.push(...Array.from(arrayofallnormaltrees))
        allhealthytrees.push(...Array.from(arrayofallprotectedtrees))
        
        // a counter which will track how many trees we do make dry
        let conversioncounter = 0;

        // for each healthy tree, decide whether it turns dry
        for(let i=0 ; i<allhealthytrees.length ; i++) {
            if(conversioncounter<n) {
                if(Math.random()<fr) {
                    updateTree(allhealthytrees[i], "dry")
                    conversioncounter++
                }
            }
            else break;
        }

        // if no trees were converted, forcibly convert one
        if(conversioncounter==0) {
            console.log(`forcibly seeding one tree.`)
            let randomtreeindex = Math.floor(Math.random()*allhealthytrees.length)
            updateTree(allhealthytrees[randomtreeindex], "dry")
        }

        console.log(`successfully seeded ${Math.max(Math.min(n,conversioncounter),1)} dry trees.`)
    }
}

/**
 * tree changes as instructed
 * @typedef {Object} TreeChangeSettings
 * @property {object} shape
 * @property {string|boolean} [shape.foliage=false] 
 * @property {string|boolean} [shape.stump=false] 
 * @property {string|boolean} [shape.fire=false] 
 * @property {string|boolean} [shape.burned=false] 
 * @property {object} colour
 * @property {string|boolean} [colour.outline=false] 
 * @property {string|boolean} [colour.foliage=false] 
 * @property {string|boolean} [colour.stump=false] 
 * @property {string|boolean} [colour.fire=false] 
 * @property {string|boolean} [colour.burned=false] 
 */
/**
 * @param {*} svgelement 
 * @param {string} state - the state of the tree
 */
function updateTree(svgelement, state) {

    // helper variables
    const id = Number(svgelement.parentNode.id.substring("tree-".length, svgelement.parentNode.id.length))
    const foliages = svgelement.getElementsByClassName('foliage')
    const wood = svgelement.getElementsByClassName('stump')
    const fires = svgelement.getElementsByClassName('fire')
    const burnedses = svgelement.getElementsByClassName('burned')

    if (tree[id].stateSettings.protected.isProtected == true) {
        // if the tree is protected, we can do nothing
    } else {
        /* tree memorises its present state */
        tree[id].state.previous = tree[id].state.now
        tree[id].shape.foliage.previous = tree[id].shape.foliage.now
        tree[id].shape.stump.previous = tree[id].shape.stump.now
        tree[id].shape.fire.previous = tree[id].shape.fire.now
        tree[id].shape.burned.previous = tree[id].shape.burned.now
        tree[id].colour.outline.previous = tree[id].colour.outline.now
        tree[id].colour.foliage.previous = tree[id].colour.foliage.now
        tree[id].colour.stump.previous = tree[id].colour.stump.now
        tree[id].colour.fire.previous = tree[id].colour.fire.now
        tree[id].colour.burned.previous = tree[id].colour.burned.now

        /* tree decides what its new appearance will be */
        tree[id].state.now = state
        // console.log(`updateTree # ${id}: ${tree[id].state.previous} -> ${tree[id].state.now}`)
        const classes = svgelement.classList
        for (let i = 0; i < classes.length; i++) {
            svgelement.classList.remove(classes[i])
        }
        svgelement.classList.add(tree[id].state.now)
        const settings = tree[id].stateSettings[state]
        tree[id].shape.foliage.now = settings.shape.foliage
        tree[id].shape.stump.now = settings.shape.stump
        tree[id].shape.fire.now = settings.shape.fire 
        tree[id].shape.burned.now = settings.shape.burned 
        tree[id].colour.outline.now = settings.colour.outline 
        tree[id].colour.foliage.now = settings.colour.foliage 
        tree[id].colour.stump.now = settings.colour.stump 
        tree[id].colour.fire.now = settings.colour.fire 
        tree[id].colour.burned.now = settings.colour.burned 

        // console.log("change t# " + id)
        // console.log(tree[id])

        /* tree changes appearance: */
        // -- 1. it updates its svg shape
        svgelement.innerHTML =
            tree[id].shape.foliage.now
            + tree[id].shape.stump.now
            + tree[id].shape.fire.now
            + tree[id].shape.burned.now
        // -- 2. it sets the colour for those svg-shapes
        for (const p of foliages) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.foliage.now
        }
        for (const p of wood) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.stump.now
        }
        for (const p of fires) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.fire.now
        }
        for (const p of burnedses) {
            p.style.stroke = tree[id].colour.outline.now
            p.style.fill = tree[id].colour.burned.now
        }
        // -- 3. sound feedback:
        //      -- tree catches fire (i.e., was not burning before, but is now)
        if (tree[id].state.previous != "burning" && tree[id].state.now == "burning") {
            playSound(sCatchFire, volumeScaler.sCatchFire)
        }

        /*  state-specific behaviour:
            if the tree just got protected...
            */
        if (tree[id].state.previous != "protected" && tree[id].state.now == "protected") {
            tree[id].stateSettings.protected.isProtected = true
            // remains protected for 'protectionDuration' time
            setTimeout(function () {
                // console.log(`protected tree-${id} is preparing to become "normal" (automatically).\n(protectionDuration: ${protectionDuration}ms)\nchecking status...\nisProtected: ${tree[id].stateSettings.protected.isProtected}`)
                if (tree[id].stateSettings.protected.isProtected = true) {
                    tree[id].stateSettings.protected.isProtected = false
                    // console.log(`protected tree-${id} is now ready to become "normal" (automatically).\nupdating status...\nisProtected: ${tree[id].stateSettings.protected.isProtected}`)
                    updateTree(svgelement, "normal")
                }
            }, approx(protectionDuration, 20))
        }
    }

    // let protecteds = document.getElementsByClassName("protected")

    // just to be extra careful...
    if (tree[id].state.now != "protected") {
        tree[id].stateSettings.protected.isProtected = false
    }
}

/*  ------------------------------------------------------------
    sound
    ------------------------------------------------------------  */

const soundsrc = "assets/sound/"
let sCatchFire = new Audio(soundsrc + 'catchfire.mp3');
let sGoodNews = new Audio(soundsrc + 'twinkle.mp3');
let sBurning = new Audio(soundsrc + 'ambient-burning.mp3');
let sForest = new Audio(soundsrc + 'ambient-forest.mp3');
let sEagle = new Audio(soundsrc + 'eagle.mp3');

const volumeScaler = {
    sCatchFire: .03125,
    sGoodNews: .03125,
    sBurning: 1,
    sForest: .25,
    sEagle: .125
}

// count the number of trees in any particular state
/** @param {string} state */
function percentageOfTrees(state) {
    let trees = document.getElementsByClassName(state)
    return Number(trees.length / totalTreesInForest)
}

/**
 * even if the sound is currently playing, stop it and play it again.
 * @param {*} sound 
 * @param {number} [volume=1] 
 */
function forcePlaySound(sound, volume) {
    sound.currentTime = 0
    playSound(sound, volume)
}

/**
 * @param {*} sound 
 * @param {number} [volume=1] 
 */
function playSound(sound, volume) {
    // if(sound.ended) {
    // sound.currentTime = 0
    sound.volume = volume
    sound.play()
    // }
}

/*  ------------------------------------------------------------
    newsBox
    ------------------------------------------------------------  */

const headlines = {
    good: [
        /**
         * note: generated by openai's chatgpt in 202311
         * prompt ~ 
         * news headlines describing human activities that are helpful for the environment and mitigate climate change (5–12 words in length). with each "headline", add a longer "byline" (which is 90–120 words long), that better explains the activity; it can also include names of ministers, companies, organisations; it can also refer to specific regions or countries in the world. in the byline, try to include some statistics about the issue being described. also: for each item, please include a "source", which is a name of a newspaper, journal, or publication. also include an "author", which can be the name of a single person, or multiple (2–3) people. and, finally, include a "date" which comprises a month and a date (but do not specify a year). an example of the typical date format is "Sep 17".
         */
        {
            "headline": "Solar Revolution Powers India's Green Future",
            "byline": "India's Ministry of New and Renewable Energy, in collaboration with leading solar companies, has installed over 35 gigawatts of solar capacity across the nation. This ambitious initiative aims to reduce greenhouse gas emissions by 30% in 10 years, helping combat climate change. The solar industry now employs over 300,000 people, providing a substantial boost to the economy while contributing to India's commitment to cleaner energy sources. This transition to solar power has already saved the country 55 million tons of CO2 emissions annually, making it a crucial step in India's commitment to environmental sustainability and a greener future.",
            "source": "The Times of Bharat",
            "author": "Priya Sharma",
            "date": "Mar 15"
        },
        {
            "headline": "Urban Forests Thrive: London Plants One Million Trees",
            "byline": "London's Mayor, Boris Khan, has launched a city-wide initiative to plant one million trees within 5 years. These trees will capture an estimated 2,500 tons of CO2 annually and enhance urban biodiversity. The effort involves community engagement, schools, and partnerships with environmental organizations, demonstrating that cities can be part of the solution to climate change. London's urban forest initiative, which has already planted 500,000 trees, is expected to reduce the city's annual CO2 emissions by an impressive 150,000 tons, providing a greener and healthier future for its residents.",
            "source": "The British Guardian",
            "author": "John Smith and Emma Wilson",
            "date": "Apr 22"
        },
        {
            "headline": "Electric Car Sales Soar, Norway Leads the Charge",
            "byline": "Norway has become a global leader in electric vehicle adoption, with 85% of new car sales being electric or hybrid vehicles. Government incentives, including tax breaks and toll exemptions, have encouraged this shift, reducing carbon emissions and air pollution. As a result, Norway's CO2 emissions from the transportation sector have significantly decreased. This transition to electric cars has led to a remarkable 40% reduction in urban air pollution levels, contributing to better public health and quality of life.",
            "source": "Energy Watch",
            "author": "Maria Andersen",
            "date": "Jul 9"
        },
        {
            "headline": "Plastic Waste Declines as Global Cleanup Campaign Gains Traction",
            "byline": "Environmental organizations and companies worldwide have organized massive cleanup efforts, removing millions of tons of plastic waste from oceans and coastlines. The United Nations reports a 30% reduction in ocean plastic pollution, highlighting the success of these campaigns. This collective action has contributed to the protection of marine ecosystems and mitigated climate change impacts. The reduction in ocean plastic pollution has led to a 15% decrease in harm to marine wildlife, preserving fragile ecosystems and ensuring a healthier planet.",
            "source": "International Geographic",
            "author": "David Wilson",
            "date": "Oct 4"
        },
        {
            "headline": "Reforestation Boom in Brazil's Amazon Rainforest",
            "byline": "Brazil's government, in partnership with international conservation organizations, is investing in large-scale reforestation projects in the Amazon. They aim to restore 100 million acres of rainforest in 10 years, with a focus on preserving biodiversity and absorbing CO2. This effort is critical in combating deforestation and safeguarding the planet's vital carbon sinks. Reforestation in the Amazon is already showing results, with a 25% reduction in deforestation rates and the preservation of countless species in one of the world's most biodiverse regions.",
            "source": "BARC News",
            "author": "Maria Santos and Juan Hernandez",
            "date": "Nov 20"
        },
        {
            "headline": "Renewable Energy Surpasses Fossil Fuels in Germany",
            "byline": "Germany has reached a milestone in its transition to clean energy. Renewable energy sources, including wind and solar, now produce more electricity than fossil fuels. This shift has significantly reduced carbon emissions and is a major step towards Germany's goal of becoming carbon-neutral within 25 years. With renewable energy contributing to 52% of the country's electricity supply, Germany sets an example for a sustainable energy future.",
            "source": "Der Spiel",
            "author": "Hans Müller",
            "date": "May 8"
        },
        {
            "headline": "China's Green Belt Initiative Aims to Combat Desertification",
            "byline": "China's Ministry of Ecology and Environment is leading a nationwide effort to combat desertification through its Green Belt initiative. By planting trees and vegetation in arid regions, the program aims to restore 50 million acres of land in 10 years, reducing soil erosion and sequestering carbon. This initiative is crucial in the fight against desertification and its adverse effects on climate and agriculture.",
            "source": "Southern Chinese Morning Post",
            "author": "Li Wei",
            "date": "Jun 14"
        },
        {
            "headline": "Netherlands Invests in Coastal Protection to Counter Rising Sea Levels",
            "byline": "The Netherlands is implementing an extensive coastal protection plan to adapt to rising sea levels. Investments in dikes, storm surge barriers, and beach nourishment aim to safeguard the low-lying country from the threats of climate change. These measures are part of the Dutch Delta Program, which is considered one of the world's most comprehensive strategies to address sea level rise and protect coastal communities.",
            "source": "Scandinavian News Network",
            "author": "Sophie van der Meer",
            "date": "Aug 30"
        },
        {
            "headline": "Australia's Great Barrier Reef Shows Signs of Recovery",
            "byline": "Efforts to protect and restore Australia's Great Barrier Reef are showing progress. Coral restoration projects and reductions in pollution have led to an increase in coral cover. While challenges persist, including climate change impacts, these conservation initiatives provide hope for the world's largest coral reef system and the diverse marine life it supports.",
            "source": "The Sydney Morning Owl",
            "author": "James Cooper",
            "date": "Sep 12"
        },
        {
            "headline": "Kenya's Reforestation Efforts Combat Deforestation and Boost Economy",
            "byline": "Kenya's government, in partnership with organizations and local communities, is planting millions of trees to combat deforestation and promote sustainable forestry. The initiative has led to increased forest cover, reduced soil erosion, and the creation of jobs in the forestry sector. In 10 years, Kenya aims to restore 5.1 million acres of degraded land and enhance its natural carbon sequestration capacity.",
            "source": "Press Office, UNAfrica",
            "author": "Alice Mwangi",
            "date": "Jul 27"
        },
        {
            "headline": "Green Buildings on the Rise Worldwide",
            "byline": "The construction industry is increasingly adopting sustainable building practices, with a growing number of green buildings and eco-friendly construction materials. This trend is reducing the carbon footprint of the built environment and improving energy efficiency. Green buildings not only help mitigate climate change but also offer cost savings and enhanced quality of life for occupants.",
            "source": "Green Architectural Digest",
            "author": "Michael Chen",
            "date": "Apr 5"
        },
        {
            "headline": "Sweden's Carbon Tax Encourages Emissions Reduction",
            "byline": "Sweden's carbon tax, introduced in the early 1990s, has played a significant role in curbing greenhouse gas emissions. The tax incentivizes businesses and individuals to reduce their carbon footprint by taxing emissions from fossil fuels. This policy has led to a substantial decrease in emissions and demonstrates the potential of carbon pricing as a tool to combat climate change.",
            "source": "Swedish Fika Times",
            "author": "Eva Eriksson",
            "date": "Oct 19"
        },
        {
            "headline": "Eco-Friendly Agriculture Practices Flourish in India",
            "byline": "Indian farmers are embracing eco-friendly agriculture practices, including organic farming and sustainable crop rotation. These methods reduce the use of chemical pesticides and fertilizers, preserving soil health and biodiversity. Such practices contribute to mitigating the environmental impact of agriculture while promoting food security and sustainability.",
            "source": "The Non-Fascist Hindu",
            "author": "Rajesh Patel",
            "date": "Feb 11"
        },
        {
            "headline": "Costa Rica Achieves Carbon Neutrality and Sets New Goals",
            "byline": "Costa Rica has become one of the first countries to achieve carbon neutrality. This accomplishment was reached through a combination of renewable energy sources, reforestation efforts, and sustainable land use practices. The country's commitment to sustainability is evident in its plans to become fully fossil fuel-free and achieve even greater carbon neutrality in the coming years.",
            "source": "CR Times",
            "author": "Ana Rodriguez",
            "date": "Nov 7"
        },
        {
            "headline": "Innovative Water Recycling Solutions Combat Drought in California",
            "byline": "California is tackling water scarcity and drought with innovative water recycling technologies. These systems purify wastewater to make it safe for drinking and irrigation, reducing the strain on traditional water sources. As California faces increasingly severe droughts due to climate change, these solutions are crucial for ensuring water sustainability in the state.",
            "source": "The Greater Floridian Times",
            "author": "Daniel Martinez",
            "date": "Jun 3"
        },
        {
            "headline": "Green Transportation Initiatives Transform New York City",
            "byline": "New York City is undergoing a green transportation revolution, with expanded bike lanes, electric buses, and incentives for carpooling. These initiatives are reducing congestion, air pollution, and greenhouse gas emissions. New York City aims to create a more sustainable and accessible urban environment while mitigating the impacts of climate change.",
            "source": "The NNY Times",
            "author": "Jennifer Lee",
            "date": "Aug 9"
        },
        {
            "headline": "Indonesia's Mangrove Reforestation Fights Coastal Erosion",
            "byline": "Indonesia is investing in mangrove reforestation to combat coastal erosion and protect communities from rising sea levels. Mangrove forests act as natural buffers, absorbing wave energy and reducing the impact of storms. This effort not only helps mitigate climate change but also safeguards the livelihoods of coastal residents.",
            "source": "Djakarta News Network",
            "author": "Rizki Pratama",
            "date": "Sep 28"
        },
        {
            "headline": "South Africa's Renewable Energy Boom Reduces Coal Dependency",
            "byline": "South Africa is experiencing a renewable energy boom, with significant investments in wind and solar power. This transition reduces the country's dependency on coal and decreases carbon emissions. South Africa's commitment to green energy aligns with global efforts to combat climate change and transition to cleaner energy sources.",
            "source": "The Times of South African",
            "author": "Lungelo Nkosi",
            "date": "Jul 17"
        },
        {
            "headline": "Ecuador's Yasuni-ITT Initiative Protects Amazon Rainforest",
            "byline": "Ecuador's Yasuni-ITT initiative pledges to keep oil reserves beneath the Amazon rainforest untapped, protecting one of the world's most biodiverse regions. This initiative aims to reduce carbon emissions by preserving the rainforest and preventing deforestation. By doing so, Ecuador contributes to global climate change mitigation and sets an example for conservation efforts worldwide.",
            "source": "The Ecuadorian Times",
            "author": "Carlos Lopez",
            "date": "Dec 2"
        },
        {
            "headline": "Efforts to Reduce Food Waste Gain Momentum Worldwide",
            "byline": "Efforts to reduce food waste are gaining momentum globally, with governments, businesses, and individuals taking action to prevent food loss. Reducing food waste not only conserves resources and reduces methane emissions from landfills but also addresses food insecurity and contributes to sustainability.",
            "source": "World Foods Journal",
            "author": "Lucia Rodriguez",
            "date": "Mar 19"
        },
        {
            "headline": "Japan's Green Roofs Initiative Enhances Urban Biodiversity",
            "byline": "Japan's green roofs initiative promotes the installation of vegetation on rooftops, enhancing urban biodiversity and mitigating the urban heat island effect. These green roofs improve air quality, reduce energy consumption, and provide habitat for wildlife. Japan's efforts in urban greening align with global goals to create more sustainable cities.",
            "source": "So-so Tokyo",
            "author": "Yuki Nakamura",
            "date": "Jun 27"
        },
        {
            "headline": "Clean Energy Transforms Portugal into a Renewable Powerhouse",
            "byline": "Portugal has become a renewable energy powerhouse, with over 50% of its electricity coming from wind, solar, and hydropower. This transition has significantly reduced carbon emissions and made Portugal a leader in clean energy production. The country's efforts to transition to green energy are instrumental in mitigating climate change.",
            "source": "Portuguese e-Gazette",
            "author": "Carlos Silva",
            "date": "Oct 14"
        },
        {
            "headline": "Green Technology Spurs Sustainable Farming in the Netherlands",
            "byline": "The Netherlands is embracing green technology in agriculture, using precision farming, drones, and sustainable practices. These innovations reduce the environmental impact of farming, lower pesticide use, and enhance crop yields. The Netherlands sets an example for sustainable agriculture practices and climate-conscious farming.",
            "source": "Dutch Agriculturalists Today",
            "author": "Marta van den Berg",
            "date": "Apr 30"
        },
        {
            "headline": "Chile's Protected Marine Areas Preserve Ocean Ecosystems",
            "byline": "Chile is expanding its network of protected marine areas to safeguard ocean ecosystems and combat overfishing. These conservation efforts help maintain biodiversity and mitigate climate change by protecting vital marine habitats. Chile's commitment to marine preservation is vital for the health of the world's oceans.",
            "source": "Associated Press Chile",
            "author": "Diego Rodriguez",
            "date": "Aug 16"
        }
    ],
    bad: [
        /** 
         * note: generated by openai's chatgpt in 202311
         * prompt ~ 
         * news headlines describing human activities that are ultimately harmful for the environment and cause climate change. with a longer byline for each headline, that better explains the issue (and can also includes names of ministers, companies, organisations). try to include some statistics about the issue being described. also: for each item, please include a "source", which is a name of a newspaper, journal, or publication. also include an "author", which can be the name of a single person, or multiple (2–3) people.
        */
        {
            "headline": "Brazil's Deforestation Spurs Climate Crisis",
            "byline": "Rising deforestation rates in the Amazon, led by Environment Minister Carlos Silva, have resulted in a concerning 30% increase in greenhouse gas emissions. Environmental organizations like GreenWatch urge Brazil to take immediate action to combat climate change, as the country's deforestation is contributing to the loss of 50,000 square kilometers of forest each year.",
            "source": "EcoWorld News",
            "author": "Maria Santos",
            "date": "Jul 10"
        },
        {
            "headline": "Caribbean Plastics Imperil Marine Life and Climate",
            "byline": "The plastic waste crisis engulfs the Caribbean as islands grapple with 8 million tons of plastic pollution yearly. Oceanographer Dr. Maria Rodriguez warns that this environmental disaster not only threatens marine life but also contributes to the region's escalating climate issues. Approximately 1,000 marine species are affected, and the plastic pollution contributes to a 1.5% annual increase in the Caribbean's sea surface temperature.",
            "source": "Oceanic Observer",
            "author": "John Martinez",
            "date": "Sep 18"
        },
        {
            "headline": "Southeast Asia's Rapid Urban Growth Intensifies Climate Challenges",
            "byline": "In the face of unprecedented urban expansion, cities in Southeast Asia are grappling with the consequences. Climate experts, like Professor James Chen, highlight how the region's urban sprawl leads to habitat fragmentation, increased energy consumption, and heightened climate challenges. With urban populations set to reach 455 million in 10 years, this rapid growth results in a 35% increase in carbon emissions.",
            "source": "Urban Insights",
            "author": "Lisa Chang",
            "date": "Mar 5"
        },
        {
            "headline": "Emissions Surge Tied to Unregulated Chinese Industries",
            "byline": "A recent study, led by climate scientist Dr. Li Wei, reveals the alarming role of unregulated industries in China. These sectors have contributed to a sharp rise in global emissions, accounting for 30% of the world's carbon footprint. Calls for international cooperation to mitigate climate change intensify. China's unregulated industries are responsible for a 40% increase in CO2 emissions in the past 15 years.",
            "source": "Climate Impact Journal",
            "author": "David Wang and Emily Liu",
            "date": "Nov 14"
        },
        {
            "headline": "Global Meat Supply Chain Linked to Methane Emissions",
            "byline": "The global meat supply chain, controlled by fast-food giants like BurgerDeluxe, is under scrutiny as methane emissions from cattle rearing reach concerning levels. Environmentalists and experts, including Sarah Anderson, warn that these emissions are a significant contributor to climate change, demanding a reevaluation of food production practices. The meat industry alone is responsible for 14.5% of global greenhouse gas emissions.",
            "source": "Sustainable Living Gazette",
            "author": "Sophia Reynolds",
            "date": "Jun 27"
        },
        {
            "headline": "Indonesia's Forest Fires Stoke Climate Crisis",
            "byline": "Annual forest fires in Indonesia, worsened by palm oil companies, release staggering amounts of carbon dioxide. Dr. Adi Kusumo, a leading environmental scientist, asserts that urgent action is needed to protect both the country's rich biodiversity and global climate stability. Indonesia's forest fires contribute to 1.8 gigatons of CO2 emissions annually.",
            "source": "Environmental Pulse",
            "author": "Liam Brown",
            "date": "Oct 8"
        },
        {
            "headline": "Plastic Pollution in Southeast Asian Rivers Amplifies Climate Concerns",
            "byline": "Southeast Asia grapples with plastic waste suffocating its rivers, with a shocking 80% originating from corporations like PlastiCorp. Environmental advocates, including Dr. Priya Sharma, raise alarms as this plastic onslaught negatively impacts ecosystems and climate change. It's estimated that over 3 million metric tons of plastic are dumped into Southeast Asian waters each year.",
            "source": "EcoWatch Asia",
            "author": "Anna Nguyen and Daniel Smith",
            "date": "Apr 19"
        },
        {
            "headline": "African Mining Boom Fuels Carbon Emissions Crisis",
            "byline": "The mining industry's rapid expansion across Africa, supported by major players like GoldEx, contributes to an alarming surge in carbon emissions. Climate researchers, including Professor Mohammed Diop, emphasize the urgent need to address this growing environmental threat. The mining sector in Africa has witnessed a 20% increase in emissions in the last decade.",
            "source": "African Environmental Review",
            "author": "Kwame Nkrumah",
            "date": "Jul 12"
        },
        {
            "headline": "European Aviation's Carbon Footprint Soars Amidst Low-Cost Travel Boom",
            "byline": "Low-cost airlines, including FlyGreen, drive a dramatic rise in Europe's aviation carbon emissions. Experts like Dr. Elena Petrov highlight the connection between affordable air travel and increased climate impact, urging airlines to adopt greener practices. The aviation industry accounts for 2.5% of global carbon emissions, and Europe's low-cost carriers are among the fastest-growing contributors.",
            "source": "Air Travel Insights",
            "author": "Sophie Brown",
            "date": "Feb 4"
        },
        {
            "headline": "Overfishing in the North Atlantic Threatens Ecosystems and Climate Stability",
            "byline": "The North Atlantic faces a severe overfishing crisis, with fisheries driven by corporations like SeaHarvest. Marine biologists, such as Dr. Maria Vargas, stress the repercussions on marine ecosystems and the broader impact on climate change. Overfishing has led to a 30% decline in North Atlantic fish populations in the past decade.",
            "source": "Marine Life Monitor",
            "author": "Mark Roberts",
            "date": "Sep 21"
        },
        {
            "headline": "Permafrost Thaw in Russia Accelerates Methane Release",
            "byline": "As Russia's permafrost continues to thaw due to warming temperatures, methane emissions surge, according to the findings of Dr. Ivan Petrov. This vicious cycle intensifies climate concerns, calling for immediate action to mitigate the consequences. The thawing permafrost releases over 2 million metric tons of methane annually.",
            "source": "Climate Science Digest",
            "author": "Olga Ivanova",
            "date": "May 15"
        },
        {
            "headline": "Mining in the Amazon Basin Spurs Mercury Pollution and Climate Impact",
            "byline": "Illegal gold mining operations in the Amazon Basin, linked to companies like GoldRush Ltd., have resulted in mercury pollution. Climate scientist Dr. Sofia Ramirez underscores how this toxic element amplifies environmental and climate crises. Mercury pollution from mining is responsible for a 10% increase in Amazonian water toxicity and a 5% rise in regional temperatures.",
            "source": "Rainforest Watch",
            "author": "Carlos Martinez",
            "date": "Nov 9"
        },
        {
            "headline": "Melting Glaciers in the Himalayas Trigger Water Scarcity and Climate Anxiety",
            "byline": "Himalayan glaciers are melting at an alarming rate, causing water scarcity in the region. Dr. Raj Patel, a glaciologist, warns that this alarming trend is not only a threat to the livelihoods of millions but also a contributor to global climate concerns. The melting glaciers result in a 20% reduction in freshwater availability in the Himalayan region.",
            "source": "Mountain Times",
            "author": "Nina Gupta",
            "date": "Apr 30"
        },
        {
            "headline": "South American Cattle Ranching Expands, Contributing to Methane Emissions",
            "byline": "The expansion of cattle ranching in South America, driven by meat industry giants like BeefWorld, leads to a surge in methane emissions. Environmentalists, including Maria Alvarez, emphasize the urgent need for sustainable farming practices. Methane emissions from cattle ranching contribute to a 15% increase in overall South American greenhouse gas emissions.",
            "source": "Agricultural Insight",
            "author": "Pedro Rodriguez",
            "date": "Jul 7"
        },
        {
            "headline": "Oil and Gas Extraction in the Arctic Amplifies Climate Crisis",
            "byline": "Arctic oil and gas extraction operations, led by companies like ArcticDrill Corp, escalate greenhouse gas emissions. Climate scientists, including Dr. Emma Larsson, stress the dire consequences of Arctic resource exploitation on global climate stability. Arctic oil and gas extraction is responsible for a 12% increase in overall global carbon emissions.",
            "source": "Polar Energy Review",
            "author": "Olivia White",
            "date": "Oct 11"
        },
        {
            "headline": "Coal Mining in India's Heartland Fuels Air Pollution and Climate Change",
            "byline": "Extensive coal mining in India's heartland, largely driven by companies such as CoalPower Ltd., results in severe air pollution and greenhouse gas emissions. Environmental advocates and health experts, including Dr. Anika Verma, call for cleaner energy alternatives. Coal mining in India contributes to a 7% rise in air pollution levels and a 6% increase in the country's greenhouse gas emissions.",
            "source": "Indian Environmental News",
            "author": "Rajesh Sharma and Priya Gupta",
            "date": "Mar 3"
        },
        {
            "headline": "Agricultural Intensive in the American Midwest Aggravates Climate Change",
            "byline": "Intensive agriculture in the American Midwest, under the influence of agribusiness giants like AgriCo, contributes to soil degradation and greenhouse gas emissions. Soil scientist Dr. Mark Thompson underscores the critical need for sustainable farming practices. The extensive agricultural activities in the American Midwest lead to a 10% decrease in soil quality and an 8% increase in regional greenhouse gas emissions.",
            "source": "Midwest Farming Gazette",
            "author": "Michael Johnson",
            "date": "Aug 20"
        },
        {
            "headline": "Illegal Wildlife Trade Across Southeast Asia Poses Threat to Biodiversity and Climate",
            "byline": "Illegal wildlife trade across Southeast Asia, aided by underground networks, threatens both biodiversity and global climate stability. Conservationist Dr. Leanne Nguyen highlights the profound ecological and climate impacts. The illegal wildlife trade leads to a 5% decrease in Southeast Asia's biodiversity and a 3% rise in wildlife-related carbon emissions.",
            "source": "Wildlife Watch Weekly",
            "author": "Emily Wilson and James Chen",
            "date": "Apr 2"
        },
        {
            "headline": "Australia's Expanding Coal Industry Sparks Climate Controversy",
            "byline": "Australia's coal industry expansion, supported by major companies like OzCoal Ltd., raises climate concerns. Environmentalists, including Dr. James Turner, argue that Australia's commitment to combating climate change is at odds with its coal exports. The expansion of Australia's coal industry contributes to a 10% increase in the country's carbon emissions and a 7% rise in global coal consumption.",
            "source": "Australian Climate Herald",
            "author": "Sophia Reynolds",
            "date": "Jun 29"
        },
        {
            "headline": "Microplastics in European Waterways Compound Marine Ecosystem Stress and Climate Impact",
            "byline": "The presence of microplastics in European waterways, largely attributed to industries like PlastiTech, deepens the stress on marine ecosystems and contributes to the climate crisis. Researchers, including Dr. Elena Petrov, emphasize the need for comprehensive solutions to tackle this issue. The microplastics in European waterways are responsible for a 5% increase in marine ecosystem stress and a 2% rise in regional temperatures.",
            "source": "Waterway Watch Europe",
            "author": "Lucas Martinez and Maria Andersen",
            "date": "Dec 13"
        }
    ]
};

/** @type {number} count the total number of times the newsBox has been shown so far */
let newsSeenCounter = 0

/** @type {HTMLElement} */
const newsBox = document.getElementById('newsBox')

/** @type {boolean} tracks whether the newsBox is displayed or not */
let newsBoxDisplayState = false
/** @type {boolean} tracks whether current headline was good (true) or bad (false) */
let goodnews = false

const newsBoxTransitionDuration = 600
const showBoxDelayDuration = 600
updateStyle(newsBox,"transition-duration",newsBoxTransitionDuration+'ms')

// sets the content and display-position of the newsBox at startup
changeNews(newsBox, false)
hideBox(newsBox, true)

/** @type {HTMLElement} */
const xNewsBox = document.getElementById('dismissNewsBoxIcon')
xNewsBox.addEventListener('click', function () {
    hideBox(newsBox, true)
})

/**
 * @param {*} box 
 * @param {boolean} [count=true] - increment newsSeenCounter?
 * @param {boolean} [wait=false] - defer showBox for a short duration?
 */
function showBox(box, count, wait) {
    newsBoxDisplayState = true // note: keep this statement outside the setTimeout(), to prevent showBox() from being called multiple times before the delayed actions (below) happen.
    setTimeout(function() {
        // sound:
        if(goodnews) forcePlaySound(sGoodNews, volumeScaler.sGoodNews) 
        else if(!goodnews) forcePlaySound(sCatchFire, volumeScaler.sCatchFire)
        // visual:
        box.style.top = `calc(-${window.innerHeight}px + 1rem)`
        box.style.height = `calc(${window.innerHeight}px - 2rem)`
    }, wait ? showBoxDelayDuration : 0)
    if(count) newsSeenCounter++
    // console.log(`newsSeenCounter: ${newsSeenCounter}`)
}

/**
 * @param {*} box 
 * @param {boolean} [seed=true] - seedDryTrees when box closes?
 */
function hideBox(box, seed) {
    newsBoxDisplayState = false
    box.style.top = "10vh"
    box.style.height = "0"
    if(seed) seedDryTrees(gameState.newsSeenCounter)
}

/**
 * @param {*} box
 * @param {boolean} goodnews - "true": show good news | "false": show bad news
 */
function changeNews(box, goodnews) {
    const newHeadline = fetchHeadline(goodnews)
    // console.log(`changing news headline to: ${content}`)
    box.getElementsByTagName("p")[0].innerHTML = newHeadline.headline
}

/** @returns {object} */
function fetchHeadline(goodnews) {
    const newstype = goodnews ? "good" : "bad"
    return headlines[newstype][Math.floor(headlines[newstype].length * Math.random())]
}

/*  ------------------------------------------------------------
    collect information before drawing tree
    ------------------------------------------------------------  */

const svgtree = {
    src: {
        starttag: '<svg width="100%" height="100%" viewBox="0 0 134 382" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">',
        foliage: [
            /* default */ '<path class="foliage" d="M40.695,345.956c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-95.673 21.939,-166.478c1.993,-14.2 14.902,-76.508 28.401,-76.508c13.498,0 19.325,56.249 27.506,126.547c6.551,56.295 16.154,87.73 16.154,116.124c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
            /* sway left */ '<path class="foliage" d="M40.695,345.956c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 12.002,-90.003 21.939,-160.808c1.993,-14.2 6.398,-82.178 19.897,-82.178c13.498,0 27.829,53.415 36.01,123.713c6.551,56.295 16.154,90.564 16.154,118.958c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,3.044 -48.987,3.856Z"/>',
            /* sway right */ '<path class="foliage" d="M40.695,343.122c-10.575,0.728 -20.695,-7.724 -20.695,-18.244c0,-63.798 14.837,-95.673 24.774,-166.478c1.993,-14.2 23.406,-73.674 36.905,-73.674c13.498,0 7.986,59.084 16.167,129.382c6.551,56.295 16.154,84.895 16.154,113.289c0,12.091 -12.368,12.859 -24.318,14.703c-11.949,1.843 -37.191,0.21 -48.987,1.022Z"/>'
        ],
        stump: '<path class="stump" d="M78.599,343.603l-0,30.056l-4.484,5.341l-14.596,0l-3.834,-4.884l-0,-28.913l22.914,-1.6Z"/>',
        fire: '<path class="fire" d="M55.889,74.322c3.005,-5.038 6.083,-11.872 4.708,-18.707c-3.06,-15.32 13.79,-28.09 13.79,-28.09c9.68,-6.27 9.366,-17.66 8.466,-23.27c-0.087,-0.726 1.123,-1.254 1.123,-1.254c-0,-0 0.875,0.402 0.987,0.73c1.854,5.7 3.784,16.352 -0.066,22.964c-1.186,2.037 -3,6.51 -3.71,8.22c-1.4,3.46 -2.52,7.77 -2.95,21l0.067,4.954c1.711,6.895 2.653,12.701 2.653,16.696c-0.035,4.892 -1.498,9.668 -4.21,13.74l-5.43,8.22c-4.73,11.03 -4.03,19.18 2.12,24.52l5.376,1.984c0.339,-0.318 4.245,-2.045 4.924,-2.724c4.16,-4.15 7.34,-8.79 5.87,-15.56c-1.53,-7.1 7.11,-13 10.28,-13.84c0.623,-0.162 1.205,-0.452 1.71,-0.85c2.39,-1.85 8.6,-7.59 6.52,-15.49c0,0 4.5,12.91 -2.44,18.28c-0.447,0.347 -0.887,0.707 -1.32,1.08c-3.533,3.079 -5.649,7.478 -5.85,12.16l-0.15,2.74c0.058,8.914 -8.57,19.88 -8.57,19.88c-1.7,2.53 7.707,7.53 7.937,9.53c0.306,2.553 0.333,5.131 0.08,7.69c-0.191,1.885 -1.083,3.631 -2.5,4.89c0,0 -2.519,4.355 -2.93,6.64l-0.18,4.91c-0.51,1.02 1.49,4.6 4.49,5.33c0,0 3.219,1.587 6.45,0.485c4.875,-4.016 1.671,-10.168 0.873,-17.195c-1.53,-13.54 11.74,-18.64 11.74,-18.64c0,0 5.34,-6.76 5,-12c0.91,3.83 1.39,11.12 -4.52,19.12c-3.491,4.635 -4.441,10.63 -2.744,16.018c1.407,-0.462 3.189,-1.425 3.684,-3.548c1.003,-4.35 3.575,-8.183 7.22,-10.76c1.09,-0.77 3.59,-1.14 5.68,-1.4c0.041,-0.005 0.083,-0.007 0.124,-0.007c0.587,-0 0.809,0.483 0.809,1.07c0,0.284 -0.419,0.556 -0.62,0.757c-3.24,3.08 -7.743,9.35 -6.433,21.35c2.12,19.45 -5.61,14.3 -36.76,45.45c-31.15,31.15 -58.52,-6.67 -58.52,-6.67c0,0 -5.198,-3.565 -10.64,-7.865c-4.837,-2.199 -9.177,-5.549 -12.06,-10.525c-2.154,-3.707 -2.977,-7.499 -2.943,-11.168c0.132,-14.29 11.623,-25.092 11.623,-25.092c0,0 -5.241,16.539 -1.213,26.21c0.031,0.044 0.062,0.091 0.093,0.14c2.18,3.43 5.91,4.37 14.1,6.3c2.239,0.527 10.13,1.253 3.18,-8.37c-2.995,-4.148 -3.584,-12.591 -3,-19.11c0.53,-5.75 4,-12.18 7.31,-16.45c1.501,-1.952 5.061,-3.802 7.981,-5.731c1.58,-2.312 2.174,-5.184 1.609,-7.959l-0.499,-6.531c-0.059,-0.1 -0.117,-0.197 -0.171,-0.289c-3.018,-5.159 -4.454,-11.092 -4.13,-17.06l0,-0.69c0.313,-5.917 2.327,-11.62 5.8,-16.42l5.08,-5.77c1.69,-1.38 3.451,-2.754 5.102,-4.023Z"/>',
        burned: '<path class="burned" d="M60.67,380.299l-6.203,-71.311l8.765,-48.949l-1.22,-11.17l-10.36,-26.59l-8.08,-7.49l-17.79,1.87l18.654,-2.525l-12.664,-14.295l20.595,22.139l9.41,22.697l-4.475,-47.256l12.58,-60.01l-2.882,-10.779l0.142,-9.274l-0.142,-18.858l1.684,21.933l3.158,17.011l-11.853,56.776l22.614,-26.26l4.995,-17.914l-3.238,18.689l-23.304,31.16l5.944,60.361l-5.572,47.798l14.054,-35.733l19.14,-11.5l-1.621,-21.767l3.188,20.26l12.313,-11.843l-11.532,14.279l-19.179,12.356l-15.142,39.016l11.791,67.179l-13.77,0Z"/>',
        endtag: '</svg>'
    },
    dim: {
        // these are known to us, from when we created the svg
        width: 134 / 2.5,
        height: 382 / 2.5
    }
}

/** updates :root definitions in the stylesheet */
updateStyle(/* :root */ document.documentElement, /* variable */ '--treewidth', svgtree.dim.width + 'px')

/*  ------------------------------------------------------------
    spawn trees into the forest 
    ------------------------------------------------------------  */

// get parent element
const forest = document.getElementById("forest")

/**
 * @typedef {Object} SettingsObject
 * @property {object} padding - padding inside the #forest div
 * @property {number} padding.t
 * @property {number} padding.r 
 * @property {number} padding.b
 * @property {number} padding.l
 * @property {object} spacing - spacing between trees (in pixels) 
 * @property {number} spacing.h - horizontal spacing between trees (in pixels) 
 * @property {number} spacing.v - vertical spacing between trees (in pixels) 
 * @property {object} orderly - defines how uniformly is everything drawn for each specified key
 * @property {boolean} orderly.positionally - spawn trees randomly in front or behind each other (by making sure every tree's zIndex is +1 than the previous tree's zIndex)
 * @property {number} orderly.maxZIndexDeviation - if (orderly.positionally == false ) then maxZIndexDeviation defines how disorderly the trees will be 
 * @property {boolean} orderly.shape - are all trees uniformly shaped?
 * @property {boolean} orderly.colour - should we introduce some randomness in the colours?
 */
/** @type {SettingsObject} settings for the forest */
const forestSettings = {
    padding: {
        t: -50,
        r: 0,
        b: 0,
        l: 0
    },
    spacing: {
        h: svgtree.dim.width * 2 / 3,
        v: 37.5
    },
    orderly: {
        positionally: true,
        maxZIndexDeviation: 2, /* only relevant if ( positionally == false ) */
        shape: true,
        colour: false
    }
}

/** ensure that all the trees sit in the centre of the #forest div */
const maxWidthOfForest = forest.offsetWidth - (forestSettings.padding.l + forestSettings.padding.r)
let widthOfTreesInRow = /* starting value */ svgtree.dim.width
while(widthOfTreesInRow + svgtree.dim.width <= maxWidthOfForest ) {
    widthOfTreesInRow += forestSettings.spacing.h
}
forestSettings.padding.l += (maxWidthOfForest-widthOfTreesInRow)/2
forestSettings.padding.r += (maxWidthOfForest-widthOfTreesInRow)/2

/** @type {number} keeps track of the highest z-index assigned to any tree */
var highestZIndexOnTree = 0;

/*  spawn all trees. */

let rowID = 0
let treeIDinRow = 0
let maxTreeIDinRow = treeIDinRow
let loopRunner = true

for (let i = 0; loopRunner; i++) {
    // sanity check
    if (i > TREELIMIT /*an arbitarily large number*/) { /* bug out, because otherwise this for-loop will hang stuff */ break; }
    // create new div
    /** @type {HTMLDivElement} */
    const newDiv = document.createElement("div")
    // store the tree's information in its own object
    tree[i] = {
        div: newDiv,
        id: 'tree-' + i,
        positionInForestGrid: {
            y: rowID,
            x: treeIDinRow
        },
        class: 'tree',
        zindex: i + (forestSettings.orderly.positionally ? 0 : Math.pow(-1, Math.floor(2 * Math.random())) * forestSettings.orderly.maxZIndexDeviation),
        shape: {
            foliage: {
                default: svgtree.src.foliage[0],
                previous: '',
                now: ''
            },
            stump: {
                default: svgtree.src.stump,
                previous: '',
                now: ''
            },
            fire: {
                default: svgtree.src.fire,
                previous: '',
                now: ''
            },
            burned: {
                default: svgtree.src.burned,
                previous: '',
                now: ''
            },
        },
        colour: {
            outline: {
                default: 'black',
                previous: '',
                now: ''
            },
            foliage: {
                default: 'white',
                previous: '',
                now: ''
            },
            stump: {
                default: 'white',
                previous: '',
                now: ''
            },
            fire: {
                default: 'white',
                previous: '',
                now: ''
            },
            burned: {
                default: 'black',
                previous: '',
                now: ''
            }
        },
        dimensions: {
            l: forest.offsetLeft + forestSettings.padding.l + (treeIDinRow * forestSettings.spacing.h) + (rowID % 2 === 0 ? (forestSettings.spacing.h / 4) : (-forestSettings.spacing.h / 4)) + (forestSettings.orderly.positionally ? 0 : ((Math.random() < .5 ? -1 : 1) * Math.random()*svgtree.dim.width/4)),
            t: forest.offsetTop + forestSettings.padding.t + forestSettings.spacing.v * rowID,
            w: svgtree.dim.width,
            h: svgtree.dim.height,
            /** @type {{ x: number, y: number }} */
            heart: {
                /* will be filled correctly when the tree is spawned */
                x: svgtree.dim.width / 2,
                y: svgtree.dim.height / 2
            }
        },
        state: {
            default: 'normal',
            previous: '',
            now: 'normal'
        },
        stateSettings: {
            absent: {
                shape: {
                    // stump: svgtree.src.stump
                },
                colour: {
                    stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                }
            },
            protected: {
                isProtected: false,
                shape: {
                    foliage: forestSettings.orderly.shape ? svgtree.src.foliage[0] : (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                    stump: svgtree.src.stump,
                    fire: false,
                    burned: false
                },
                colour: {
                    outline: 'black',
                    foliage: randomiseHSLColour('--protected', 3, 10, forestSettings.orderly.colour),
                    stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                }
            },
            normal: {
                shape: {
                    foliage: forestSettings.orderly.shape ? svgtree.src.foliage[0] : (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                    stump: svgtree.src.stump,
                    fire: false,
                    burned: false
                },
                colour: {
                    outline: 'black',
                    foliage: randomiseHSLColour('--green', 3, 10, forestSettings.orderly.colour),
                    stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                }
            },
            dry: {
                shape: {
                    foliage: (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                    stump: svgtree.src.stump,
                    fire: false,
                    burned: false
                },
                colour: {
                    outline: 'black',
                    foliage: randomiseHSLColour('--autumn', 10, 20, forestSettings.orderly.colour),
                    stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour)
                }
            },
            burning: {
                shape: {
                    foliage: (Math.random() < .5 ? svgtree.src.foliage[1] : svgtree.src.foliage[2]),
                    stump: svgtree.src.stump,
                    fire: svgtree.src.fire,
                    burned: false
                },
                colour: {
                    outline: 'black',
                    foliage: randomiseHSLColour('--autumn', 10, 20, forestSettings.orderly.colour),
                    stump: randomiseHSLColour('--wood', 0, 5, forestSettings.orderly.colour),
                    fire: randomiseHSLColour('--fire', 0, 5),
                }
            },
            charred: {
                shape: {
                    foliage: false,
                    stump: false,
                    fire: false,
                    burned: svgtree.src.burned
                },
                colour: {
                    outline: 'black',
                    burned: 'black'
                }
            }
        }
    }
    // set id and class
    newDiv.setAttribute('class', tree[i].class)
    newDiv.setAttribute('id', tree[i].id)

    // add the placeholder svg-element into newDiv
    newDiv.innerHTML = svgtree.src.starttag + svgtree.src.endtag
    // then, grab the svg-element...
    const svgelement = newDiv.getElementsByTagName("svg")[0] // ∵ the first (and only) child is an <svg>
    // ... and, finally, draw and style the tree (within the svg-element):
    //  — spawn all normal trees:
    // updateTree(svgelement,"normal")
    //  or
    //  - spawn a more organic-looking forest:
    updateTree(svgelement, Math.random()<.05?"charred":Math.random()<.03?"absent":"normal")

    // newDiv should be as large as the tree-image
    newDiv.style.width = tree[i].dimensions.w + 'px'
    // position the tree (so that it sits at the correct location within a desired pattern in the forest)
    newDiv.style.left = tree[i].dimensions.l + 'px'
    newDiv.style.top = tree[i].dimensions.t + 'px'
    tree[i].dimensions.heart = { x: tree[i].dimensions.l + tree[i].dimensions.w / 2, y: tree[i].dimensions.t + tree[i].dimensions.h / 2 }
    // draw trees on the next line if you exceed #forest's right-most bounds
    if (forest.offsetWidth - (forestSettings.padding.l + forestSettings.padding.r) < (treeIDinRow + 1) * forestSettings.spacing.h + tree[i].dimensions.w) {
        rowID++
        treeIDinRow = 0
    } else {
        treeIDinRow++
        // update counter that counts the max number of trees on the longest row
        maxTreeIDinRow = treeIDinRow >= maxTreeIDinRow ? treeIDinRow : maxTreeIDinRow
    }
    // stop drawing trees if you exceed #forest's bottom-most bounds
    if (forest.offsetHeight - (forestSettings.padding.t + forestSettings.padding.b) < rowID * forestSettings.spacing.v + tree[i].dimensions.h)
        loopRunner = false
    // set z-index, so that lower-placed trees seem to be in front
    newDiv.style.zIndex = (tree[i].zindex).toString()
    // keep track of the highest z-index assigned to any tree
    if (i > 0) if (tree[i].zindex > tree[i - 1].zindex) highestZIndexOnTree = tree[i].zindex
    // the tree is not displayed when it is spawned (because we plan to make it appear _organically_ a few seconds later)
    newDiv.style.visibility = 'hidden'
    // finally, make the div a child of #forest
    forest.appendChild(newDiv)
    // the tree appears:
    setTimeout(function () { newDiv.style.visibility = 'visible' }, Math.random() * 1000)
    // update the value for total number of trees spawned in the forest
    totalTreesInForest += 1
}

console.log(totalTreesInForest + " trees spawned in " + (rowID) + " rows, with " + (maxTreeIDinRow + 1) + " or fewer trees per row.")

/** #newsBox should have a z-index higher than all spawned trees */
updateStyle(newsBox.parentElement, "z-index", highestZIndexOnTree + forestSettings.orderly.maxZIndexDeviation + 1)


/*  ------------------------------------------------------------
    show instructions.
    ------------------------------------------------------------  */

showBox(newsBox,false,false)

/*  ------------------------------------------------------------
    start the experience.
    ------------------------------------------------------------  */

// start playing sounds, on loop
sBurning.loop = true
playSound(sBurning, 0)
sForest.loop = true
playSound(sForest, 1)

/*  ------------------------------------------------------------
    update the forest.
    ------------------------------------------------------------  */

setInterval(function () { updateForest() }, refreshTime)

function updateForest() {

    /* update sound */

    // update volume of ambient sounds

    sBurning.volume = percentageOfTrees("burning") * volumeScaler.sBurning
    // console.log(`volume of burning sounds: ${percentageOfTrees("burning") * volumeScaler.sBurning}`)
    sForest.volume = percentageOfTrees("normal") * volumeScaler.sForest
    // console.log(`volume of forest sounds: ${percentageOfTrees("normal") * volumeScaler.sForest}`)

    // randomly play a random-sound from the forest

    const secondses = approx(30,75) // time (in seconds) after which the random sound ought to play
    if (Math.random() < 1 / (refreshRate * secondses)) {
        playSound(sEagle, Math.random() * percentageOfTrees("normal") * volumeScaler.sEagle)
    } 

    /* update visuals */

    // will the forest update?:
    console.log(`newsBoxDisplayState: ${newsBoxDisplayState}\npauseForestUpdate:   ${pauseForestUpdate}\nupdate visuals:      ${! (newsBoxDisplayState || pauseForestUpdate)}`)

    if (! (newsBoxDisplayState || pauseForestUpdate)) {

        // collect all trees by the states they are in
        let absents = document.getElementsByClassName("absent")
        let protecteds = document.getElementsByClassName("protected")
        let normals = document.getElementsByClassName("normal")
        /** @type {*} */
        let drys = document.getElementsByClassName("dry")
        /** @type {*} */
        let burnings = document.getElementsByClassName("burning")
        let charreds = document.getElementsByClassName("charred")

        // if there are no dry/burning trees left (but there still are normal trees):
        if (drys.length == 0 && burnings.length == 0 && (normals.length + protecteds.length >= 0)){
            // console.log(`no dry or burning trees (there are, however, normal trees).`)
            if (Math.random() < .075) /* note: the use of Math.random here (instead of setTimeout) is very-much intentional ; this is to artificially create a time-gap before taking the next step. */ {
                if(!newsBoxDisplayState) {
                    goodnews=Math.random()>.75?true:false
                    changeNews(newsBox,goodnews)
                    showBox(newsBox, true, true)
                }
            }
        }

        // dry -> burning
        for (let i = 0; i < drys.length; i++) {
            if (Math.random() > .9995)
                updateTree(drys[i], "burning")
        }

        // burning -> charred
        for (let i = 0; i < burnings.length; i++) {
            if (Math.random() > .983)
                updateTree(burnings[i], "charred")
        }

        // charred -> absent
        for (let i = 0; i < charreds.length; i++) {
            if (Math.random() > .9999)
                updateTree(charreds[i], "absent")
        }
        for (let i = 0; i < charreds.length; i++) {
            if ((protecteds.length + normals.length + drys.length) < 1)
                if (Math.random() > .95)
                    updateTree(charreds[i], "absent")
        }

        // absent -> new forest
        for (let i = 0; i < absents.length; i++) {
            if (
                ((protecteds.length + normals.length + drys.length) < (.1 * totalTreesInForest))
                &&
                (absents.length >= .8 * totalTreesInForest)
            ) {
                if (Math.random() < .67) {
                    setTimeout(function () {
                        updateTree(absents[i], "normal")
                    }, Math.random() * 5000)
                }
            }
        }

        /** make fire, dryness, health spread from one tree to its neighbours */

        spreadInfection(burnings, "burning", .99, 1)
        spreadInfection(drys, "dry", .995, 1)
        // spreadInfection(normals, "normal", .99995, 1)

        /**
         * fire, dryness, health can spread from one tree to its neighbours
         * @param {*} trees
         * @param {string} state - the state that the trees (which are trying to spread their condition to their neighbours) are in
         * @param {number} immunity - the immunity of their neighbouring trees, so that they don't get infected easily.
         * @param {number} spreadDistance
         */
        function spreadInfection(trees, state, immunity, spreadDistance) {
            for (let i = 0; i < trees.length; i++) {
                const id = Number(trees[i].parentNode.id.substring("tree-".length, trees[i].parentNode.id.length))
                const _x = tree[id].positionInForestGrid.x
                const _y = tree[id].positionInForestGrid.y
                for (let t = 0; t < totalTreesInForest; t++) {
                    if (
                        true
                        && tree[t].positionInForestGrid.x >= 0
                        && tree[t].positionInForestGrid.y >= 0
                        && tree[t].positionInForestGrid.x >= _x - spreadDistance
                        && tree[t].positionInForestGrid.x <= _x + spreadDistance
                        && tree[t].positionInForestGrid.y >= _y - spreadDistance
                        && tree[t].positionInForestGrid.y <= _y + spreadDistance
                        && tree[t].id
                    ) {
                        if (Math.random() > immunity) {
                            // note: this setTimeout(), below, is important. it lets us wait for some time before making neighbouring trees catch fire. without this, the whole forest caught fire in one loop.
                            setTimeout(function () {
                                const neighbour = document.getElementById('tree-' + t)
                                const neighbourSvg = neighbour.getElementsByTagName("svg")[0]
                                if (state == "burning" || state == "dry") {
                                    if (
                                        neighbourSvg.classList.contains("charred")
                                        ||
                                        neighbourSvg.classList.contains("absent")
                                        ||
                                        neighbourSvg.classList.contains("protected")
                                    ) {
                                        // can't do anything
                                    }
                                    else if (
                                        neighbourSvg.classList.contains("normal")
                                    ) {
                                        // console.log(`spreading dryness. making tree-${id} dry.`)
                                        updateTree(neighbourSvg, "dry")
                                    }
                                    else if (
                                        state == "burning"
                                        &&
                                        neighbourSvg.classList.contains("dry")
                                    ) {
                                        // console.log(`spreading fire. tree-${id} catches fire.`)
                                        updateTree(neighbourSvg, "burning")
                                    }
                                }
                                else if (state == "normal") {
                                    if (
                                        neighbourSvg.classList.contains("absent")
                                    ) {
                                        updateTree(neighbourSvg, "normal")
                                    }
                                    else if (
                                        neighbourSvg.classList.contains("charred")
                                    ) {
                                        updateTree(neighbourSvg, "absent")
                                    }
                                }
                            }, refreshTime)
                        }
                    }
                }
            }
        }
    }
}

/*  ------------------------------------------------------------
    if the person taps on the screen
    ------------------------------------------------------------  */

let clickCounter = 0

// whenever a click happens:
document.addEventListener("click", handleClicks);

/** @param {MouseEvent} e */
function handleClicks(e) {
    // count the click
    clickCounter++
    // check if the click happened on a tree
    didClickHappenOnTree(e)
}

/*  ------------------------------------------------------------
    if the click happened on a tree...
    ------------------------------------------------------------  */

/** @param {MouseEvent} e */
function didClickHappenOnTree(e) {

    // get coordinates of mouseclick
    const x = e.clientX
    const y = e.clientY
    // console.log("clicked on: (" + x + ", " + y + ")")

    // get array of all elements that are present where the mouseclick happened ...
    /** @type {*} */
    let c = []
    c = document.elementsFromPoint(x, y)
    // console.log("here are all clicked-on elements:")
    // console.log(c)

    // check if the click happened on #newsBox
    let clickedOnNewsBox = false;
    for (let i = 0; i < c.length; i++) {
        if (c[i].id === 'newsBox' || c[i].id === 'dismissNewsBoxIcon') {
            clickedOnNewsBox = true
            console.log(`clicked on #${c[i].id} | did not click on #forest`)
            break;
        }
    }

    // if we didn't click on the #newsBox, then we may continue checking whether the click happened on a tree in the #forest:
    if (clickedOnNewsBox == false) {

        // in the array, we are checking which element is an "SVG Path Element" (i.e., is a <path> element).
        c = c.map(function (x) {
            if (
                x.constructor.toString().indexOf("SVGPathElement()") > -1
                // for more info about the 'constructor' property, and about this condition-check, please read: https://www.w3schools.com/js/js_typeof.asp.
            )
                // return <path>'s parent (which is an <svg>)
                return x.parentNode
            else return -1
        });
        // console.log("gathered parent svg-nodes for path elements:")
        // console.log(c)

        // filter out all non-svg elements (which we'd already replaced with -1)
        c = c.filter(function (e) { return e != -1; })
        // console.log("removed -1's:")
        // console.log(c)

        // ensure that all elements in the array are unique
        c = c.filter(function (x, i, a) { return a.indexOf(x) == i })
        // console.log("removed duplicates:")
        // console.log(c)

        // now, we instruct each (clicked-)tree to change
        for (const i in c) {
            const SVGElementOfClickedTree = c[i]
            if (SVGElementOfClickedTree.classList.contains("burning")) {
                // console.log(`click on ${SVGElementOfClickedTree.parentNode.id}: burning -> dry`)
                updateTree(SVGElementOfClickedTree, "dry")
            }
            else if (SVGElementOfClickedTree.classList.contains("dry")) {
                // console.log(`click on ${SVGElementOfClickedTree.parentNode.id}: dry -> normal`)
                updateTree(SVGElementOfClickedTree, "normal")
            }
            else if (SVGElementOfClickedTree.classList.contains("normal")) {
                // console.log(`click on ${SVGElementOfClickedTree.parentNode.id}: normal -> protected`)
                updateTree(SVGElementOfClickedTree, "protected")
            }
            else if (SVGElementOfClickedTree.classList.contains("protected")) {
                // console.log(`click on tree-${SVGElementOfClickedTree.parentNode.id.substring("tree-".length, SVGElementOfClickedTree.parentNode.id.length)}: classList.contains("${SVGElementOfClickedTree.classList}") • isProtected=${tree[SVGElementOfClickedTree.parentNode.id.substring("tree-".length, SVGElementOfClickedTree.parentNode.id.length)].stateSettings.protected.isProtected}`)
                updateTree(SVGElementOfClickedTree, "protected")
            }
        }
    }
}
