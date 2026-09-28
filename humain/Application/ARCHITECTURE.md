# Architecture de l'application humaine ARIANE

## Démonstrateur

Le front est une application statique React/Vite. Il n'appelle aucune API OpenAI et n'écrit aucune donnée.

```text
Utilisateur
   │
   ├─ copie un prompt depuis le front
   ▼
ChatGPT
   │ lit mkaldiAc/Ariane/ia
   │ analyse les documents
   │ écrit les JSON
   ▼
mkaldiAc/Ariane_capture_data
   │ catalog.json + index.json + CAPTURE / STR / CURRENT
   ▼
Front ARIANE
   │ lecture HTTP statique
   ▼
Visualisation
```

## Couches

```text
src/content          prompts de démonstration
src/pages            guide et vues de données
src/services         lecture statique de Ariane_capture_data
src/ui               shell de l'application
ui-theme             design Aiguillon autonome
public               guide HTML autonome et assets servis
```

## Source de données

Le front charge `catalog.json` depuis `VITE_CAPTURE_DATA_BASE_URL`, puis chaque `index.json` de programme. Il ne liste jamais directement les répertoires GitHub.

La valeur par défaut est :

```text
https://raw.githubusercontent.com/mkaldiAc/Ariane_capture_data/main
```

Le contrat de stockage est normatif dans `ia/contracts/capture-storage.yaml`.

## Origine

Socle aligné sur `mkaldiAc/Bucket` : React 19 / TypeScript / Vite / MSAL / Nginx.

Le contrat visuel reprend : `aiguillon-shell`, `aiguillon-sidebar`, `aiguillon-topbar`, `aiguillon-main`, `aiguillon-content`, `aiguillon-nav`, `aiguillon-nav__item`.

## Évolutions ultérieures

- visualisation détaillée de la structure sous forme d'arbre ;
- table des observations et filtres attributaires ;
- vue détaillée des anomalies et sources ;
- comparaison CAPTURE / CURRENT ;
- authentification interne ;
- remplacement éventuel du copier-coller par une orchestration API.
