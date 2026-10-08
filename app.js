'use strict';
const $=id=>document.getElementById(id);let revealObserver,motionFrame=0,motionImages=[],motionCards=[],motionBound=false;let content,activeCategory='',activeMilestone=0,slideTimer,connectionTarget=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const preview=new URLSearchParams(location.search).has('preview');
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(raw){if(!raw)return '';if(raw.startsWith('#')||/^(\.\/|\.\.\/|assets\/)/.test(raw))return raw;try{const u=new URL(raw,location.href);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?raw:''}catch{return ''}}
function imageUrl(raw){if(/^data:image\/(png|jpeg|webp|gif);base64,/.test(raw||''))return raw;const u=safeUrl(raw);return u&&!/^(mailto:|tel:)/.test(u)?u:''}
function text(id,value){if($(id))$(id).textContent=value||''}function imgHTML(url,alt='',extra=''){const safe=imageUrl(url);return safe?`<img src="${escapeHTML(safe)}" alt="${escapeHTML(alt)}" ${extra}>`:''}
function linksHTML(links=[]){return links.map(l=>{const u=safeUrl(l.url);return u?`<a href="${escapeHTML(u)}" ${/^https?:/.test(u)?'target="_blank" rel="noopener noreferrer"':''}>${escapeHTML(l.label||'View link')}</a>`:''}).join('')}
function paragraphs(value){return String(value||'').split(/\n\s*\n/).map(t=>`<p>${escapeHTML(t).replace(/\n/g,'<br>')}</p>`).join('')}
async function getContent(){if(preview){try{const d=JSON.parse(localStorage.getItem('talha-site-draft'));if(d){const badge=document.createElement('div');badge.className='draft-badge';badge.textContent='Draft preview · not published';document.body.append(badge);return d}}catch{}}const r=await fetch('content.json',{cache:'no-cache'});if(!r.ok)throw Error('Content could not be loaded.');return r.json()}
function applyTheme(){for(const [k,v]of Object.entries(content.theme||{}))if(/^#[0-9a-f]{6}$/i.test(v))document.documentElement.style.setProperty('--'+k,v);if(content.motion?.enabled===false)document.body.classList.add('no-motion')}
function render(){applyTheme();const s=content.site;document.title=s.title||s.name;document.querySelector('meta[name="description"]').content=s.description||'';$('wordmark').innerHTML=escapeHTML(s.name)+'<span>.</span>';text('eyebrow',s.eyebrow);text('headline',s.headline);text('intro',s.intro);text('hero-caption',s.heroCaption);text('timeline-title',s.timelineTitle);text('timeline-description',s.timelineDescription);$('search').placeholder=s.searchPlaceholder||'Search';text('about-label',s.aboutLabel);text('feature-label',s.featureLabel);text('footer-note',s.footerNote);document.querySelector('.hero-cta').textContent=s.heroLinkLabel||'Explore the journey';document.querySelector('.hero-cta').href=safeUrl(s.heroLinkUrl)||'#journey';document.querySelector('#journey .eyebrow').textContent=s.journeyLabel||'The journey';text('show-all',s.showAllLabel||'Show all');document.querySelector('#empty h3').textContent=s.emptyTitle||'No matching entries.';document.querySelector('#empty p').textContent=s.emptyDescription||'Try another phrase.';text('reset-search',s.resetLabel||'Reset filters');text('cookie-preferences',s.cookiePreferencesLabel||'Cookie preferences');text('footer-monogram',s.initials);text('copyright',content.footer.copyright);text('privacy-link',content.privacy.linkLabel);$('portrait').innerHTML=imgHTML(s.portrait,s.portraitAlt)||escapeHTML(s.initials);$('navigation').innerHTML=(content.navigation||[]).map(l=>`<a href="${escapeHTML(safeUrl(l.url)||'#home')}">${escapeHTML(l.label)}</a>`).join('');
const ms=content.milestones||[],heroImage=s.portrait||s.heroImage,heroAlt=s.portrait?s.portraitAlt:s.heroImageAlt,slides=s.heroUseChapterImages&&ms.length?ms:[{image:heroImage,imageAlt:heroAlt}];$('hero-slides').innerHTML=slides.map((m,i)=>imgHTML(m.image||heroImage,m.imageAlt||heroAlt,`class="hero-slide ${i===0?'active':''}" style="object-position:${escapeHTML(m.position||'center')}"`)).join('');$('milestones').innerHTML=ms.map((m,i)=>`<article class="milestone ${i===0?'active':''}" data-milestone="${i}" tabindex="0"><span class="milestone-dot"></span>${imgHTML(m.image||heroImage,m.imageAlt||heroAlt,'class="story-thumb" loading="lazy"')}<p class="date">${escapeHTML(m.date)}</p><h3>${escapeHTML(m.title)}</h3><p class="description">${escapeHTML(m.description)}</p>${m.url?`<a class="text-link" href="${escapeHTML(safeUrl(m.url))}">${escapeHTML(m.linkLabel||'Explore')}</a>`:''}</article>`).join('');
$('categories').innerHTML=(content.categories||[]).map((c,i)=>`<button class="category" data-category="${escapeHTML(c.id)}" aria-pressed="false"><span class="cat-index">${String(i+1).padStart(2,'0')}</span><span class="cat-name">${escapeHTML(c.label)}</span><span class="cat-description">${escapeHTML(c.description)}</span></button>`).join('');activeCategory=content.categories?.[0]?.id||'';
const f=content.feature;text('feature-title',f.title);text('feature-subtitle',f.subtitle);text('feature-description',f.description);text('feature-quote',f.quote);$('feature-quote').hidden=!f.quote;$('feature-image').innerHTML=imgHTML(f.image,f.imageAlt,'loading="lazy"');$('feature-image').hidden=!f.image;$('feature-links').innerHTML=linksHTML(f.links);const a=content.about;text('about-title',a.title);$('about-description').innerHTML=paragraphs(a.description);$('about-portrait').innerHTML=imgHTML(a.image||s.portrait,a.imageAlt||s.portraitAlt,'loading="lazy"')||escapeHTML(s.initials);$('about-links').innerHTML=linksHTML(a.links);
$('footer-columns').innerHTML=(content.footer.columns||[]).map(c=>`<div class="footer-col"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p>${linksHTML(c.links)}</div>`).join('');$('image-credit').innerHTML=s.imageCreditUrl?`<a href="${escapeHTML(safeUrl(s.imageCreditUrl))}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.imageCredit)}</a>`:escapeHTML(s.imageCredit);setupMotion();renderEntries();bind();cookies();startSlides();network();}
function highlighted(s,q){if(!q)return escapeHTML(s);const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');return String(s||'').split(re).map((part,i)=>i%2?`<mark>${escapeHTML(part)}</mark>`:escapeHTML(part)).join('')}
function renderEntries(){const q=$('search').value.trim().toLowerCase();$('clear-search').hidden=!q;document.querySelectorAll('.category').forEach(b=>{const on=!q&&b.dataset.category===activeCategory;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});const rows=(content.entries||[]).filter(e=>q?[e.year,e.title,e.subtitle,e.description,...(e.links||[]).map(l=>l.label)].join(' ').toLowerCase().includes(q):!activeCategory||e.category===activeCategory);text('result-count',`${rows.length} ${rows.length===1?'entry':'entries'}${q?' · searching all categories':''}`);$('empty').hidden=rows.length>0;$('entries').innerHTML=rows.map(e=>`<article class="entry reveal ${e.image?'':'no-image'}" data-entry="${escapeHTML(e.id)}"><span class="entry-dot"></span><p class="entry-year">${highlighted(e.year,q)}</p><div class="entry-main">${e.sample?'<span class="sample-tag">Sample entry</span>':''}<h3>${highlighted(e.title,q)}</h3><p class="entry-subtitle">${highlighted(e.subtitle,q)}</p><p class="entry-description">${highlighted(e.description,q)}</p><div class="links">${linksHTML(e.links)}</div></div>${e.image?`<div class="entry-media">${imgHTML(e.image,e.imageAlt,'loading="lazy"')}</div>`:''}</article>`).join('');document.querySelectorAll('.entry').forEach(el=>{el.addEventListener('mouseenter',()=>connectionTarget=el);el.addEventListener('mouseleave',()=>connectionTarget=null)});reveal();}
function reveal(){
 const enabled=!reduced&&content.motion?.enabled!==false;
 document.body.classList.toggle('motion-ready',enabled);
 const elements=document.querySelectorAll('.reveal');
 if(!enabled||!('IntersectionObserver' in window)){elements.forEach(e=>e.classList.add('visible'));return}
 if(!revealObserver)revealObserver=new IntersectionObserver(list=>list.forEach(item=>{
  if(item.isIntersecting){item.target.classList.add('visible');revealObserver.unobserve(item.target)}
 }),{threshold:0,rootMargin:'0px 0px -35px 0px'});
 elements.forEach((el,i)=>{if(!el.classList.contains('visible')){el.style.setProperty('--reveal-delay',Math.min(i%4,3)*70+'ms');revealObserver.observe(el)}});
 motionImages=[...document.querySelectorAll('.entry-media,.feature-image,.story-thumb')];
 motionCards=[...document.querySelectorAll('.milestone,.entry')];
 queueMotion();
}
function setupMotion(){
 document.querySelectorAll('.hero-copy,.hero-art,.milestone,.section-head,.category-bar,.feature-copy,.feature-image,.about-heading,.about-copy,.footer-top,.footer-col').forEach(e=>e.classList.add('reveal'));
 if(reduced||content.motion?.enabled===false||motionBound)return;
 motionBound=true;
 addEventListener('scroll',queueMotion,{passive:true});
 addEventListener('resize',queueMotion);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueMotion()});
}
function queueMotion(){if(reduced||content.motion?.enabled===false||motionFrame||document.hidden)return;motionFrame=requestAnimationFrame(updateScrollMotion)}
function updateScrollMotion(){
 motionFrame=0;
 const height=innerHeight,range=document.documentElement.scrollHeight-height;
 document.documentElement.style.setProperty('--page-progress',range>0?Math.min(1,Math.max(0,scrollY/range)):0);
 for(const el of motionImages){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>height)continue;const p=Math.max(-1,Math.min(1,(r.top+r.height/2-height/2)/height));el.style.setProperty('--image-drift',(-p*16).toFixed(1)+'px');el.classList.toggle('image-in-view',r.top<height*.85&&r.bottom>height*.15)}
 const touch=matchMedia('(hover: none)').matches||innerWidth<=960;
 if(touch){let nearest=null,distance=Infinity;for(const el of motionCards){const r=el.getBoundingClientRect();if(r.bottom<80||r.top>height*.8)continue;const d=Math.abs(r.top+Math.min(r.height/2,100)-height*.45);if(d<distance){nearest=el;distance=d}}
 motionCards.forEach(el=>el.classList.toggle('scroll-active',el===nearest));
 connectionTarget=nearest;
 if(nearest?.matches('.milestone'))selectMilestone(Number(nearest.dataset.milestone));
 }
}

