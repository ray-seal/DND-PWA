const {getPool,verifyUser}=require('./_lib/db');
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'})}
  try{
    const user=await verifyUser(req),db=getPool();
    if(req.method==='GET'){
      const result=await db.query('SELECT id,name,species,class_name,level,experience,abilities,hit_points,max_hit_points,armour_class,sheet,version,created_at,updated_at FROM public.characters WHERE owner_id=$1 ORDER BY updated_at DESC',[user.id]);
      return res.status(200).json({characters:result.rows});
    }
    const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{}),name=String(b.name||'').trim();
    if(!name||name.length>60)return res.status(400).json({error:'Character name must be 1-60 characters.'});
    const level=Math.max(1,Math.min(20,Number(b.level)||1)),xp=Math.max(0,Math.floor(Number(b.xp)||0));
    const hp=Math.max(0,Math.floor(Number(b.hp)||1)),maxHp=Math.max(1,Math.floor(Number(b.maxHp)||1));
    if(hp>maxHp)return res.status(400).json({error:'Current HP cannot exceed maximum HP.'});
    const result=await db.query('INSERT INTO public.characters(owner_id,name,species,class_name,level,experience,abilities,hit_points,max_hit_points,armour_class,sheet) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,name,level,experience,hit_points,max_hit_points,armour_class,version',
      [user.id,name,String(b.species||''),String(b.className||''),level,xp,JSON.stringify(b.abilities||{}),hp,maxHp,Math.max(1,Math.min(40,Number(b.ac)||10)),JSON.stringify(b.sheet||{})]);
    return res.status(201).json({character:result.rows[0]});
  }catch(e){console.error('Characters API:',e);return res.status(e.status||500).json({error:e.status?e.message:'Could not process characters request.'})}
};
