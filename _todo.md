# todo

publish:
[ ] host on https://playforgood.news

environment:
[ ] improve sounds. build soundscape. find more randomSounds. 

forest:
[✓] add variation in tree-colour
[✓] update tree-shapes
    [✓] on-fire trees are offset. (they are lower than other trees.)
    [✓] dry and on-fire trees should use the fully-grown-tree svg-path for foliage
    [✓] absent trees have fully-grown-tree svg-path in them, but it is invisible. (use class='invisible' for this.)
[✓] state-change from normal to dry should be gradual. (interpolate colour.)
[✓] tap on an absent-tree to make it grow. (because it has a larger clickable-area.)
[ ] when tapped on, an absent tree respawns BUT ONLY at the start of the game.
[ ] seed dryness in a single spot, and let the dryness spread organically
[ ] content should be different depending on the person's behaviour: { played at all, clicked at all, saved the forest well, did poorly, played for long, etc }.

infoBox messages:
[x] add links to actual "good news" articles
[ ] update (or remove) mouse-pointer svg's

essay:
[ ] people read the "read about this project" button first. it's too conspicuous.
[ ] improve the essay.
    [ ] add links to actual "good news" articles.

play:
[ ] why will someone want to save the forest? (make them plant it first, perhaps?)
[ ] strengthen design future/fiction narrative.
    [ ] years not noticed on news articles. make the passage of time obvious. (use an upfront slider?)
[ ] conclusion
    [ ] remove "conclusion"? (and show some kind of stats in every #infoBox)
    [ ] improve criteria for triggering game-conclusion (infoBox-0)
    [ ] when conclusion (or any news) is shown, buttons should allow us to "play again".
    [ ] add a (well-timed) conclusion or reward to the experience. maybe also display some scores ("trees saved", etc) in the concluding message (infoBox-0)
[ ] different messaging (in #infoBox) depending on the gamestate/timed-conclusion of the playful experience. eg: good news comes when the person is doing well, and not randomly.
[ ] a gamestate bar, showing a combined stat about the quality of gameplay (incl. health of forest, activity by person, etc). maybe it is "climate change vs you" or just "trees saved".

tidy:
[ ] replace setInterval with requestAnimationFrame(callback)
[ ] organise code (into files or modules)
[ ] remove unnecessary console.log messages

ios/safari bugs:
[ ] disable double-tap-to-zoom on ios devices.
[ ] fix sound: volume-settings dont seem to work on iphone browsers

gamify:
[x] mousedrag to cut trees (leave stumps behind). [code example](https://developer.mozilla.org/en-US/docs/Web/API/Touch/radiusX)
[x] add scorekeeping graphic
[x] add a button to toggle 'game' and 'toy' mode
[x] modes: axe & water (click & drag ; click on tool buttons ; click & hold)

---

tip: execute `npx http-server .` on 23-playful-data-js to be able to test the experience on any device within the same network.