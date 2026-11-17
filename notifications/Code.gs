// PawPark-only notification worker. No Google database scope or service-account key.
const PROJECT='pawpark-2027-web';
const API_KEY='AIzaSyBkC-e2oJs6agmX-ZKt0C6saVbU2vF8aB8';
const RECIPIENT='info@pawapp.net';
const DASHBOARD='https://bibiabdulkareem.github.io/pawpark-2027-website/admin.html';
function authCall_(operation,body){
 const r=UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:'+operation+'?key='+API_KEY,{method:'post',contentType:'application/json',payload:JSON.stringify(body),muteHttpExceptions:true});
 if(r.getResponseCode()>=300)throw new Error('PawPark worker sign-in HTTP '+r.getResponseCode());return JSON.parse(r.getContentText());
}
function preparePawParkWorker(){
 const p=PropertiesService.getScriptProperties();
 if(!p.getProperty('workerUid')){
  const email='notifications-'+Utilities.getUuid()+'@pawpark-worker.invalid';
  const password=Utilities.getUuid()+Utilities.getUuid();
  const account=authCall_('signUp',{email,password,returnSecureToken:true});
  p.setProperties({workerEmail:email,workerPassword:password,workerUid:account.localId});
 }
 console.log('PawPark notification worker UID: '+p.getProperty('workerUid'));
}
function call_(path,body,token){
 const r=UrlFetchApp.fetch('https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents'+path,{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+token},payload:JSON.stringify(body),muteHttpExceptions:true});
 if(r.getResponseCode()>=300)throw new Error('PawPark notification queue HTTP '+r.getResponseCode());return JSON.parse(r.getContentText());
}
function workerToken_(){
 const p=PropertiesService.getScriptProperties();
 if(!p.getProperty('workerUid'))throw new Error('Prepare PawPark worker first');
 return authCall_('signInWithPassword',{email:p.getProperty('workerEmail'),password:p.getProperty('workerPassword'),returnSecureToken:true}).idToken;
}
function pending_(token){return call_(':runQuery',{structuredQuery:{from:[{collectionId:'notificationQueue'}],where:{fieldFilter:{field:{fieldPath:'sent'},op:'EQUAL',value:{booleanValue:false}}},limit:50}},token).filter(r=>r.document).map(r=>r.document)}
function acknowledge_(names,token){
 const prefix='projects/'+PROJECT+'/databases/(default)/documents/notificationQueue/';
 names.forEach(n=>{if(!n.startsWith(prefix)||!/^PP27-[A-Za-z0-9]{20}$/.test(n.slice(prefix.length)))throw new Error('Unexpected queue path')});
 call_(':commit',{writes:names.map(name=>({update:{name,fields:{sent:{booleanValue:true}}},updateMask:{fieldPaths:['sent']},updateTransforms:[{fieldPath:'sentAt',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:true}}))},token);
}
function pollPawParkApplications(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const p=PropertiesService.getScriptProperties(),token=workerToken_(),sent=JSON.parse(p.getProperty('sentAwaitingAcknowledgement')||'[]');
  if(sent.length){acknowledge_(sent,token);p.deleteProperty('sentAwaitingAcknowledgement')}
  if(MailApp.getRemainingDailyQuota()<1)return;
  const docs=pending_(token);if(!docs.length)return;
  const lines=docs.map(d=>d.name.split('/').pop()+' | '+d.fields.type.stringValue+' | '+d.fields.createdAt.timestampValue);
  MailApp.sendEmail({to:RECIPIENT,subject:'PawPark 2027 — '+docs.length+' new application(s) | طلبات جديدة',body:'New PawPark applications have been securely saved.\nتم حفظ طلبات جديدة لباو بارك بأمان.\n\n'+lines.join('\n')+'\n\nProtected dashboard / لوحة الإدارة المحمية:\n'+DASHBOARD+'\n\nSign in with bibi@pawapp.net. Customer details stay in the protected dashboard.',name:'PawPark 2027'});
  const names=docs.map(d=>d.name);p.setProperty('sentAwaitingAcknowledgement',JSON.stringify(names));acknowledge_(names,token);p.deleteProperty('sentAwaitingAcknowledgement');
 }finally{lock.releaseLock()}
}
function installPawParkNotifications(){
 pending_(workerToken_());
 if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='pollPawParkApplications'))ScriptApp.newTrigger('pollPawParkApplications').timeBased().everyMinutes(5).create();
 const p=PropertiesService.getScriptProperties();
 if(!p.getProperty('connectionTestSent')){MailApp.sendEmail({to:RECIPIENT,subject:'PawPark 2027 — Notifications connected | تم ربط الإشعارات',body:'The free PawPark 2027 notification sender is connected.\nتم ربط إشعارات باو بارك ٢٠٢٧.\n\n'+DASHBOARD,name:'PawPark 2027'});p.setProperty('connectionTestSent',new Date().toISOString())}
 pollPawParkApplications();console.log('PawPark notification timer installed; connection email sent to info@pawapp.net.');
}
