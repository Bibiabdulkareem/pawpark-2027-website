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
   const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth}));
   console.log("viewport",width,dims);
   assert.ok(dims.body<=dims.viewport+2,"body overflows at "+width+":"+JSON.stringify(dims));
   assert.ok(dims.root<=dims.viewport+2,"root overflows at "+width+":"+JSON.stringify(dims));
   await page.locator("#lang").click();
   assert.equal(await page.locator("html").getAttribute("dir"),"rtl");
   await page.locator("#brand").fill("Sample Pet Store");
   await page.locator("#contact").fill("Test Contact");
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
   assert.deepEqual(errors,[]);
   await context.close();
   console.log("PASS",width);
  }
 } finally {if(browser)await browser.close();server.kill();}
}
main().catch(e=>{console.error("QA FAILED:",e);process.exitCode=1;});
