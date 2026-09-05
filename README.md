# CREAFOOD

Application de suivi nutritionnel — **entièrement fonctionnelle**, sans backend : tout est stocké localement dans le navigateur (`localStorage`), namespacé par compte.

Design system : **Obsidian Luxe** (voir `DESIGN.md`), le même que **LISTMAX**. Architecture inspirée de **[My-RoutinePov](https://github.com/shunziker07-byte/My-RoutinePov)** : état global par domaine (repas, recettes, courses, réglages), persistance locale via un adaptateur `dbGet`/`dbSet`, formulaires réels pour chaque action.

## Ce qui fonctionne réellement

Chaque bouton déclenche une action qui modifie l'état et le sauvegarde immédiatement :

- **Accueil** — objectif du jour calculé à partir du journal réel, ajout rapide d'un repas, hydratation +/− fonctionnelle, suggestion de recette (parmi celles pas encore loguées aujourd'hui) validable en un clic, journal du jour avec suppression.
- **Repas** — navigation jour par jour (flèches ← →), calories/macros restantes recalculées en direct, ajout d'un repas par créneau (petit-déjeuner/déjeuner/collation/dîner) avec sélection optionnelle depuis une recette existante, suppression d'une entrée.
- **Recettes** — recherche texte, filtres par catégorie, ajout au journal en un clic, favoris (❤), création d'une nouvelle recette (titre, catégorie, macros), suppression.
- **Courses** — ajout rapide (avec extraction automatique d'une quantité en tête de texte), cases à cocher persistées, suppression d'un article, "vider la liste", "retirer les cochés".
- **Réglages** — édition des objectifs caloriques/macros (répercutée immédiatement sur Accueil et Repas), édition du régime alimentaire, ajout/suppression d'allergies, portions par défaut, rappels (préférences simples, sans notifications réelles), **export JSON** et **import JSON** de toutes les données, suppression de compte (efface tout), déconnexion.

## Ce qui est volontairement absent (honnêteté du prototype)

Comme le prototype est un site statique sans backend, il n'y a **aucune fonctionnalité simulée qui ferait croire à une intégration réelle** :
- Pas de "Vision IA" qui scannerait une photo — l'ajout d'un repas se fait via un formulaire (nom + macros), exactement comme le fait `My-RoutinePov` qui documente honnêtement l'absence d'API IA connectée plutôt que d'inventer un faux résultat.
- Pas de "Garmin/Apple Health connecté" — aucune intégration matérielle n'est réellement câblée.

Si tu veux ajouter un vrai backend (Firebase, Supabase, une fonction IA de description/photo de repas...), la structure des fonctions `dbGet`/`dbSet` dans `assets/js/app.js` est le seul endroit à modifier : il suffit de brancher un vrai stockage distant à la place de `localStorage`, sans toucher au reste de la logique.

## Structure

```
creafood/
├── index.html             # Connexion / inscription (identique à LISTMAX, rebrandée)
├── app.html                 # Application (Accueil, Repas, Recettes, Courses, Réglages)
├── DESIGN.md                  # Design system Obsidian Luxe
└── assets/
    ├── css/
    │   ├── style.css          # Base LISTMAX (Tailwind CDN) — utilisée par index.html
    │   └── app.css              # Styles de l'application CREAFOOD — utilisée par app.html
    └── js/
        ├── tailwind.config.js    # Tokens du design system pour Tailwind CDN
        ├── auth.js                 # Connexion/inscription (démo, localStorage)
        └── app.js                    # État, stockage local, CRUD, rendu — toute la logique
```

## Comment ça marche

- `index.html` gère connexion/inscription. Un compte réussi stocke une session (`creafood_session_v1`) et redirige vers `app.html`.
- `app.html` vérifie cette session au chargement ; sans session, il renvoie vers `index.html`.
- Toutes les données d'un compte sont stockées sous des clés `creafood:<email>:<clé>` dans `localStorage` — un compte différent a ses propres données, isolées.
- Le bouton **Se déconnecter** efface la session (les données restent). **Supprimer mon profil** efface tout (compte + données) définitivement.

## Aperçu local

Aucune dépendance ni build nécessaire :

```bash
npx serve .
```

Ou ouvre simplement `index.html` dans un navigateur.

## Déploiement GitHub Pages

1. Pousse ce dossier dans un repo GitHub.
2. Dans **Settings → Pages**, choisis la branche `main` et le dossier racine (`/`).
3. `index.html` sera servi comme page d'entrée.

## Notes

- Police : [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) + icônes [Material Symbols Outlined](https://fonts.google.com/icons), via Google Fonts CDN.
- Testé automatiquement (navigation entre les 5 écrans, ajout/suppression de repas, recettes, articles de courses, édition des réglages) avant livraison — aucune erreur JS au chargement ni pendant l'utilisation.
