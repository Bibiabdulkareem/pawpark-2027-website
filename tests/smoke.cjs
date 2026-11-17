const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
async function main(){
 const server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1"],{stdio:"ignore"});
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 await pause(1800);
 let browser;
 try {
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:width<500,deviceScaleFactor:1});
   const page=await context.newPage();let errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/index.html",{waitUntil:"domcontentloaded"});
   await page.waitForSelector("#spaceForm");
   // Check that the seven original photos and official PawApp logo are actually loaded from the repository.
   await page.locator(".contact-img img.photo").scrollIntoViewIfNeeded();
   // Force below-fold lazy images to load for full asset QA without altering user-facing performance.
   await page.locator("img.photo, img.official-pawapp-logo").evaluateAll(els=>els.forEach(img=>img.loading="eager"));
   await page.waitForFunction(() => Array.from(document.querySelectorAll("img.photo, img.official-pawapp-logo")).length === 9 && Array.from(document.querySelectorAll("img.photo, img.official-pawapp-logo")).every(img => img.complete && img.naturalWidth > 0),{timeout:30000}).catch(async err=>{throw new Error("Original image failed to load: "+JSON.stringify(await page.locator("img.photo, img.official-pawapp-logo").evaluateAll(els=>els.map(e=>({src:e.getAttribute("src"),complete:e.complete,naturalWidth:e.naturalWidth}))))+" "+err.message)});
   const photoSummary=await page.locator("img.photo").evaluateAll(els=>els.map(img=>({file:img.getAttribute("src"),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,fit:getComputedStyle(img).objectFit})));
   console.log("Loaded original photography:",photoSummary);
   assert.equal(photoSummary.length,8);
   assert.equal(await page.locator(".zone-grid button.zone").count(),3);

   const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth}));
   console.log("viewport",width,dims);
   assert.ok(dims.body<=dims.viewport+2,"body overflows at "+width+":"+JSON.stringify(dims));
   assert.ok(dims.root<=dims.viewport+2,"root overflows at "+width+":"+JSON.stringify(dims));
   await page.locator("#lang").click();
   assert.equal(await page.locator("html").getAttribute("dir"),"rtl");
   await page.locator("#brand").fill("Sample Pet Store");
   await page.locator("#contactPerson").fill("Test Contact");
   await page.locator("#phone").fill("99993407");
   await page.locator("#email").fill("demo@example.test");
   await page.locator('[data-size="3 × 3 m"]').click();
   await page.locator("#zone").selectOption("Pets Zone");
   await page.locator("#spaceForm button[type=submit]").click();
   await page.waitForSelector("#spaceResult:not(.hidden)");
   const out=await page.locator("#spaceResult").innerText();
   assert.ok(out.includes("Sample Pet Store"),"missing summary");
   await page.goto("http://127.0.0.1:8765/admin.html",{waitUntil:"domcontentloaded"});
   await page.waitForSelector(".request");
   assert.equal(await page.locator(".request").count(),1);
   assert.ok((await page.locator(".request").first().innerText()).includes("Test Contact"));
   assert.equal(await page.locator(".request a[href^='tel:']").count(),1);
   await page.locator("#lang").click();
   assert.equal(await page.locator("html").getAttribute("dir"),"rtl");
   assert.ok((await page.locator(".request").first().innerText()).includes("رقم الهاتف"));

   // Admin replies: changing status should load the matching bilingual message template.
   await page.locator(".manage .status-wrap select").first().selectOption("Approved");
   let draft=await page.locator(".reply-tools textarea").inputValue();
   assert.ok(draft.includes("الموافقة المبدئية"),"Arabic approved template missing");
   const emailHref=await page.locator(".reply-tools a.email").getAttribute("href");
   assert.ok(emailHref.startsWith("mailto:demo%40example.test")||emailHref.startsWith("mailto:demo@example.test"),"Missing email recipient");
   assert.ok(decodeURIComponent(emailHref).includes("الموافقة المبدئية"),"Email draft body missing");
   const waHref=await page.locator(".reply-tools a.whatsapp").getAttribute("href");
   assert.ok(waHref.startsWith("https://wa.me/96599993407?text="),"Incorrect Kuwaiti WhatsApp link: "+waHref);
   assert.ok(decodeURIComponent(waHref).includes("الموافقة المبدئية"),"WhatsApp draft missing");
   await page.locator(".reply-controls select").selectOption("en");
   draft=await page.locator(".reply-tools textarea").inputValue();
   assert.ok(draft.includes("preliminary approval"),"English approved template missing");
   await page.locator(".reply-tools textarea").fill("Custom follow-up for Pet Store");
   await page.locator(".manage .status-wrap select").last().selectOption("Preparing");
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator(".request").waitFor();
   assert.equal(await page.locator(".reply-tools textarea").inputValue(),"Custom follow-up for Pet Store","Edited message did not persist");
   assert.equal(await page.locator(".manage .status-wrap select").last().inputValue(),"Preparing","Contract stage did not persist");
   await page.locator("#contractFilter").selectOption("Preparing");
   assert.equal(await page.locator(".request").count(),1,"Contract filter lost the request");
   await page.locator("#contractFilter").selectOption("Signed");
   assert.equal(await page.locator(".request").count(),0,"Contract filter should exclude the request");
   await page.locator("#contractFilter").selectOption("all");
   await page.locator(".lifecycle button").click();
   const contactSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem("pawpark_demo_requests")||"[]")[0].contactedAt);
   assert.ok(contactSaved,"Contacted timestamp was not saved");
   assert.deepEqual(errors,[]);
   await context.close();
   console.log("PASS",width);
  }
 } finally {if(browser)await browser.close();server.kill();}
}
main().catch(e=>{console.error("QA FAILED:",e);process.exitCode=1;});
