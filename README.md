FkBoard
=======
Ce projet a pour but de fournir une interface dynamique de configuration web pour le plugin Minecraft [FallenKingdom](https://github.com/Etrenak/FallenKingdom).

Fonctionnement
--------------
Ce dépôt est divisé en deux parties :
- Un plugin à ajouter au plugin Fk de base, qui créé un serveur de *WebSockets* en parallèle au serveur Spigot/Paper.
- Une interface web, accessible directement depuis [GitHub Pages](https://syldium.github.io/fkboard/app). Celle-ci permet la création d'une communication directe au serveur sur lequel le plugin est installé.

Road map
--------
- [x] Affichage des joueurs connectés
- [ ] CRUD des équipes (WIP)
- [ ] Gestion des règles

Crédits
--------
- [Zondicons](https://www.zondicons.com/) sous license [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) par Steve Schoger ([Twitter](https://twitter.com/steveschoger)-[Dribbble](https://dribbble.com/steveschoger))

Inspirations
------------
- [WebConsole](https://github.com/mesacarlos/WebConsole) pour le serveur de WebSockets