function selectMilestone(i){activeMilestone=i;document.querySelectorAll('.hero-slide').forEach((e,n)=>e.classList.toggle('active',content.site.heroUseChapterImages?n===i:n===0));document.querySelectorAll('.milestone').forEach((e,n)=>e.classList.toggle('active',n===i))}
function startSlides(){clearInterval(slideTimer);if(content.site.heroUseChapterImages&&!reduced&&content.motion?.enabled!==false&&innerWidth>760&&(content.milestones||[]).length>1){slideTimer=setInterval(()=>{if(!document.hidden)selectMilestone((activeMilestone+1)%content.milestones.length)},Math.max(2,Number(content.motion.slideshowSeconds)||6.8)*1000)}}
function bind(){$('search').addEventListener('input',renderEntries);$('clear-search').onclick=()=>{$('search').value='';renderEntries();$('search').focus()};$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;activeCategory=b.dataset.category;$('search').value='';renderEntries()});$('show-all').onclick=()=>{activeCategory='';$('search').value='';renderEntries()};$('reset-search').onclick=$('show-all').onclick;document.querySelector('.menu-toggle').onclick=e=>{const b=e.currentTarget;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('navigation').classList.toggle('open',open)};$('navigation').onclick=e=>{if(e.target.closest('a')){$('navigation').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false')}};document.querySelectorAll('.milestone').forEach((el,i)=>{el.addEventListener('mouseenter',()=>{clearInterval(slideTimer);selectMilestone(i);connectionTarget=el});el.addEventListener('mouseleave',()=>{connectionTarget=null;startSlides()});el.addEventListener('focus',()=>selectMilestone(i));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectMilestone(i)}});el.addEventListener('click',()=>selectMilestone(i))});const observer=new IntersectionObserver(list=>{list.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('#navigation a').forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+e.target.id))})},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id],footer[id]').forEach(s=>observer.observe(s));addEventListener('resize',startSlides)}
function readConsent(){try{return JSON.parse(localStorage.getItem('talha-cookie-consent'))}catch{return null}}
function saveConsent(v){try{localStorage.setItem('talha-cookie-consent',JSON.stringify({...v,updated:new Date().toISOString()}))}catch{}$('cookie-banner').hidden=true;if($('cookie-dialog').open)$('cookie-dialog').close()}
function cookies(){const c=content.cookies||{};if(c.cookieYesId&&/^[a-f0-9]{20,64}$/i.test(c.cookieYesId)){const script=document.createElement('script');script.id='cookieyes';script.src=`https://cdn-cookieyes.com/client_data/${c.cookieYesId}/script.js`;document.head.append(script);$('cookie-preferences').onclick=()=>{if(window.revisitCkyConsent)window.revisitCkyConsent();else $('cookie-dialog').showModal()};return}$('cookie-preferences').hidden=c.enabled===false;$('cookie-preferences').onclick=()=>{const v=readConsent()||{};$('consent-analytics').checked=!!v.analytics;$('consent-marketing').checked=!!v.marketing;$('cookie-dialog').showModal()};$('close-cookie').onclick=()=>$('cookie-dialog').close();$('save-consent').onclick=()=>saveConsent({necessary:true,analytics:$('consent-analytics').checked,marketing:$('consent-marketing').checked});if(c.enabled===false||readConsent())return;$('cookie-banner').innerHTML=`<div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p></div><div class="cookie-actions"><button class="inline-button" id="cookie-settings">${escapeHTML(c.settingsLabel)}</button><button class="button secondary" id="cookie-reject">${escapeHTML(c.rejectLabel)}</button><button class="button" id="cookie-accept">${escapeHTML(c.acceptLabel)}</button></div>`;$('cookie-banner').hidden=false;$('cookie-settings').onclick=$('cookie-preferences').onclick;$('cookie-reject').onclick=()=>saveConsent({necessary:true,analytics:false,marketing:false});$('cookie-accept').onclick=()=>saveConsent({necessary:true,analytics:true,marketing:true})}
function network(){
 if(reduced||content.motion?.enabled===false)return;
 const canvas=$('network'),ctx=canvas.getContext('2d'),fx=$('connections'),fc=fx.getContext('2d');
 if(!ctx||!fc)return;
 let w,h,nodes=[],frame=0,raf=0,last=0;
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,innerWidth<=960?1.5:2);
 [canvas,fx].forEach(c=>{c.width=Math.round(w*d);c.height=Math.round(h*d)});
 [ctx,fc].forEach(c=>c.setTransform(d,0,0,d,0,0));
 nodes=Array.from({length:Math.min(w<=960?22:42,Math.round(w*h/24000))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28}))}
 function draw(time){
 raf=0;if(document.hidden)return;raf=requestAnimationFrame(draw);if(time-last<33)return;last=time;frame++;
 ctx.clearRect(0,0,w,h);fc.clearRect(0,0,w,h);
 const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#36775f';
 const warm=getComputedStyle(document.documentElement).getPropertyValue('--warm').trim()||'#bc7255';
 ctx.fillStyle=accent;ctx.globalAlpha=.23;
 for(const n of nodes){n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1;ctx.beginPath();ctx.arc(n.x,n.y,1.6,0,Math.PI*2);ctx.fill()}
 ctx.strokeStyle=accent;
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<120){ctx.globalAlpha=(1-d/120)*.12;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
 ctx.globalAlpha=1;
 if(connectionTarget&&connectionTarget.isConnected){
 const origin=connectionTarget.querySelector('.milestone-dot,.entry-dot');if(!origin)return;
 const a=origin.getBoundingClientRect(),from={x:a.left+a.width/2,y:a.top+a.height/2};
 const targets=[...document.querySelectorAll('.milestone-dot,.entry-dot')].filter(t=>{const b=t.getBoundingClientRect();return t!==origin&&b.top>75&&b.top<h}).slice(0,w<=960?3:5);
 for(const [i,t] of targets.entries()){const b=t.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,cx=(from.x+x)/2+(w<=760?22:65),cy=(from.y+y)/2-30;
 fc.strokeStyle=accent;fc.globalAlpha=.22+.08*Math.sin(frame/24+i);fc.lineWidth=1;fc.beginPath();fc.moveTo(from.x,from.y);fc.quadraticCurveTo(cx,cy,x,y);fc.stroke();
 const p=((frame+i*20)%100)/100,px=(1-p)**2*from.x+2*(1-p)*p*cx+p*p*x,py=(1-p)**2*from.y+2*(1-p)*p*cy+p*p*y;
 fc.globalAlpha=.8;fc.fillStyle=warm;fc.beginPath();fc.arc(px,py,2.5,0,Math.PI*2);fc.fill()}
 fc.globalAlpha=1;}
 }
 resize();addEventListener('resize',resize);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(!raf){last=0;raf=requestAnimationFrame(draw)}});
 raf=requestAnimationFrame(draw);
}

getContent().then(d=>{content=d;render()}).catch(()=>{$('page-error').hidden=false;text('page-error','The website content could not be loaded. Please refresh the page.');$('page-error').style.cssText='position:fixed;bottom:20px;left:20px;background:white;padding:20px;z-index:99'});
