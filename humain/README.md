# ARIANE — Espace humain

Documentation métier, historique de décisions et applications de consultation et de préparation des scénarios ARIANE.

**Protocole ARIANE en vigueur : 1.4.0** (défini par `VERSION` et `ia/manifest.yaml`). Le dossier `ia/` reste **l'unique source normative** pour les IA exécutant une captation.

## Arborescence actuelle

```text
humain/
├── application_v1/              # Version fonctionnelle de référence, préservée
├── application_v2/              # Copie initialement identique à la V1 ; évolutions futures
├── referentiel/                 # Documentation descriptive du patrimoine et des attributs
├── decisions/                   # Journaux d'arbitrages métier et techniques
├── processus/                   # CAPTURE, CURRENT et décisions de structure
├── GUIDE_APPLICATIONS.md        # Lancement, architecture et règles de gestion des versions
└── README.md
```

Les anciens répertoires `Application/` et `application_scenario/` ne font plus partie de l'arborescence. Les éventuels dossiers `historique/` et `livrables/` sont des pistes futures, **non présents actuellement**.

## Applications

- **`application_v1/`** : reprend à l'identique l'ancien dossier `application_scenario/`, sans aucune modification interne. Elle sert de référence historique fonctionnelle.
- **`application_v2/`** : créée avec exactement les mêmes fichiers que `application_v1/`. C'est la version retenue pour les prochains développements ; elle peut ensuite diverger au fil des évolutions approuvées.
- L'ancienne `Application/` a été supprimée du contenu courant du dépôt. Son historique demeure accessible dans Git.

Consulter [GUIDE_APPLICATIONS.md](GUIDE_APPLICATIONS.md) pour les chemins de lancement actualisés, les dépendances et la séparation des responsabilités.

**Note documentaire :** pour préserver strictement les deux copies applicatives, leurs fichiers `README.md` et `ARCHITECTURE.md` internes ont été conservés sans modification. Ils peuvent donc encore citer l'ancien chemin `humain/Application` et portent des descriptions historiques ; le présent guide central fait foi pour les chemins et le positionnement des versions.

## Documentation métier

- [Structure patrimoniale](referentiel/structure-patrimoniale.md)
- [Référentiel attributaire](referentiel/attributs-patrimoniaux.md)
- [Relations](referentiel/relations.md)
- [Processus CAPTURE / CURRENT / validation](processus/capture-current-validation-structure.md)
- [Arbitrages de structure](decisions/journal-arbitrages-structure.md)
- [Arbitrages d'attributs](decisions/journal-arbitrages-attributs.md)

Les versions 1.3.x indiquées dans certains journaux ou référentiels normatifs sont des **révisions de ressources**, et non la version globale d'exécution ARIANE, qui reste **1.4.0**.

## Règles de gouvernance

- `ia/` est la seule référence d'exécution des captations ; `humain/` ne peut ni la remplacer, ni ajouter une règle normative.
- Les résultats des captations et les fichiers `CURRENT` relèvent du dépôt distinct `mkaldiAc/Ariane_capture_data`. Les applications y accèdent **en lecture seule**.
- Chaque CAPTURE est immuable. L'évolution d'une structure `STR-xxx` requiert une décision humaine explicite ; la validation métier des observations a lieu en dehors du protocole IA.
- Toute modification du dépôt `Ariane` est soumise à la validation explicite du responsable du projet. Les modifications d'applications seront concentrées dans `application_v2/` jusqu'à nouvel arbitrage.

En cas de décision métier modifiant le protocole de captation, documenter l'arbitrage, coordonner une mise à jour distincte du référentiel normatif `ia/` et de la version globale, puis réaligner les documents descriptifs. Cette réorganisation ne change **pas** le protocole ARIANE 1.4.0.
