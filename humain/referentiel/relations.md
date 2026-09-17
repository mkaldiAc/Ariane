# ARIANE — Relations complémentaires et juridiques

Version : 1.3.0

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

Une relation identifiée dans un jeu documentaire ultérieur peut être restituée comme une nouvelle observation relationnelle, mais elle ne peut jamais entraîner automatiquement une modification de la structure patrimoniale validée.