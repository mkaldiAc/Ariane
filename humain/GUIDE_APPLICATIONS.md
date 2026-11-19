# ARIANE — Guide des versions applicatives

**État de référence : 19 novembre 2026** — protocole ARIANE **1.4.0**.

## Historique et convention de versions

| Dossier actuel | Provenance | Utilisation |
| --- | --- | --- |
| `humain/application_v1/` | Renommage à contenu strictement identique de `humain/application_scenario/` | Référence fonctionnelle conservée |
| `humain/application_v2/` | Copie exacte de `application_v1/` lors de cette réorganisation | Développements futurs |
| `humain/Application/` | Ancienne application de restitution, retirée de `main` | Historique Git uniquement |

Les deux versions applicatives partent des **mêmes fichiers et du même état initial** : aucune différence de code, de configuration, de style, de thème ou de documentation interne n'a été introduite lors de leur création.

## Architecture commune

Socle : React 19, TypeScript, Vite 7, Lucide, thème autonome `Aiguillon_design`, Docker / Nginx ; intégration MSAL / Microsoft Entra ID préparée.

Le front est statique et lit des JSON en HTTP :
1. `mkaldiAc/Ariane_capture_data/main/catalog.json` pour découvrir les programmes ;
2. les `index.json` de programme, puis les fichiers `captures/`, `structures/`, `current/` et `validations/` déclarés dans les index ;
3. le référentiel attributaire depuis `mkaldiAc/Ariane/main/ia/referentiel/attributs/`.

L'interface présente les programmes, les données courantes, les captations et les structures validées, ainsi qu'un espace de décision d'évolution de structure. Les boutons de scénario **composent et copient des prompts** ; ils peuvent ouvrir ChatGPT, mais ne déclenchent ni captation automatique ni écriture Git depuis le navigateur.

Les écritures de captation relèvent d'un processus extérieur au front, fondé sur le contrat `ia/contracts/capture-storage.yaml`. La gestion métier transactionnelle des validations d'observations relève du système aval.

## Démarrer la V2

Depuis la racine du dépôt sur une machine équipée de **Node.js 22** et de npm :

```bash
cd humain/application_v2
cp .env.example .env
npm ci
npm run dev
```

En PowerShell Windows, la copie peut se faire par `Copy-Item .env.example .env`.

L'application est servie par Vite sur le port **5173** par défaut ; le script `dev` utilise déjà `--host 0.0.0.0`, utile notamment dans GitHub Codespaces. Dans Codespaces, ouvrir l'URL transmise par l'onglet **Ports** pour le port actif (sans supposer que `localhost` est accessible depuis le navigateur local).

Pour démarrer la V1, remplacer uniquement `application_v2` par `application_v1` dans la commande `cd`.

## Démarrer dans Docker

Depuis `humain/application_v2/` :

```bash
docker build -t ariane-application-v2 .
docker run --rm -p 8080:8080 ariane-application-v2
```

Ouvrir `http://localhost:8080/`.

## Configuration

- `VITE_CAPTURE_DATA_BASE_URL` : URL du dépôt des captations ; valeur par défaut : `https://raw.githubusercontent.com/mkaldiAc/Ariane_capture_data/main`.
- `VITE_ARIANE_REFERENCE_BASE_URL` : URL de base du référentiel ; valeur par défaut : `https://raw.githubusercontent.com/mkaldiAc/Ariane/main`.
- `VITE_CHATGPT_URL` : destination du bouton « Copier et ouvrir ChatGPT ».
- `VITE_UI_THEME_BASE_URL` : éventuel thème Aiguillon distant ; une copie locale est incluse.
- `VITE_USE_MOCK_DATA` : contrôle le démarrage sans authentification obligatoire. La lecture des fichiers JSON reste une lecture du dépôt distant.
- `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`, `VITE_AZURE_REDIRECT_URI`, `VITE_API_SCOPE` : paramètres d'authentification Microsoft Entra ID / MSAL.

L'exemple `.env.example` ne renseigne pas toutes les options facultatives : les valeurs par défaut sont définies dans `src/config.ts`.

## Maintenance et cohérence documentaire

Les fichiers internes `README.md` et `ARCHITECTURE.md` des applications sont volontairement **figés et dupliqués à l'identique** dans cette opération. Certaines mentions historiques (notamment `cd humain/Application`) sont donc **obsolètes**. Pour lancer et identifier les versions actuelles, suivre **ce guide** plutôt que les chemins internes hérités.

Toute amélioration de la V2 doit être faite **uniquement dans `humain/application_v2/`**, après validation explicite. Ne pas synchroniser automatiquement ces changements vers la V1.

**Référence normative d'exécution des captations : `ia/README.md` puis `ia/manifest.yaml`.** Le présent document est une documentation de l'interface humaine, sans portée normative sur les opérations IA.
