// simple demo session guard
try{
  if(!localStorage.getItem('creafood_session_v1')){
    window.location.href = 'index.html';
  }
}catch(e){}

const tabs = [
    {id:'home', label:'Accueil', icon:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/>'},
    {id:'meals', label:'Repas', icon:'<path d="M12 2.5c-3 3-4.5 6-4.5 9a4.5 4.5 0 009 0c0-1.2-.4-2.2-1-3.2-.6 1-1.5 1.4-2 1.2.6-1.6.3-4-1.5-7z"/>'},
    {id:'recipes', label:'Recettes', icon:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"/>'},
    {id:'shopping', label:'Courses', icon:'<path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 3h2l1 3"/>'},
    {id:'settings', label:'Réglages', icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.5 1z"/>'}
  ];

  function buildNav(activeId){
    return tabs.map(t => `
      <button class="navitem ${t.id===activeId?'active':''}" onclick="goTo('${t.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
        ${t.label}
        <span class="navdot"></span>
      </button>`).join('');
  }

  tabs.forEach(t => { document.getElementById('nav-'+t.id).innerHTML = buildNav(t.id); });

  function goTo(id){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-'+id).classList.add('active');
    document.getElementById('screen-'+id).querySelector('.content').scrollTop = 0;
  }

  // simple interactive checkboxes on shopping list
  document.querySelectorAll('.list-item .checkbox').forEach(cb => {
    cb.addEventListener('click', () => {
      cb.classList.toggle('checked');
      const name = cb.nextElementSibling;
      name.classList.toggle('done');
      cb.innerHTML = cb.classList.contains('checked') ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>' : '';
    });
  });

  // toggle switches
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => sw.classList.toggle('on'));
  });

  // logout
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
      try{ localStorage.removeItem('creafood_session_v1'); }catch(e){}
      window.location.href = 'index.html';
    });
  }

  // chip selection (recipes)
  document.querySelectorAll('.chip-row').forEach(row=>{
    row.querySelectorAll('.chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        row.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });
