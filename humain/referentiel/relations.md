# ARIANE — Relations complémentaires et juridiques

Protocole ARIANE : **1.4.0** (révision des relations juridiques : **1.3.2**).

Références normatives : [`ia/referentiel/objets-patrimoniaux.yaml`](../../ia/referentiel/objets-patrimoniaux.yaml) pour les relations complémentaires et [`ia/referentiel/relations-juridiques.yaml`](../../ia/referentiel/relations-juridiques.yaml) pour les relations juridiques.

Les relations ARIANE décrivent des liens fonctionnels, cadastraux ou juridiques qui ne doivent jamais déformer la hiérarchie physique principale.

## Relations complémentaires

- `IMPLANTE_SUR` : `RES` vers `PAR`.
- `AFFECTE_A` : `PST`, `CAV` ou `DEP` vers `LOG` ou `LOC`.
- `UTILISE_PAR` : relation d'usage d'un objet partagé.
- `DESSERT` : relation de desserte technique.

## Relations juridiques

- `SERVITUDE_FONCIERE` : servitude affectant une parcelle.
- `SERVITUDE_BATIMENT` : servitude affectant un bâtiment.

Une relation juridique doit conserver autant que possible sa nature, la référence de l'acte, la date, les parties ou objets concernés et la source documentaire.

## Captation incrémentale

Une relation identifiée dans un jeu documentaire ultérieur est conservée dans la CAPTURE, sans entraîner de modification automatique de la structure patrimoniale validée. Si elle dépend d'un objet candidat, elle est conservée avec le statut `EN_ATTENTE_RATTACHEMENT_STRUCTUREL` et reste hors CURRENT jusqu'à la validation explicite de l'objet. La promotion ultérieure ne réécrit pas la CAPTURE d'origine.