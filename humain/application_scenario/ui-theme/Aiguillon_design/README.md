# Aiguillon_design v1

Thème autonome, sans logique métier, pour les applications transactionnelles Aiguillon. Il reproduit l'identité dense et professionnelle des rapports Power BI fournis.

## Utilisation locale

Importer dans cet ordre : `theme/tokens.css`, `theme/shell.css`, puis `theme/components.css`. L'application Bucket centralise cette injection dans `src/main.tsx`.

## Remplacer uniquement le thème

1. Conserver les noms du contrat CSS documenté dans `ARCHITECTURE_UI.md`.
2. Remplacer le dossier par `Aiguillon_design_v2`, puis modifier seulement les trois URLs du point d'injection.
3. Pour un thème distant, exposer `VITE_UI_THEME_BASE_URL` (ou `UI_THEME_BASE_URL` dans l'orchestrateur) et injecter les trois feuilles depuis ce préfixe dans le document hôte. La copie locale reste le fallback recommandé afin de ne pas bloquer le premier rendu.

Le fond est l'original joint : ne pas le convertir en couleur unie. Pour rester
compatible avec les outils de revue qui refusent les fichiers binaires, sa source
est versionnée dans
`assets/backgrounds/bandeau-gauche-bleu.png.base64`. La commande
`npm run theme:assets` reconstitue à l'octet près
`assets/backgrounds/bandeau-gauche-bleu.png`, chemin stable consommé par le CSS.
Les scripts `dev`, `build` et `preview` lancent automatiquement cette commande.

Les deux captures de référence ne sont volontairement pas versionnées : elles ne
sont pas nécessaires au runtime et leur présence binaire empêchait la création de
la pull request. Les références restent décrites dans `SPECIFICATIONS_DESIGN.md`.

## Aperçu et conteneur

Ouvrir `preview/index.html`, ou construire le serveur statique :

```bash
docker build -t aiguillon-design-v1 -f docker-theme/Dockerfile .
docker run --rm -p 8081:8080 aiguillon-design-v1
```

Le `Dockerfile` décode lui aussi la source textuelle avant de démarrer Nginx.
