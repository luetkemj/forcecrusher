# Dev Log

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
