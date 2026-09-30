# Spécifications Aiguillon_design

- Police : Segoe UI Variable, Segoe UI, Arial, sans-serif.
- Desktop (≥1200 px) : navigation fixe 276 px, image officielle étirée à 100% × 100%.
- Bandeau d'accueil : hauteur minimale 270 px et deux indicateurs filtrés à très forte visibilité.
- Tablette (768–1199 px) : topbar sticky 64 px, même image en `cover`, position 23%.
- Mobile (≤767 px) : topbar sticky 56 px, même image en `cover`, position 18%; KPI sur deux colonnes et panneaux sur une colonne.
- Surfaces blanches sur fond gris clair, bordures fines, ombre minimale, rayon 4–7 px et densité proche de Power BI.
- Bleu pour structure/navigation; teal et rouge réservés aux données et états.
- Tableau : corps en 15,6 px, alternance de bleus légers et espace carte latéral à droite.
- Focus clavier visible, libellés accessibles pour actions icône, page active annoncée et animations neutralisées avec `prefers-reduced-motion`.

- Actions opérationnelles homogènes : les actions de même niveau fonctionnel utilisent le composant `.button-action` (fond `--blue-800`, texte blanc, survol `--blue-950`). Une différence de destination (copier, ouvrir un outil, fermer un panneau) ne justifie pas une couleur différente ; réserver les variations colorées aux états, alertes ou actions destructives.
