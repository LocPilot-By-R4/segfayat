# SEG FAYAT — V25.10 : les timelapses dès l'accueil

Cette archive complète reprend la V25.9 et tous ses médias.

## Mise en avant

- Le bouton principal de l'accueil devient « Voir les timelapses 360° ».
- Le menu place « Timelapses 360° » immédiatement après « Accueil ».
- Une section « Le chantier en mouvement » apparaît juste sous l'accueil,
  avant les étapes documentées, avec deux grandes vignettes et leurs durées.
- Chaque vignette ouvre directement le lecteur 360° existant. Un lien permet
  aussi de télécharger chaque MP4, et un autre rejoint le reportage du 7 septembre.
- Les deux vidéos restent accessibles dans leur reportage d'origine.

La vidéo ne démarre pas automatiquement. Les MP4 ne sont chargés dans le lecteur
qu'à son ouverture. Aucun média n'a été réencodé ou remplacé.

## Essayer la version

1. Extraire le ZIP complet dans un nouveau dossier.
2. Depuis ce dossier, lancer le serveur local habituel, par exemple
   `python -m http.server 8080`, puis ouvrir `http://localhost:8080`.
3. Tester le bouton principal de l'accueil et l'entrée « Timelapses 360° » du menu.
4. Ouvrir chacune des deux grandes vignettes ; lancer la lecture, regarder autour,
   zoomer puis fermer le lecteur.
5. Tester les liens de téléchargement et le retour au reportage du 7 septembre.
6. Vérifier la présentation sur ordinateur et sur téléphone.

Comme en V25.9, le lecteur 360° utilise les bibliothèques chargées depuis jsDelivr.
Une connexion Internet et un serveur HTTP sont nécessaires au test complet.

## Publication

Version livrée pour essai. Aucun push GitHub avant validation explicite de Jonathan.

## Vérifications de livraison

Syntaxe JavaScript, identifiants HTML, destinations des liens et présence des
ressources locales contrôlés. Les médias de la V25.9 sont conservés octet pour
octet. Le ZIP complet passe le contrôle d'intégrité CRC.

La prévisualisation locale n'a pas pu être ouverte dans le navigateur de contrôle
(connexion refusée). Le rendu visuel et les interactions restent à confirmer
dans votre navigateur avant publication.
