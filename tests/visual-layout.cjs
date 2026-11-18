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
      const headerGeometry=await page.evaluate(()=>{
        const get=q=>{const r=document.querySelector(q).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
        return {logo:get('.top .brand'),nav:get('.topnav'),title:get('.hero h1')};
      });
      assert.ok(headerGeometry.logo.left>=headerGeometry.nav.right-2,
        'English logo should sit to the right of header navigation: '+width+' '+JSON.stringify(headerGeometry));
      assert.ok(headerGeometry.logo.right<=width+2&&headerGeometry.logo.right>=width-65,
        'English logo should sit in far right corner: '+width+' '+JSON.stringify(headerGeometry));
      if(width>=1001)assert.ok(headerGeometry.logo.left>headerGeometry.title.right,
        'English logo should not sit beside the event title: '+width+' '+JSON.stringify(headerGeometry));
      const ribbons=await page.evaluate(()=>{
        const info=(first,second)=>{
          const e=document.querySelector(first),n=document.querySelector(second);
          const p=getComputedStyle(e,'::before'),r=e.getBoundingClientRect(),nr=n.getBoundingClientRect();
          return {text:e.textContent,pseudo:p.content,right:r.right+Math.abs(parseFloat(p.right)||0),nextLeft:nr.left};
        };
        return {zones:info('.zones .title-band .band','.zones .title-band>span:last-child'),
          booking:info('.booking-title .book-title-keyword','.booking-title .book-title-rest')};
      });
      for(const [name,ribbon] of Object.entries(ribbons)){
        assert.ok(ribbon.pseudo!=='none',name+' highlight missing');
        assert.ok(ribbon.right<ribbon.nextLeft,name+' ribbon overlaps next word at '+width+': '+JSON.stringify(ribbon));
      }
      const bookGeometry=await page.evaluate(()=>{
        const bounds=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
        return {photo1:bounds('.book-photos .media:first-child'),photo2:bounds('.book-photos .media:nth-child(2)'),form:bounds('.booking .form-panel')};
      });
      assert.ok(bookGeometry.photo1.width>150&&bookGeometry.photo1.height>90,'Booking photo 1 missing '+width);
      assert.ok(bookGeometry.photo2.width>150&&bookGeometry.photo2.height>90,'Booking photo 2 missing '+width);
      if(width>=1001){
        assert.ok(bookGeometry.photo1.right<bookGeometry.form.left,'Desktop photo must be left of form '+JSON.stringify(bookGeometry));
        assert.ok(bookGeometry.photo2.top>bookGeometry.photo1.bottom,'Two translucent desktop images must be stacked '+JSON.stringify(bookGeometry));
      }
      console.log('PASS booking image geometry',width,JSON.stringify(bookGeometry));
      if(width===390||width===1366)await page.screenshot({path:path.join('test-results','pawpark-'+width+'.png'),fullPage:true,animations:'disabled'});
      console.log('PASS Canva visual geometry',width,JSON.stringify(metrics));

      // Arabic visual verification is independent of English geometry assertions above.
      await page.locator('#lang').click();
      await page.waitForFunction(()=>document.documentElement.lang==='ar' && document.documentElement.dir==='rtl');
      await page.evaluate(()=>document.fonts.ready);
      const rtl=await page.evaluate(()=>{
        const get=q=>{const e=document.querySelector(q),r=e.getBoundingClientRect();return {x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:r.width,h:r.height,text:e.textContent.trim()}};
        const border=(q)=>getComputedStyle(document.querySelector(q),'::before').content;
        const headings=[...document.querySelectorAll('.zones .title-band span,.booking-title h2 span,.shine-head h2 span')].map(e=>({text:e.textContent.trim(),visible:e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0}));
        return {
          viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
          cssLoaded:[...document.styleSheets].some(x=>x.href?.includes('site-arabic-rtl.css')),
          heroTitle:get('.hero h1'),heroImage:get('.hero-img .media'),zoneTitle:get('.zones .title-band'),
          zoneHighlight:get('.zones .title-band .band'),
          zoneNext:get('.zones .title-band>span:last-child'),
          bookingTitle:get('.booking-title .heading'),
          bookingHighlight:get('.booking-title .book-title-keyword'),
          bookingRest:get('.booking-title .book-title-rest'),
          showTitle:get('.shine-head .heading'),showDescription:get('.shine-head p'),
          showBand:get('.show-band'),showImage:get('.show-image'),showForm:get('.show-form'),
          contactTitle:get('.contact .heading'),contactCard:get('.contact-card'),contactImage:get('.contact-img'),
          bookPhotos:get('.book-photos'),bookForm:get('.booking .form-panel'),
          zoneBg:border('.zones .title-band .band'),
          headingSpans:headings
        };
      });
      assert.ok(rtl.cssLoaded,'Missing Arabic-only CSS at '+width);
      assert.ok(rtl.scrollWidth<=width+2,'Arabic horizontal overflow at '+width+': '+JSON.stringify(rtl));
      assert.ok(rtl.headingSpans.every(h=>h.visible),'Arabic headings invisible at '+width+': '+JSON.stringify(rtl.headingSpans));
      assert.ok(rtl.zoneBg!=='none','Arabic highlighted zones word lost its background '+width);
      assert.ok(rtl.zoneHighlight.right<=width+1 && rtl.zoneHighlight.left>=-1,'Arabic highlighted zone word is offscreen at '+width);
      assert.ok(rtl.zoneNext.right<=width+1 && rtl.zoneNext.left>=-1,'Arabic other zone word is offscreen at '+width);
      assert.ok(rtl.showTitle.bottom<=rtl.showBand.top+2,'Arabic pet-show headline overlaps registration banner at '+width+': '+JSON.stringify(rtl));
      assert.ok(rtl.contactCard.w>width*.34,'Arabic contact card is too small at '+width);
      if(width>=1001){
        assert.ok(rtl.heroImage.right<rtl.heroTitle.right && rtl.heroTitle.left>rtl.heroImage.left,'Arabic desktop hero must be mirrored '+width+': '+JSON.stringify(rtl));
        assert.ok(rtl.contactImage.right<rtl.contactCard.left+25,'Arabic desktop contact must be mirrored '+width+': '+JSON.stringify(rtl));
        assert.ok(rtl.bookForm.right<rtl.bookPhotos.left+25,'Arabic desktop booking form should be on left '+width+': '+JSON.stringify(rtl));
      }
      if(width===390||width===1366)await page.screenshot({path:path.join('test-results','pawpark-ar-'+width+'.png'),fullPage:true,animations:'disabled'});
      console.log('PASS Arabic RTL visual geometry',width,JSON.stringify(rtl));

      await ctx.close();
    }
  }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
