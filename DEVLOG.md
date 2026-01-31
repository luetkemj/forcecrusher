# Dev Log

## 013026

**Skulltooth 2: Forcecrusher** ([github](https://github.com/luetkemj/forcecrusher) | [play](https://luetkemj.github.io/forcecrusher))

Recently added the infrastructure for spells and have been working to clean that up and expand the list. There are spells to create fluid, water, lava, oil, and blood. There's a collection of fire spells of various shapes, ignite lights a point on fire, fire wall lights everything along a line, and inferno lights a 6 cell diameter circle. Kill and Mass Kill end all life (including your own) at target or in the area of effect.

Created a UI for casting spells of various shapes. Arrow keys to select a target but there are indicators that highlight the area of effect. Available shapes are circle, line, and point.

Just finished spellbooks. Spellbooks can be found throughout the dungeon and will add to your known spells after reading. No mana or magic points yet so once you know a spell you can cast it however much you want. Obviously that's something I'd like to change. Scrolls are in the backlog for single use spells. And I'd like to include a system for spells of a duration. Currently everything is instant or permanent. There's a desiccate spell that remove water from a target location but after casting it's invisible and just acts as a sort of liquid black hole. Need to be able to remove that component after some time and should probably add UI effects for that sort of thing.

Other spells in the backlog, telekenesis, paralyze, blind, deafening, and noseblind (remove sense of smell).

Last month I moved my backlog to a proper github project. Lots of fun building out an entire feature and marking tickets as complete. Feels like I'm actually working towards something instead of just writing code sort of aimless like.

##

**Skulltooth 2: Forcecrusher** ([github](https://github.com/luetkemj/forcecrusher) | [play](https://luetkemj.github.io/forcecrusher))

The holidays and getting sick resulted in a slow week. Fixed a few bugs, removed some old dependencies, added some QOL scripts in CI. Got lost down a rabbit hole trying to redo dungeon gen that went nowhere.

## 122625

Skulltooth 2: Forcecrusher [github](https://github.com/luetkemj/forcecrusher) | [play](https://luetkemj.github.io/forcecrusher)

- Project management moved to GitHub
- Wrapped up interactive fluid layers
- Added living sponges that collect select fluids and release them upon death
- Fixed a bug where rat death could cause a runaway blood flood
- Improved bottle UI — names and colors now reflect contents
- Added support for mixed-width rendering to fix legend and inventory UIs

---

Got sick of managing this project from a loose markdown file and **set up a GitHub project**. Feels much more… official.

Wrapped up interactive fluid layers for now. There’s still some work to do, but most of the worst bugs are fixed. The biggest issue was a case where killing multiple rats in the same vicinity caused spilled blood to multiply exponentially and flood the entire dungeon. It turns out having multiple bi-directional fluid containers at the same position is bad. Fluid containers are now directional, and only “floor” fluid containers are bi-directional. A dead rat can bleed, but it won’t try to absorb anything anymore.

Living sponges are now a thing. They randomly select a fluid to absorb on spawn and will only absorb that fluid. Their color reflects their contents. It would be good to spawn them with a bit of fluid inside so it’s more obvious what they absorb. It might also be a good idea to limit possible fluids to those available in the dungeon. Right now it’s possible to spawn a water sponge on a level with no water, which just results in a useless mob.

The bottle UI has been improved. Bottles now render with the color of their contents. They can contain multiple fluid types, so the color is a weighted mix of those fluids. The sprite changes between empty, half-full, and full based on volume. The actual fluid mix (as seen when inspecting a puddle) isn’t yet displayed in the inventory, but it should be. Bottles are also corked, so they can be placed without spilling everything. They don’t yet break when thrown, though, so for now bottles are mostly useful for removing fluid hazards like lava or oil.

The addition of graphics a while ago broke the legend and inventory UIs — that’s now fixed. I had to refactor `canvas.ts` to add support for mixed-width rendering. This is the kind of work where AI has really shined for me. I wrote the `canvas.ts` rendering logic years ago and have ported it to every game since. I dropped the file into ChatGPT with an explanation of what I needed to change, and it acted as a thought partner, walking through how and why to refactor it.

Previously, I was setting tile width on the canvas itself and using array indexing to find and update tiles, which only works if tiles have a consistent width and height. ChatGPT suggested implementing a cursor-based positioning system. Instead of storing width on the canvas, it’s stored on the token. Tokens can be glyphs (graphics) or text. A couple of helper functions understand the token types and handle rendering and cursor progression.

I’m not a fan of vibe coding, but I _have_ found AI as a thought partner to be extremely valuable. I started partnering with it over the past year and have learned a ton. Many refactors and complex systems would have taken much longer without what amounts to an extremely detailed, on-demand manual for roguelike development. AI is a much larger discussion, but the more I use it, the more I understand its value as a powerful tool — and the less I worry about the impending robot apocalypse or the false promises of tech entrepreneurs just trying to sell me something.

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
