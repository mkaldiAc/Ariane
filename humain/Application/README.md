# ARIANE — Application humaine

Première base front interne pour accompagner les collaborateurs dans les opérations ARIANE.

## Socle technique

Cette application reprend le socle du dépôt `mkaldiAc/Bucket` :

- React 19 + TypeScript ;
- Vite 7 ;
- lucide-react ;
- préparation Azure AD / MSAL ;
- design system autonome `Aiguillon_design` ;
- build Node 22 ;
- runtime Nginx 1.27, port 8080 ;
- compatible Azure Container Apps.

Le design Aiguillon est copié localement dans `ui-theme/Aiguillon_design`. Comme dans Bucket, une version distante peut être chargée via `VITE_UI_THEME_BASE_URL`.

## Fonctionnalité disponible

La première vue opérationnelle est **Guide de captation** :
- tutoriel ARIANE 1.4.0 ;
- prompts prêts à copier ;
- scénario CANDIDAT_STRUCTURE → STR-002 → promotion CURRENT ;
- version HTML autonome à `/guide-captation.html`.

Les vues Programmes, Captations, Structures et Validations sont préparées pour les prochaines itérations.

## Démarrage

```bash
cd humain/Application
cp .env.example .env
npm ci
npm run dev
```

## Conteneur

```bash
docker build -t ariane-human-app .
docker run --rm -p 8080:8080 ariane-human-app
```

Application : http://localhost:8080/
Guide HTML : http://localhost:8080/guide-captation.html

## Authentification

Le mode initial est `VITE_USE_MOCK_DATA=true`. Pour préparer un déploiement interne authentifié, renseigner Azure AD et passer cette variable à `false`.

## Architecture UI

La logique fonctionnelle est dans `src/`. Les décisions de marque sont dans `ui-theme/Aiguillon_design/`.
