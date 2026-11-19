# ARIANE — Application humaine V2

**Application de travail** du projet ARIANE. La version `humain/application_v1/` est conservée comme référence fonctionnelle et ne doit pas être modifiée dans le cadre des évolutions de la V2.

## Socle technique

- React 19, TypeScript, Vite 7 et `lucide-react` ;
- intégration Microsoft Entra ID / MSAL préparée ;
- design system Aiguillon embarqué dans `ui-theme/Aiguillon_design` ;
- Node.js 22, npm, Docker et Nginx 1.27 (port 8080) ;
- déploiement possible sur Azure Container Apps.

## Fonctionnalités actuelles

L'application propose la consultation des programmes, des CAPTURE, des données CURRENT, des structures validées, des décisions de validation et du guide de captation. Elle permet de **préparer et copier des prompts de scénario**, notamment pour l'évolution de la structure patrimoniale, et d'ouvrir ChatGPT.

L'application est **en lecture seule** vis-à-vis des résultats de captation : elle charge les fichiers JSON de `mkaldiAc/Ariane_capture_data/main` à partir de `catalog.json` et des `index.json` de programme. Les boutons de scénario ne déclenchent aucune écriture Git depuis le navigateur.

**Référentiel applicatif embarqué :** la V2 contient sous `src/referentiel/` les 24 types patrimoniaux, leurs parents autorisés et les 278 attributs canoniques, dérivés de `ia/` sur `main`. `src/execution/structureRules.ts` interdit les rattachements non définis, les cycles, les parents manquants et les identifiants dupliqués. Ces fichiers sont embarqués pour le navigateur et ne nécessitent pas de lecture HTTP de `ia/` à l'exécution. Le référentiel `ia/` sur `main` reste l'unique autorité normative pour les prompts IA.

## Démarrage

Depuis la racine du dépôt :

```bash
cd humain/application_v2
cp .env.example .env
npm ci
npm run dev
```

Sous PowerShell, remplacer `cp .env.example .env` par `Copy-Item .env.example .env`. Dans GitHub Codespaces, ouvrir le port de Vite depuis l'onglet **Ports**.

## Conteneur

Depuis `humain/application_v2/` :

```bash
docker build -t ariane-application-v2 .
docker run --rm -p 8080:8080 ariane-application-v2
```

Application : `http://localhost:8080/`. Guide HTML : `http://localhost:8080/guide-captation.html`.

## Configuration

- `VITE_CAPTURE_DATA_BASE_URL` : URL du dépôt des captations, par défaut `https://raw.githubusercontent.com/mkaldiAc/Ariane_capture_data/main`.
- `VITE_CHATGPT_URL` : URL d'ouverture de ChatGPT après copie du prompt.
- `VITE_UI_THEME_BASE_URL` : thème Aiguillon distant optionnel ; une copie locale est disponible.
- `VITE_USE_MOCK_DATA` : paramétrage du mode de démonstration et de l'authentification.
- `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`, `VITE_AZURE_REDIRECT_URI`, `VITE_API_SCOPE` : paramètres Entra ID / MSAL.

## Règle impérative : cohérence entre le référentiel normatif IA et l'application

**Cette section est une consigne de maintenance obligatoire pour toute évolution future de `application_v2/`. Elle ne modifie pas les règles de captation actuellement en vigueur.**

### 1. Une seule source normative, toujours sur `main`

- Le dossier `ia/` du dépôt `mkaldiAc/Ariane`, branche **`main`**, est l'**unique source normative** des règles de captation et de structure patrimoniale.
- L'application peut embarquer des représentations techniques locales de ce référentiel (JSON pour les types, attributs, parents autorisés et règles de rattachement), afin de fonctionner sans requête vers `ia/` **à l'exécution**.
- Ces représentations locales sont des **copies applicatives dérivées**, jamais des référentiels normatifs concurrents.
- **Ne pas introduire de gestion de plusieurs versions du référentiel dans `ia/`, de tags ou branches normatives à sélectionner, ni de verrouillage des prompts sur un ancien commit.** Les prompts de captation et de validation continuent à charger le référentiel officiel depuis `main`.
- Les numéros de version ou métadonnées présents dans les ressources servent à informer et à vérifier la cohérence ; ils ne constituent pas un mécanisme de sélection de plusieurs référentiels.

