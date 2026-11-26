import React from 'react';

/**
 * Reserved boundary for the tabletop campaign UI. Keep D&D-specific sheets and
 * encounter controls out of the narrative-only experience screens.
 */
export function GameShell({ children }) {
  return <section className="game-shell">{children}</section>;
}
