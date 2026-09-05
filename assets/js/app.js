/* =========================================================================
   CREAFOOD — Application fonctionnelle.
   Architecture inspirée de My-RoutinePov (github.com/shunziker07-byte/My-RoutinePov) :
   - stockage "local-first" via dbGet/dbSet (ici : localStorage uniquement,
     namespacé par utilisateur — pas de backend Firebase dans ce prototype).
   - un état global par domaine (mealsData, recipes, shoppingData, settingsData),
     chargé une fois au démarrage, muté puis persisté à chaque action.
   - formulaires réels (pas de fausses données) : chaque bouton déclenche une
     action qui modifie l'état et sauvegarde, honnêtement, sans rien simuler
     (pas de "Vision IA" ou de "Garmin connecté" qui ne serait pas réellement
     branché à un backend).
   ========================================================================= */

/* ---------------------------- Session guard ---------------------------- */
const SESSION_KEY = 'creafood_session_v1';
const ACCOUNTS_KEY = 'creafood_accounts_v1';

const sessionEmail = localStorage.getItem(SESSION_KEY);
if(!sessionEmail){
  window.location.href = 'index.html';
  throw new Error('No active session — redirecting to login.');
}

function loadAccounts(){
  try{ return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); }catch(e){ return []; }
}
const accounts = loadAccounts();
const account = accounts.find(a => a.email === sessionEmail) || { name: sessionEmail.split('@')[0], email: sessionEmail, createdAt: dstr(new Date()) };

