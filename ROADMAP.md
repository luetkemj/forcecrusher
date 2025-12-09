# Roadmap

This is aspirational only. Expect anything and everything in this document to be changed, ignored, or abandoned.

100% GUARANTEED!

## checklist

- [x] Setting Up
- [x] Drawing the ‘@’ symbol and moving it around
- [x] The generic Entity, the render functions, and the map
- [x] Generating a dungeon
- [x] Field of view
- [x] Placing enemies and kicking them (harmlessly)
- [x] Doing (and taking) some damage
  - [x] Enemy pathing
  - [x] Basic AI
  - [x] health component
  - [x] Morgue System
  - [x] basic combat
- [x] Creating the Interface
  - [x] Legend
  - [x] Controls list
  - [x] Combat log
  - [x] Senses log
- [x] Items and Inventory
  - [x] Item entities
  - [x] Inventory
  - [x] Inventory UI
  - [x] Pickup controls
  - [x] Drop controls
  - [x] Healing potion
    - [x] Effects system
- [x] Ranged Weapons and Targeting
  - [x] Cursor
  - [x] Show what is under cursor in sensory log
  - [x] Targeting UI (for throwing)
  - [x] Ability to throw things to a specified location
  - [x] Disallow throwing on and through walls
  - [x] Thrown item cause damage
- [x] Saving and loading
- [x] Delving into the Dungeon
- [x] Damage System
- [x] Increasing Difficulty
- [x] Gearing up

---

- [x] dead enemies drop gear
- [x] unarmed attacks (create bites and claws, punching)
- [x] view entire log
- [x] Dedupe and count identical messages
- [x] multi color logs
- [x] color coded logs (ale-dsi/brogue-esque)
  - [x] support writing mutiple colors to a text row
- [x] Systems Piplines refactor
- [x] View Renderer refactor
- [x] Input Handlers refactor
- [x] Enhanced Debog logging
- [x] Memory AI
  - [x] Remember
  - [x] Forget
- [x] Disposition
  - [x] ~~Only attack player~~
  - [x] Attack based on disposition
- [x] Sensory System
- [ ] Perception
  - [x] See
    - [x] See things
    - [x] Remember things seen
    - [x] Act on memory
    - [x] Debug UI
  - [x] Smell
    - [x] Smell things
    - [x] Remember things smelled
    - [x] Act on memory
    - [x] Debug UI
  - [ ] Hear
    - [ ] Hear things
    - [ ] Remember things heard
    - [ ] Act on memory
    - [ ] Debug UI
  - [ ] Feel (tremor sense)
    - [ ] Feel things
    - [ ] Remember things felt
    - [ ] Act on memory
    - [ ] Debug UI
  - [ ] Taste
    - [ ] Player taste UI (flavor text) - this isn't really useful for baddies
- [ ] Behavior
  - [ ] Agressive, passive, idle etc
  - [ ] Only do things according to behavior
- [ ] Debug overlay
- [ ] dungeons v2
  - [x] tags refactor
  - [ ] room of different shapes (circular)
  - [ ] caverns
  - [ ] water
  - [ ] walls of different materials
  - [ ] cave ins (deteriorated walls etc)
