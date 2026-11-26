const {getPool,verifyUser}=require('./_lib/db');
function body(req){return typeof req.body==='string'?JSON.parse(req.body):(req.body||{})}
function cleanName(value){const name=String(value||'').trim();if(!name||name.length>60)throw Object.assign(new Error('Character name must be 1-60 characters.'),{status:400});return name}
function cleanAbilities(value){const a=value&&typeof value==='object'?value:{};const result={};for(const k of ['str','dex','con','int','wis','cha']){const n=Number(a[k]??10);if(!Number.isInteger(n)||n<1||n>30)throw Object.assign(new Error('Ability scores must be whole numbers from 1 to 30.'),{status:400});result[k]=n}return result}
function cleanSheet(value){const s=value&&typeof value==='object'?value:{};return {genre:s.genre==='csi'?'csi':'dnd',experienceType:s.genre==='csi'?'detective':'dnd',skills:Array.isArray(s.skills)?s.skills.map(x=>String(x).slice(0,60)).slice(0,40):[],equipment:Array.isArray(s.equipment)?s.equipment.map(x=>String(x).slice(0,100)).slice(0,60):[],spells:Array.isArray(s.spells)?s.spells.map(x=>String(x).slice(0,100)).slice(0,60):[],biography:String(s.biography||'').slice(0,4000)}}
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
  const hp=Math.max(1,Math.min(10000,Math.floor(Number(b.maxHp)||10))),ac=Math.max(1,Math.min(40,Math.floor(Number(b.ac)||10)));
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
