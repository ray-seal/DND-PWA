const DND_THRESHOLDS = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const DETECTIVE_THRESHOLDS = [0,100,250,450,700,1000,1400,1900,2500,3200,4000,4900,5900,7000,8200,9500,10900,12400,14000,15700];
export function levelForProgression(xp, track='dnd') {
  if (!Number.isInteger(xp) || xp < 0) throw new RangeError('XP must be a non-negative integer.');
  const thresholds = track === 'detective' ? DETECTIVE_THRESHOLDS : DND_THRESHOLDS;
  let level = 1;
  for (let i=1;i<thresholds.length;i++) if (xp >= thresholds[i]) level=i+1;
  return level;
}
export function progressionTrackFor(character) {
  return character?.experienceType === 'detective' || character?.genre === 'csi' ? 'detective' : 'dnd';
}
export function progressSummary(character) {
  const track=progressionTrackFor(character), thresholds=track==='detective'?DETECTIVE_THRESHOLDS:DND_THRESHOLDS;
  const level=levelForProgression(Number(character.xp)||0,track);
  const next=thresholds[level] ?? null;
  const current=thresholds[level-1] ?? 0;
  return {track,level,xp:Number(character.xp)||0,currentLevelXp:current,nextLevelXp:next,xpToNext:next===null?0:Math.max(0,next-(Number(character.xp)||0)),progress:next===null?100:Math.min(100,((Number(character.xp)||0)-current)/(next-current)*100)};
}
export const DETECTIVE_SKILL_GROUPS = Object.freeze({
  investigation:['Observation','Evidence handling','Scene examination','Deduction','Research','Digital forensics','Interviewing','Interrogation','Empathy','Situational awareness']
});
export const DETECTIVE_THRESHOLDS_FOR_TESTS = DETECTIVE_THRESHOLDS;
