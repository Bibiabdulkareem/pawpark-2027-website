// Public visual QA: no real Firebase writes, sign-in, customer data or other projects.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const server=spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
  let browser;
  try {
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    fs.mkdirSync('test-results',{recursive:true});
    for(const width of [375,390,820,1366,1440]){
      const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:width<500});
      const page=await ctx.newPage();
      await page.goto('http://127.0.0.1:8766/index.html',{waitUntil:'domcontentloaded'});
      await page.locator('img.photo,img.official-pawapp-logo').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
      await page.waitForFunction(()=>[...document.querySelectorAll('img.photo,img.official-pawapp-logo')].every(i=>i.complete&&i.naturalWidth>0),{timeout:20000}).catch(()=>{});
      const metrics=await page.evaluate(()=>{
        const get=(q)=>{const e=document.querySelector(q);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),visible:r.width>0&&r.height>0}};
        return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
          cssLoaded:[...document.styleSheets].some(s=>s.href&&s.href.includes('site-canva-faithful.css')),
          logo:document.querySelector('.official-pawapp-logo')?.getAttribute('src'),
          date:document.querySelector('.event-line')?.textContent,
          hero:get('.hero h1'),heroPhoto:get('.hero-img .photo'),
          zones:get('.zone-grid'),form:get('#spaceForm'),show:get('#petForm'),contact:get('.contact'),
          missingImages:[...document.querySelectorAll('img.photo,img.official-pawapp-logo')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)};
      });
      assert.ok(metrics.cssLoaded,'Missing Canva-matched stylesheet');
      assert.match(metrics.logo,/pawapp-logo-original\.svg$/);
      assert.ok(metrics.date.includes('21–23 January 2027'),'Approved date must be preserved');
      assert.ok(!metrics.date.includes('20–25'),'Old Canva date must not ship');
      assert.equal(metrics.missingImages.length,0,'Photo / logo failed to load');
      assert.ok(metrics.scrollWidth<=width+2,'Horizontal overflow at '+width+': '+JSON.stringify(metrics));
      for(const k of ['hero','heroPhoto','zones','form','show','contact']) assert.ok(metrics[k]?.visible,'Missing element: '+k+' at '+width);
      if(width===390||width===1366)await page.screenshot({path:path.join('test-results','pawpark-'+width+'.png'),fullPage:true,animations:'disabled'});
      console.log('PASS Canva visual geometry',width,JSON.stringify(metrics));
      await ctx.close();
    }
  }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
