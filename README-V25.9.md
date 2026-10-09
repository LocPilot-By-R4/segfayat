# SEG FAYAT — V25.9 : timelapses du 7 septembre 2026

Cette archive complète reprend la V25.8, y compris les 18 photos de l’exercice de secours du 1er octobre et leurs originaux PNG.

## Ajouts

- Deux vidéos dans le reportage existant du 7 septembre, avec ses 10 photos : « Timelapse 01 — 10 h 37 » et « Timelapse 02 — 12 h 39 ».
- Lecture sphérique avec Photo Sphere Viewer **5.15.1**, **VideoPlugin** et **EquirectangularVideoAdapter** : déplacement libre à 360°, zoom, lecture/pause, son, barre de progression et plein écran.
- Les liens « Vidéos » ouvrent directement le reportage concerné. Le précédent encart vidéo vide est retiré.
- Les vidéos apparaissent également dans la galerie complète et participent à la sélection du reportage et à la sélection globale. Téléchargement individuel du MP4 ou ZIP commun avec les photos et panoramas.
- Chargement vidéo uniquement à l’ouverture du lecteur, lecture déclenchée par l’utilisateur, arrêt et libération du lecteur à la fermeture. Bouton de reprise et lien de téléchargement en cas d’échec.
- Totaux : **23 reportages, 138 photographies, 7 panoramas et 2 timelapses 360°**.

## Médias

Les deux MP4 fournis sont intégrés tels quels, sans réencodage : H.264, projection équirectangulaire 2:1, 3840 × 1920, environ 17,25 s et 18,75 s. Les miniatures WebP proviennent des vidéos.

Chemins : `assets/videos/2026-09/`. Données et rattachement au reportage : tableau `videos` dans `data/chantier.json` (`reportId: "2026-09-07"`). Les fichiers INSV ne sont pas nécessaires à la lecture web ; les MP4 exportés contiennent déjà la projection 360°.

## Tester

1. Extraire entièrement ce ZIP dans un nouveau dossier.
2. Depuis ce dossier, lancer `python -m http.server 8080` (ou le serveur local habituel), puis ouvrir `http://localhost:8080`.
3. Cliquer sur « Vidéos » ou ouvrir le reportage du **7 septembre 2026** dans « Archives terrain ».
4. Ouvrir chaque timelapse : lancer la lecture, glisser pour regarder autour, zoomer, déplacer le curseur temporel et essayer le plein écran.
5. Vérifier le téléchargement d’une vidéo, puis une sélection mêlant photos et vidéos. « Sélectionner tout le reportage » sélectionne **12 médias** pour cette date.

Une connexion Internet est nécessaire pour les bibliothèques Photo Sphere Viewer et Three.js chargées depuis jsDelivr. L’ouverture directe avec `file://` ne permet pas le chargement des données et modules. Un serveur prenant en charge les requêtes HTTP Range permet une lecture et une recherche temporelle plus rapides des MP4 originaux.

## Publication

Version livrée pour essai. **Aucun push GitHub avant validation explicite de Jonathan.**

Après validation, conserver les chemins relatifs et publier le contenu complet. Pour déplacer ultérieurement les vidéos vers un hébergement externe, utiliser des URL directes de MP4 autorisant CORS et HTTP Range ; une page YouTube ne peut pas servir de source à ce lecteur 360°.
