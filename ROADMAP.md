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
  - [x] basic combat
- [x] Creating the Interface
  - [x] Legend
  - [x] Controls list
  - [x] Combat log
  - [x] Senses log
- [ ] Items and Inventory
  - [x] Item entities
  - [x] Inventory
  - [ ] Inventory UI
  - [x] Pickup controls
  - [ ] Drop controls
  - [ ] Healing potion
    - [ ] Effects system
- [ ] Ranged Weapons and Targeting
  - [ ] Cursor (inspect ui)
  - [ ] Targeting UI (for throwing)
  - [ ] Ability to throw things to a specified location
  - [ ] Coroner System
  - [ ] Damage System
  - [ ] Disallow throwing on and through walls
  - [ ] Thrown item cause damage
- [ ] Saving and loading
- [ ] Delving into the Dungeon
- [ ] Increasing Difficulty
- [ ] Gearing up
- [ ] Containers
- [ ] AI for actors to use own inventory
- [ ] Materials
- [ ] Sensory System
- [ ] Overworld map with multiple dungeons to explore
- [ ] Crafting
- [ ] Ability to shoot things from a ranged weapon
- [ ] color coded logs (ale-dsi/brogue-esque)
  - [ ] support writing mutiple colors to a text row
- [ ] Game cheats/debugging menu to toggle various modes



Inventory notes

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

