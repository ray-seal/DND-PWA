const {getPool,verifyUser}=require('./_lib/db');\nconst crypto=require('node:crypto');

const XP={
  fantasy:{quest_completed:100,objective_completed:10,encounter_resolved:25,major_milestone:50},
  csi:{case_closed:100,evidence_verified:10,interview_insight:10,major_breakthrough:30},
  horror:{chapter_survived:50,objective_completed:10,threat_escaped:20,major_milestone:30}
};
const THRESHOLDS={
  fantasy:[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000],
  csi:[0,100,250,450,700,1000,1400,1900,2500,3200,4000,4900,5900,7000,8200,9500,10900,12400,14000,15700],
  horror:[0,100,250,500,850,1300,1900,2600,3500,4600,5900,7400,9100,11000,13100,15400,17900,20600,23500,26600]
};
const HIT_DIE={Barbarian:12,Fighter:10,Paladin:10,Ranger:10,Bard:8,Cleric:8,Druid:8,Monk:8,Rogue:8,Warlock:8,Sorcerer:6,Wizard:6};
function levelFor(xp,track){let level=1;for(let i=1;i<THRESHOLDS[track].length;i++)if(xp>=THRESHOLDS[track][i])level=i+1;return level}
function modifier(score){return Math.floor((Number(score||10)-10)/2)}
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Use POST to record progression.'})}
 let client;
 try{
  const user=await verifyUser(req),b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  const characterId=String(b.characterId||''),sessionId=String(b.sessionId||''),awardKey=String(b.awardKey||''),track=String(b.track||''),awardToken=String(b.awardToken||'');
  if(!/^[0-9a-f-]{36}$/i.test(characterId)||!/^[0-9a-f-]{36}$/i.test(sessionId))return res.status(400).json({error:'A valid character and adventure session are required.'});
  if(!/^[a-z0-9_-]{1,80}$/i.test(awardKey))return res.status(400).json({error:'Invalid progression event.'});
  if(!XP[track]||!XP[track][b.type])return res.status(400).json({error:'This progression event is not supported.'});\n  const parts=awardToken.split('.');if(parts.length!==2)return res.status(403).json({error:'Progression award was not issued by the game engine.'});const secret=process.env.ADVENTURE_STATE_SECRET||process.env.GEMINI_API_KEY;if(!secret)return res.status(503).json({error:'Progression signing is not configured.'});const expected=crypto.createHmac('sha256',secret).update(parts[0]).digest('base64url');const left=Buffer.from(expected),right=Buffer.from(parts[1]);if(left.length!==right.length||!crypto.timingSafeEqual(left,right))return res.status(403).json({error:'Invalid progression award signature.'});let signed;try{signed=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'))}catch{return res.status(403).json({error:'Invalid progression award.'})}if(signed.exp<Date.now()||signed.characterId!==characterId||signed.sessionId!==sessionId||signed.type!==b.type||signed.key!==awardKey)return res.status(403).json({error:'Progression award has expired or does not match.'});
  const amount=XP[track][b.type];
  client=await getPool().connect();await client.query('BEGIN');
  const found=await client.query('SELECT id,name,level,experience,abilities,class_name,sheet,max_hit_points,hit_points FROM public.characters WHERE id=$1 AND owner_id=$2 FOR UPDATE',[characterId,user.id]);
  if(!found.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Character not found.'})}
  const ch=found.rows[0],genre=ch.sheet?.genre==='dnd'?'fantasy':ch.sheet?.genre;
  if(genre!==track){await client.query('ROLLBACK');return res.status(400).json({error:'This award does not match the character experience.'})}
  const prior=await client.query('SELECT id FROM public.progression_awards WHERE character_id=$1 AND session_id=$2 AND award_key=$3',[characterId,sessionId,awardKey]);
  if(prior.rowCount){await client.query('ROLLBACK');return res.status(200).json({awarded:false,duplicate:true,character:{id:ch.id,level:ch.level,experience:ch.experience}})}
  const daily=await client.query("SELECT COALESCE(sum(xp_awarded),0)::int AS total FROM public.progression_awards WHERE character_id=$1 AND created_at >= date_trunc('day',now())",[characterId]);
  const session=await client.query('SELECT COALESCE(sum(xp_awarded),0)::int AS total FROM public.progression_awards WHERE character_id=$1 AND session_id=$2',[characterId,sessionId]);
  const xp=Math.min(amount,Math.max(0,500-Number(daily.rows[0].total)),Math.max(0,250-Number(session.rows[0].total)));
  if(!xp){await client.query('ROLLBACK');return res.status(200).json({awarded:false,limitReached:true,character:{id:ch.id,level:ch.level,experience:ch.experience}})}
  await client.query('INSERT INTO public.progression_awards(owner_id,character_id,session_id,award_key,award_type,xp_awarded,evidence) VALUES($1,$2,$3,$4,$5,$6,$7)',[user.id,characterId,sessionId,awardKey,b.type,xp,JSON.stringify({source:'validated-adventure-milestone'})]);
  const oldXp=Number(ch.experience)||0,newXp=oldXp+xp,newLevel=levelFor(newXp,track),levelGain=newLevel-Number(ch.level||1);
  let maxHp=Number(ch.max_hit_points)||0,hp=Number(ch.hit_points)||0,sheet=ch.sheet||{};
  if(track==='fantasy'&&levelGain>0){
   const die=HIT_DIE[ch.class_name]||8,con=modifier(ch.abilities?.con),gain=levelGain*Math.max(1,Math.floor(die/2)+1+con);
   maxHp+=gain;hp+=gain;
   sheet={...sheet,dndStats:{...(sheet.dndStats||{}),maxHp,proficiencyBonus:Math.ceil(newLevel/4)+1}};
  }
  const updated=await client.query('UPDATE public.characters SET experience=$3,level=$4,max_hit_points=$5,hit_points=$6,sheet=$7,version=version+1,updated_at=now() WHERE id=$1 AND owner_id=$2 RETURNING id,name,level,experience,max_hit_points,hit_points,sheet',[characterId,user.id,newXp,newLevel,maxHp,hp,JSON.stringify(sheet)]);
  await client.query('COMMIT');
  return res.status(200).json({awarded:true,xpAwarded:xp,levelledUp:levelGain>0,levelsGained:levelGain,character:updated.rows[0]});
 }catch(e){if(client)await client.query('ROLLBACK').catch(()=>{});console.error('Progression API:',e);return res.status(e.status||500).json({error:e.status?e.message:'Could not update character progression.'})}
 finally{client?.release()}
};
