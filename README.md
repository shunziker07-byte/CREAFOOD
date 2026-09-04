# CREAFOOD

Prototype front-end (HTML/CSS/JS statique) de l'application CREAFOOD — suivi nutritionnel, recettes IA et liste de courses.

Design system : **Obsidian Luxe** (voir `DESIGN.md`) — le même que celui de **LISTMAX**. La page de connexion (`index.html`) reprend à l'identique la structure, les classes Tailwind et la logique d'authentification de démo de LISTMAX, rebrandée CREAFOOD.

## Structure

```
creafood/
├── index.html             # Page de connexion / inscription (identique à LISTMAX)
├── app.html                # Application (Accueil, Repas, Recettes, Courses, Réglages)
├── DESIGN.md                # Design system de référence (Obsidian Luxe)
└── assets/
    ├── css/
    │   ├── style.css        # Base LISTMAX (Tailwind CDN) — utilisée par index.html
    │   └── app.css           # Styles de l'application CREAFOOD — utilisée par app.html
    └── js/
        ├── tailwind.config.js  # Tokens du design system, injectés dans Tailwind CDN
        ├── auth.js               # Logique de connexion/inscription (démo, localStorage)
        └── app.js                 # Navigation entre écrans + interactions de l'app
```

## Fonctionnement

- `index.html` utilise Tailwind CDN + `tailwind.config.js` (mêmes tokens que LISTMAX) pour reproduire fidèlement l'écran de connexion : tabs Connexion/Créer un compte, affichage du mot de passe, connexion Google simulée.
- Une fois connecté (email/mot de passe ou Google démo), une session est stockée dans `localStorage` (`creafood_session_v1`) et l'utilisateur est redirigé vers `app.html`.
- `app.html` vérifie la présence de cette session ; en son absence, il renvoie vers `index.html`.
- Le bouton **Se déconnecter** (dans Réglages) efface la session et revient à l'écran de connexion.

⚠️ Authentification de démonstration uniquement — aucun backend réel, les mots de passe sont hashés de façon triviale côté client à titre d'exemple.

## Aperçu local

Aucune dépendance ni build nécessaire :

```bash
npx serve .
```

Ou ouvre simplement `index.html` dans un navigateur.

## Déploiement GitHub Pages

1. Pousse ce dossier dans un repo GitHub.
2. Dans **Settings → Pages**, choisis la branche `main` et le dossier racine (`/`).
3. `index.html` sera servi comme page d'entrée (connexion), redirigeant vers `app.html` après authentification.

## Notes

- Police : [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) + icônes [Material Symbols Outlined](https://fonts.google.com/icons), via Google Fonts CDN.
- Images de démonstration servies depuis Unsplash dans `app.html`.