/* ------------------------------ Utilities ------------------------------ */
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function dstr(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function parseDate(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function addDays(dateStr, n){ const d = parseDate(dateStr); d.setDate(d.getDate()+n); return dstr(d); }
function pctOf(val, goal){ return goal > 0 ? Math.max(0, Math.min(100, Math.round((val/goal)*100))) : 0; }
function initialsOf(name){ return (name||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join(''); }
const DAY_NAMES = ['DIMANCHE','LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
const MONTH_NAMES = ['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE'];
function formatDateSub(dateStr){ const d = parseDate(dateStr); return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`; }
function formatDateLabel(dateStr){
  const today = dstr(new Date());
  if(dateStr === today) return "Aujourd'hui";
  if(dateStr === addDays(today,-1)) return 'Hier';
  if(dateStr === addDays(today,1)) return 'Demain';
  const d = parseDate(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,1)+MONTH_NAMES[d.getMonth()].slice(1).toLowerCase()}`;
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ t.style.opacity = '0'; }, 1900);
}

/* ------------------------ Local-first storage --------------------------
   Même signature que dbGet/dbSet de My-RoutinePov, mais purement locale
   (localStorage), namespacée par utilisateur. Aucune donnée ne quitte le
   navigateur dans ce prototype.
--------------------------------------------------------------------- */
function storageKey(key){ return `creafood:${sessionEmail}:${key}`; }
function dbGet(key, fallback){
  try{
    const raw = localStorage.getItem(storageKey(key));
    return raw !== null ? JSON.parse(raw) : fallback;
  }catch(e){ return fallback; }
}
function dbSet(key, value){
  try{ localStorage.setItem(storageKey(key), JSON.stringify(value)); }
  catch(e){ console.warn('CREAFOOD: échec de sauvegarde locale', e); toast('Sauvegarde locale impossible (stockage plein ?)'); }
}

/* ------------------------------ Data model ------------------------------ */
const MEAL_TYPES = ['Petit-déjeuner','Déjeuner','Collation','Dîner'];
const MEAL_ICON = {'Petit-déjeuner':'🥐','Déjeuner':'☀️','Collation':'⚡','Dîner':'🌙'};

const RECIPE_CATEGORIES = {
  'tous': 'Tous',
  'petit-dejeuner': 'Petit-déjeuner',
  'repas': 'Repas',
  'snacks': 'Snacks',
  'desserts': 'Desserts'
};
const CATEGORY_TO_MEAL_TYPE = {
  'petit-dejeuner': 'Petit-déjeuner',
  'repas': 'Déjeuner',
  'snacks': 'Collation',
  'desserts': 'Collation'
};

const DEFAULT_GOALS = { calories: 2100, protein: 140, carbs: 210, fat: 65 };

function defaultMealsData(){ return { goals: { ...DEFAULT_GOALS }, entries: [] }; }

function defaultRecipes(){
  return [
    { id: uid(), title: 'Poke bowl saumon teriyaki & edamame', category:'repas', tags:['Facile'], prepTime:20, calories:520, protein:36, carbs:58, fat:16, favorite:false },
    { id: uid(), title: 'Poulet croustillant au paprika & asperges', category:'repas', tags:['High Protein'], prepTime:25, calories:480, protein:45, carbs:22, fat:18, favorite:false },
    { id: uid(), title: "Overnight oats protéinés cacao & beurre de cacahuète", category:'petit-dejeuner', tags:['Express'], prepTime:5, calories:390, protein:26, carbs:44, fat:12, favorite:false },
    { id: uid(), title: 'Omelette épinards & féta grecque', category:'petit-dejeuner', tags:['Rapide'], prepTime:10, calories:320, protein:28, carbs:6, fat:20, favorite:false },
    { id: uid(), title: 'Shaker whey & amandes', category:'snacks', tags:['Post-training'], prepTime:2, calories:220, protein:27, carbs:6, fat:9, favorite:false },
    { id: uid(), title: 'Curry de crevettes au lait de coco léger & riz jasmin', category:'repas', tags:["Saveurs d'Asie"], prepTime:30, calories:460, protein:32, carbs:52, fat:14, favorite:false },
    { id: uid(), title: 'Mousse chocolat noir & tofu soyeux', category:'desserts', tags:['Léger'], prepTime:15, calories:210, protein:9, carbs:18, fat:11, favorite:false },
  ];
}

function defaultShoppingData(){
  return {
    groups: [
      { id: uid(), name: 'Fruits & Légumes', icon: '🥦', items: [
        { id: uid(), name: 'Avocats mûrs', qty: 'x2', done:false },
        { id: uid(), name: 'Épinards frais', qty: '200g', done:false },
        { id: uid(), name: 'Citron vert', qty: 'x2', done:false },
      ]},
      { id: uid(), name: 'Boucherie & Poissonnerie', icon: '🥩', items: [
        { id: uid(), name: 'Pavé de saumon frais', qty: '300g', done:false },
        { id: uid(), name: 'Filets de poulet fermier', qty: '600g', done:false },
      ]},
      { id: uid(), name: 'Épicerie & Féculents', icon: '🌾', items: [
        { id: uid(), name: 'Quinoa bio', qty: '500g', done:false },
        { id: uid(), name: "Flocons d'avoine complets", qty: '1kg', done:false },
        { id: uid(), name: 'Beurre de cacahuète 100%', qty: '1 pot', done:false },
      ]},
      { id: uid(), name: 'Produits Frais', icon: '🧊', items: [
        { id: uid(), name: "Lait d'amande sans sucre", qty: '1L', done:true },
      ]},
      { id: uid(), name: 'Autres', icon: '🛒', items: [] },
    ]
  };
}

function defaultSettingsData(){
  return {
    diet: 'Équilibré & Hyperprotéiné',
    allergies: ['Sans lactose', 'Faible teneur en sucre raffiné'],
    portionsDefault: 2,
    reminders: { meals: true, hydration: true }
  };
}

function defaultWaterData(){ return {}; }

/* ------------------------------ Load state ------------------------------ */
let mealsData = dbGet('creafood-meals', defaultMealsData());
let recipes = dbGet('creafood-recipes', defaultRecipes());
let shoppingData = dbGet('creafood-shopping', defaultShoppingData());
let settingsData = dbGet('creafood-settings', defaultSettingsData());
let waterData = dbGet('creafood-water', defaultWaterData());

let selectedDate = dstr(new Date());
let recipesActiveCategory = 'tous';
let recipesSearchTerm = '';

function saveMeals(){ dbSet('creafood-meals', mealsData); }
function saveRecipes(){ dbSet('creafood-recipes', recipes); }
function saveShopping(){ dbSet('creafood-shopping', shoppingData); }
function saveSettings(){ dbSet('creafood-settings', settingsData); }
function saveWater(){ dbSet('creafood-water', waterData); }

/* ------------------------------ Navigation ------------------------------ */
const TABS = [
  {id:'home', label:'Accueil', icon:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/>'},
  {id:'meals', label:'Repas', icon:'<path d="M12 2.5c-3 3-4.5 6-4.5 9a4.5 4.5 0 009 0c0-1.2-.4-2.2-1-3.2-.6 1-1.5 1.4-2 1.2.6-1.6.3-4-1.5-7z"/>'},
  {id:'recipes', label:'Recettes', icon:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"/>'},
  {id:'shopping', label:'Courses', icon:'<path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 3h2l1 3"/>'},
  {id:'settings', label:'Réglages', icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.5 1z"/>'}
];
function buildNavHTML(activeId){
  return TABS.map(t => `
    <button class="navitem ${t.id===activeId?'active':''}" data-nav="${t.id}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
      ${t.label}
      <span class="navdot"></span>
    </button>`).join('');
}
TABS.forEach(t => { document.getElementById('nav-'+t.id).innerHTML = buildNavHTML(t.id); });

const RENDERERS = { home: renderHome, meals: renderMeals, recipes: renderRecipes, shopping: renderShopping, settings: renderSettings };

function goTo(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  document.getElementById('screen-'+id).querySelector('.content').scrollTop = 0;
  RENDERERS[id]();
}

/* Avatar buttons (initials) in every topbar */
function renderAvatars(){
  const initials = initialsOf(account.name) || '?';
  document.querySelectorAll('[id^="avatar-btn-"]').forEach(btn => {
    btn.innerHTML = `<span style="font-size:13px;font-weight:700;">${escapeHtml(initials)}</span>`;
    btn.onclick = () => goTo('settings');
  });
}

/* ============================================================
   HOME
   ============================================================ */
function todayEntries(){ return mealsData.entries.filter(e => e.date === selectedDate); }
function totalsFor(entries){
  return entries.reduce((acc,e)=>{
    acc.calories += e.calories; acc.protein += e.protein; acc.carbs += e.carbs; acc.fat += e.fat;
    return acc;
  }, {calories:0, protein:0, carbs:0, fat:0});
}

function renderHome(){
  renderAvatars();
  document.getElementById('home-greeting').textContent = `Bonjour, ${account.name.split(' ')[0]}`;

  const today = dstr(new Date());
  const entries = mealsData.entries.filter(e => e.date === today);
  const totals = totalsFor(entries);
  const g = mealsData.goals;
  const pct = pctOf(totals.calories, g.calories);

  document.getElementById('home-kcal-consumed').textContent = Math.round(totals.calories);
  document.getElementById('home-kcal-target').textContent = g.calories;
  document.getElementById('home-goal-status').textContent = `${pct}% atteint`;
  document.getElementById('home-protein-val').textContent = `${Math.round(totals.protein)}g / ${g.protein}g`;
  document.getElementById('home-carbs-val').textContent = `${Math.round(totals.carbs)}g / ${g.carbs}g`;
  document.getElementById('home-fat-val').textContent = `${Math.round(totals.fat)}g / ${g.fat}g`;
  document.getElementById('home-remaining-kcal').textContent = `${Math.max(0, Math.round(g.calories - totals.calories))} kcal`;
  document.getElementById('home-entries-count').textContent = entries.length;

  const circumference = 2 * Math.PI * 38;
  const ring = document.getElementById('home-ring-fg');
  ring.setAttribute('stroke-dasharray', circumference);
  ring.setAttribute('stroke-dashoffset', circumference - (circumference * pct / 100));
  ring.style.transform = 'rotate(-90deg)';
  document.getElementById('home-ring-pct').textContent = `${pct}%`;

  const water = waterData[today] || 0;
  document.getElementById('home-water-val').innerHTML = `${water.toFixed(2).replace(/\.00$/,'')}<small> / 2.5 L</small>`;

  document.getElementById('home-recipes-count').textContent = recipes.length;

  // Suggestion
  const loggedTitles = new Set(entries.map(e => e.name));
  const suggestion = recipes.find(r => !loggedTitles.has(r.title));
  const suggestCard = document.getElementById('home-suggestion-card');
  if(!recipes.length){
    suggestCard.innerHTML = `<div class="empty-state">Aucune recette pour l'instant.<br><button class="btn btn-primary" style="margin-top:10px;" data-nav="recipes">Créer ma première recette</button></div>`;
  } else if(!suggestion){
    suggestCard.innerHTML = `<div class="empty-state">Tu as déjà logué toutes tes recettes aujourd'hui 👏<br><button class="btn btn-secondary" style="margin-top:10px;" data-nav="recipes">Voir les recettes</button></div>`;
  } else {
    suggestCard.innerHTML = `
      <div class="nm-row">
        <div class="nm-thumb" style="display:flex;align-items:center;justify-content:center;font-size:24px;">${categoryEmoji(suggestion.category)}</div>
        <div class="nm-info">
          <div class="nm-tags"><span class="tag">${suggestion.prepTime} min</span><span class="tag">${suggestion.calories} kcal</span></div>
          <div class="nm-title">${escapeHtml(suggestion.title)}</div>
          <div class="nm-macros">P&nbsp;${suggestion.protein}g&nbsp;·&nbsp;G&nbsp;${suggestion.carbs}g&nbsp;·&nbsp;L&nbsp;${suggestion.fat}g</div>
        </div>
      </div>
      <div class="nm-actions">
        <button class="btn btn-primary" data-log-recipe="${suggestion.id}">Valider ce repas</button>
        <button class="icon-square" data-nav="recipes" title="Voir d'autres recettes"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg></button>
      </div>`;
  }

  // Journal (today, last 5)
  const journalEl = document.getElementById('home-journal-list');
  if(!entries.length){
    journalEl.innerHTML = `<div class="empty-state">Aucun repas loggé aujourd'hui.</div>`;
  } else {
    journalEl.innerHTML = entries.slice(-5).reverse().map(e => `
      <div class="card food-row" style="margin-top:8px;">
        <div class="food-thumb" style="display:flex;align-items:center;justify-content:center;font-size:20px;">${MEAL_ICON[e.type]||'🍽️'}</div>
        <div class="food-info">
          <div class="food-name">${escapeHtml(e.name)}</div>
          <div class="food-macro">${e.type} · ${Math.round(e.calories)} kcal · P${Math.round(e.protein)} G${Math.round(e.carbs)} L${Math.round(e.fat)}</div>
        </div>
        <span class="kebab" data-del-meal="${e.id}" title="Supprimer" style="cursor:pointer;">✕</span>
      </div>`).join('');
  }
}

function categoryEmoji(cat){
  return {'petit-dejeuner':'🥐','repas':'🍽️','snacks':'⚡','desserts':'🍫'}[cat] || '🍽️';
}

function buildMealForm(prefix, defaultType){
  const typeOptions = MEAL_TYPES.map(t => `<option value="${t}" ${t===defaultType?'selected':''}>${t}</option>`).join('');
  const recipeOptions = `<option value="">— Saisie manuelle —</option>` + recipes.map(r => `<option value="${r.id}">${escapeHtml(r.title)}</option>`).join('');
  return `
    <div class="form-row">
      <div class="form-field">
        <label>Repas</label>
        <select id="${prefix}-type">${typeOptions}</select>
      </div>
      <div class="form-field">
        <label>Depuis une recette</label>
        <select id="${prefix}-recipe">${recipeOptions}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Nom du plat</label>
        <input id="${prefix}-name" placeholder="Ex: Salade César">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Kcal</label><input id="${prefix}-cal" type="number" min="0" placeholder="0"></div>
      <div class="form-field"><label>Protéines (g)</label><input id="${prefix}-prot" type="number" min="0" placeholder="0"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Glucides (g)</label><input id="${prefix}-carb" type="number" min="0" placeholder="0"></div>
      <div class="form-field"><label>Lipides (g)</label><input id="${prefix}-fat" type="number" min="0" placeholder="0"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" data-cancel-form="${prefix}">Annuler</button>
      <button class="btn btn-primary" data-submit-meal="${prefix}">Ajouter au journal</button>
    </div>`;
}

function wireMealForm(prefix, dateForEntry){
  const recipeSel = document.getElementById(`${prefix}-recipe`);
  recipeSel.addEventListener('change', () => {
    const r = recipes.find(x => x.id === recipeSel.value);
    if(!r) return;
    document.getElementById(`${prefix}-name`).value = r.title;
    document.getElementById(`${prefix}-cal`).value = r.calories;
    document.getElementById(`${prefix}-prot`).value = r.protein;
    document.getElementById(`${prefix}-carb`).value = r.carbs;
    document.getElementById(`${prefix}-fat`).value = r.fat;
    document.getElementById(`${prefix}-type`).value = CATEGORY_TO_MEAL_TYPE[r.category] || 'Déjeuner';
  });
  document.querySelector(`[data-submit-meal="${prefix}"]`).addEventListener('click', () => {
    const name = document.getElementById(`${prefix}-name`).value.trim();
    if(!name){ toast('Indique un nom pour ce plat'); return; }
    const entry = {
      id: uid(),
      date: dateForEntry,
      type: document.getElementById(`${prefix}-type`).value,
      name,
      calories: Math.max(0, parseFloat(document.getElementById(`${prefix}-cal`).value) || 0),
      protein: Math.max(0, parseFloat(document.getElementById(`${prefix}-prot`).value) || 0),
      carbs: Math.max(0, parseFloat(document.getElementById(`${prefix}-carb`).value) || 0),
      fat: Math.max(0, parseFloat(document.getElementById(`${prefix}-fat`).value) || 0),
    };
    mealsData.entries.push(entry);
    saveMeals();
    toast('Repas ajouté au journal');
    hideForm(prefix);
    renderHome(); if(document.getElementById('screen-meals').classList.contains('active')) renderMeals();
  });
  document.querySelector(`[data-cancel-form="${prefix}"]`).addEventListener('click', () => hideForm(prefix));
}

function showForm(containerId, prefix, defaultType, dateForEntry){
  const el = document.getElementById(containerId);
  el.innerHTML = buildMealForm(prefix, defaultType);
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.gap = '0';
  wireMealForm(prefix, dateForEntry);
}
function hideForm(prefix){
  const map = { 'home-mf': 'home-quick-add-form', 'meals-mf': 'meals-add-form' };
  const containerId = map[prefix];
  if(containerId){ document.getElementById(containerId).style.display = 'none'; document.getElementById(containerId).innerHTML=''; }
}

function delMealEntry(id){
  if(!confirm('Supprimer ce repas du journal ?')) return;
  mealsData.entries = mealsData.entries.filter(e => e.id !== id);
  saveMeals();
  toast('Repas supprimé');
  renderHome();
  if(document.getElementById('screen-meals').classList.contains('active')) renderMeals();
}

function logRecipe(recipeId, dateForEntry){
  const r = recipes.find(x => x.id === recipeId);
  if(!r) return;
  mealsData.entries.push({
    id: uid(), date: dateForEntry, type: CATEGORY_TO_MEAL_TYPE[r.category] || 'Déjeuner',
    name: r.title, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat
  });
  saveMeals();
  toast(`"${r.title}" ajouté au journal`);
}

function addWater(delta){
  const today = dstr(new Date());
  const current = waterData[today] || 0;
  waterData[today] = Math.max(0, Math.min(5, Math.round((current + delta) * 4) / 4));
  saveWater();
  renderHome();
}

/* ============================================================
   MEALS TRACKER
   ============================================================ */
function renderMeals(){
  renderAvatars();
  document.getElementById('meals-date-label').textContent = formatDateLabel(selectedDate);
  document.getElementById('meals-date-sub').textContent = formatDateSub(selectedDate);

  const entries = mealsData.entries.filter(e => e.date === selectedDate);
  const totals = totalsFor(entries);
  const g = mealsData.goals;

  document.getElementById('meals-remaining-kcal').textContent = Math.max(0, Math.round(g.calories - totals.calories));
  document.getElementById('meals-consumed-kcal').textContent = Math.round(totals.calories);
  document.getElementById('meals-target-kcal').textContent = g.calories;
  document.getElementById('meals-kcal-bar').style.width = pctOf(totals.calories, g.calories) + '%';

  document.getElementById('meals-protein-val').textContent = Math.round(totals.protein);
  document.getElementById('meals-protein-goal').textContent = g.protein;
  document.getElementById('meals-protein-pct').textContent = pctOf(totals.protein,g.protein)+'%';
  document.getElementById('meals-protein-bar').style.width = pctOf(totals.protein,g.protein)+'%';

  document.getElementById('meals-carbs-val').textContent = Math.round(totals.carbs);
  document.getElementById('meals-carbs-goal').textContent = g.carbs;
  document.getElementById('meals-carbs-pct').textContent = pctOf(totals.carbs,g.carbs)+'%';
  document.getElementById('meals-carbs-bar').style.width = pctOf(totals.carbs,g.carbs)+'%';

  document.getElementById('meals-fat-val').textContent = Math.round(totals.fat);
  document.getElementById('meals-fat-goal').textContent = g.fat;
  document.getElementById('meals-fat-pct').textContent = pctOf(totals.fat,g.fat)+'%';
  document.getElementById('meals-fat-bar').style.width = pctOf(totals.fat,g.fat)+'%';

  const groupsEl = document.getElementById('meals-groups');
  groupsEl.innerHTML = MEAL_TYPES.map(type => {
    const items = entries.filter(e => e.type === type);
    const kcal = items.reduce((s,e)=>s+e.calories,0);
    const rows = items.length
      ? items.map(e => `
        <div class="card food-row" style="margin-top:8px;">
          <div class="food-thumb" style="display:flex;align-items:center;justify-content:center;font-size:20px;">${MEAL_ICON[type]}</div>
          <div class="food-info">
            <div class="food-name">${escapeHtml(e.name)}</div>
            <div class="food-macro">${Math.round(e.calories)} kcal · P${Math.round(e.protein)} G${Math.round(e.carbs)} L${Math.round(e.fat)}</div>
          </div>
          <span class="kebab" data-del-meal="${e.id}" title="Supprimer" style="cursor:pointer;">✕</span>
        </div>`).join('')
      : `<button class="toggle-form-btn" data-quick-add-type="${type}">＋ Ajouter à ${type.toLowerCase()}</button>`;
    return `
      <div class="meal-block" style="margin-top:20px;">
        <div class="meal-head">
          <div class="meal-head-left">${MEAL_ICON[type]} ${type}</div>
          <div class="meal-kcal">${Math.round(kcal)} kcal</div>
        </div>
        ${rows}
      </div>`;
  }).join('');

  // wire per-slot quick add buttons
  groupsEl.querySelectorAll('[data-quick-add-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      showForm('meals-add-form', 'meals-mf', btn.dataset.quickAddType, selectedDate);
      document.getElementById('meals-add-form').scrollIntoView({behavior:'smooth', block:'center'});
    });
  });
}

document.getElementById('meals-prev-day').addEventListener('click', () => { selectedDate = addDays(selectedDate,-1); renderMeals(); });
document.getElementById('meals-next-day').addEventListener('click', () => { selectedDate = addDays(selectedDate,1); renderMeals(); });
document.getElementById('meals-add-toggle').addEventListener('click', () => {
  const el = document.getElementById('meals-add-form');
  if(el.style.display === 'flex'){ hideForm('meals-mf'); return; }
  showForm('meals-add-form', 'meals-mf', 'Déjeuner', selectedDate);
});
document.getElementById('home-quick-add-toggle').addEventListener('click', () => {
  const el = document.getElementById('home-quick-add-form');
  if(el.style.display === 'flex'){ hideForm('home-mf'); return; }
  showForm('home-quick-add-form', 'home-mf', 'Déjeuner', dstr(new Date()));
});
document.getElementById('water-plus').addEventListener('click', () => addWater(0.25));
document.getElementById('water-minus').addEventListener('click', () => addWater(-0.25));

/* ============================================================
   RECIPES
   ============================================================ */
function renderRecipes(){
  renderAvatars();
  const tabsEl = document.getElementById('recipes-cat-tabs');
  tabsEl.innerHTML = Object.entries(RECIPE_CATEGORIES).map(([key,label]) =>
    `<span class="cat-tab ${recipesActiveCategory===key?'active':''}" data-cat="${key}">${label}</span>`).join('');
  tabsEl.querySelectorAll('[data-cat]').forEach(el => el.addEventListener('click', () => {
    recipesActiveCategory = el.dataset.cat; renderRecipes();
  }));

  let filtered = recipes.filter(r => recipesActiveCategory==='tous' || r.category===recipesActiveCategory);
  if(recipesSearchTerm.trim()){
    const q = recipesSearchTerm.trim().toLowerCase();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(q));
  }

  document.getElementById('recipes-count').textContent = filtered.length;
  const listEl = document.getElementById('recipes-list');
  if(!filtered.length){
    listEl.innerHTML = `<div class="empty-state">Aucune recette ne correspond. Essaie une autre recherche, ou crée-en une nouvelle ci-dessous.</div>`;
  } else {
    listEl.innerHTML = filtered.map(r => `
      <div class="recipe-card">
        <div class="recipe-body" style="padding-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div class="recipe-badges" style="position:static; display:flex; gap:6px; margin-bottom:10px;">
              <span class="badge" style="background:var(--glass-06);">${r.prepTime} min</span>
              ${r.tags.map(t=>`<span class="badge tag-tertiary">${escapeHtml(t)}</span>`).join('')}
            </div>
            <button class="heart-btn" style="position:static; background:none; ${r.favorite?'color:var(--primary)':'color:var(--outline)'}" data-fav="${r.id}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="${r.favorite?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
            </button>
          </div>
          <div class="recipe-title">${escapeHtml(r.title)}</div>
          <div class="recipe-foot" style="margin-top:12px;">
            <div class="recipe-macros">
              <div class="rm">Énergie<b>${r.calories} kcal</b></div>
              <div class="rm">Protéines<b>${r.protein}g</b></div>
              <div class="rm">Glucides<b>${r.carbs}g</b></div>
              <div class="rm">Lipides<b>${r.fat}g</b></div>
            </div>
          </div>
          <div class="recipe-actions" style="margin-top:12px; width:100%;">
            <button class="add-btn" style="flex:1; justify-content:center;" data-log-recipe="${r.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>Ajouter au journal</button>
            <button class="btn-ghost-icon" data-del-recipe="${r.id}" title="Supprimer la recette"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg></button>
          </div>
        </div>
      </div>`).join('');
  }
}

let recipesSearchTimer;
document.getElementById('recipes-search').addEventListener('input', (e) => {
  clearTimeout(recipesSearchTimer);
  recipesSearchTimer = setTimeout(() => { recipesSearchTerm = e.target.value; renderRecipes(); }, 200);
});

function buildRecipeForm(){
  const catOptions = Object.entries(RECIPE_CATEGORIES).filter(([k])=>k!=='tous').map(([k,l])=>`<option value="${k}">${l}</option>`).join('');
  return `
    <div class="form-row"><div class="form-field"><label>Titre</label><input id="rf-title" placeholder="Ex: Bowl de quinoa au poulet"></div></div>
    <div class="form-row">
      <div class="form-field"><label>Catégorie</label><select id="rf-category">${catOptions}</select></div>
      <div class="form-field"><label>Temps (min)</label><input id="rf-time" type="number" min="1" placeholder="15"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Kcal</label><input id="rf-cal" type="number" min="0" placeholder="0"></div>
      <div class="form-field"><label>Protéines (g)</label><input id="rf-prot" type="number" min="0" placeholder="0"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Glucides (g)</label><input id="rf-carb" type="number" min="0" placeholder="0"></div>
      <div class="form-field"><label>Lipides (g)</label><input id="rf-fat" type="number" min="0" placeholder="0"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="rf-cancel">Annuler</button>
      <button class="btn btn-primary" id="rf-submit">Créer la recette</button>
    </div>`;
}
document.getElementById('recipes-add-toggle').addEventListener('click', () => {
  const el = document.getElementById('recipes-add-form');
  const opening = el.style.display !== 'flex';
  if(!opening){ el.style.display='none'; el.innerHTML=''; return; }
  el.innerHTML = buildRecipeForm();
  el.style.display = 'flex'; el.style.flexDirection = 'column';
  document.getElementById('rf-cancel').addEventListener('click', () => { el.style.display='none'; el.innerHTML=''; });
  document.getElementById('rf-submit').addEventListener('click', () => {
    const title = document.getElementById('rf-title').value.trim();
    if(!title){ toast('Indique un titre pour la recette'); return; }
    recipes.push({
      id: uid(), title, category: document.getElementById('rf-category').value,
      tags: [], prepTime: Math.max(1, parseInt(document.getElementById('rf-time').value)||10),
      calories: Math.max(0, parseFloat(document.getElementById('rf-cal').value)||0),
      protein: Math.max(0, parseFloat(document.getElementById('rf-prot').value)||0),
      carbs: Math.max(0, parseFloat(document.getElementById('rf-carb').value)||0),
      fat: Math.max(0, parseFloat(document.getElementById('rf-fat').value)||0),
      favorite: false
    });
    saveRecipes();
    toast('Recette créée');
    el.style.display='none'; el.innerHTML='';
    renderRecipes();
  });
});

function toggleFavorite(id){
  const r = recipes.find(x=>x.id===id); if(!r) return;
  r.favorite = !r.favorite;
  saveRecipes();
  renderRecipes();
}
function deleteRecipe(id){
  if(!confirm('Supprimer cette recette ?')) return;
  recipes = recipes.filter(r=>r.id!==id);
  saveRecipes();
  toast('Recette supprimée');
  renderRecipes();
}

/* ============================================================
   SHOPPING LIST
   ============================================================ */
function renderShopping(){
  renderAvatars();
  const groupsEl = document.getElementById('shopping-groups');
  let total = 0, done = 0;
  shoppingData.groups.forEach(g => { total += g.items.length; done += g.items.filter(i=>i.done).length; });

  groupsEl.innerHTML = shoppingData.groups.map(group => {
    if(!group.items.length && group.name !== 'Autres') return ''; // hide empty default groups except "Autres"
    const rows = group.items.length
      ? group.items.map(item => `
        <div class="list-item">
          <span class="checkbox ${item.done?'checked':''}" data-toggle-shopping="${item.id}">${item.done?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>':''}</span>
          <span class="item-name ${item.done?'done':''}">${escapeHtml(item.name)}</span>
          ${item.qty ? `<span class="item-qty">${escapeHtml(item.qty)}</span>` : ''}
          <span class="kebab" style="margin-left:8px; cursor:pointer;" data-del-shopping="${item.id}">✕</span>
        </div>`).join('')
      : `<div class="empty-state" style="padding:10px;">Rien ici pour l'instant.</div>`;
    return `
      <div class="list-group">
        <div class="list-group-head"><div class="list-group-title">${group.icon} ${escapeHtml(group.name)}</div><span class="list-group-count">${group.items.length} article${group.items.length>1?'s':''}</span></div>
        <div class="card" style="padding:4px 12px;">${rows}</div>
      </div>`;
  }).join('');

  document.getElementById('shopping-remaining-label').textContent = `${total-done} article${total-done!==1?'s':''} restant${total-done!==1?'s':''}`;
  document.getElementById('shopping-done-label').textContent = `${done} acheté${done!==1?'s':''}`;
  document.getElementById('shopping-progress-bar').style.width = (total ? Math.round(done/total*100) : 0) + '%';
}

document.getElementById('shopping-quick-add').addEventListener('click', submitQuickShoppingItem);
document.getElementById('shopping-quick-name').addEventListener('keydown', (e) => { if(e.key==='Enter') submitQuickShoppingItem(); });
function submitQuickShoppingItem(){
  const input = document.getElementById('shopping-quick-name');
  const raw = input.value.trim();
  if(!raw) return;
  // essaie d'extraire une quantité en tête (ex: "200g riz basmati")
  const match = raw.match(/^([\d.,]+\s?(?:g|kg|ml|l|x\d*)?)\s+(.+)$/i);
  const name = match ? match[2] : raw;
  const qty = match ? match[1] : '';
  let autresGroup = shoppingData.groups.find(g => g.name === 'Autres');
  if(!autresGroup){ autresGroup = { id: uid(), name:'Autres', icon:'🛒', items: [] }; shoppingData.groups.push(autresGroup); }
  autresGroup.items.push({ id: uid(), name, qty, done:false });
  saveShopping();
  input.value = '';
  toast('Article ajouté');
  renderShopping();
}

function toggleShoppingItem(id){
  for(const g of shoppingData.groups){
    const item = g.items.find(i=>i.id===id);
    if(item){ item.done = !item.done; saveShopping(); renderShopping(); return; }
  }
}
function delShoppingItem(id){
  shoppingData.groups.forEach(g => { g.items = g.items.filter(i=>i.id!==id); });
  saveShopping();
  renderShopping();
}
document.getElementById('shopping-clear-btn').addEventListener('click', () => {
  if(!confirm('Vider entièrement la liste de courses ?')) return;
  shoppingData.groups.forEach(g => g.items = []);
  saveShopping();
  toast('Liste vidée');
  renderShopping();
});
document.getElementById('shopping-clear-done-btn').addEventListener('click', () => {
  shoppingData.groups.forEach(g => g.items = g.items.filter(i=>!i.done));
  saveShopping();
  toast('Articles cochés retirés');
  renderShopping();
});

/* ============================================================
   SETTINGS
   ============================================================ */
function renderSettings(){
  renderAvatars();
  document.getElementById('settings-avatar-initials').textContent = initialsOf(account.name) || '?';
  document.getElementById('settings-name').textContent = account.name;
  document.getElementById('settings-email').textContent = account.email;
  document.getElementById('settings-since').textContent = `Membre depuis ${account.createdAt || '—'}`;

  const g = mealsData.goals;
  document.getElementById('settings-kcal-target').textContent = g.calories;
  document.getElementById('settings-protein-g').textContent = g.protein+'g';
  document.getElementById('settings-carbs-g').textContent = g.carbs+'g';
  document.getElementById('settings-fat-g').textContent = g.fat+'g';
  const totalG = g.protein + g.carbs + g.fat;
  const pP = totalG ? Math.round(g.protein/totalG*100) : 33;
  const pC = totalG ? Math.round(g.carbs/totalG*100) : 34;
  const pF = totalG ? Math.max(0,100-pP-pC) : 33;
  document.getElementById('settings-split-p').style.width = pP+'%';
  document.getElementById('settings-split-c').style.width = pC+'%';
  document.getElementById('settings-split-f').style.width = pF+'%';
  document.getElementById('settings-split-total').textContent = `${pP+pC+pF}%`;

  document.getElementById('settings-diet-value').textContent = settingsData.diet;

  const allergiesEl = document.getElementById('settings-allergies-list');
  allergiesEl.innerHTML = settingsData.allergies.map((a,i) => `
    <span class="allergy-pill">${escapeHtml(a)} <button data-del-allergy="${i}">✕</button></span>`).join('')
    || `<span class="small-note">Aucune exclusion enregistrée.</span>`;

  document.getElementById('settings-portions-value').textContent = settingsData.portionsDefault;

  const mealsSwitch = document.getElementById('toggle-meals-reminder');
  mealsSwitch.classList.toggle('on', !!settingsData.reminders.meals);
  const hydrationSwitch = document.getElementById('toggle-hydration-reminder');
  hydrationSwitch.classList.toggle('on', !!settingsData.reminders.hydration);
}

document.getElementById('settings-goals-toggle').addEventListener('click', () => {
  const el = document.getElementById('settings-goals-form');
  if(el.style.display === 'block'){ el.style.display='none'; el.innerHTML=''; return; }
  const g = mealsData.goals;
  el.innerHTML = `
    <div class="form-row">
      <div class="form-field"><label>Calories / jour</label><input id="gf-cal" type="number" min="0" value="${g.calories}"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Protéines (g)</label><input id="gf-prot" type="number" min="0" value="${g.protein}"></div>
      <div class="form-field"><label>Glucides (g)</label><input id="gf-carb" type="number" min="0" value="${g.carbs}"></div>
      <div class="form-field"><label>Lipides (g)</label><input id="gf-fat" type="number" min="0" value="${g.fat}"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="gf-cancel">Annuler</button>
      <button class="btn btn-primary" id="gf-submit">Enregistrer</button>
    </div>`;
  el.style.display = 'block';
  document.getElementById('gf-cancel').addEventListener('click', () => { el.style.display='none'; el.innerHTML=''; });
  document.getElementById('gf-submit').addEventListener('click', () => {
    mealsData.goals = {
      calories: Math.max(0, parseInt(document.getElementById('gf-cal').value)||0),
      protein: Math.max(0, parseInt(document.getElementById('gf-prot').value)||0),
      carbs: Math.max(0, parseInt(document.getElementById('gf-carb').value)||0),
      fat: Math.max(0, parseInt(document.getElementById('gf-fat').value)||0),
    };
    saveMeals();
    toast('Objectifs mis à jour');
    el.style.display='none'; el.innerHTML='';
    renderSettings();
  });
});

document.getElementById('settings-diet-row').addEventListener('click', () => {
  const el = document.getElementById('settings-diet-form');
  const opening = el.style.display !== 'block';
  if(!opening){ el.style.display='none'; el.innerHTML=''; return; }
  el.innerHTML = `
    <div class="form-row"><div class="form-field"><input id="df-input" value="${escapeHtml(settingsData.diet)}"></div></div>
    <div class="form-actions"><button class="btn btn-secondary" id="df-cancel">Annuler</button><button class="btn btn-primary" id="df-submit">Enregistrer</button></div>`;
  el.style.display = 'block';
  document.getElementById('df-cancel').addEventListener('click', () => { el.style.display='none'; el.innerHTML=''; });
  document.getElementById('df-submit').addEventListener('click', () => {
    const v = document.getElementById('df-input').value.trim();
    if(v){ settingsData.diet = v; saveSettings(); toast('Régime mis à jour'); }
    el.style.display='none'; el.innerHTML='';
    renderSettings();
  });
});

document.getElementById('settings-allergy-add').addEventListener('click', addAllergyFromInput);
document.getElementById('settings-allergy-input').addEventListener('keydown', e => { if(e.key==='Enter') addAllergyFromInput(); });
function addAllergyFromInput(){
  const input = document.getElementById('settings-allergy-input');
  const v = input.value.trim();
  if(!v) return;
  settingsData.allergies.push(v);
  saveSettings();
  input.value = '';
  renderSettings();
}
function delAllergy(idx){
  settingsData.allergies.splice(idx,1);
  saveSettings();
  renderSettings();
}

document.getElementById('portions-plus').addEventListener('click', () => {
  settingsData.portionsDefault = Math.min(12, settingsData.portionsDefault+1);
  saveSettings(); renderSettings();
});
document.getElementById('portions-minus').addEventListener('click', () => {
  settingsData.portionsDefault = Math.max(1, settingsData.portionsDefault-1);
  saveSettings(); renderSettings();
});

document.getElementById('toggle-meals-reminder').addEventListener('click', () => {
  settingsData.reminders.meals = !settingsData.reminders.meals; saveSettings(); renderSettings();
});
document.getElementById('toggle-hydration-reminder').addEventListener('click', () => {
  settingsData.reminders.hydration = !settingsData.reminders.hydration; saveSettings(); renderSettings();
});

document.getElementById('settings-export-btn').addEventListener('click', () => {
  const payload = { account: {name:account.name, email:account.email}, meals:mealsData, recipes, shopping:shoppingData, settings:settingsData, water:waterData, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `creafood-export-${dstr(new Date())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('Export téléchargé');
});

document.getElementById('settings-import-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      if(data.meals) { mealsData = data.meals; saveMeals(); }
      if(data.recipes) { recipes = data.recipes; saveRecipes(); }
      if(data.shopping) { shoppingData = data.shopping; saveShopping(); }
      if(data.settings) { settingsData = data.settings; saveSettings(); }
      if(data.water) { waterData = data.water; saveWater(); }
      toast('Import réussi');
      renderHome(); renderMeals(); renderRecipes(); renderShopping(); renderSettings();
    }catch(err){
      toast("Fichier invalide — import annulé");
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
});

document.getElementById('delete-account-btn').addEventListener('click', () => {
  if(!confirm('Supprimer définitivement ton compte et toutes tes données locales ? Cette action est irréversible.')) return;
  ['creafood-meals','creafood-recipes','creafood-shopping','creafood-settings','creafood-water'].forEach(k => localStorage.removeItem(storageKey(k)));
  const remaining = accounts.filter(a => a.email !== sessionEmail);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(remaining));
  localStorage.removeItem(SESSION_KEY);
  toast('Compte supprimé');
  setTimeout(() => window.location.href = 'index.html', 600);
});

/* ============================================================
   Global event delegation (dynamic list items)
   ============================================================ */
document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]'); if(navBtn){ goTo(navBtn.dataset.nav); return; }
  const delMeal = e.target.closest('[data-del-meal]'); if(delMeal){ delMealEntry(delMeal.dataset.delMeal); return; }
  const logRecipeBtn = e.target.closest('[data-log-recipe]'); if(logRecipeBtn){ logRecipe(logRecipeBtn.dataset.logRecipe, selectedDate); renderHome(); if(document.getElementById('screen-meals').classList.contains('active')) renderMeals(); return; }
  const favBtn = e.target.closest('[data-fav]'); if(favBtn){ toggleFavorite(favBtn.dataset.fav); return; }
  const delRecipeBtn = e.target.closest('[data-del-recipe]'); if(delRecipeBtn){ deleteRecipe(delRecipeBtn.dataset.delRecipe); return; }
  const toggleShop = e.target.closest('[data-toggle-shopping]'); if(toggleShop){ toggleShoppingItem(toggleShop.dataset.toggleShopping); return; }
  const delShop = e.target.closest('[data-del-shopping]'); if(delShop){ delShoppingItem(delShop.dataset.delShopping); return; }
  const delAllergyBtn = e.target.closest('[data-del-allergy]'); if(delAllergyBtn){ delAllergy(parseInt(delAllergyBtn.dataset.delAllergy)); return; }
});

/* ============================================================
   Initial render
   ============================================================ */
renderHome();
