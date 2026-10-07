# Suivi de chantier – Complexe hôtelier 4★+ · Domaine de La Mongie

Maquette HTML/CSS/JavaScript responsive conçue pour GitHub Pages.

## Fonctionnalités

- Hero et tableau de bord du projet
- Timeline interactive des reportages
- Galerie photo / lightbox native
- Deux modes d'affichage : mosaïque et grille
- Photo Sphere Viewer 5.15.1
- Hotspots 360° via MarkersPlugin
- Sélection du point de vue et de la date
- Comparateur avant / après
- Cartes vidéo
- Responsive desktop / tablette / mobile
- Données séparées en JSON pour faciliter les mises à jour

## Lancer le site en local

Les fichiers JSON sont chargés avec `fetch()`. Il faut donc utiliser un petit serveur local
plutôt que d'ouvrir directement `index.html` avec `file://`.

### Python

```bash
cd site-chantier-la-mongie
python -m http.server 8080
```

Puis ouvrir :

```text
http://localhost:8080
```

## Déploiement GitHub Pages

1. Créer un nouveau dépôt GitHub.
2. Envoyer tout le contenu de ce dossier à la racine du dépôt.
3. Ouvrir **Settings → Pages**.
4. Choisir **Deploy from a branch**.
5. Sélectionner la branche `main` et le dossier `/ (root)`.
6. GitHub fournit ensuite l'URL publique du site.

Le fichier `.nojekyll` est inclus pour servir les fichiers tels quels.

## Ajouter un nouveau reportage

Modifier `data/chantier.json`.

Exemple :

```json
{
  "id": "2026-09-17",
  "date": "2026-09-17",
  "phase": "Gros œuvre",
  "title": "Suivi du chantier – 17 septembre 2026",
  "description": "Élévation du niveau...",
  "photoCount": 25,
  "videoCount": 1,
  "photos": [
    {
      "src": "assets/photos/2026-09-17/001.webp",
      "alt": "Vue générale du chantier"
    }
  ]
}
```

## Ajouter un panorama 360°

Les images doivent idéalement être **équirectangulaires au ratio 2:1**.

1. Placer le fichier dans `assets/360/`.
2. Ouvrir `data/panoramas.json`.
3. Ajouter une nouvelle entrée `shot` à l'emplacement concerné.

Exemple :

```json
{
  "date": "2026-09-17",
  "panorama": "assets/360/vue-generale-2026-09-17.webp",
  "thumbnail": "assets/photos/2026-09-17/thumb-360.webp",
  "description": "Vue générale du chantier.",
  "markers": [
    {
      "id": "spa",
      "title": "Futur spa",
      "description": "Zone du futur espace bien-être.",
      "yaw": -0.75,
      "pitch": -0.05
    }
  ]
}
```

Les coordonnées `yaw` et `pitch` sont exprimées en radians.

## Photos

Pour un site léger :

- original : conserver hors GitHub si nécessaire
- affichage web : WebP ou AVIF, 1600 à 2200 px de large
- miniatures : 400 à 700 px
- panorama 360° : conserver une définition plus élevée, par exemple 4096×2048 ou davantage

## Vidéos

Il est déconseillé de versionner de gros fichiers vidéo directement dans GitHub.
Préférer YouTube non répertorié, Vimeo ou un hébergement vidéo dédié, puis intégrer le lecteur.

## À remplacer avant publication

- les SVG de démonstration dans `assets/images/`
- les panoramas JPEG de démonstration dans `assets/360/`
- les textes de phase et de reportage
- les compteurs
- les cartes vidéo
- les informations de contact


## Responsive V2

Le site est désormais optimisé pour trois usages :

- **Smartphone chantier** : navigation compacte, boutons tactiles ≥ 48 px, galerie en une colonne, visionneuse 360° adaptée au portrait et au paysage.
- **Tablette** : timeline horizontale, galeries en 2 colonnes, visionneuse 360° plein espace, sélecteurs défilables.
- **PC / grand écran** : affichage complet avec timeline latérale, mosaïque photo et panneau 360° élargi.

La mise en page tient compte des zones sûres iOS (`safe-area-inset-*`), du mode paysage mobile et de `prefers-reduced-motion`.


## Responsive V3 — appareils modernes

Le responsive est maintenant fluide et non dépendant d'un modèle d'appareil précis.

Couverture cible :
- smartphones compacts 320–400 px CSS
- grands smartphones / phablets 401–600 px CSS, notamment Samsung S Ultra et iPhone Pro Max
- tablettes portrait et foldables ouverts jusqu'à 860 px
- tablettes paysage / touch laptops jusqu'à 1180 px
- desktop et grands écrans au-delà

