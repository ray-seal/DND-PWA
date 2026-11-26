const {getPool,verifyUser}=require('./_lib/db');
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'||req.method==='POST'){
    try{
      const user=await verifyUser(req),db=getPool();
      if(req.method==='GET'){
        const result=await db.query('SELECT c.id,c.title,c.ruleset,c.status,c.dm_mode,c.difficulty,c.created_at,c.updated_at FROM public.campaigns c JOIN public.campaign_members m ON m.campaign_id=c.id WHERE m.user_id=$1 ORDER BY c.updated_at DESC',[user.id]);
        return res.status(200).json({campaigns:result.rows});
      }
      const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
      const title=String(b.title||'').trim();
      if(!title||title.length>100)return res.status(400).json({error:'Campaign title must be 1-100 characters.'});
      const client=await db.connect();
      try{
        await client.query('BEGIN');
        const campaign=await client.query('INSERT INTO public.campaigns(owner_id,title,ruleset,status,dm_mode,difficulty) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,title,ruleset,status,dm_mode,difficulty',[user.id,title,'dnd5e-2014','active',b.dmMode==='human'?'human':'ai',String(b.difficulty||'balanced')]);
        await client.query('INSERT INTO public.campaign_members(campaign_id,user_id,role) VALUES($1,$2,$3)',[campaign.rows[0].id,user.id,'dm']);
        await client.query('COMMIT');
        return res.status(201).json({campaign:campaign.rows[0]});
      }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
    }catch(e){console.error('Campaigns API:',e);return res.status(e.status||500).json({error:e.status?e.message:'Could not process campaigns request.'})}
  }
  res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'});
};
