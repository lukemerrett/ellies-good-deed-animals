(function () {
  const D = window.GameData;
  const A = window.Art;
  const KEY = 'ellies-good-deed-animals:v1';
  const SLOTS = 3;
  const RECENT_MAX = 80;
  const HISTORY_MAX = 300;

  const CATS = Object.fromEntries(D.categories.map(c => [c.id, c]));
  const CRE = Object.fromEntries(D.creatures.map(c => [c.id, c]));
  const $ = id => document.getElementById(id);
  const rand = list => list[Math.floor(Math.random() * list.length)];

  // ---------- Saving ----------

  const fresh = () => ({ v: 1, found: {}, slots: [], recent: [], history: [], deedsDone: 0, muted: false, started: Date.now() });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return tidy(JSON.parse(raw));
    } catch (e) { /* fall through to a new game */ }
    return fresh();
  }

  // Merge a loaded save onto defaults and drop anything this version doesn't know about.
  function tidy(s) {
    const st = Object.assign(fresh(), s);
    for (const id of Object.keys(st.found)) if (!CRE[id]) delete st.found[id];
    st.slots = (st.slots || []).filter(sl => sl && CRE[sl.egg] && CATS[sl.cat] && sl.text).slice(0, SLOTS);
    return st;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  let persistAsked = false;
  function askPersist() {
    if (persistAsked) return;
    persistAsked = true;
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }

  let state = load();

  // ---------- Picking deeds and eggs ----------

  function remember(text) {
    state.recent.push(text);
    if (state.recent.length > RECENT_MAX) state.recent.splice(0, state.recent.length - RECENT_MAX);
  }

  function pickDeed(others) {
    const usedCats = new Set(others.map(s => s.cat));
    const shown = new Set(others.map(s => s.text));
    const recent = new Set(state.recent);
    let cats = D.categories.filter(c => !usedCats.has(c.id));
    if (!cats.length) cats = D.categories;
    const cat = rand(cats);
    let options = cat.deeds.filter(t => !recent.has(t) && !shown.has(t));
    if (!options.length) options = cat.deeds.filter(t => !shown.has(t));
    const text = rand(options);
    remember(text);
    return { cat: cat.id, text };
  }

  function pickEgg(others) {
    const inEggs = new Set(others.map(s => s.egg));
    const foundCount = Object.keys(state.found).length;
    const favs = D.favourites.filter(id => !state.found[id] && !inEggs.has(id));
    if (favs.length && foundCount < D.favourites.length) return rand(favs);

    let pool = D.creatures.filter(c => !state.found[c.id] && !inEggs.has(c.id));
    if (!pool.length) pool = D.creatures.filter(c => !inEggs.has(c.id));
    const total = pool.reduce((n, c) => n + D.rarities[c.rarity].weight, 0);
    let roll = Math.random() * total;
    for (const c of pool) {
      roll -= D.rarities[c.rarity].weight;
      if (roll <= 0) return c.id;
    }
    return pool[pool.length - 1].id;
  }

  function fillSlots() {
    while (state.slots.length < SLOTS) {
      const others = state.slots;
      state.slots.push(Object.assign(pickDeed(others), { egg: pickEgg(others) }));
    }
  }

  // ---------- Sound (made with WebAudio, no files) ----------

  const Sound = (() => {
    let ctx;
    function ac() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(freq, at, dur, type = 'sine', vol = .18, slideTo) {
      if (state.muted) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime + at;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + .05);
    }
    return {
      pop: () => tone(520, 0, .12, 'sine', .15, 880),
      tap: () => tone(700, 0, .06, 'triangle', .1),
      crack: n => { tone(180 + n * 60, 0, .1, 'square', .07, 90); tone(900 + n * 200, .02, .12, 'triangle', .12); },
      hatch: rarity => {
        const notes = rarity === 'legendary' ? [523, 659, 784, 1047, 1319, 1568] : rarity === 'rare' ? [523, 659, 784, 1047, 1319] : [523, 659, 784, 1047];
        notes.forEach((f, i) => tone(f, i * .09, .35, 'triangle', .16));
        tone(notes[notes.length - 1] * 2, notes.length * .09, .6, 'sine', .08);
      },
      shuffle: () => [440, 560, 660].forEach((f, i) => tone(f, i * .05, .08, 'triangle', .09)),
    };
  })();

  // ---------- Rendering: deeds ----------

  function iconSpan(name) {
    return `<span class="ico">${A.iconSvg(name)}</span>`;
  }

  function deedCard(slot, i, enter) {
    const cat = CATS[slot.cat];
    const rarity = CRE[slot.egg].rarity;
    const el = document.createElement('article');
    el.className = 'deed' + (enter ? ' enter' : '');
    el.style.setProperty('--c', cat.color);
    el.style.animationDelay = enter ? `${i * 90}ms` : '';
    el.dataset.slot = i;
    el.innerHTML = `
      <div class="chip">${iconSpan(cat.icon)}${cat.name}</div>
      <p class="deed-text"></p>
      <img class="deed-egg" src="${A.eggUrl(rarity)}" alt="A ${rarity === 'common' ? '' : rarity + ' '}mystery egg" draggable="false">
      <button class="done-btn">${iconSpan('tick')}I did it!</button>
      <div class="confirm">
        <p>Did you really do it?</p>
        <button class="yes">Yes!</button>
        <button class="no">Not yet</button>
      </div>`;
    el.querySelector('.deed-text').textContent = slot.text;
    return el;
  }

  function renderDeeds(enterSlots = []) {
    const box = $('deeds');
    box.innerHTML = '';
    state.slots.forEach((slot, i) => box.appendChild(deedCard(slot, i, enterSlots.includes(i))));
  }

  $('deeds').addEventListener('click', e => {
    askPersist();
    const card = e.target.closest('.deed');
    if (!card) return;
    const i = Number(card.dataset.slot);
    if (e.target.closest('.done-btn')) {
      Sound.tap();
      document.querySelectorAll('.deed.confirming').forEach(c => c.classList.remove('confirming'));
      card.classList.add('confirming');
    } else if (e.target.closest('.no')) {
      Sound.tap();
      card.classList.remove('confirming');
    } else if (e.target.closest('.yes')) {
      completeDeed(i);
    } else if (e.target.closest('.deed-egg')) {
      const egg = e.target.closest('.deed-egg');
      egg.classList.remove('jiggle');
      void egg.offsetWidth;
      egg.classList.add('jiggle');
      Sound.pop();
    }
  });

  $('reroll-btn').addEventListener('click', () => {
    askPersist();
    Sound.shuffle();
    const btn = $('reroll-btn');
    btn.classList.remove('spin');
    void btn.offsetWidth;
    btn.classList.add('spin');
    const eggs = state.slots.map(s => s.egg);
    state.slots = [];
    for (const egg of eggs) state.slots.push(Object.assign(pickDeed(state.slots), { egg }));
    save();
    renderDeeds([0, 1, 2]);
  });

  // ---------- Completing a deed and hatching ----------

  let revealSlot = null;

  function completeDeed(i) {
    const slot = state.slots[i];
    const id = slot.egg;
    const before = state.found[id];
    const now = Date.now();
    state.found[id] = before ? { n: before.n + 1, first: before.first, last: now } : { n: 1, first: now, last: now };
    state.deedsDone += 1;
    state.history.push({ t: now, cat: slot.cat, text: slot.text, got: id });
    if (state.history.length > HISTORY_MAX) state.history.splice(0, state.history.length - HISTORY_MAX);

    // Swap in the next deed now and save, so nothing is lost if the tab closes mid-hatch.
    const others = state.slots.filter((_, j) => j !== i);
    state.slots[i] = Object.assign(pickDeed(others), { egg: pickEgg(others) });
    save();
    revealSlot = i;
    startReveal(id, !before, state.found[id].n);
  }

  let cracks = 0;
  let hatching = null;

  function startReveal(id, isNew, count) {
    const c = CRE[id];
    hatching = { id, isNew, count, rarity: c.rarity };
    cracks = 0;
    const ov = $('reveal');
    ov.className = 'overlay r-' + c.rarity;
    ov.hidden = false;
    $('reveal-title').textContent = 'Tap the egg to hatch it!';
    const egg = $('reveal-egg');
    egg.className = '';
    egg.src = A.eggUrl(c.rarity, 0);
    egg.hidden = false;
    const cr = $('reveal-creature');
    cr.className = '';
    cr.src = A.creatureUrl(id);
    cr.alt = c.name;
    $('reveal-info').classList.remove('show');
    $('confetti').innerHTML = '';
    Sound.pop();
  }

  document.querySelector('#reveal .stage').addEventListener('click', () => {
    if (!hatching || cracks >= 3) return;
    cracks += 1;
    const egg = $('reveal-egg');
    egg.src = A.eggUrl(hatching.rarity, cracks);
    egg.className = '';
    void egg.offsetWidth;
    egg.className = 'shake' + cracks;
    Sound.crack(cracks);
    if (cracks === 1) $('reveal-title').textContent = 'Crack! Keep tapping!';
    if (cracks === 2) $('reveal-title').textContent = 'Nearly there...';
    if (cracks === 3) setTimeout(hatch, 650);
  });

  function hatch() {
    const { id, isNew, count, rarity } = hatching;
    const c = CRE[id];
    $('reveal-egg').className = 'gone';
    const flash = document.querySelector('#reveal .flash');
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');
    $('reveal').classList.add('hatched');
    $('reveal-creature').className = 'pop';
    Sound.hatch(rarity);
    confetti(rarity);

    $('reveal-title').textContent = isNew
      ? (rarity === 'legendary' ? 'A magical creature!' : rarity === 'rare' ? 'A rare animal!' : 'A new friend!')
      : 'Hello again!';
    const tag = $('reveal-tag');
    tag.className = 'tag ' + (isNew ? 'new' : 'r-' + rarity);
    tag.textContent = isNew ? 'NEW!' : `You have ${count} now`;
    if (isNew && rarity !== 'common') {
      tag.className = 'tag r-' + rarity;
      tag.textContent = 'NEW! ' + D.rarities[rarity].label;
    }
    $('reveal-name').textContent = c.name;
    $('reveal-fact').textContent = c.fact;
    setTimeout(() => $('reveal-info').classList.add('show'), 500);
    updateBadge();
  }

  $('reveal-close').addEventListener('click', () => {
    Sound.tap();
    $('reveal').hidden = true;
    hatching = null;
    renderDeeds(revealSlot === null ? [] : [revealSlot]);
    renderAlbum();
  });

  function confetti(rarity) {
    const box = $('confetti');
    box.innerHTML = '';
    const colours = rarity === 'legendary'
      ? ['#ff8fb6', '#ffcf5c', '#86dcae', '#86c8ff', '#bb9cff', '#ffffff']
      : rarity === 'rare' ? ['#ffffff', '#86c8ff', '#ffcf5c', '#bb9cff'] : ['#ffffff', '#ffcf5c', '#ff7f9f', '#45c46f', '#5ea8ff'];
    const n = rarity === 'legendary' ? 110 : rarity === 'rare' ? 80 : 60;
    for (let k = 0; k < n; k++) {
      const b = document.createElement('i');
      b.className = 'bit' + (Math.random() < .35 ? ' round' : '');
      const ang = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 320;
      b.style.background = rand(colours);
      b.style.setProperty('--x', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--y', Math.sin(ang) * dist + 120 + 'px');
      b.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
      b.style.setProperty('--t', (1.1 + Math.random() * 1.2) + 's');
      box.appendChild(b);
    }
  }

  // ---------- Rendering: album ----------

  function renderAlbum() {
    const box = $('album');
    box.innerHTML = '';
    const total = D.creatures.length;
    const foundCount = D.creatures.filter(c => state.found[c.id]).length;
    $('progress-fill').style.width = (foundCount / total * 100) + '%';
    const deeds = state.deedsDone;
    $('album-count').textContent = `${foundCount} of ${total} found, from ${deeds} good deed${deeds === 1 ? '' : 's'}`;

    for (const r of ['common', 'rare', 'legendary']) {
      const list = D.creatures.filter(c => c.rarity === r);
      const got = list.filter(c => state.found[c.id]).length;
      const g = document.createElement('section');
      g.className = 'group';
      g.innerHTML = `<h3>${D.rarities[r].name}<span>${got} / ${list.length}</span></h3><div class="grid"></div>`;
      const grid = g.querySelector('.grid');
      for (const c of list) {
        const f = state.found[c.id];
        const t = document.createElement('button');
        t.className = `tile r-${r}` + (f ? '' : ' locked');
        t.dataset.id = c.id;
        t.innerHTML = `<img src="${A.creatureUrl(c.id)}" alt="" draggable="false"><span></span>` + (f && f.n > 1 ? `<b class="count">x${f.n}</b>` : '');
        t.querySelector('span').textContent = f ? c.name : '???';
        grid.appendChild(t);
      }
      box.appendChild(g);
    }
  }

  $('album').addEventListener('click', e => {
    const t = e.target.closest('.tile');
    if (!t) return;
    if (t.classList.contains('locked')) {
      Sound.tap();
      t.classList.remove('shake');
      void t.offsetWidth;
      t.classList.add('shake');
      return;
    }
    showDetail(t.dataset.id);
  });

  function showDetail(id) {
    const c = CRE[id];
    const f = state.found[id];
    Sound.pop();
    $('detail').hidden = false;
    const card = document.querySelector('#detail .card');
    card.className = 'card r-' + c.rarity;
    $('detail-img').src = A.creatureUrl(id);
    $('detail-img').alt = c.name;
    const tag = $('detail-tag');
    tag.className = 'tag' + (c.rarity === 'common' ? '' : ' r-' + c.rarity);
    tag.textContent = c.rarity === 'common' ? 'Everyday animal' : D.rarities[c.rarity].label;
    $('detail-name').textContent = c.name;
    $('detail-home').textContent = 'Lives in: ' + c.home;
    $('detail-fact').textContent = c.fact;
    const when = new Date(f.first).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    $('detail-meta').textContent = `First found on ${when}` + (f.n > 1 ? ` · Found ${f.n} times` : '');
  }
  const closeDetail = () => { $('detail').hidden = true; };
  $('detail-close').addEventListener('click', closeDetail);
  $('detail').addEventListener('click', e => { if (e.target.id === 'detail') closeDetail(); });

  // ---------- Tabs, sound toggle, badge ----------

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    askPersist();
    Sound.tap();
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === tab.dataset.screen));
    window.scrollTo(0, 0);
  }));

  function updateBadge() {
    $('found-badge').textContent = Object.keys(state.found).length || '';
  }

  function renderSound() {
    $('sound-btn').innerHTML = A.iconSvg(state.muted ? 'soundOff' : 'soundOn');
  }
  $('sound-btn').addEventListener('click', () => {
    state.muted = !state.muted;
    save();
    renderSound();
    Sound.tap();
  });

  // ---------- Grown-ups: backup, restore, reset ----------

  const encode = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const decode = str => JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
  const msg = text => { $('backup-msg').textContent = text; };

  $('backup-btn').addEventListener('click', async () => {
    const ta = $('backup-text');
    ta.hidden = false;
    ta.value = encode(state);
    ta.select();
    try {
      await navigator.clipboard.writeText(ta.value);
      msg('Backup code copied. Paste it somewhere safe, like a note or an email to yourself.');
    } catch (e) {
      msg('Copy this backup code and keep it somewhere safe.');
    }
  });

  $('restore-btn').addEventListener('click', () => {
    const ta = $('backup-text');
    if (ta.hidden || !ta.value.trim() || ta.value === encode(state)) {
      ta.hidden = false;
      ta.value = '';
      ta.focus();
      msg('Paste a backup code in the box, then press "Load a backup code" again.');
      return;
    }
    try {
      const loaded = decode(ta.value);
      if (!loaded || typeof loaded.found !== 'object') throw new Error('bad');
      if (!confirm('Replace the animals on this device with the ones in the backup code?')) return;
      state = tidy(loaded);
      fillSlots();
      save();
      renderAll();
      msg(`Backup loaded: ${Object.keys(state.found).length} animals.`);
    } catch (e) {
      msg('That backup code did not work. Check it was copied completely.');
    }
  });

  $('reset-btn').addEventListener('click', () => {
    if (!confirm('Start again? All of Ellie\'s animals on this device will be gone.')) return;
    if (!confirm('Are you really sure? This cannot be undone.')) return;
    const muted = state.muted;
    state = fresh();
    state.muted = muted;
    fillSlots();
    save();
    renderAll();
    msg('Started a new game.');
  });

  // ---------- Start ----------

  function renderAll() {
    renderDeeds([0, 1, 2]);
    renderAlbum();
    updateBadge();
    renderSound();
  }

  document.querySelector('.tab .egg-ico').innerHTML = `<img src="${A.eggUrl('common')}" alt="">`;
  $('detail-close').innerHTML = A.iconSvg('close');
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = A.iconSvg(el.dataset.icon); });
  fillSlots();
  save();
  renderAll();
})();
