![enter image description here](https://raw.githubusercontent.com/Spikharpax/Avatar-Serveur/master/logo/Avatar.jpg)
![enter image description here](https://images-na.ssl-images-amazon.com/images/I/51ggpKwx+cL._SL210_QL95_BG0,0,0,0_FMpng_.png)

**Fonctions :**

-   Allume / Eteint - Ouvre / Ferme + ( module).

**EX :**

- Allume la lumière
- Eteins la bouilloire

**Configuration :**

Voir cette aide en ligne pour récupérer les informations de vos devices :

https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP_DEPRECATED.md#android

Dans le fichier smartlife.prop

	"devices": {
		"ruban": {
			"id": "xxxxxxxxxxxxxxxxxxxx",
			"key": "yyyyyyyyyyyyyy",
			"ip": "192.168.x.x"
			},
		"lumière": {
			"id": "05200458dc4f2238eebf",
			"key": "69beb13096808d8f",                                
			"ip": "192.168.x.x"
			}
		}
		
		"node":{
			"displayNode":true ou false 		  (Permet d'afficher une icône sur l'interface du serveur)
			"delNodeAfterCommand":true ou false   (Efface l'icone de l'interface après une commande de fermeture)
	},	
		
**Versions :**

Version 1.2 (01-04-2019)

- [x] Selon paramètre ajout d'un node par module sur le serveur.
- [x] Selon paramètre lors de la fermeture supprime le node (module)
- [x] Chaque modules affichés à un menu contextuel pour commander l'appareil.

Version 1.0 (29-10-2018)

- [x] Allumer / Eteindre un module