### 2. Contrôle préalable à tout développement

Avant de modifier une logique métier, une règle de structure, une interaction de déplacement, un scénario ou un contrat de données dans la V2 :

1. Lire l'état **actuel** de `ia/manifest.yaml`, `ia/referentiel/objets-patrimoniaux.yaml`, `ia/regles/`, des schémas et du contrat `ia/contracts/capture-storage.yaml` pertinents, depuis `main`.
2. Identifier les règles concernées : types d'objets, `allowed_parents`, priorité aux circulations physiques, identifiants, attributs, candidats, CAPTURE/CURRENT, validation et traçabilité.
3. Comparer ces règles avec le code et, lorsqu'elles existeront, les copies JSON embarquées dans la V2.
4. Établir explicitement si l'évolution envisagée est **strictement applicative** ou si elle requiert aussi une évolution normative.
5. **Ne pas intégrer ni déclarer terminée une évolution produisant un écart entre l'application et `ia/`.** Si une modification normative est nécessaire, la proposer et obtenir sa validation explicite avant toute écriture ; sa mise en œuvre doit être coordonnée avec celle de la V2.

Une simple modification de présentation sans incidence métier ne nécessite pas d'altérer artificiellement `ia/`, mais elle ne dispense pas de vérifier l'absence de changement de comportement.

### 3. Synchronisation et contrôles de conformité

Lorsqu'une règle normative évolue avec l'accord explicite du responsable du projet :

1. Mettre à jour le **référentiel unique** dans `ia/` sur `main`, avec les schémas, contrats et instructions concernés.
2. Régénérer ou réaligner les représentations locales correspondantes dans `application_v2/` ; ne pas les maintenir comme un second référentiel indépendant.
3. Mettre à jour les contrôles de l'interface et les prompts pour utiliser les règles en vigueur sur `main`, **sans épingler une version historique**.
4. Vérifier au minimum : cohérence des types et parents autorisés, règles de dépendance et absence de cycles, gestion des objets candidats, conservation des identifiants, préservation des observations et relations, compatibilité des formats JSON et des opérations de validation.
5. Prévoir des tests de comparaison entre la source `ia/` et les copies applicatives ; à terme, **faire échouer le contrôle de conformité et empêcher la publication de la V2** si une divergence est détectée. Ne jamais remplacer une règle indisponible ou non interprétable par une autorisation par défaut.
6. Documenter les changements et confirmer que `application_v1/` est restée inchangée.

Le contrôle des empreintes normatives et des représentations embarquées est désormais automatisé par `npm run check:referentiel`. Il lit localement `ia/` dans le dépôt de travail complet, sans accès réseau, et vérifie les empreintes des règles, schémas et contrats ainsi que les objets, parents et attributs générés. Il échoue en cas de divergence. Il reste **obligatoire de l'exécuter avant toute publication** ; aucune action GitHub Actions de blocage automatique n'est encore installée.

### 4. Principe intangible de validation humaine

**Aucun ajout, retrait, déplacement/changement de parent ou réintégration d'objet ne peut être appliqué à une structure patrimoniale validée sans décision humaine explicite préalable.**

- Pendant une captation, l'IA peut constater, sourcer et proposer des évolutions ; elle **ne modifie jamais** la dernière structure validée.
- Les propositions n'ont aucun effet automatique sur les versions `STR-xxx` ni sur leur structure CURRENT.
- L'humain arbitre les changements dans l'interface. La confirmation doit être explicite et porter sur les opérations exactes.
- Après cette décision, l'application peut construire l'instruction `VALIDER_STRUCTURE`. L'IA ne fait que **matérialiser la décision approuvée**, après vérification de toutes les contraintes normatives ; elle ne peut ni ajouter d'autres changements ni contourner des parents interdits.
- Les CAPTURE et les anciennes structures validées restent immuables. Un retrait est une sortie de la structure active, **pas une destruction des preuves ni des observations historiques**. Une réintégration doit préserver l'identité de l'objet et permettre de retrouver ses données.
- Toute modification des règles permettant les ajouts, retraits, changements de parent ou réintégrations doit respecter les étapes de synchronisation ci-dessus.