- [ ] doors
  - [x] Place doors
  - [x] Open and closeable doors
  - [x] Breakable doors
  - [ ] Lockable doors
  - [ ] doors of different kinds (wooden, metal, portculis, locked, jammed)
  - [ ] Jammable doors (what's that UI look like?)
  - [ ] AI that can open doors (or not)
- [ ] Kick System
  - [x] Basic system to kick doors and walls etc
  - [x] Handle damage in a system
  - [x] Knockback system
  - [x] Handle breaking things that are kicked
  - [ ] Should offer some sort of information (is it jammed, or stuck etc)
  - [ ] Sound (alert enemies) Sound System
- [ ] Maker Mode
  - [x] Maker Mode Game State
  - [x] Select Prefabs
  - [x] Place Prefabs
  - [ ] Create shapes (rectangles for rooms etc)
- [ ] morgue file (game over screen)
- [ ] Plague doctor outfit to guard against potions and gas attacks
- [ ] money
- [ ] points(?)
- [ ] high scores list
- [ ] more descriptive attacks (You smash the rat with the butt of your dagger)
- [ ] weildable and wearable components so you can only use certain things BUT allow crafting out of materials to build the rat armor or skeleton armor.
- [ ] more weapons
- [ ] more armor
- [ ] more enemies
- [ ] creature multiattacks
- [ ] creature behavior, like swarming, pack tactics, retreat, hunting, sleeping, etc
- [ ] Leveling up
- [ ] Proficiency Bonuses
- [ ] Weapon types (ranged, melee, martial, finess, heavy, light etc)
- [ ] Spells
- [ ] Wands
- [ ] Rings
- [ ] Containers
- [ ] AI for actors to use own inventory
- [ ] you can "wear" a health potion?? seems like that shouldn't be possible. Do we need wearable and wieldable Or just go with it? It's no better then not wearing any armor...
- [ ] Materials
- [ ] Overworld map with multiple dungeons to explore
- [ ] Crafting
- [ ] Ability to shoot things from a ranged weapon
- [ ] Game cheats/debugging menu to toggle various modes
- [ ] save to indexDB (local storage collapses after 6 levels)
- [ ] inventory select armor/weapons so they can be removed
- [ ] dykstra maps
- [ ] lightsources from skrimshank
- [ ] map gen from shank
- [ ] graphical mode (use sprites not ascii as an option)

## Crafting notes

Can only craft at a workbench, workbenches are rare enough that you have to be careful what you save - you can't save it all for new gear or potions.

## Inventory notes

Inventories are just containers
A container can be open (you can pick up and put things in it)
A container can be closed (it have items but you cannot add to it)
An open container might be your backpack
A closed container my be your anatomy - torso contains heart, lungs, stomach
Items should have both weight and bulk
Containers have both a weight and bulk limit
If an item exceeds either the containers bulk or weight limit it cannot fit
Forcing an item into a container has a chance relative to exceeded bulk or weight of destorying the container and spilling all items on the ground.

item
name
description
bulk
weight
...other stats

An intentory is just a list of ids
A system will run that checks the container for bulk weight etc.
And if necessary, destroy the container

Items should provide some actual use in game. No junk items. Gold can be used to purchase things - gold has a weight. So you can only carry so much of it without a pack animal.

## Saving and loading:

### Todos

Game saves are now handled with dexie (indexedDb)

- [x] Rerender on load (go into a SAVING mode and manually send a keyboard impossible key code to get out of it after the save completes)
- [x] Add logs to game log for saving and loading
- [x] Add some sort of "loading" intersticial - an overlay of some sort
- [x] make sure we're blocking user interaction (should be but make sure) (we weren't, but now we are)

saveZone()

- store all entity ids in engine.world to current mapId in DB

saveGame()

- saveZone()
- save zones, registry, and saveState to db

loadZone(zoneId)

- Save current zone
- Does zoneId exist?
  - NO
    - store ids of any entities that must move to new map
    - clear engine.world
    - generate new map (will create entities and store in registry)
    - create migrated entities from stored ids and entities in registry
    - update location of player entity
    - update current mapId
  - YES
    - get ids from zoneId
    - generate entities in engine.world from entities in registry
    - update current mapId

loadGame()

- load registry into memory
- get current mapId
- loadZone()

loadzone - load a zone with character from that zone
createzone - generate a new zone and place character into it
changezone - create/load zone and place character into it

saveGameData:

- registry: Map<eId, Entity()>
- zones: Map<locId, Set<eId>>
- gameState: <GameState>

### ChatGPT suggestions

1. Component Data Versioning
   When you update your ECS or component structure, old saved entities might break.

