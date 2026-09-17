# 04 — Traçabilité et sources

Chaque captation appartient à un `programme_id` et un `capture_id`.

Chaque document analysé reçoit un `source_id` stable dans la sortie de la captation.

Chaque observation doit référencer au minimum :

- `programme_id` ;
- `capture_id` ;
- `source_id` ;
- `object_id` ;
- `attribute_id` ;
- valeur source ;
- document / fichier ;
- page, feuille ou plan lorsque disponible ;
- repère ou ancre source lorsque disponible ;
- mode d’identification ;
- score de confiance.

Lorsque disponible, produire aussi une empreinte du fichier (`sha256`) afin de permettre au système aval de détecter la réingestion d’un même document.

La traçabilité doit permettre à un humain de retrouver précisément l’élément documentaire à l’origine de chaque observation.
