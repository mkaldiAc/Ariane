# Architecture de l'application humaine ARIANE

## Couches

```text
src/content          prompts et contenus documentaires
src/pages            vues fonctionnelles
src/ui               shell de l'application
src/services         services techniques
ui-theme             design Aiguillon autonome
public               guide HTML autonome et assets servis
```

## Origine

Socle aligné sur `mkaldiAc/Bucket` : React 19 / TypeScript / Vite / MSAL / Nginx.

Le contrat visuel reprend : `aiguillon-shell`, `aiguillon-sidebar`, `aiguillon-topbar`, `aiguillon-main`, `aiguillon-content`, `aiguillon-nav`, `aiguillon-nav__item`.

## Évolutions prévues

- navigation dans Ariane_capture_data ;
- visualisation des programmes ;
- comparaison CAPTURE / CURRENT ;
- revue des candidats ;
- déclenchement guidé de VALIDER_STRUCTURE ;
- suivi des anomalies ;
- validation métier hors IA.
