# Architecture UI

## Analyse du dépôt avant intégration

- **Framework** : React 19 + TypeScript, construit par Vite.
- **Shell initial** : un `Header` sticky dans `App.tsx`; application monopage sans bibliothèque de routing, les vues carte/détail étant pilotées par état React.
- **Composants communs** : carte Leaflet, tableau, filtres, pagination et modale de contrôle vivaient dans `App.tsx`.
- **Couplage constaté** : `src/styles.css` contenait directement deux identités successives (rose/violet puis sombre), les tailles du shell, cartes, tableau, états et règles responsive.

## Mapping cible

`services + types` (métier, inchangés) → `App.tsx` (fonctionnel) → `src/ui` (primitives) → `ui-theme/Aiguillon_design/theme` (marque).

Le point d'injection unique est `src/main.tsx`. Le contrat stable est : `aiguillon-shell`, `aiguillon-sidebar`, `aiguillon-topbar`, `aiguillon-main`, `aiguillon-content`, `aiguillon-nav`, `aiguillon-nav__item`, `kpi-card`, `panel`, `data-table`, `segmented`, `module-pill`. Les primitives disponibles sont `AppShell`, `Sidebar`, `Topbar`, `KpiCard`, `Panel`, `DataTable`, `SegmentedControl`, `ModulePill`, `IconButton`, `Button` et `Badge`.

Les règles de marque sont interdites dans les composants fonctionnels. Un changement de version doit préserver ce contrat et ne toucher ni repository, ni authentification, ni types.

## Gestion de l'asset binaire

Le PNG officiel est stocké sous forme Base64 textuelle afin que le diff puisse
être traité par les outils de pull request. `scripts/generate-theme-assets.mjs`
le décode avant Vite. Cette étape de transport ne modifie ni les octets de
l'image, ni son URL CSS publique.
