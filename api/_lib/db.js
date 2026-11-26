const {Pool}=require('pg');
let pool;
function getPool(){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured.');
  if(!pool)pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true},max:5,idleTimeoutMillis:10000,connectionTimeoutMillis:5000});
  return pool;
}
function getBearer(req){
  const raw=req.headers?.authorization||req.headers?.Authorization||'';
  const match=String(raw).match(/^Bearer\s+(.+)$/i);
  return match?match[1]:'';
}
async function verifyUser(req){
  const token=getBearer(req);
  if(!token)throw Object.assign(new Error('Sign in to continue.'),{status:401});
  const base=process.env.NEON_AUTH_BASE_URL, jwks=process.env.NEON_AUTH_JWKS_URL;
  if(!base||!jwks)throw new Error('Neon Auth is not configured on the server.');
  const {createRemoteJWKSet,jwtVerify}=await import('jose');
  const {payload}=await jwtVerify(token,createRemoteJWKSet(new URL(jwks)),{issuer:base,algorithms:['EdDSA']});
  if(!payload.sub||!/^[0-9a-f-]{36}$/i.test(String(payload.sub))||payload.role!=='authenticated')
    throw Object.assign(new Error('A valid StoryFoundry account is required.'),{status:403});
  return {id:String(payload.sub),email:typeof payload.email==='string'?payload.email:''};
}
module.exports={getPool,verifyUser};
