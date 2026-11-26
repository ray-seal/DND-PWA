const ALLOWED_ORIGINS=new Set([
  'https://ray-seal.github.io',
  'https://storyfoundry-phi.vercel.app'
]);
module.exports=function applyCors(req,res){
  const origin=String(req.headers?.origin||'');
  if(ALLOWED_ORIGINS.has(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
    res.setHeader('Access-Control-Max-Age','86400');
  }
  if(req.method==='OPTIONS'){
    if(!ALLOWED_ORIGINS.has(origin))return res.status(403).json({error:'Origin is not allowed.'});
    return res.status(204).end();
  }
  return false;
};
