# GameLife Project Rules

GameLife is a Russian text-based life simulator. The player lives from birth to death through yearly choices, random events, stats, family, relationships, education, career, money, assets, business, health, documents, crime, reputation, and legacy.

## Product Rules

- The game is Russian-first: UI text, events, actions, data, and documentation should be written in Russian unless there is a strong technical reason.
- Do not copy BitLife literally: no borrowed branding, interface, texts, names, event wording, paid-pack concepts, unique mechanics, icons, or distinctive presentation.
- The game may use the broad life-simulator genre idea, but every system and text must be original to GameLife.

## Architecture Rules

- All new gameplay logic should be data-driven where practical.
- Random events must be described as data objects, then resolved by engine code.
- Every simulation change should go through engine functions in `engine/`.
- UI code in `ui/` should render state and call engine actions; it should not directly own complex state transitions.
- Shared state helpers belong in `state.js`; static catalogs belong in `data/`; random helpers belong in `utils/random.js`.
- Save/load concerns belong in `storage/saveLoad.js`.
- Keep `game.js` as a thin bootstrap file.

## Change Rules

- Preserve static launch through `index.html`.
- Keep changes small and scoped.
- Do not add gameplay features during architecture-only refactors.
- After changing simulation code, run available checks and manually verify the game starts.
