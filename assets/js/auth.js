/* ---------------------------------------------------------------------
   CREAFOOD — Écran de connexion / inscription.
   Authentification de démonstration (localStorage), aucun backend réel.
   Même schéma que LISTMAX : adaptateur "storage" async, comptes stockés
   côté client, redirection vers app.html une fois connecté.
--------------------------------------------------------------------- */
const storage = {
  async get(key){
    const v = localStorage.getItem(key);
    return v !== null ? { key, value: v } : null;
  },
  async set(key, value){
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key){
    localStorage.removeItem(key);
    return { key, deleted: true };
  }
};

const ACCOUNTS_KEY = 'creafood_accounts_v1';
const SESSION_KEY = 'creafood_session_v1';

function dstr(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function simpleHash(str){ let h = 0; for(let i=0;i<str.length;i++){ h = (h<<5)-h + str.charCodeAt(i); h |= 0; } return 'h'+h; }

async function loadAccounts(){
  try{ const res = await storage.get(ACCOUNTS_KEY); if(res && res.value) return JSON.parse(res.value); }catch(e){}
  return [];
}
async function saveAccounts(accounts){
  try{ await storage.set(ACCOUNTS_KEY, JSON.stringify(accounts)); }catch(e){}
}
async function saveSession(email){
  try{ if(email) await storage.set(SESSION_KEY, email); else await storage.delete(SESSION_KEY); }catch(e){}
}

async function loginAs(account){
  await saveSession(account.email);
  toast(`Bienvenue, ${account.name.split(' ')[0]} !`);
  setTimeout(() => { window.location.href = 'app.html'; }, 500);
}

/* ----- auth UI ----- */
let authMode = 'login';

document.getElementById('tab-login').addEventListener('click', () => setAuthMode('login'));
document.getElementById('tab-signup').addEventListener('click', () => setAuthMode('signup'));
document.getElementById('toggle-pw').addEventListener('click', () => {
  const pw = document.getElementById('auth-password');
  const btn = document.getElementById('toggle-pw');
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  btn.querySelector('span').textContent = show ? 'visibility_off' : 'visibility';
});
document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
document.getElementById('btn-google').addEventListener('click', handleGoogleAuth);

function setAuthMode(mode){
  authMode = mode;
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  loginTab.classList.toggle('bg-primary-container', mode==='login');
  loginTab.classList.toggle('text-on-primary-container', mode==='login');
  loginTab.classList.toggle('font-semibold', mode==='login');
  loginTab.classList.toggle('text-on-surface-variant', mode!=='login');
  signupTab.classList.toggle('bg-primary-container', mode==='signup');
  signupTab.classList.toggle('text-on-primary-container', mode==='signup');
  signupTab.classList.toggle('font-semibold', mode==='signup');
  signupTab.classList.toggle('text-on-surface-variant', mode!=='signup');
  document.getElementById('auth-name').classList.toggle('hidden', mode!=='signup');
  document.getElementById('auth-title').textContent = mode==='login' ? 'Bon retour' : 'Créer un compte';
  document.getElementById('auth-subtitle').textContent = mode==='login' ? 'Connecte-toi pour retrouver tes repas, tes recettes et ta liste de courses.' : 'Crée ton compte pour commencer à piloter ta nutrition.';
  document.getElementById('auth-submit').textContent = mode==='login' ? 'Se connecter' : 'Créer mon compte';
  hideAuthError();
}
function showAuthError(msg){ const e = document.getElementById('auth-error'); e.textContent = msg; e.classList.remove('hidden'); }
function hideAuthError(){ document.getElementById('auth-error').classList.add('hidden'); }

async function handleAuthSubmit(e){
  e.preventDefault();
  hideAuthError();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value.trim();
  if(!email || !password){ showAuthError('Merci de remplir tous les champs.'); return; }
  const accounts = await loadAccounts();
  if(authMode === 'signup'){
    if(!name){ showAuthError('Merci d\u2019indiquer ton nom.'); return; }
    if(password.length < 4){ showAuthError('Le mot de passe doit faire au moins 4 caractères.'); return; }
    if(accounts.find(a => a.email === email)){ showAuthError('Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.'); return; }
    const account = { name, email, passwordHash: simpleHash(password), provider: 'email', createdAt: dstr(new Date()) };
    accounts.push(account);
    await saveAccounts(accounts);
    await loginAs(account);
  } else {
    const account = accounts.find(a => a.email === email);
    if(!account || account.passwordHash !== simpleHash(password)){ showAuthError('E-mail ou mot de passe incorrect.'); return; }
    await loginAs(account);
  }
}

async function handleGoogleAuth(){
  openModal(`
    <div class="text-center py-2">
      <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Connexion Google</h3>
      <p class="font-body-md text-body-md text-on-surface-variant mb-4">Aucune vraie authentification Google n'est reliée à ce prototype : indique le nom et l'e-mail du compte à utiliser pour simuler la connexion.</p>
      <div class="flex flex-col gap-3 text-left">
        <input id="g-auth-name" type="text" placeholder="Nom complet" class="w-full bg-surface-container-highest/60 border border-white/10 rounded-xl px-3.5 py-3 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary"/>
        <input id="g-auth-email" type="email" placeholder="prenom.nom@gmail.com" class="w-full bg-surface-container-highest/60 border border-white/10 rounded-xl px-3.5 py-3 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary"/>
      </div>
      <button id="g-auth-confirm" class="mt-4 w-full py-3.5 rounded-xl bg-primary text-on-primary font-headline-md text-headline-md font-semibold active:scale-[0.98] transition-all">Continuer</button>
    </div>
  `);
  document.getElementById('g-auth-confirm').addEventListener('click', async () => {
    const name = document.getElementById('g-auth-name').value.trim();
    const email = document.getElementById('g-auth-email').value.trim().toLowerCase();
    if(!name || !email){ toast('Nom et e-mail requis'); return; }
    const accounts = await loadAccounts();
    let account = accounts.find(a => a.email === email);
    if(!account){
      account = { name, email, passwordHash: null, provider: 'google', createdAt: dstr(new Date()) };
      accounts.push(account);
      await saveAccounts(accounts);
    }
    closeModal();
    await loginAs(account);
  });
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('opacity-0'); t.classList.add('opacity-100');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ t.classList.add('opacity-0'); t.classList.remove('opacity-100'); }, 1800);
}

function openModal(html){
  document.getElementById('modal-panel').innerHTML = html;
  document.getElementById('modal-backdrop').classList.add('active');
}
function closeModal(){
  document.getElementById('modal-backdrop').classList.remove('active');
}
document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if(e.target.id === 'modal-backdrop') closeModal();
});
