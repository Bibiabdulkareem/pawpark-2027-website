const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, collection, getDoc, getDocs, query, orderBy, writeBatch, updateDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const projectId = 'demo-pawpark-2027';
const source = fs.readFileSync('firebase-backend.js', 'utf8');
const match = source.match(/export const authorizedAdmin = ([\s\S]*?);\n/);
assert.ok(match, 'Find the actual website authorization predicate');
const authorizedAdmin = vm.runInNewContext('(' + match[1] + ')');
const cases = [
  { email:'bibi@pawapp.net', verified:true, provider:'google.com', allow:true },
  { email:'operations@pawapp.net', verified:true, provider:'google.com', allow:true },
  { email:'Another.Admin@PAWAPP.NET', verified:true, provider:'google.com', allow:true },
  { email:'outsider@gmail.com', verified:true, provider:'google.com', allow:false },
  { email:'staff@pawapp.net.evil.test', verified:true, provider:'google.com', allow:false },
  { email:'staff@sub.pawapp.net', verified:true, provider:'google.com', allow:false },
  { email:'staff@notpawapp.net', verified:true, provider:'google.com', allow:false },
  { email:'staff@pawappxnet', verified:true, provider:'google.com', allow:false },
  { email:'staff@pawapp.net', verified:false, provider:'google.com', allow:false },
  { email:'staff@pawapp.net', verified:true, provider:'password', allow:false },
  { email:'staff@pawapp.net', verified:true, provider:'anonymous', allow:false }
];
assert.equal(authorizedAdmin(null), false);
assert.equal(authorizedAdmin({email:null,emailVerified:true,providerData:[{providerId:'google.com'}]}), false);
(async () => {
  const env = await initializeTestEnvironment({ projectId, firestore:{ host:'127.0.0.1',port:8085,rules:fs.readFileSync('firestore.rules','utf8') } });
  try {
    const visitor = env.unauthenticatedContext().firestore();
    const id = 'PP27-AccessPolicyTest0001';
    assert.match(id, /^PP27-[A-Za-z0-9]{20}$/);
    const ref = db => doc(db,'applications',id);
    const application = {type:'Space request',details:{brand:'Emulator only',contact:'QA',phone:'99999999',email:'qa@example.test',space:'3 × 3 m',zone:'Pets Zone',custom:''},language:'en',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),status:'New',notes:'',contractStage:'Not started',updatedBy:'',draftMessage:'',draftStatus:'',draftLanguage:'',messageLang:'',contactedAt:''};
    const batch=writeBatch(visitor);
    batch.set(ref(visitor),application);
    batch.set(doc(visitor,'notificationQueue',id),{type:application.type,createdAt:serverTimestamp(),sent:false,sentAt:null});
    await assertSucceeds(batch.commit());
    await assertFails(getDoc(ref(visitor)));
    await assertFails(getDocs(collection(visitor,'applications')));
    for (let i=0;i<cases.length;i++) {
      const c=cases[i];
      assert.equal(authorizedAdmin({email:c.email,emailVerified:c.verified,providerData:[{providerId:c.provider}]}),c.allow,'Website gate: '+c.email+'/'+c.provider);
      const db=env.authenticatedContext('policy-'+i,{email:c.email,email_verified:c.verified,firebase:{sign_in_provider:c.provider}}).firestore();
      const check=c.allow?assertSucceeds:assertFails;
      await check(getDoc(ref(db)));
      await check(getDocs(query(collection(db,'applications'),orderBy('createdAt','desc'))));
      await check(updateDoc(ref(db),{status:i%2?'Approved':'Under Review',updatedAt:serverTimestamp(),updatedBy:c.email}));
      await assertFails(deleteDoc(ref(db)));
      if(c.allow) {
        assert.equal((await getDoc(ref(db))).data().updatedBy,c.email);
        await assertFails(updateDoc(ref(db),{'details.email':'changed@example.test',updatedAt:serverTimestamp(),updatedBy:c.email}));
        await assertFails(getDocs(collection(db,'notificationQueue')));
      }
      console.log('PASS policy:',c.email,c.provider,c.verified?'verified':'unverified',c.allow?'allowed':'denied');
    }
    console.log('PASS: frontend and Firestore domain/provider policy, public atomic submission, private reads, immutable details and delete protection; all data confined to demo emulator.');
  } finally { await env.cleanup(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
