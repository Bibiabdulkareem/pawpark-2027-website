const fs=require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,writeBatch,getDoc,getDocs,collection,query,orderBy,updateDoc,deleteDoc,serverTimestamp,Timestamp}=require('firebase/firestore');
const assert=require('node:assert/strict');
const projectId='demo-pawpark-2027';
const sample=()=>({type:'Space request',details:{brand:'Fictional QA Brand',contact:'QA only',phone:'99999999',email:'qa@example.test',space:'3 × 3 m',zone:'Pets Zone',custom:''},language:'ar',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),status:'New',notes:'',contractStage:'Not started',updatedBy:'',draftMessage:'',draftStatus:'',draftLanguage:'',messageLang:'',contactedAt:''});
(async()=>{
 const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8085,rules:fs.readFileSync('firestore.rules','utf8')}});
 try{
  await env.clearFirestore();
  const visitor=env.unauthenticatedContext().firestore();
  const admin=env.authenticatedContext('admin',{email:'bibi@pawapp.net',email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
  const other=env.authenticatedContext('other',{email:'other@example.test',email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
  const unverified=env.authenticatedContext('unverified',{email:'bibi@pawapp.net',email_verified:false,firebase:{sign_in_provider:'google.com'}}).firestore();
  const wrongProvider=env.authenticatedContext('password',{email:'bibi@pawapp.net',email_verified:true,firebase:{sign_in_provider:'password'}}).firestore();
  const worker=env.authenticatedContext('P7lZLSwavefAwvaqRvFzKS7i7Tp1',{email:'worker@example.test',firebase:{sign_in_provider:'password'}}).firestore();
  async function create(db,key,data){const b=writeBatch(db);b.set(doc(db,'applications',key),data);b.set(doc(db,'notificationQueue',key),{type:data.type||'Space request',createdAt:serverTimestamp(),sent:false,sentAt:null});return b.commit()}
  let n=0;const id=()=> 'PP27-'+String(++n).padStart(20,'0');const ref=(db,key)=>doc(db,'applications',key);
  const key=id();await assertSucceeds(create(visitor,key,sample()));
  const pet=sample();pet.type='Pet show';pet.details={show:'Pet Fashion Show',owner:'QA Pet Owner',phone:'99999999',email:'',pet:'QA Pet',species:'Dog',breed:'',age:''};
  await assertSucceeds(create(visitor,id(),pet));
  for(const db of [visitor,other,unverified,wrongProvider]){
   await assertFails(getDoc(ref(db,key)));await assertFails(getDocs(collection(db,'applications')));
   await assertFails(updateDoc(ref(db,key),{status:'Approved',updatedAt:serverTimestamp(),updatedBy:'bibi@pawapp.net'}));
   await assertFails(deleteDoc(ref(db,key)));
  }
  await assertSucceeds(getDocs(query(collection(admin,'applications'),orderBy('createdAt','desc'))));
  await assertSucceeds(updateDoc(ref(admin,key),{status:'Under Review',notes:'QA note',contractStage:'Preparing',updatedAt:serverTimestamp(),updatedBy:'bibi@pawapp.net'}));
  assert.equal((await getDoc(ref(admin,key))).data().notes,'QA note');
  await assertSucceeds(updateDoc(ref(admin,key),{status:'Approved',contractStage:'Signed',updatedAt:serverTimestamp(),updatedBy:'bibi@pawapp.net'}));
  for(const patch of [{notes:'x'.repeat(5001)},{notes:42},{details:{...sample().details,brand:'Changed'}},{createdAt:Timestamp.fromMillis(0)},{extraData:'bad'},{notificationSent:true},{status:'Paid'},{updatedBy:'other@example.test'},{updatedAt:Timestamp.fromMillis(0)}]){
   await assertFails(updateDoc(ref(admin,key),{updatedAt:serverTimestamp(),updatedBy:'bibi@pawapp.net',...patch}));
  }
  await assertFails(deleteDoc(ref(admin,key)));
  for(const mutate of [x=>x.status='Approved',x=>x.notes='Injected',x=>x.isAdmin=true,x=>x.updatedBy='bibi@pawapp.net',x=>x.createdAt=Timestamp.fromMillis(0),x=>x.details.brand='x'.repeat(111),x=>x.details.phone=123,x=>delete x.details.email,x=>x.details.extra='bad',x=>delete x.type,x=>x.notificationSent=true,x=>x.details.email='invalid',x=>x.details.zone='Other']){
   const x=sample();mutate(x);await assertFails(create(visitor,id(),x));
  }
  await assertFails(setDoc(ref(visitor,id()),sample()));
  await assertFails(setDoc(doc(visitor,'notificationQueue',id()),{type:'Space request',createdAt:serverTimestamp(),sent:false,sentAt:null}));
  await assertFails(getDoc(ref(worker,key)));
  await assertFails(getDocs(collection(worker,'applications')));
  await assertSucceeds(getDocs(collection(worker,'notificationQueue')));
  await assertSucceeds(updateDoc(doc(worker,'notificationQueue',key),{sent:true,sentAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(worker,'notificationQueue',key),{type:'Pet show',sentAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(worker,'notificationQueue',key),{sent:false,sentAt:serverTimestamp()}));
  await assertFails(updateDoc(ref(worker,key),{notes:'bad',updatedAt:serverTimestamp(),updatedBy:'bibi@pawapp.net'}));
  await assertFails(getDocs(collection(other,'notificationQueue')));
  await assertFails(setDoc(doc(other,'admins','other'),{admin:true}));
  await assertFails(getDoc(doc(other,'applications',key,'private','notes')));
  console.log('PASS: valid bilingual submissions; public/other/unverified/provider access denied; admin reads and workflow updates; schema, size, immutable fields, role escalation and deletion blocked.');
 }finally{await env.cleanup()}
})().catch(e=>{console.error(e);process.exitCode=1});
