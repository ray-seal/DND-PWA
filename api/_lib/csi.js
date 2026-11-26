const ASSISTANCE_COSTS = Object.freeze({ gentle: 10, directional: 25, direct: 50 });

function assistanceLevel(hintLevel) {
  const level = Math.max(0, Math.min(3, Number(hintLevel) || 0));
  return level === 1 ? 'gentle' : level === 2 ? 'directional' : level === 3 ? 'direct' : null;
}

function recordAssistance(state, hintLevel) {
  const kind = assistanceLevel(hintLevel);
  if (!kind) return state;
  const previous = state.csiAssistance || { gentle: 0, directional: 0, direct: 0 };
  return {
    ...state,
    csiAssistance: { ...previous, [kind]: (Number(previous[kind]) || 0) + 1 }
  };
}

function calculateCaseScore({ baseXp = 0, discoveries = 0, verifiedFindings = 0, falseLeadsResolved = 0, timelineEstablished = false, culpritIdentified = false, assistance = {} } = {}) {
  const earned = Math.max(0, Math.round(baseXp))
    + Math.max(0, discoveries) * 20
    + Math.max(0, verifiedFindings) * 30
    + Math.max(0, falseLeadsResolved) * 15
    + (timelineEstablished ? 75 : 0)
    + (culpritIdentified ? 150 : 0);
  const deductions = Math.max(0, Number(assistance.gentle) || 0) * ASSISTANCE_COSTS.gentle
    + Math.max(0, Number(assistance.directional) || 0) * ASSISTANCE_COSTS.directional
    + Math.max(0, Number(assistance.direct) || 0) * ASSISTANCE_COSTS.direct;
  return { earned, deductions, finalXp: Math.max(0, earned - deductions), assistance: { ...assistance } };
}

// Preserve the sealed case's canonical answer and evidence catalogue. The model may
// narrate discoveries, but it cannot rewrite the underlying case between turns.
function preserveCaseTruth(previous, proposed) {
  if (!previous || !proposed) return proposed;
  const locked = ['truth', 'timeline', 'world', 'caseFile'];
  const next = { ...proposed };
  for (const key of locked) {
    if (Object.prototype.hasOwnProperty.call(previous, key)) next[key] = previous[key];
  }
  if (Array.isArray(previous.clues)) {
    const proposedById = new Map((Array.isArray(proposed.clues) ? proposed.clues : []).map(clue => [clue.id, clue]));
    next.clues = previous.clues.map(clue => {
      const candidate = proposedById.get(clue.id) || {};
      return { ...clue, discovered: Boolean(clue.discovered || candidate.discovered) };
    });
  }
  if (Array.isArray(previous.facts)) next.facts = previous.facts;
  return next;
}

module.exports = { ASSISTANCE_COSTS, assistanceLevel, recordAssistance, calculateCaseScore, preserveCaseTruth };
