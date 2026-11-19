export const prompts={
preflight:`Accède au dépôt GitHub mkaldiAc/Ariane, branche main.
Lis ia/manifest.yaml puis toutes les ressources normatives qu'il déclare, dans l'ordre prévu par ia/README.md, y compris ia/contracts/capture-storage.yaml.
Confirme la version ARIANE chargée et que tu as accès en écriture à mkaldiAc/Ariane_capture_data.
N'utilise jamais humain/ pour prendre une décision de captation.
Ne complète jamais les règles à partir de connaissances générales.
À cette étape, ne modifie aucun fichier.`,

initial:`MODE: INITIALISATION_PROGRAMME
programme_id: <PROGRAMME_ID>
capture_id: <CAPTURE_ID_INITIAL>

Les documents joints constituent le jeu documentaire initial.

Exécute strictement le référentiel ARIANE chargé depuis mkaldiAc/Ariane/ia.
Analyse uniquement les documents fournis.
Produis SOURCES, STRUCTURE_PROPOSEE, OBSERVATIONS, RELATIONS et ANOMALIES.
Ne valide jamais la structure.

Persiste ensuite le résultat dans mkaldiAc/Ariane_capture_data conformément à ia/contracts/capture-storage.yaml :
- vérifie que programmes/<PROGRAMME_ID>/captures/<CAPTURE_ID_INITIAL>/ n'existe pas ;
- crée la CAPTURE immuable et son capture.json ;
- crée ou mets à jour programmes/<PROGRAMME_ID>/index.json ;
- mets à jour catalog.json ;
- ne crée aucune STR validée et aucun CURRENT avant validation explicite ;
- committe les écritures.

À la fin, retourne un bilan synthétique : fichiers créés, nombre d'objets proposés, observations, relations, anomalies et commit Git.`,

review:`Dans mkaldiAc/Ariane_capture_data, charge la CAPTURE <CAPTURE_ID_INITIAL> du programme <PROGRAMME_ID>.
Lis structure_proposee.json et anomalies.json.
Aide-moi uniquement à contrôler les objets, types, parents physiques et incohérences.
Ne valide pas la structure, ne crée aucune STR et ne modifie aucun fichier.`,

validate1:`action: VALIDER_STRUCTURE
human_approval: true
programme_id: <PROGRAMME_ID>
source_structure_version: PROPOSEE
target_structure_version: STR-001
requested_changes: []

Exécute uniquement cette décision humaine selon ARIANE.
Crée programmes/<PROGRAMME_ID>/structures/STR-001/structure.json.
Initialise programmes/<PROGRAMME_ID>/current/ avec la structure et les données structurellement rattachables.
Crée la trace de validation prévue par le contrat de stockage.
Mets à jour index.json et catalog.json si nécessaire.
Ne modifie aucune CAPTURE historique.
Committe les écritures et retourne le commit Git.`,

incremental:`MODE: CAPTATION_INCREMENTALE
programme_id: <PROGRAMME_ID>
capture_id: <CAPTURE_ID_N>
structure_version: <STR_COURANTE>

Les documents joints constituent le nouveau jeu documentaire.

Charge la structure validée depuis mkaldiAc/Ariane_capture_data/programmes/<PROGRAMME_ID>/current/structure.json.
Exécute strictement ARIANE. La structure validée est intangible.
Crée une nouvelle CAPTURE immuable conformément à ia/contracts/capture-storage.yaml.
Si un objet absent est démontré, conserve-le comme CANDIDAT_STRUCTURE avec ses observations et relations EN_ATTENTE_RATTACHEMENT_STRUCTUREL et l'anomalie OBJET_STRUCTURE_ABSENT.
Ne le promeus jamais dans CURRENT pendant cette captation.
Mets à jour CURRENT uniquement avec les données autorisées, puis les index techniques.
Committe les écritures et retourne un bilan ainsi que le commit Git.`,

validateCandidate:`action: VALIDER_STRUCTURE
human_approval: true
programme_id: <PROGRAMME_ID>
source_structure_version: <STR_COURANTE>
target_structure_version: <STR_CIBLE>
approved_candidate_object_ids:
  - <OBJECT_ID_CANDIDAT>
requested_changes:
  - "<CORRECTION_EXPLICITEMENT_VALIDEE_PAR_L_HUMAIN>"

Exécute strictement cette décision humaine.
Crée la nouvelle STR sans modifier les CAPTURE.
Promeus vers CURRENT uniquement les observations et relations déjà captées qui deviennent rattachables, sans recapture ni changement d'identifiant.
Mets à jour dans CURRENT l'état des anomalies concernées.
Archive la nouvelle STR, crée la trace de validation, mets à jour les index et committe les écritures.`,

audit:`Réalise un audit ARIANE en lecture seule sur mkaldiAc/Ariane_capture_data :
- CAPTURE immuables ;
- chemins conformes à ia/contracts/capture-storage.yaml ;
- dernière STR cohérente avec current/structure.json ;
- archives STR présentes ;
- aucune donnée EN_ATTENTE_RATTACHEMENT_STRUCTUREL dans CURRENT ;
- identifiants préservés lors des promotions ;
- sources cumulées ;
- anomalies historiques inchangées ;
- aucune STR créée sans VALIDER_STRUCTURE ;
- catalog.json et index.json cohérents.
Retourne PASS/FAIL par contrôle sans corriger ni modifier aucun fichier.`
} as const;
