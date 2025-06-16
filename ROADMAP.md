# Roadmap

This is aspirational only. Expect anything and everything in this document to be changed, ignored, or abandoned.

100% GUARANTEED!

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
- [ ] doors from skrimshank
- [ ] morgue file (game over screen)
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
- [ ] Sensory System
- [ ] Overworld map with multiple dungeons to explore
- [ ] Crafting
- [ ] Ability to shoot things from a ranged weapon
- [ ] Game cheats/debugging menu to toggle various modes
- [ ] save to indexDB (local storage collapses after 6 levels)
- [ ] inventory select armor/weapons so they can be removed
- [ ] dykstra maps
- [ ] lightsources from skrimshank
- [ ] map gen from shank

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
