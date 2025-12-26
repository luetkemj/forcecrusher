# Dev Log

## 122625

Skulltooth 2: Forcecrusher [github](https://github.com/luetkemj/forcecrusher) | [play](https://luetkemj.github.io/forcecrusher)

- project management in github
- wrapped up interactive fluid layers
- added living sponges that collect select fluids and release it upon death
- fixed bug where rat death could cause a runaway blood flood
- improved bottle ui - their name and color now reflect the contents
- added support for mixed width rendering to fix legend and inventory UIs

Got sick of managing this project from a loose markdown file and setup a github project. Feels much more... official.

Wrapped up interactive fluid layers for now. Still some work to do but got most of the worst bugs fixed. The biggest bug being a case where upon killing multiple rats in the same vicinity, the spilled blood would multiply exponentially and flood the entire dungeon. Turns out having multiple bi-directional fluid containers at the same position is bad. Fluid containers are now directional and only the "floor" fluid containers are bi-directional. A dead read can bleed but won't try and absorb anything anymore.

Living sponges are now a thing. They randomly select a fluid to absorb on spawn and will only absorb that fluid. Their color reflects their contents. Would be good to spawn then with a bit of fluid inside so it's more obvious what fluid they will absorb. Might also be a good idea to limit the possible fluid to those that are available in the dungeon. It's possible to spawn a water sponge on a level with no water and it ends up just being a useless mob.

Bottles UI has been improved. They also render with the color of their contents. They can contain multiple fluid types so the color is a weighted mix of those fluids. The sprite will change from empty, half full, and full bottles based on volume. Not yet displaying the actual fluid mix (seen when inspecting a puddle) in inventory but should. Bottles also are corked, so they can be put down without spilling everything but do not yet break when thrown so at the moment... bottles are only useful for removing a fluid hazard like lava or oil.

The addition of graphics a while ago broke the legend and inventory UIs - that's now fixed. Had to refactor the canvas.ts file to add support for mixed-width rendering. This sort of work is where AI has really shined for me. I wrote the canvas.ts rendering logic years ago and have ported it to every game since. I dropped the file in chatGPT with an explanation of what I needed to do instead and it acted as a thought partner explaining how and what to change. I'd been setting tile width on the canvas itself and using array indexing to find and update tiles, which only works if your tiles are a reliable width and height. ChatGPT suggested implementing a cursor based positioning system where instead of setting tile width on the canvas it's stored on the token. Tokens can be a glyph (graphic) or text. A couple helper functions understand the various token types and handle the actual rendering and cursor progression.

I'm not a fan of vibe coding but I have found AI as thought partnership to be extremely valuable. I started partering with it over the past year and have learned a TON! A lot of refactors and some of the more complex systems would have taken much much longer without what amounts to an extremely detailed manual on roguelike development. AI is a much larger discussion to be sure but the more I use it the more I recognize and understand it's value as a very powerful tool and the less I worry about the impending robot apocolypse and the false promises of tech entreprenuers just trying to sell me something.

## 121925

Skulltooth 2: Forcecrusher [github](https://github.com/luetkemj/forcecrusher) | [play](https://luetkemj.github.io/forcecrusher)

- interactive fluid layers
- SIM mode to run world pipeline during zone generation
- desiccation
- bugfixes

Biggest change (still in progress) is interactive fluid layers. Bottles exist that can be filled with any liquid in a tile. You can then throw the bottle to spill the liquid somewhere else. Useful for things like collecting oil and tossing it near lava or fire to create a bit of a firestorm.

Once I got the interactive fluid layers working the gears started turning on what else I could do with it. So far I've only added a desiccate component that absorbs fluid from containers withing range. The idea is to have a "gelatinous sponge" mob that wanders the dungeon absorbing all the liquid. On death it will release it all. That idea could pretty easily be used for spells that would do the same sort of thing over AOE. This got me thinking about how entities could have a fluid container of blood that could be used instead of health. Attacks would spill it, death would spill all of it. Vampires might drink it to refill their own blood container... lots of ideas.

So much fun now that the systems are reaching a critical mass!

## 121225

Skulltooth 2: Forcecrusher [github](https://github.com/luetkemj/forcecrusher) | [play](https://luetkemj.github.io/forcecrusher) | [devlog](https://luetkemj.github.io/251205/mutable)

- Layered fluids
- Fluids as materials
- Lava Golems
- Regrowth

Rewrote the water system to be a more generic fluid system supporting multiple layered fluids. Currently the game supports lava, water, blood, and oil. Lava is always on fire and will destroy water and blood - steam hasn't been implemented but that's the rationale, and oil is explosive. These layers all interact with each other so in the image below I turned off lava as things get a bit too chaotic with so many fluids in the dungeon.

[DUNGEON PIC]

Fluids are no longer "special". They are materials like anything else which makes interaction with the other system "just work". This lead to experimenting with mobs made from fluid.

Welcome, Lava Golems! Their attacks deal fire damage and they will spread fire to anything nearby. The player is still immune to fire for testing purposes but it's fun seeing the golems interact with skeletons who they don't like and rats who they do like but sadly, [shouldn't be allowed to play with :(](https://imgur.com/hQw2SEa)

I wanted grass to grow back after it was burnt and assumed it would be a relatively simple add. Boy was I wrong! The naive first attempt of just updating their appearance component and recalculating flammability didn't work as I needed it to occur at a randomized cadance so I implemented a "growth" system to move entites through stages. This "one way" system ran into various problems. I tried to solve them through another post process system that in the end felt more like an events system. It worked but didn't feel "right" within an ECS architecture. Thought about it some more and ended up rewriting the entire thing into something that feels much better. It's simple and doesn't "fight the framework".

Introducing the "mutable" system. The mutable component contains mutations which are just a list of components to add and remove and a chance to mutate to another specified mutation. In this way I can attach a "mutateTo" component to mutate to a "burnt" mutation or if grass currently has the "young" mutation it will mutate to "mature" over time. I can easily add flags like "calculateFlammability: true" to trigger another system to calculate the flammability - previously accomplished through my DIY eventing setup.

Making heavy use of these new systems, [a fire golem lights grass on fire repeatedly as it regrows.](https://imgur.com/ib2TiPp)
