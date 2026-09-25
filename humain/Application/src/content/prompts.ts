export const prompts={preflight:`Accède au dépôt GitHub mkaldiAc/Ariane, branche main. Lis ia/manifest.yaml puis toutes les ressources normatives déclarées, dans l'ordre prévu par ia/README.md. Confirme la version ARIANE chargée. N'utilise jamais humain/ pour prendre une décision de captation et ne complète jamais les règles à partir de connaissances générales. Ne modifie aucun fichier.`,initial:`MODE: INITIALISATION_PROGRAMME
programme_id: <PROGRAMME_ID>
capture_id: <CAPTURE_ID_INITIAL>

Analyse uniquement les documents fournis. Exécute strictement ARIANE 1.4.0. Produis SOURCES, STRUCTURE_PROPOSEE, OBSERVATIONS, RELATIONS et ANOMALIES. Ne valide pas la structure. Dépose les JSON dans Ariane_capture_data/<PROGRAMME_ID>/captures/001_<CAPTURE_ID_INITIAL>/ et committe la CAPTURE. Ne crée encore aucune STR validée ni CURRENT validé.`,review:`Lis la structure_proposee.json et les anomalies de la CAPTURE initiale. Aide-moi uniquement à contrôler les objets, types, parents physiques et incohérences. Ne valide pas, ne crée aucune STR et ne modifie aucun fichier.`,validate1:`action: VALIDER_STRUCTURE
human_approval: true
programme_id: <PROGRAMME_ID>
source_structure_version: PROPOSEE
target_structure_version: STR-001
requested_changes: []

Crée STR-001 à partir de la structure proposée, archive-la dans structures/STR-001/structure.json, initialise current/structure.json et CURRENT avec les données structurellement rattachables. Ne modifie aucune CAPTURE.`,incremental:`MODE: CAPTATION_INCREMENTALE
programme_id: <PROGRAMME_ID>
capture_id: <CAPTURE_ID_N>
structure_version: <STR_COURANTE>

Charge current/structure.json. La structure est intangible. Crée une nouvelle CAPTURE. Si un objet absent est démontré, conserve-le comme CANDIDAT_STRUCTURE avec ses observations/relations EN_ATTENTE_RATTACHEMENT_STRUCTUREL et l'anomalie OBJET_STRUCTURE_ABSENT. Ne le promeus pas dans CURRENT.`,validateCandidate:`action: VALIDER_STRUCTURE
human_approval: true
programme_id: <PROGRAMME_ID>
source_structure_version: STR-001
target_structure_version: STR-002
approved_candidate_object_ids:
  - CAV_003
requested_changes:
  - "Intégrer CAV_003 avec le parent validé par l'humain : BAT_001."

Crée STR-002. Promeus vers CURRENT les observations et relations déjà captées de CAV_003 sans les recapter ni changer leurs identifiants. Passe l'anomalie correspondante en RESOLUE dans CURRENT. Ne modifie aucune CAPTURE.`,audit:`Réalise un audit ARIANE en lecture seule : CAPTURE immuables, dernière STR dans current/structure.json, archives STR présentes, aucune donnée EN_ATTENTE_RATTACHEMENT_STRUCTUREL dans CURRENT, identifiants préservés lors des promotions, sources cumulées, anomalies historiques inchangées, aucune STR créée sans VALIDER_STRUCTURE. Retourne PASS/FAIL sans corriger.`} as const;