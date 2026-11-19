# ARIANE — Captation incrémentale

Version : 1.5.0

## Objectif

Permettre plusieurs campagnes documentaires successives sur un même programme sans reconstruire ni altérer la structure patrimoniale validée, tout en conservant intégralement les nouveaux constats documentaires, y compris lorsqu'ils concernent un objet absent de la structure courante.

## Entrées obligatoires

- `programme_id`
- `capture_id`
- `structure_version`
- structure patrimoniale validée
- nouveau jeu documentaire

## Règle d'intangibilité

La structure fournie est la structure de référence du programme.

Pendant une captation incrémentale, l'IA ne peut pas :
- ajouter un objet à la structure validée ;
- supprimer un objet de la structure validée ;
- changer un parent dans la structure validée ;
- fusionner ou scinder des objets validés ;
- renommer un identifiant validé ;
- produire une nouvelle version de structure ;
- promouvoir un objet candidat ou ses données vers `CURRENT`.

## Objets déjà présents

Lorsqu'une donnée concerne un objet de la structure validée, l'IA réutilise son `object_id`.

Les observations et relations produites sont structurellement rattachables et peuvent alimenter le processus de consolidation vers `CURRENT`, sans préjuger de leur validation métier.

## Objet absent de la structure validée

Si la source démontre un objet absent de la structure :

1. ne pas modifier la structure validée ;
2. créer dans la CAPTURE courante un objet avec `object_status = CANDIDAT_STRUCTURE` ;
3. lui attribuer un `object_id` stable dans la CAPTURE ;
4. conserver son type pressenti, son parent pressenti et sa preuve uniquement lorsqu'ils sont démontrables ;
5. produire une anomalie `OBJET_STRUCTURE_ABSENT` liée à ce candidat ;
6. capter les observations démontrables sur ce candidat ;
7. capter les relations démontrables impliquant ce candidat ;
8. marquer ces observations et relations `structural_binding_status = EN_ATTENTE_RATTACHEMENT_STRUCTUREL`.

L'objet candidat, ses observations et ses relations appartiennent à l'historique immuable de la CAPTURE.

Ils ne font pas partie de la structure validée et ne peuvent pas entrer dans `CURRENT` tant qu'une décision humaine explicite n'a pas été matérialisée par `VALIDER_STRUCTURE`.

## Rattachement impossible ou incertain

Si l'existence de l'objet lui-même, son type ou le rattachement documentaire sont insuffisamment démontrés :

- ne pas fabriquer un objet candidat ;
- ne pas forcer le rattachement ;
- produire une anomalie adaptée avec la source, le repère documentaire et les éléments disponibles.

## Neutralité par rapport aux observations antérieures

L'IA ne doit pas utiliser les anciennes valeurs comme vérité métier pour interpréter le nouveau document.

Une nouvelle valeur contradictoire doit être conservée comme une nouvelle observation distincte.

## Continuité programme

Toutes les sorties d'une captation incrémentale reprennent le même `programme_id`.

Une CAPTURE passée n'est jamais modifiée par une captation ultérieure.

Le fonctionnement détaillé de `CAPTURE`, `CURRENT` et de la promotion après validation de structure est défini dans `08-capture-current.md`.

## Propositions de structure : ajout, retrait, déplacement, réintégration

Une CAPTURE incrémentale peut inclure `propositions_structure.json` conforme à `ia/schemas/proposition-structure.schema.json`. Pour tout écart démontré :
- `AJOUT` : créer le candidat classique si l'objet est réellement nouveau, avec observations en attente ;
- `RETRAIT` : proposer le retrait d'un objet actif seulement si la source remet en cause sa présence ;
- `MODIFIER_PARENT` : documenter l'ancien et le nouveau parent, et la preuve physique ;
- `REINTEGRATION` : rechercher l'object_id historique avant d'inventer un nouvel ID pour un objet précédemment retiré.

`IDENTIFIEE` implique une identité documentée. Sinon, utiliser `A_QUALIFIER` et `object_id: null`. Un total de 21 places pour 22 objets validés ne prouve pas que `PST_SS_22` doit être retirée. La seule omission d'un objet dans un document n'est pas une preuve de retrait.

La proposition conserve sa source et son ancre ; l'anomalie correspondante reste traçable. Une proposition ne modifie ni la structure validée ni sa projection CURRENT. Les nouvelles observations sur les objets toujours actifs restent éligibles à CURRENT ; celles d'objets archivés en attente de réintégration restent dans la CAPTURE. **Aucune évolution n'est appliquée sans validation humaine explicite.**
