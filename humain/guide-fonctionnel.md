# ARIANE — guide fonctionnel consolidé

Version 1.3.0

## Objectif

ARIANE vise à construire, pour chaque programme immobilier, une structure patrimoniale normalisée puis à accumuler au fil de plusieurs jeux documentaires toutes les observations attributaires disponibles.

## Étape 1 — initialisation

Le premier jeu documentaire sert à :

- proposer la structure patrimoniale ;
- capter les premières observations attributaires ;
- identifier les relations et anomalies.

La structure obtenue est ensuite contrôlée et validée en dehors de l’IA. Elle devient la structure de référence du programme.

## Étapes 2 à N — enrichissement documentaire

Chaque nouveau jeu documentaire est traité en faisant référence au même `programme_id` et à la structure validée.

L’IA n’est plus autorisée à modifier cette structure. Elle produit de nouvelles observations et signale les éléments qui ne peuvent être rattachés.

## Observations cumulatives

Une observation est un constat documentaire : valeur + attribut + objet + source + contexte + score de confiance.

Plusieurs observations peuvent exister pour le même attribut d’un même objet. Elles sont toutes conservées, y compris lorsqu’elles se contredisent.

## Frontière avec la base de données

ARIANE-IA ne valide pas les valeurs métier.

Après ingestion des sorties IA dans la base de données, des opérations transactionnelles externes peuvent :

- marquer une observation comme validée par un humain ;
- désigner l’observation qui fait foi pour un objet et un attribut ;
- conserver l’historique des décisions de validation.

Ces statuts ne doivent jamais être demandés ni restitués par l’IA de captation.

## Score de confiance

Le score qualifie la fiabilité de la captation : qualité de la preuve, rattachement à l’objet, correspondance sémantique et transformation. Il ne préjuge pas de la priorité métier du document.
