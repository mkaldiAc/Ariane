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
src/services         lecture statique de Ariane_capture_data et des propositions de STR
src/referentiel      copie JSON embarquée et contrôlée de ia/ (24 types, 278 attributs)
src/execution        prompts de scénarios et contrôles de structure
scripts             préparation du thème et vérification de cohérence normative
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

Le contrat de stockage est normatif dans `ia/contracts/capture-storage.yaml`. La V2 lit les JSON du dépôt de données, mais ne l'écrit jamais.

Les règles parent-enfant et les attributs nécessaires au front sont embarqués dans `src/referentiel/`. **Le navigateur ne charge plus `ia/`**. Les prompts destinés à l'IA continuent à lire l'unique référentiel normatif `ia/` sur `main`.

## Origine

Socle aligné sur `mkaldiAc/Bucket` : React 19 / TypeScript / Vite / MSAL / Nginx.

Le contrat visuel reprend : `aiguillon-shell`, `aiguillon-sidebar`, `aiguillon-topbar`, `aiguillon-main`, `aiguillon-content`, `aiguillon-nav`, `aiguillon-nav__item`.

## Atelier de structure — ARIANE 1.5.0

L'interface d'évolution lit CURRENT et les anciennes STR. Elle classe les propositions documentaires AJOUT / RETRAIT / MODIFIER_PARENT / REINTEGRATION, permet la qualification humaine des écarts, et prépare une structure cible sans écriture.

Les contrôles statiques sont dérivés du référentiel IA : racine PRG unique, types et parents autorisés, absence de cycle, d'orphelin et de duplication. Une suppression de parent ne supprime jamais implicitement les descendants. La preuve physique de la priorité CIR est vérifiée et attestée par l'humain lors d'un déplacement. Un récapitulatif et une confirmation explicite précèdent la génération du prompt `VALIDER_STRUCTURE`.

Le retrait d'un objet de CURRENT ne détruit pas les données des CAPTURE ; leur retour sous le même ID permet une reconstruction déterministe des observations éligibles.

## Contrôle de publication

`npm run verify` exécute le contrôle de cohérence du référentiel embarqué avec `ia/` du clone complet, le typecheck TypeScript puis le build. La vérification des empreintes source est hors exécution de l'application et ne multiplie pas les versions normatives. **Aucune mise à jour automatique de Git ou de `ia/`**. La V1 demeure inchangée.

## Perspectives

- automatiser ce contrôle dans une chaîne CI avant publication ;
- déployer l'authentification interne et la politique d'accès ;
- envisager une orchestration API remplaçant le copier-coller des prompts.