Suggestion: Store a version number in each Entity() and your saveGameData. Create migration steps as needed.

2. Global Systems or Timers
   Are there systems (e.g., quest trackers, cooldown timers, global events) that run outside of entities?

Suggestion: Add systemsState or globalTickState to gameState if applicable.

3. Entity Dependencies
   Do you have parent-child relationships or constraints (e.g., followers, inventories)?

Suggestion: Ensure that any dependent entities are saved/loaded in the correct order or have reference resolution logic after instantiation.

4. Cross-Zone Entities
   What happens if an entity exists in more than one zone or moves between them frequently?

Suggestion: Track entity location explicitly in the registry (entity.zoneId) to avoid inconsistencies.

5. Delta Save Support (Optional Optimization)
   Saving the entire registry every time can be costly if your game scales.

Suggestion: Consider a dirty-flag system to track changed entities.

6. Rollback or Backup
   What happens if a save becomes corrupted or a load fails mid-way?

Suggestion: Implement backup versions or transactions (saveA → saveB → overwrite saveA).

7. Loading Order
   Are any entities expected to exist before others (e.g., map must exist before placing player)?

Suggestion: Formalize entity spawn order or handle deferred initialization.

8. Asynchronous Loads (if applicable)
   If you eventually stream zones/maps in and out asynchronously, you’ll need more lifecycle hooks (e.g., preload hooks, unload cleanup).

```
saveGameData = {
  registry: Map<EntityId, EntityData>,
  zones: Map<MapId, Set<EntityId>>,
  gameState: {
    currentMapId: string,
    playerId: string,
    version: number,
    // maybe: questState, timers, etc.
  }
}
```

entity = {
id: string,
zoneId: string,
version: number,
}

9. Lazy load: as the game scales - to avoid having to load/save the entire registry only load in entities from registry as needed

## Fire and materials

Chat GPT:

https://chatgpt.com/share/69272d12-7734-8009-aa11-79353f2fa9d2

Materials:

- Flesh
- Metal
- Bone
- Glass
- Stone
- Wood
- Leather
- Cloth
- Paper
- Oil
- Plant

| Material | Ignition | Fuel | Max Intensity | Heat Tolerance | base color       |
| -------- | -------- | ---- | ------------- | -------------- | ---------------- |
| wood     | 0.35     | 20   | 4             | 1              | brown            |
| cloth    | 0.7      | 5    | 2             | 0.5            | tan              |
| paper    | 0.9      | 3    | 2             | 0.2            | offwhite         |
| plant    | 0.5      | 7    | 3             | 0.7            | green            |
| leather  | 0.2      | 10   | 2             | 1              | brown            |
| flesh    | 0.05     | 12   | 2             | 2              | brown to pink    |
| bone     | 0.01     | 3    | 1             | 4              | off white        |
| metal    | 0        | 0    | 0             | 5              | gray             |
| stone    | 0        | 0    | 0             | 5              | gray black green |
| glass    | 0        | 0    | 0             | 3              | green            |
| oil      | 0.9      | 15   | 5             | 0.1            | olive            |

| Category      | Mass Range |
| ------------- | ---------- |
| Tiny          | 0.1–0.5    |
| Small         | 0.5–2      |
| Medium        | 2–6        |
| Creatures     | 6–20       |
| Large objects | 10–30      |
| Huge objects  | 30–60      |
| Special cases | 60–80      |

