(function(){
  var d=document;

  // rozkład jazdy przepisany z obrazków na stronie mix-trans.com.pl (stan 09.11.2026)
  var R={
    stary:{od:null,do:'2026-11-11',P:['05:25','06:28','08:10','12:00','12:55','14:50S','15:50'],L:['06:43','07:13S','07:53','10:30','13:20','14:20','17:30'],s:'kurs Srock - Piotrków'},
    nowy:{od:'2026-11-12',do:null,P:['05:05','06:20','08:10','10:30','12:00','12:55','14:50S','15:50'],L:['06:24','07:49','10:15','11:45','13:20','14:25','17:30'],s:'kurs Piotrków - Srock'}
  };
  function iso(dt){return dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)+'-'+('0'+dt.getDate()).slice(-2)}
  function ktory(dt){return iso(dt)>=R.nowy.od?'nowy':'stary'}
  function min(t){return +t.slice(0,2)*60+ +t.slice(3,5)}
  var teraz=new Date(), dzis=iso(teraz), tMin=teraz.getHours()*60+teraz.getMinutes(), dzien=teraz.getDay();
  var kursDzis=dzien>0&&dzien<6;

  function najblizszy(kier){
    var dni=['w niedzielę','w poniedziałek','we wtorek','w środę','w czwartek','w piątek','w sobotę'];
    for(var i=0;i<8;i++){
      var dt=new Date(teraz.getFullYear(),teraz.getMonth(),teraz.getDate()+i), wd=dt.getDay();
      if(wd===0||wd===6)continue;
      var lista=R[ktory(dt)][kier];
      for(var j=0;j<lista.length;j++){
        if(lista[j].indexOf('S')>0)continue; // kursy S nie jadą na całej trasie
        var g=lista[j].slice(0,5);
        if(i>0||min(g)>tMin)return {g:g,kiedy:i===0?'':(i===1?'jutro':dni[wd]),dzis:i===0};
      }
    }
    return null;
  }

  function rysuj(klucz){
    var r=R[klucz], aktualny=klucz===ktory(teraz)&&kursDzis;
    [['P','godzP'],['L','godzL']].forEach(function(k){
      var ol=d.getElementById(k[1]); ol.innerHTML='';
      var nb=aktualny?najblizszy(k[0]):null;
      r[k[0]].forEach(function(t){
        var g=t.slice(0,5), li=d.createElement('li');
        li.textContent=g;
        if(t.indexOf('S')>0){var s=d.createElement('span');s.className='s';s.textContent='S';s.title=r.s;li.appendChild(s)}
        if(aktualny&&min(g)<=tMin)li.classList.add('min');
        if(nb&&nb.dzis&&nb.g===g)li.classList.add('najb');
        ol.appendChild(li);
      });
    });
    d.getElementById('legendaS').textContent=r.s;
    d.querySelectorAll('[data-rozk]').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.rozk===klucz))});
  }
  d.querySelectorAll('[data-rozk]').forEach(function(b){b.addEventListener('click',function(){rysuj(b.dataset.rozk)})});
  var tStary=d.getElementById('t-stary');
  if(ktory(teraz)==='stary'){tStary.textContent='Obowiązuje do 11.11.2026';tStary.parentNode.insertBefore(tStary,tStary.parentNode.firstChild)}
  else{tStary.remove()}
  rysuj(ktory(teraz));

  // najbliższe odjazdy w pierwszym ekranie
  var p=najblizszy('P'), l=najblizszy('L');
  if(p&&l){
    d.getElementById('odjP').textContent=p.g; d.getElementById('odjL').textContent=l.g;
    var kp=p.kiedy||'dziś', kl=l.kiedy||'dziś';
    d.getElementById('odjazdKiedy').textContent='Najbliższe odjazdy '+(kp===kl?kp:'z Piotrkowa '+kp+', z Łodzi '+kl)+', pn-pt';
  }

  // menu mobilne
  var burger=d.getElementById('burger'), menu=d.getElementById('menu');
  function zamknij(){menu.classList.remove('otw');burger.setAttribute('aria-expanded','false');d.body.style.overflow=''}
  burger.addEventListener('click',function(){
    var otw=!menu.classList.contains('otw');
    menu.classList.toggle('otw',otw);burger.setAttribute('aria-expanded',String(otw));d.body.style.overflow=otw?'hidden':'';
  });
  menu.addEventListener('click',function(e){if(e.target.closest('a'))zamknij()});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')zamknij()});

  // aktywna pozycja menu = bieżąca sekcja
  var linki=[].slice.call(menu.querySelectorAll('a[href^="#"]'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(wp){
      wp.forEach(function(w){if(w.isIntersecting){linki.forEach(function(a){if(a.getAttribute('href')==='#'+w.target.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}});
    },{rootMargin:'-45% 0px -50% 0px'});
    linki.forEach(function(a){var s=d.querySelector(a.getAttribute('href'));if(s)io.observe(s)});
  }

  // galeria: palec natywnie, mysz przeciąganiem, strzałki
  var gal=d.getElementById('gal');
  if(gal){
    var x0=0,s0=0,ciag=false,ruch=false;
    gal.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;ciag=true;ruch=false;x0=e.clientX;s0=gal.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!ciag)return;var dx=e.clientX-x0;if(Math.abs(dx)>4){ruch=true;gal.classList.add('ciag')}if(ruch){gal.scrollLeft=s0-dx;e.preventDefault()}});
    window.addEventListener('pointerup',function(){if(!ciag)return;ciag=false;gal.classList.remove('ciag')});
    gal.addEventListener('click',function(e){if(ruch){e.preventDefault();e.stopPropagation();ruch=false}},true);
    gal.addEventListener('dragstart',function(e){e.preventDefault()});
    function krok(k){var f=gal.querySelector('figure');gal.scrollBy({left:k*(f?f.getBoundingClientRect().width+16:320),behavior:'smooth'})}
    d.querySelectorAll('[data-gal]').forEach(function(b){b.addEventListener('click',function(){krok(+b.dataset.gal)})});
    gal.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();krok(1)}if(e.key==='ArrowLeft'){e.preventDefault();krok(-1)}});
  }

  // formularz pokazowy, bez wysyłki
  var f=d.getElementById('form');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();d.getElementById('formInfo').hidden=false});

  var rok=d.getElementById('rok');if(rok)rok.textContent=new Date().getFullYear();
})();
