/* STRIKE 5 V5: dedicated Home / bot Lobby without claiming online multiplayer. */
(() => {
  'use strict';
  const by = id => document.getElementById(id);
  let previousMenu = 'lobby';
  function show(id) {
    for (const name of ['home', 'lobby', 'menu', 'end']) {
      const panel = by(name);
      if (panel) panel.classList.toggle('hide', name !== id);
    }
  }
  function selectedLabel(root) {
    const active = document.querySelector('#' + root + ' .chip.active');
    if (!active) return 'Not selected';
    const copy = active.cloneNode(true);
    copy.querySelectorAll('small').forEach(node => node.remove());
    return copy.textContent.trim().slice(0, 36);
  }
  function syncLobby() {
    const current=window.STRIKE5ReadOnly?.getSelection?.();
    const char = current?.character?.name || selectedLabel('charChoices');
    const weapon = current?.weapon?.name || selectedLabel('gunChoices');
    by('lobbyOperator').textContent = char;
    by('lobbyWeapon').textContent = weapon;
    by('lobbyPlayerName').textContent = char;
    by('homeXP').textContent = by('profileXP')?.textContent || '0 XP';
  }
  function goHome() { syncLobby(); show('home'); }
  function goLobby() { syncLobby(); by('lobbyStatus').textContent = 'Offline bot team match · no online matchmaking'; show('lobby'); }
  function openLoadout(section) {
    previousMenu = by('lobby').classList.contains('hide') ? 'home' : 'lobby';
    syncLobby();
    by('menuBack').textContent = previousMenu === 'home' ? '← BACK TO HOME' : '← BACK TO LOBBY';
    show('menu');
    if (section) {
      const node=by(section);
      if (node) requestAnimationFrame(() => node.scrollIntoView({block:'center',behavior:'smooth'}));
    }
  }
  function startFromLobby() {
    const start=by('startBtn');
    if (!start || start.disabled) {
      by('lobbyStatus').textContent = by('loading')?.textContent || '3D engine has not loaded';
      return;
    }
    start.click();
    if (by('hud').classList.contains('hide')) {
      by('lobbyStatus').textContent = 'Match not ready. Check game engine loading or device support.';
    } else {
      by('lobbyStatus').textContent = '';
      by('lobby').classList.add('hide');
      by('home').classList.add('hide');
    }
  }
  function initialize() {
    by('homePlay').addEventListener('click',goLobby);
    by('homeOperators').addEventListener('click',()=>openLoadout('charChoices'));
    by('homeArmory').addEventListener('click',()=>openLoadout('gunFilters'));
    by('homeSettings').addEventListener('click',()=>openLoadout('qualityRow'));
    by('lobbyHome').addEventListener('click',goHome);
    by('lobbyLoadout').addEventListener('click',()=>openLoadout('loadoutPanel'));
    by('lobbyStart').addEventListener('click',startFromLobby);
    by('menuBack').addEventListener('click',()=>{
      if (by('startBtn').textContent.includes('RESUME')) { by('startBtn').click(); return; }
      previousMenu==='home' ? goHome() : goLobby();
    });
    by('endLobby').addEventListener('click',goLobby);
    by('againBtn').addEventListener('click',()=>{by('home').classList.add('hide');by('lobby').classList.add('hide')});
    by('startBtn').addEventListener('click',()=> {
      if (!by('hud').classList.contains('hide')) {
        by('home').classList.add('hide');
        by('lobby').classList.add('hide');
      }
    });
    const resumeWatcher = new MutationObserver(() => { if (by('startBtn').textContent.includes('RESUME')) by('menuBack').textContent = '← RESUME MATCH'; });
    resumeWatcher.observe(by('startBtn'), {childList:true, characterData:true, subtree:true});
    const watched = by('loadoutPanel');
    if (watched && typeof MutationObserver !== 'undefined') {
      const observer=new MutationObserver(()=>{if(!by('lobby').classList.contains('hide')||!by('home').classList.contains('hide')) syncLobby()});
      observer.observe(watched,{childList:true,subtree:true});
    }
    syncLobby();
    show('home');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
  else initialize();
})();
