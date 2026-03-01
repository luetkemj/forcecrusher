import {
  bash,
  beak,
  bite,
  claw,
  kick,
  lavaPunch,
  slash,
  stab,
  stomp,
} from "./melee";
import { kill } from "./rangedSpell";

export default {
  melee: { kick, bite, claw, lavaPunch, beak, bash, stomp, stab, slash },
  ranged: {},
  meleeSpell: {},
  rangedSpell: { kill },
};
