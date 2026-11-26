# StoryFoundry tabletop RPG architecture

## Product direction

StoryFoundry's D&D experience becomes a persistent tabletop RPG, not a chat prompt that improvises its own arithmetic. The same platform should support:

- A solo player with an AI Dungeon Master and AI companions.
- A human Dungeon Master with human and AI-controlled players.
- Persistent player characters that can join multiple campaigns.
- Campaign-specific character copies/snapshots so a DM can run a one-shot without corrupting a player's main character.
- AI player personas with configurable experience and table behaviour.
- Verifiable dice, combat, character progression, inventory and campaign state.

## Authority boundaries

**Deterministic game engine owns:** dice generation, modifiers, proficiency, checks, saves, attack rolls, damage, initiative, HP, conditions, inventory mutations, XP awards, level thresholds, character-sheet validation and encounter budgets.

**AI director owns:** narration, NPC dialogue, scene framing, descriptions, tactical suggestions, adjudication proposals and consequences expressed as structured requests to the rules engine.

The model must never invent a die result, silently change a character statistic, award XP directly, edit inventory directly, or override a resolved engine result. The server validates every proposed action and commits the authoritative result.

## Character and campaign model

- Account: authentication identity and profile.
- Character: reusable player-owned canonical sheet, progression, equipment, abilities, proficiencies and biography.
- Campaign: ruleset/version, owner/DM, table settings, world state and current session.
- Campaign membership: role (DM/player/AI player), permissions and AI persona configuration.
- Campaign character: a campaign-scoped copy or snapshot of a reusable character, including campaign-specific HP, spell slots, conditions and temporary effects.
- Turn/action: player intent, model proposal, validated rules events, dice results and narration.
- Event log: append-only record of rolls, damage, healing, inventory changes, XP and level-ups. Current state is a projection of this log.

Character progression is owned by the character record and updated only by validated campaign rewards. Campaign snapshots prevent one-shot or experimental campaigns from corrupting the player's long-running character.

## AI player skill personas

Provide a skill setting independent of character level:

- **New player:** asks basic rules questions, seeks confirmation, makes understandable mistakes, uses simple tactics and requests explanations. Example: "Could I in theory make that jump?" or "What do you suppose would happen if I cast Fireball in here?"
- **Learning player:** understands core actions, asks occasional clarifying questions and tries straightforward teamwork.
- **Experienced player:** understands action economy, common conditions, positioning and class features, but can still make human mistakes.
- **Veteran / rules-savvy:** notices inconsistent modifiers, asks for the exact roll breakdown, challenges rulings politely and proposes tactical alternatives. It cannot change dice or rules and must accept a transparent correction when the DM is right.

A separate personality slider can control confidence, caution, humour, roleplay intensity and rules-lawyer tendency. Skill level changes decision quality and question frequency, not the character's stats or the dice.

## Fair difficulty and anti-power-farming

- Use party composition, average level, equipment, resources, action economy and encounter context, not only the highest-level character.
- Avoid linear scaling alone: a high-level character joining low-level characters should create a mixed-level challenge, not simply make every enemy enormous.
- Rewards require server-validated milestones, challenge completion or meaningful objectives. Repeating a trivial encounter cannot farm full XP.
- Use diminishing or zero XP for repeated low-risk encounters, with DM override logged and visible to players.
- Keep campaign difficulty and player character level separate. DMs can choose fixed-level one-shots, level bands, or adaptive campaign encounters.
- Never silently nerf a character's sheet to force balance. Scale the world, use objectives and constraints, and make danger legible.

## Dice and rules

First implementation target: a clearly declared D&D 5e-compatible core ruleset with its exact version recorded on each campaign. All rolls are server-side and auditable. Each roll stores die faces, modifiers, proficiency, advantage/disadvantage, target DC/AC, total and outcome. UI shows the breakdown. Advantage/disadvantage rolls two d20s and selects the higher/lower; natural 1/20 behaviour follows the chosen ruleset and roll type.

## Persistence and authentication

The current browser-local saves remain available as an offline/guest mode. Accounts unlock reusable characters, cloud campaigns, invitations, cross-device play and DM/player roles. Use a dedicated StoryFoundry database project with row-level ownership checks. Do not repurpose the existing Speakly, CardBuddy or Clive databases.

Supabase is a strong fit for the account layer because Auth and Postgres ownership policies are integrated. Before provisioning a new project, confirm the organisation and any quoted recurring cost. The database must use row-level security for profiles, characters, campaigns, memberships, events and invitations. Gemini API keys remain server-side in Vercel.

## Delivery stages

1. Rules core and unit tests (this branch): deterministic D20, ability/skill checks, saves, attacks, initiative, XP thresholds and encounter-budget primitives.
2. Character sheet UX: create/edit sheets, derived statistics, equipment, HP, conditions and roll history.
3. Server-authoritative D&D turn pipeline: AI proposes a check/action, rules engine resolves it, AI narrates the result.
4. Authentication and cloud persistence: reusable characters, campaign memberships, event log and guest migration.
5. AI companions: persona skill levels and transparent roll/action execution.
6. Human DM mode: create campaign, invite players, control scenes, approve/override rulings with an audit trail, assign AI players.
7. Progression and balance: milestone/XP rewards, anti-farming, level-aware encounter composition and campaign difficulty controls.

## Important scope boundary

The existing crime, horror and fantasy experiences should continue to use the narrative director. The deterministic tabletop engine is initially D&D-specific, but its event and campaign architecture should be reusable for future systems.
