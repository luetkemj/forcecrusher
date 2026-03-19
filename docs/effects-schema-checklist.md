## Proposed Schema: Effect System

### Goals
- Support both instant and timed effects.
- Prevent permanent stat drift for temporary buffs.
- Allow additive stacking with independent durations.
- Keep health healing permanent when intended.
- Support optional reset-to-base behavior on expiry.

### Type Model

#### EffectableStat
- base: number
- current: number
- min: number
- max: number

Notes:
- base is the stable recompute anchor.
- current is recomputed for derived/timed stats and directly mutated for instant-only stats where appropriate.

#### EffectComponent
- health
- speed

#### EffectMode
- instant: applied once, then removed.
- timed: active for duration, contributes during recompute until expiry.

#### EffectApplyKind
- deltaCurrent: adds to current once (example: heal potion).
- deltaBase: modifies base while active (example: fortify speed).
- deltaMax: modifies max while active (example: temporary max-health bonus).

#### StackPolicy
- additive
- refreshDuration
- strongestOnly

#### TimedEffect
- id: string
- source: item | spell | ability | environment
- component: EffectComponent
- applyKind: EffectApplyKind
- delta: number
- mode: timed
- durationTurns: number
- appliedTurn: number
- expiresAtTurn: number
- stackPolicy: StackPolicy
- ignoreMin?: boolean
- ignoreMax?: boolean
- resetToBaseOnExpire?: boolean

#### InstantEffect
- id: string
- source: item | spell | ability | environment
- component: EffectComponent
- applyKind: EffectApplyKind
- delta: number
- mode: instant
- ignoreMin?: boolean
- ignoreMax?: boolean

#### Entity Effect Fields
- pendingEffects: InstantEffect[]
- activeTimedEffects: TimedEffect[]

### Processing Rules

1. Apply pending instant effects once.
- Resolve by applyKind.
- Clamp unless ignoreMin/ignoreMax explicitly allow overflow/underflow.
- Remove from pending queue after apply.

2. Recompute derived stats each tick/turn from stable anchors.
- Start from stat.base.
- Apply all active timed deltas for matching component and applyKind.
- Write computed value to stat.current.
- Apply clamp rules.

3. Expiry check.
- If globalTurn >= expiresAtTurn, remove timed effect.
- If resetToBaseOnExpire is true, force recompute from base without expired effect.

4. Health policy.
- Instant healing uses deltaCurrent and persists.
- Temporary max-health uses timed deltaMax.
- On expiry of deltaMax, clamp current to resulting max.

5. Stacking policy.
- additive: sum all deltas.
- refreshDuration: replace timer for same signature.
- strongestOnly: keep strongest magnitude effect.

### Example Authoring

- Heal potion:
  - mode: instant
  - applyKind: deltaCurrent
  - component: health
  - delta: +25

- Haste potion:
  - mode: timed
  - applyKind: deltaBase
  - component: speed
  - delta: +100
  - durationTurns: 10
  - stackPolicy: additive
  - resetToBaseOnExpire: true

- Fortify health:
  - mode: timed
  - applyKind: deltaMax
  - component: health
  - delta: +20
  - durationTurns: 20
  - stackPolicy: additive

## Implementation Checklist

### Phase 1: Stabilize Existing Behavior
1. Fix clamp branching in active effects processing so normal deltas do not snap to min/max.
2. Add tests for non-overflow positive/negative deltas and ignoreMin/ignoreMax semantics.
3. Add test coverage for speed effects, not just health.

### Phase 2: Introduce New Schema
1. Add schema fields for mode, applyKind, duration, stacking, reset behavior.
2. Add entity fields pendingEffects and activeTimedEffects.
3. Keep backward compatibility parser for old effect entries during migration.

### Phase 3: Resolver Refactor
1. Split resolver into three stages:
- apply instant queue
- recompute timed-derived stats
- expire timed effects
2. Use global turn clock for expiry decisions.
3. Ensure recompute is deterministic and order-safe.

### Phase 4: Producer Migration
1. Update consumables to enqueue instant or timed effects explicitly.
2. Convert haste potion to timed speed effect.
3. Keep heal potion as instant deltaCurrent.
4. Migrate temporary spell stat buffs to the same model where applicable.

### Phase 5: Save/Load and Compatibility
1. Persist activeTimedEffects and any necessary anchor fields.
2. Restore timed effects with correct remaining duration after load.
3. Validate backward compatibility for old saves where possible.

### Phase 6: Verification
1. Unit tests for:
- additive stacking
- independent expiry
- refreshDuration behavior
- strongestOnly behavior
2. Integration tests for:
- haste applies then expires without permanent speed drift
- heal remains permanent
- temporary max-health expires and clamps current health
3. Manual checks:
- save/load mid-duration preserves remaining turns
- UI displays active effects and remaining turns correctly

### Scope Guardrails
- Include: health and speed first, potion and spell producers, save/load consistency.
- Exclude for first pass: complex non-numeric status side effects and AI behavior coupling.
