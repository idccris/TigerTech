const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
let user=null, rows=[],calls=[];
const db=(parts,...values)=>{const text=parts.join('?');calls.push({text,values});return text.startsWith('SELECT slug,visible,stock')?Promise.resolve(rows):{text,values};};
db.transaction=async queries=>{calls.push({transaction:queries});return []};
function mock(p,exports){require.cache[require.resolve(p)]={loaded:true,exports};}
mock('../lib/db.ts',{ensureDb:async()=>{},sql:()=>db});
mock('../lib/admin-auth.ts',{requireUser:async()=>user,isTrustedMutation:r=>r.headers.get('origin')==='https://shop.test',verifyAdminPassword:async()=>false});
mock('next/cache',{revalidateTag(){},revalidatePath(){}});
const {PATCH}=require('../app/api/admin/products/route.ts');
function request(data,origin='https://shop.test'){return new Request(origin+'/api/admin/products',{method:'PATCH',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)})}
test('group feature requires trusted origin and authenticated admin',async()=>{
 assert.equal((await PATCH(request({groupSlug:'g',featured:true}))).status,401);
 user={role:'admin'};
 assert.equal((await PATCH(request({groupSlug:'g',featured:true},'https://evil.test'))).status,403);
 user={role:'operator'};
 assert.equal((await PATCH(request({groupSlug:'g',featured:true}))).status,403);
});
test('invalid or unavailable group never clears existing highlights',async()=>{
 user={role:'admin'};rows=[];calls=[];
 assert.equal((await PATCH(request({groupSlug:'g',featured:true}))).status,404);
 rows=[{slug:'r',visible:true,stock:0}];
 assert.equal((await PATCH(request({groupSlug:'g',featured:true}))).status,400);
 assert.equal((await PATCH(request({groupSlug:'g'}))).status,400);
 assert.equal(calls.filter(c=>c.transaction).length,0);
});
test('feature updates all group colors transactionally and counts models',async()=>{
 rows=[{slug:'b',visible:true,stock:3},{slug:'r',visible:true,stock:0}];calls=[];
 assert.equal((await PATCH(request({groupSlug:'g',featured:true}))).status,200);
 const transaction=calls.find(c=>c.transaction).transaction;
 assert.equal(transaction.length,2);
 assert.match(transaction[0].text,/WHERE group_slug=/);
 assert.deepEqual(transaction[0].values,[true,true,'g']);
 assert.match(transaction[1].text,/GROUP BY 1/);
 assert.match(transaction[1].text,/OFFSET 6/);
});
test('removing highlight also works for an out-of-stock group',async()=>{
 rows=[{slug:'b',visible:false,stock:0}];calls=[];
 assert.equal((await PATCH(request({groupSlug:'g',featured:false}))).status,200);
 assert.deepEqual(calls.find(c=>c.transaction).transaction[0].values,[false,false,'g']);
});