| Object                       | Game Mass | Category  |
| ---------------------------- | --------- | --------- |
| Paper scrap                  | 0.1       | tiny      |
| Dry leaf                     | 0.1       | tiny      |
| Feathers                     | 0.2       | tiny      |
| Cloth strip / rag            | 0.3       | tiny      |
| Small scroll                 | 0.3       | tiny      |
| Candle wick                  | 0.3       | tiny      |
| Twig                         | 0.4       | tiny      |
| Arrow                        | 0.5       | tiny      |
| Potion bottle (glass)        | 0.8       | small     |
| Dagger / small metal tool    | 1.0       | small     |
| Wooden spoon / hilt          | 1.0       | small     |
| Burning torch                | 1.2       | small     |
| Scroll tube                  | 1.2       | small     |
| Leather gloves               | 1.5       | small     |
| Shortbow                     | 1.5       | small     |
| Small oil flask (full)       | 2.0       | small     |
| Backpack                     | 2.0       | medium    |
| Leather armor piece          | 2.5       | medium    |
| Wooden chair                 | 3.0       | medium    |
| Medium chest (wood)          | 4.0       | medium    |
| Wooden table                 | 5.0       | medium    |
| Human arm/leg                | 4.0–5.0   | medium    |
| Shield (wood)                | 5.0–6.0   | medium    |
| Rat                          | 0.8       | creatures |
| Dog                          | 3         | creatures |
| Goblin                       | 6         | creatures |
| Skeleton                     | 6–8       | creatures |
| Human                        | 8–12      | creatures |
| Orc                          | 12–15     | creatures |
| Troll                        | 15–20     | creatures |
| Ogre                         | 18–25     | creatures |
| Wooden door (interior)       | 10        | large     |
| Heavy reinforced wooden door | 15        | large     |
| Wooden bookshelf             | 12        | large     |
| Large chest / wardrobe       | 14        | large     |
| Barrel (empty)               | 8         | large     |
| Barrel (water)               | 12        | large     |
| Barrel (oil)                 | 15–20     | large     |
| Small tree                   | 20        | huge      |
| Medium tree                  | 30        | huge      |
| Large tree                   | 40        | huge      |
| Wooden watchtower            | 50–60     | huge      |
| Hut / shack wall segment     | 40–60     | huge      |
| Hill Giant                   | 30        | special   |
| Dragon (medium)              | 40        | special   |
| Dragon (ancient)             | 60–80     | special   |

Objects can be explosive - instantly trigger chance to light (perhaps with an increased change to ignite) over a larger area than the current 4 cardinal directions. would likely cause force damage during the explosion as well.

Using a FOV alg for explosions.

## Fluid dynamics

Something oil should spread to a steady state. Volume & viscosity
Volume is how much something can spread out - 1 unit per tile, so something with a volume of 20 can spread to 20 tiles
Viscosity is how quickly something spreads out. Water is very fast (low visosity), lava would be very slow (high viscosity).

Liquid can stack on items and should later according to density, so oil on water. Liquids might also spread more/differntly on top of another liquid - this could make oil spread more on top of water.

https://chatgpt.com/share/692766c2-ba18-8009-893b-ae1ac0182e28

- [ ] wet component to handle extinguishing flames
- [ ] all liquids should just be materials
- [ ] need to add a concept of source block for fill large areas or creating rivers etc.

## anatomy

What happens when a body has anatomy - owlbear has feather and fur materials above flesh material. Player has leather and cloth above flesh. Heat becomes important - heat transfer, insulation, destruction of items...

## z-index

enties have a layer component with the layer the component renders at.

| Layer | Description                                            |
| ----- | ------------------------------------------------------ |
| 100   | Floor/Walls                                            |
| 125   | terrain (grass etc)                                    |
| 150   | liquid                                                 |
| 200   | Pickups                                                |
| 225   | Ground GFX (blood, stains, shadows)                    |
| 250   | Interactive Feature (stairs, doors, etc)               |
| 300   | PC/NPC                                                 |
| 325   | Projectiles                                            |
| 350   | FX (slash arcs, fire, spell glows, damage popups, etx) |
| 400   | Volumetric VFX gas/smoke                               |

350 FX (slash arcs, spell glows, damage popups)
375 Lighting / fog-of-war overlay
400 Gas/Smoke (volumetric)
500 In-world UI / targeting cursor
1000 Screen-space UI
