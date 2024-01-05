# todo

publish:
[ ] host on https://playforgood.news
[ ] disable play-experience on desktop devices
    [ ] add message: "please open on a phone. if you open it on a larger screen, it will greedily eat up your battery and memory (much like how we're eating up the environment)."

sound
[ ] improve soundscape. add random sounds.

forest:
[ ] improve gamestate bars
[ ] when tapped on, an absent tree respawns at any point in the game.
[ ] seed dryness in a single spot, and let the dryness spread organically

conclusion:
[ ] add stats on every infoBox. 
    eg: { trees planted, saved, time spent, etc }
[ ] review conclusion criteria (i.e., the if statements). 
[ ] when conclusion (or any news) is shown, buttons should allow us to "play again".
[ ] conclusion infoBox can be dismissed, to allow people to take screenshots.

essay:
[ ] people read the "read about this project" button first. it's too conspicuous.
[ ] improve the essay.
[ ] different messaging (in #infoBox) depending on the gamestate/timed-conclusion of the playful experience. 
    eg: { played at all, clicked at all, saved the forest well, did poorly, played for long, saved # trees, etc }.
[ ] present links to actual "good news" articles.

bugs:
[ ] tapping seems sluggish. (check if throttled-framerate is causing this issue.)

tidy:
[ ] (on desktop) update/remove mouse-pointer svg's


---

tip: execute `npx http-server .` on 23-playful-data-js to be able to test the experience on any device within the same network.