import { validateCharacter, abilityModifier, proficiencyBonus } from './rules.js';

export function createCharacter(input) {
  const level = Math.max(1, Math.min(20, Number(input.level) || 1));
  const abilities = { str:10, dex:10, con:10, int:10, wis:10, cha:10, ...(input.abilities || {}) };
  for (const [key, score] of Object.entries(abilities)) {
    if (!Number.isInteger(score) || score < 3 || score > 20) throw new RangeError(`${key.toUpperCase()} must be an integer from 3 to 20.`);
  }
  const con = abilityModifier(abilities.con);
  const hitDie = Math.max(1, Math.min(12, Number(input.hitDie) || 8));
  const maxHp = Math.max(1, Number(input.maxHp) || (hitDie + con + (level - 1) * Math.max(1, Math.floor(hitDie / 2) + 1 + con)));
  const character = {
    id: input.id || crypto.randomUUID(),
    name: String(input.name || 'Unnamed Adventurer').trim().slice(0, 60),
    species: String(input.species || ''),
    className: String(input.className || 'Adventurer'),
    level, xp: Number(input.xp) || 0, abilities,
    hp: Math.min(maxHp, Math.max(0, Number(input.hp ?? maxHp))),
    maxHp, ac: Math.max(1, Math.min(40, Number(input.ac) || 10)), hitDie,
    proficiencyBonus: proficiencyBonus(level),
    proficiencies: Array.isArray(input.proficiencies) ? [...new Set(input.proficiencies)] : [],
    savingThrowProficiencies: Array.isArray(input.savingThrowProficiencies) ? [...new Set(input.savingThrowProficiencies)] : [],
    equipment: Array.isArray(input.equipment) ? input.equipment : [],
    spells: Array.isArray(input.spells) ? input.spells : [],
    biography: String(input.biography || '').slice(0, 4000)
  };
  return validateCharacter(character);
}
export function characterSummary(character) {
  validateCharacter(character);
  return {
    id:character.id,name:character.name,className:character.className,species:character.species,
    level:character.level,xp:character.xp,proficiencyBonus:proficiencyBonus(character.level),
    abilities:Object.fromEntries(Object.entries(character.abilities).map(([key,score])=>[key,{score,modifier:abilityModifier(score)}])),
    hp:character.hp,maxHp:character.maxHp,ac:character.ac,equipment:character.equipment,spells:character.spells
  };
}
