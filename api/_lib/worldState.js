function createWorldState(session){
  const characters=Array.isArray(session.characters)?session.characters:[];
  const npcLocations={},npcMemories={};
  for(const person of characters){
    if(!person||!person.id)continue;
    npcLocations[person.id]=String(person.currentLocation||person.location||session.location||'Unknown');
    const prior=Array.isArray(person.memories)?person.memories:Array.isArray(person.statements)?person.statements:[];
    npcMemories[person.id]=prior.slice(-12).map(x=>typeof x==='string'?x:String(x.text||x.memory||'')).filter(Boolean);
  }
  return {turn:0,playerLocation:String(session.location||'Unknown'),npcLocations,npcMemories,eventLog:[]};
}
function applyWorldEvents(previous,events,reply,characters,playerAction){
  const world=previous&&typeof previous==='object'?JSON.parse(JSON.stringify(previous)):{turn:0,playerLocation:'Unknown',npcLocations:{},npcMemories:{},eventLog:[]};
  world.turn=(Number(world.turn)||0)+1;
  world.npcLocations=world.npcLocations||{};
  world.npcMemories=world.npcMemories||{};
  world.eventLog=Array.isArray(world.eventLog)?world.eventLog:[];
  const people=Array.isArray(characters)?characters:[];
  const response=String(reply||'').toLowerCase();
  const action=String(playerAction||'').toLowerCase();
  for(const event of (Array.isArray(events)?events:[]).slice(0,12)){
    if(!event||typeof event!=='object')continue;
    const person=people.find(x=>x&&String(x.id)===String(event.characterId||event.personId||''));
    if(!person)continue;
    const name=String(person.name||'').trim().toLowerCase();
    if(event.type==='npc_moved'){
      const from=String(event.from||''),to=String(event.to||'').trim();
      const current=String(world.npcLocations[person.id]||person.currentLocation||'Unknown');
      const movement=/\b(walks?|travels?|moves?|leaves?|enters?|arrives?|follows?|heads?|returns?|departs?|goes)\b/i.test(reply||'');
      const named=name&&response.includes(name);
      const destination=to&&response.includes(to.toLowerCase());
      if(!to||!from||from!==current||!movement||!named||!destination)continue;
      world.npcLocations[person.id]=to;
      world.eventLog.push({turn:world.turn,type:'npc_moved',characterId:person.id,name:person.name,from,to});
    }else if(event.type==='npc_memory'){
      const memory=String(event.memory||'').trim().slice(0,500);
      if(!memory||!(name&&(response.includes(name)||action.includes(name))))continue;
      const list=world.npcMemories[person.id]||(world.npcMemories[person.id]=[]);
      if(!list.includes(memory))list.push(memory);
      world.npcMemories[person.id]=list.slice(-12);
      world.eventLog.push({turn:world.turn,type:'npc_memory',characterId:person.id,name:person.name,memory});
    }
  }
  world.eventLog=world.eventLog.slice(-80);
  return world;
}
function applyWorldStateToCharacters(session,world){
  session.characters=(Array.isArray(session.characters)?session.characters:[]).map(person=>{
    if(!person||!person.id)return person;
    return {...person,currentLocation:world.npcLocations?.[person.id]||person.currentLocation||session.location||'Unknown',memories:world.npcMemories?.[person.id]||person.memories||[]};
  });
  session.worldState=world;
  return session;
}
module.exports={createWorldState,applyWorldEvents,applyWorldStateToCharacters};
