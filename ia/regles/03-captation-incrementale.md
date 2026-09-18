# ARIANE — Captation incrémentale

Version : 1.3.1

## Objectif

Permettre plusieurs campagnes documentaires successives sur un même programme sans reconstruire ni altérer la structure patrimoniale validée.

## Entrées obligatoires

- `programme_id`
- `capture_id`
- `structure_version`
- structure patrimoniale validée
- nouveau jeu documentaire

## Règle d'intangibilité

La structure fournie est la structure de référence du programme.

Pendant une captation incrémentale, l'IA ne peut :
- créer un objet ;
- supprimer un objet ;
- changer un parent ;
- fusionner ou scinder des objets ;
- renommer un identifiant ;
- produire une nouvelle version de structure.

## Rattachement

Chaque nouvelle donnée doit être rapprochée d'un `object_id` existant.

Si le rapprochement est impossible ou incertain :
- ne pas forcer le rattachement ;
- produire une anomalie avec la source, le repère documentaire et le type d'objet pressenti.

## Neutralité par rapport aux observations antérieures

L'IA ne doit pas utiliser les anciennes valeurs comme vérité métier pour interpréter le nouveau document.

Une nouvelle valeur contradictoire doit être conservée comme une nouvelle observation distincte.

## Continuité programme

Toutes les sorties d'une captation incrémentale doivent reprendre le même `programme_id` que la structure validée fournie.
