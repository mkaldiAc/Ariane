# ARIANE — Relations juridiques patrimoniales

Version : 1.2.0

## Objet

Certaines informations historiques ne sont pas des attributs intrinsèques d'un objet mais des relations juridiques entre un objet patrimonial et un autre objet ou une contrepartie externe. Elles doivent être captées comme relations complémentaires sans modifier la hiérarchie physique.

## Servitude foncière

Origine historique : `ATT-0218 — Servitude foncière`.

Relation : `SERVITUDE_FONCIERE`.

Source principale : `PAR`.

Cible : autre `PAR` lorsqu'elle est représentée dans ARIANE, ou contrepartie externe documentée lorsque le fonds concerné n'appartient pas au patrimoine modélisé.

Informations à conserver lorsque disponibles :

- nature / objet de la servitude ;
- fonds servant ;
- fonds dominant / bénéficiaire ;
- référence de l'acte ;
- date de l'acte ;
- document source ;
- page / article / repère ;
- mode d'identification ;
- confiance.

Ne jamais convertir une servitude en relation parent/enfant.

## Servitude bâtiment

Origine historique : `ATT-0219 — Servitude bâtiment`.

Relation : `SERVITUDE_BATIMENT`.

Source principale : `BAT`.

Cible : objet patrimonial ARIANE lorsque la contrepartie est identifiée dans le modèle, ou contrepartie externe documentée dans les autres cas.

La relation doit conserver la description et la source juridique. Une contrainte d'usage constatée sans base juridique explicite ne doit pas être qualifiée automatiquement de servitude.

## Règle IA

Lorsqu'une servitude est mentionnée :

1. identifier l'objet patrimonial directement affecté ;
2. identifier la contrepartie si elle est démontrable ;
3. créer la relation juridique appropriée ;
4. conserver la description source sans extrapolation ;
5. conserver l'acte, article, page ou référence si disponible ;
6. si la contrepartie ne peut pas être représentée comme objet ARIANE, utiliser une cible externe documentée plutôt qu'inventer un objet patrimonial.
