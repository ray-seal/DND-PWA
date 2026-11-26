const {getPool,verifyUser}=require('./_lib/db');
function body(req){return typeof req.body==='string'?JSON.parse(req.body):(req.body||{})}
function cleanName(value){const name=String(value||'').trim();if(!name||name.length>60)throw Object.assign(new Error('Character name must be 1-60 characters.'),{status:400});return name}
function cleanAbilities(value){const a=value&&typeof value==='object'?value:{};const result={};for(const k of ['str','dex','con','int','wis','cha']){const n=Number(a[k]??10);if(!Number.isInteger(n)||n<3||n>20)throw Object.assign(new Error('D&D ability scores must be whole numbers from 3 to 20.'),{status:400});result[k]=n}return result}
const CLASS_RULES={
 Barbarian:{die:12,saves:['str','con'],armour:'Unarmoured',weapon:'Greataxe',slots:0,mode:'barbarian'},
 Bard:{die:8,saves:['dex','cha'],armour:'Leather armour',weapon:'Rapier',slots:2},
 Cleric:{die:8,saves:['wis','cha'],armour:'Scale mail',weapon:'Mace',slots:2},
 Druid:{die:8,saves:['int','wis'],armour:'Leather armour',weapon:'Scimitar',slots:2},
 Fighter:{die:10,saves:['str','con'],armour:'Chain mail',weapon:'Longsword',slots:0},
 Monk:{die:8,saves:['str','dex'],armour:'Unarmoured',weapon:'Shortsword',slots:0,mode:'monk'},
 Paladin:{die:10,saves:['wis','cha'],armour:'Chain mail',weapon:'Longsword',slots:0},
 Ranger:{die:10,saves:['str','dex'],armour:'Scale mail',weapon:'Longbow',slots:0},
 Rogue:{die:8,saves:['dex','int'],armour:'Leather armour',weapon:'Rapier',slots:0},
 Sorcerer:{die:6,saves:['con','cha'],armour:'Unarmoured',weapon:'Dagger',slots:2},
 Warlock:{die:8,saves:['wis','cha'],armour:'Leather armour',weapon:'Light crossbow',slots:1},
 Wizard:{die:6,saves:['int','wis'],armour:'Unarmoured',weapon:'Quarterstaff',slots:2}
};
const ARMOUR_AC={'Unarmoured':10,'Leather armour':11,'Scale mail':14,'Chain mail':16};
function derivedDnd(className,abilities,level=1){
 const rule=CLASS_RULES[className]||CLASS_RULES.Fighter,mod=k=>Math.floor(((abilities[k]??10)-10)/2),dex=mod('dex');
 const hp=Math.max(1,rule.die+mod('con')+(level-1)*(Math.ceil(rule.die/2)+1+mod('con')));
 let ac=ARMOUR_AC[rule.armour]+(rule.armour==='Chain mail'?0:rule.armour==='Scale mail'?Math.min(2,dex):dex);
 if(rule.mode==='barbarian')ac=10+dex+mod('con');
 if(rule.mode==='monk')ac=10+dex+mod('wis');
 return {hitDie:rule.die,savingThrows:rule.saves,armour:rule.armour,weapon:rule.weapon,spellSlots:rule.slots,spellSlotLevel:1,proficiencyBonus:Math.ceil(level/4)+1,maxHp:hp,armourClass:ac};
}
function cleanSheet(value){const s=value&&typeof value==='object'?value:{};return {genre:['dnd','csi','horror','fantasy'].includes(s.genre)?s.genre:'dnd',experienceType:s.genre==='csi'?'detective':s.genre==='horror'?'horror':s.genre==='fantasy'?'fantasy':'dnd',skills:Array.isArray(s.skills)?s.skills.map(x=>String(x).slice(0,60)).slice(0,5):[],equipment:Array.isArray(s.equipment)?s.equipment.map(x=>String(x).slice(0,100)).slice(0,60):[],spells:Array.isArray(s.spells)?s.spells.map(x=>String(x).slice(0,100)).slice(0,60):[],biography:String(s.biography||'').slice(0,4000)}}
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST','PATCH','DELETE'].includes(req.method)){res.setHeader('Allow','GET, POST, PATCH, DELETE');return res.status(405).json({error:'Method not allowed.'})}
 try{
  const user=await verifyUser(req),db=getPool();
  if(req.method==='GET'){
   const result=await db.query('SELECT id,name,species,class_name,level,experience,abilities,hit_points,max_hit_points,armour_class,sheet,version,created_at,updated_at FROM public.characters WHERE owner_id=$1 ORDER BY updated_at DESC',[user.id]);
   return res.status(200).json({characters:result.rows});
  }
  const b=body(req),id=String(b.id||'');
  if(req.method==='DELETE'){
   if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'A valid character id is required.'});
   const result=await db.query('DELETE FROM public.characters WHERE id=$1 AND owner_id=$2 RETURNING id',[id,user.id]);
   if(!result.rowCount)return res.status(404).json({error:'Character not found.'});
   return res.status(200).json({deleted:true});
  }
  const name=cleanName(b.name),species=String(b.species||'').slice(0,80),className=String(b.className||'Adventurer').slice(0,80);
  const abilities=cleanAbilities(b.abilities),sheet=cleanSheet(b.sheet);
  const speciesBonus=sheet.genre==='dnd'?{Human:{str:1,dex:1,con:1,int:1,wis:1,cha:1},Elf:{dex:2},Dwarf:{con:2},Halfling:{dex:2},Dragonborn:{str:2,cha:1},Gnome:{int:2},'Half-Elf':{cha:2},'Half-Orc':{str:2,con:1},Tiefling:{int:1,cha:2}}[species]||{}:{};
  for(const key of ['str','dex','con','int','wis','cha'])abilities[key]=Math.min(20,abilities[key]+(speciesBonus[key]||0));
  const dndStats=sheet.genre==='dnd'?derivedDnd(className,abilities,1):null;
  const hp=dndStats?dndStats.maxHp:sheet.genre==='csi'?0:Math.max(1,Math.min(10000,Math.floor(Number(b.maxHp)||10))),ac=dndStats?dndStats.armourClass:sheet.genre==='csi'?0:Math.max(1,Math.min(40,Math.floor(Number(b.ac)||10)));
  if(dndStats)sheet.dndStats=dndStats;
  if(req.method==='POST'){
   const result=await db.query('INSERT INTO public.characters(owner_id,name,species,class_name,level,experience,abilities,hit_points,max_hit_points,armour_class,sheet) VALUES($1,$2,$3,$4,1,0,$5,$6,$6,$7,$8) RETURNING id,name,species,class_name,level,experience,abilities,hit_points,max_hit_points,armour_class,sheet,version,created_at,updated_at',
    [user.id,name,species,className,JSON.stringify(abilities),hp,ac,JSON.stringify(sheet)]);
   return res.status(201).json({character:result.rows[0]});
  }
  if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'A valid character id is required.'});
  const result=await db.query('UPDATE public.characters SET name=$3,species=$4,class_name=$5,abilities=$6,hit_points=LEAST(hit_points,$7),max_hit_points=$7,armour_class=$8,sheet=$9,version=version+1,updated_at=now() WHERE id=$1 AND owner_id=$2 RETURNING id,name,species,class_name,level,experience,abilities,hit_points,max_hit_points,armour_class,sheet,version,created_at,updated_at',
   [id,user.id,name,species,className,JSON.stringify(abilities),hp,ac,JSON.stringify(sheet)]);
  if(!result.rowCount)return res.status(404).json({error:'Character not found.'});
  return res.status(200).json({character:result.rows[0]});
 }catch(e){console.error('Characters API:',e);return res.status(e.status||500).json({error:e.status?e.message:'Could not process characters request.'})}
};
