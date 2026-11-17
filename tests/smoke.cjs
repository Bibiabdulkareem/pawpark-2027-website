const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const base='http://127.0.0.1:8765';
async function login(page,email='bibi@pawapp.net'){
 await page.evaluate(async email=>{
  const {auth}=await import('./firebase-backend.js');
  const {signInWithCredential,GoogleAuthProvider}=await import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js');
  const encode=x=>btoa(JSON.stringify(x)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const token=encode({alg:'none',typ:'JWT'})+'.'+encode({sub:email,email,email_verified:true,name:'QA Admin',iss:'https://accounts.google.com',aud:'demo-pawpark-2027'})+'.';
  await signInWithCredential(auth,GoogleAuthProvider.credential(token));
 },email);
}
(async()=>{
 const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
 let browser;try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const width of [390,1440]){
   await fetch('http://127.0.0.1:8085/emulator/v1/projects/demo-pawpark-2027/databases/(default)/documents',{method:'DELETE'});
   const visitor=await browser.newContext({viewport:{width,height:844},isMobile:width<500});
   const staff=await browser.newContext({viewport:{width,height:844}});
   await visitor.addInitScript(()=>window.PAWPARK_EMULATORS=true);
   await staff.addInitScript(()=>window.PAWPARK_EMULATORS=true);
   const page=await visitor.newPage(),admin=await staff.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));admin.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/index.html');
   await page.waitForFunction(()=>document.querySelector('.hero h1').textContent.includes('PAWPARK'));
   await page.locator('img.photo,img.official-pawapp-logo').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('img.photo,img.official-pawapp-logo')).every(i=>i.complete&&i.naturalWidth>0));
   assert.equal(await page.locator('img.photo').count(),8);
   assert.equal(await page.locator('.zone').count(),3);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   await page.locator('#lang').click();assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
   await page.locator('#brand').fill('Fictional QA Brand');await page.locator('#contactPerson').fill('QA Contact');
   await page.locator('#phone').fill('99999999');await page.locator('#email').fill('qa@example.test');
   await page.locator('[data-size="3 × 3 m"]').click();await page.locator('#zone').selectOption('Pets Zone');
   await page.locator('#spaceForm button[type=submit]').click();await page.locator('#spaceResult:not(.hidden)').waitFor();
   assert.match(await page.locator('.confirm-ref-number').innerText(),/^PP27-[a-zA-Z0-9]{20}$/);
   assert.equal(await page.evaluate(()=>localStorage.getItem('pawpark_demo_requests')),null);
   await admin.goto(base+'/admin.html');await admin.locator('#signIn').waitFor();
   assert.equal(await admin.locator('#dashboard').isVisible(),false);
   await login(admin,'other@example.test');await admin.waitForFunction(()=>document.querySelector('#authState').textContent.includes('not authorized'));
   assert.equal(await admin.locator('.request-head').count(),0);
   await login(admin);await admin.locator('.request-head').waitFor();
   assert.match(await admin.locator('#list').innerText(),/QA Contact/);
   await admin.locator('#lang').click();assert.equal(await admin.locator('html').getAttribute('dir'),'rtl');
   await admin.locator('.manage .status-wrap select').first().selectOption('Approved');
   await admin.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('تم حفظ'));
   assert.match(await admin.locator('.reply-tools textarea').inputValue(),/الموافقة المبدئية/);
   await admin.locator('.manage .notes-wrap textarea').fill('QA persisted note');await admin.locator('#search').click();
   await admin.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('تم حفظ'));
   await admin.locator('.manage .status-wrap select').last().selectOption('Preparing');
   await admin.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('تم حفظ'));
   await admin.reload();await admin.locator('.request-head').waitFor();
   assert.equal(await admin.locator('.manage .notes-wrap textarea').inputValue(),'QA persisted note');
   assert.equal(await admin.locator('.manage .status-wrap select').first().inputValue(),'Approved');
   assert.equal(await admin.locator('.manage .status-wrap select').last().inputValue(),'Preparing');
   await page.locator('#show').selectOption('Pet Fashion Show');await page.locator('#owner').fill('QA Owner');await page.locator('#petPhone').fill('99999999');await page.locator('#petName').fill('QA Pet');await page.locator('#species').selectOption('Dog');
   await page.locator('#petForm button[type=submit]').click();await page.locator('#petResult:not(.hidden)').waitFor();
   await admin.waitForFunction(()=>document.querySelector('#total').textContent==='2');
   await admin.locator('#signOut').click();await admin.locator('#signIn').waitFor();assert.equal(await admin.locator('.request-head').count(),0);
   // Force a write failure: no success receipt may be shown.
   await page.reload();await page.waitForFunction(()=>document.querySelector('.hero h1').textContent.includes('PAWPARK'));
   await page.locator('#brand').fill('QA Failure');await page.locator('#contactPerson').fill('QA Contact');await page.locator('#phone').fill('99999999');await page.locator('#email').fill('qa@example.test');await page.locator('[data-size="3 × 3 m"]').click();await page.locator('#zone').selectOption('Pets Zone');
   await page.evaluate(async()=>{const {db}=await import('./firebase-backend.js');const {disableNetwork}=await import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js');await disableNetwork(db)});
   await page.locator('#spaceForm button[type=submit]').click();
   assert.equal(await page.locator('#spaceResult').isVisible(),false);assert.equal(await page.locator('#spaceForm button[type=submit]').isDisabled(),true);
   assert.deepEqual(errors,[]);
   await visitor.close();await staff.close();console.log('PASS responsive bilingual UI, original photos, separate-device storage, admin gate, persisted workflow, live pet registration, sign-out privacy and offline confirmation guard:',width);
  }
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