Techniques utilisées :
- `clamp()` pour les tailles fluides
- `svh` / `dvh` pour les navigateurs mobiles modernes
- `viewport-fit=cover` et safe areas
- Container Queries pour les galeries et cartes
- grilles `auto-fit/minmax`
- cibles tactiles de 48 px minimum
- comportement paysage spécifique
- support des écrans à forte densité : le layout se base sur les pixels CSS, pas sur la résolution physique


## Responsive V4 — visionneuse 360°

La visionneuse 360° a été reprise spécifiquement pour smartphone et tablette :

- smartphone : uniquement bouton plein écran dans la barre PSV
- tablette : zoom +/- et plein écran
- PC : zoom +/-, téléchargement et plein écran
- suppression des quatre flèches directionnelles, inutiles en tactile
- dimensions des icônes PSV contraintes pour éviter leur agrandissement par le CSS global
- message d'erreur compact avec bouton « Réessayer »
- aucun hotspot ni bouton PSV ne reste visible au-dessus de l'état d'erreur
- indice tactile temporaire « Deux doigts pour explorer le 360° »
- hauteur du viewer réduite et fluide sur smartphone/phablette
- gestion des événements `panorama-error`, `panorama-loaded` et `ready`


## Responsive V5 — interaction 360° mobile

- suppression du mode obligatoire à deux doigts
- suppression de l’overlay pédagogique Photo Sphere Viewer
- déplacement du panorama à un doigt
- sélecteur de dates en grille sur smartphone
- plus de date tronquée hors écran
- hauteur du viewer légèrement réduite pour conserver le contexte de la page


## V6 — intégration des archives réelles

Archives intégrées :
- 8 juillet 2026 : 2 photos
- 12 juillet 2026 : 1 photo
- 20 juillet 2026 : 23 photos
- 22 juillet 2026 : 13 photos
- 31 juillet 2026 : 9 photos
- total : 48 photos

Les originaux JPEG ont été convertis en WebP optimisés pour le web avec correction automatique de l’orientation EXIF. Le site pèse environ 15 Mo hors archive source.

### Archive de juin

Le fichier `juin2026compressed.zip` reçu est une archive ZIP valide mais vide (0 fichier). Aucun média de juin n’a donc été inventé ni intégré. Il faudra remplacer/retransmettre cette archive pour compléter la timeline.

### 360°

Les photos de juillet sont des panoramas classiques et non des images équirectangulaires 2:1 à 360°. La section Photo Sphere Viewer reste donc en attente du premier média 360° réel afin de ne pas afficher de faux contenu immersif.


## V16 — Chronologie planning

- ajout d'une chronologie opérationnelle accessible basée sur le planning prévisionnel Phase 01
- distinction explicite entre dates prévisionnelles et médias réellement documentés
- grandes phases : Préparation, VRD, Fondations, Sous-sol, RDC, R+1, R+5
- affichage responsive : rail horizontal tactile sur mobile, cartes détaillées sur tablette et PC
- le document PDF source n'est pas publié sur le mini-site
- conservation du correctif de molette du viewer 360° : la molette fait défiler la page, le zoom reste disponible via les boutons


## V17 — grandes étapes sans planning prévisionnel

- conservation de la navigation par grands postes : Préparation, VRD, Fondations, Sous-sol, RDC, R+1 et R+5
- suppression de toutes les dates prévisionnelles
- suppression des statuts « en cours / terminé / à venir selon planning »
- suppression de la barre d'avancement calendaire
- les dates conservées sur le site correspondent uniquement aux reportages réellement réalisés
- maintien des liens entre grands postes et médias disponibles


## V18 — étapes documentées

- la chronologie n'affiche plus les phases sans média associé
- une étape apparaît uniquement lorsqu'un reportage photo ou une immersion 360° est disponible
- les cartes sont simplifiées pour mettre le reportage au premier plan
- suppression des références visibles à LocPilot ; le footer affiche uniquement R4 CONSULTING


## V19 — projection hôtel restaurée

- restauration de la perspective architecturale de l'hôtel terminé dans le header
- image servie localement depuis le dépôt GitHub
- affichage complet de la perspective, sans recadrage `cover`
- sur desktop : texte à gauche, perspective entière à droite
- sur mobile/tablette : perspective entière au-dessus du texte
- conservation du filtrage V18 : seules les étapes disposant d'un reportage sont affichées
- aucune référence visible à LocPilot
