import React, { useState } from 'react';
import { DiceRoller } from 'rpg-dice-roller';

export default function DiceRollerComponent() {
  const [expr, setExpr] = useState('1d20+3');
  const [result, setResult] = useState('');

  function roll() {
    try {
      const dr = new DiceRoller();
      const r = dr.roll(expr);
      setResult(r.output);
    } catch (e) {
      setResult('Invalid expression');
    }
  }

  return (
    <div>
      <h2>Dice Roller</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input value={expr} onChange={(e) => setExpr(e.target.value)} style={{ width: 260, padding: 6 }} />
        <button onClick={roll} style={{ marginLeft: 8, padding: '6px 10px' }}>Roll</button>
      </div>
      <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{result}</div>
    </div>
  );
}
