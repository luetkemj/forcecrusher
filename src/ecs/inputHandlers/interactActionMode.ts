import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn } from "../gameState";
import { Keys } from "./KeyMap";

export const handleInteractActionModeInput = ({
  key,
  world,
  registry,
  state,
  setState,
}: InputContext) => {
  if (key === Keys.INTERACT || key === Keys.CANCEL) {
    setState((state: State) => {
      state.gameState = GameState.GAME;
    });
  }

  const { interaction, interactActions } = state;

  const interactor = interaction.interactor
    ? registry.get(interaction.interactor)
    : undefined;

  const target = interaction.target
    ? registry.get(interaction.target)
    : undefined;

  const applicator = interaction.applicator
    ? registry.get(interaction.applicator)
    : undefined;

  if (!target) return;

  const afterInteractCleanUp = () => {
    setState((state: State) => {
      state.interaction = {};
      state.interactTargets = [];
      state.gameState = GameState.GAME;
      state.turn = Turn.WORLD;
    });
  };

  // attack
  if (interactActions.includes(`§${Keys.ATTACK}§`)) {
    if (key === Keys.ATTACK) {
      if (interactor && target) {
        world.addComponent(interactor, "tryAttack", { targetId: target.id });
      }
      afterInteractCleanUp();
      return true;
    }
  }
  // close
  if (interactActions.includes(`§${Keys.CONSUME}§`)) {
    if (key === Keys.CONSUME) {
      if (interactor && target) {
        world.addComponent(interactor, "tryClose", target);
      }
      afterInteractCleanUp();
      return true;
    }
  }
  // get
  if (interactActions.includes(`§${Keys.PICK_UP}§`)) {
    if (key === Keys.PICK_UP) {
      if (interactor && target) {
        world.addComponent(target, "tryPickUp", {
          pickerId: interactor.id,
        });
      }
      afterInteractCleanUp();
      return true;
    }
  }
  // kick
  if (interactActions.includes(`§${Keys.KICK}§`)) {
    if (key === Keys.KICK) {
      if (interactor && target) {
        world.addComponent(interactor, "tryKick", { targetId: target.id });
      }
      afterInteractCleanUp();
      return true;
    }
  }

  // fill
  // need the fluid container target and source (source is floor, target is bottle)
  if (interactActions.includes(`§${Keys.FILL}§`)) {
    if (key === Keys.FILL) {
      if (applicator && target) {
        world.addComponent(applicator, "tryFill", {
          targetId: target.id,
        });
      }
      afterInteractCleanUp();
      return true;
    }
  }

  // open
  if (interactActions.includes(`§${Keys.OPEN}§`)) {
    if (key === Keys.OPEN) {
      if (interactor && target) {
        world.addComponent(interactor, "tryOpen", { id: target.id });
      }
      afterInteractCleanUp();
      return true;
    }
  }
};