### 5. Périmètre des changements

Toute modification Git du dépôt `Ariane` nécessite **une validation explicite préalable** du responsable du projet. Dans les évolutions applicatives, travailler exclusivement dans `humain/application_v2/` et conserver `application_v1/` intacte. Une modification de `ia/` ne peut être engagée que si son périmètre est explicitement autorisé.

**Règle de livraison : pas de divergence fonctionnelle entre les comportements applicatifs et le référentiel normatif unique `ia/` sur `main`.**

## Ressources complémentaires

- [Guide des versions applicatives](../GUIDE_APPLICATIONS.md).
- [Documentation humaine](../README.md).
- [Manifeste IA normatif](../../ia/manifest.yaml).
- [Règles de structure patrimoniale](../../ia/regles/01-structure-patrimoniale.md).
- [Contrat de stockage des captations](../../ia/contracts/capture-storage.yaml).

## Espace de décision structurelle — ARIANE 1.5.0

La V2 prépare les changements sans modifier directement Git ni CURRENT. L'atelier permet :
- **AJOUT** d'un candidat documenté à la structure cible ;
- **RETRAIT** explicite d'un objet actif, sans cascade implicite ; les enfants doivent être déplacés ou retirés individuellement ;
- **REINTEGRATION** d'un objet retrouvé dans une STR historique, sous son identifiant d'origine ;
- **MODIFIER_PARENT** par glisser-déposer sur un parent ou choix d'un parent autorisé, sans changer l'identifiant de l'objet ;
- **QUALIFIER** un écart de comptage contenu dans une proposition `A_QUALIFIER`, en sélectionnant manuellement l'objet concerné et en documentant l'arbitrage.

Les captations ARIANE 1.5.0 peuvent fournir `propositions_structure.json`. Par compatibilité, la V2 affiche également certaines anomalies historiques `INCOHERENCE_STRUCTURE` comme **écarts de quantité à qualifier** ; leur traduction n'est pas une proposition de retrait identifiée et ne sélectionne jamais un objet.

Les contrôles statiques de `allowed_parents`, de racine PRG, d'identifiants, de parent manquant et de cycle s'appuient sur les JSON embarqués. La priorité physique des CIR ne peut pas être déduite d'une seule matrice de types : toute modification de parent nécessite une **attestation humaine de vérification physique** et une justification. Pour les retraits aussi, une justification humaine est exigée. Les changements sont résumés avant validation, avec une **case de confirmation humaine explicite**, puis intégrés à un prompt structuré `VALIDER_STRUCTURE`. L'IA doit refaire tous les contrôles normatifs avant une éventuelle écriture.

Les observations, relations, objets et identifiants historiques restent conservés dans les CAPTURE et les STR archivées. Les données d'un objet retiré cessent d'être éligibles à CURRENT, mais redeviennent éligibles après réintégration explicite et vérifiée. L'application **ne modifie jamais `Ariane_capture_data`**.

### Vérifications de livraison

Depuis la racine du dépôt, après `cd humain/application_v2 && npm ci` :

```bash
npm run check:referentiel
npm run check:types
npm run build
```

La commande `npm run verify` regroupe ces trois contrôles. Le contrôle du référentiel nécessite que le dossier `ia/` de ce même dépôt soit disponible localement ; il n'est pas requis au démarrage du navigateur ou du conteneur. Le script ne synchronise jamais silencieusement des règles : toute divergence exige une correction validée du code et/ou de `ia/`.

**Les nouvelles fonctions s'appliquent aux CAPTURE futures respectant ARIANE 1.5.0 ; les CAPTURE historiques ne sont jamais réécrites.**
