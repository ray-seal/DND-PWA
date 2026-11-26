import {createRequire} from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {createWorldState,applyWorldEvents,applyWorldStateToCharacters}=require('./worldState.js');

test('initialises a stable location and memory ledger for each NPC',()=>{
  const world=createWorldState({location:'The Drowning Rat',characters:[{id:'barnaby',name:'Barnaby'}]});
  assert.equal(world.npcLocations.barnaby,'The Drowning Rat');
  assert.deepEqual(world.npcMemories.barnaby,[]);
});

test('does not let an NPC teleport without a matching narrated movement event',()=>{
  const state=createWorldState({location:'The Drowning Rat',characters:[{id:'barnaby',name:'Barnaby'}]});
  const next=applyWorldEvents(state,[{type:'npc_moved',characterId:'barnaby',from:'The Drowning Rat',to:'Eel Street safehouse'}],"Barnaby tells you the safehouse is on Eel Street.",[{id:'barnaby',name:'Barnaby'}],"Ask Barnaby about the safehouse");
  assert.equal(next.npcLocations.barnaby,'The Drowning Rat');
});

test('accepts an NPC move only when the response narrates it and the from-location matches',()=>{
  const state=createWorldState({location:'The Drowning Rat',characters:[{id:'barnaby',name:'Barnaby'}]});
  const next=applyWorldEvents(state,[{type:'npc_moved',characterId:'barnaby',from:'The Drowning Rat',to:'Eel Street safehouse'}],"Barnaby leaves the tavern and heads to the Eel Street safehouse.",[{id:'barnaby',name:'Barnaby'}],"Tell Barnaby to go to the safehouse");
  assert.equal(next.npcLocations.barnaby,'Eel Street safehouse');
});

test('persists meaningful NPC memories across turns',()=>{
  const state=createWorldState({location:'The Drowning Rat',characters:[{id:'barnaby',name:'Barnaby'}]});
  const next=applyWorldEvents(state,[{type:'npc_memory',characterId:'barnaby',memory:'The player threatened him with a hungry direwolf.'}],"Barnaby nervously remembers your direwolf threat.",[{id:'barnaby',name:'Barnaby'}],"Remind Barnaby about the direwolf");
  const session=applyWorldStateToCharacters({characters:[{id:'barnaby',name:'Barnaby'}]},next);
  assert.match(session.characters[0].memories[0],/direwolf/);
});
