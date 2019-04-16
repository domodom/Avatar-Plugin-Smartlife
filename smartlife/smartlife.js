

let cyto, sentence, debug, data_request, data_module, data_room, data_value, data_enabled, module_data;
let iconeName = 'pc';

const TuyaDevice = require('./node_modules/tuyapi/index.js');
const {remote} = require('electron');
const {Graph} = require('cyto-avatar');
const {Menu,BrowserWindow} = remote;
const fs = require('fs-extra');

const nodeType = "smartlife";


exports.addPluginElements = function(CY) {
  if (Config.modules.smartlife.node.displayNode) {
    cyto = new Graph(CY, __dirname);
    cyto.loadAllGraphElements()
      .then(elems => {
        elems.forEach(function(ele) {
          if (ele.hasClass(nodeType)) {
            cyto.onClick(ele, (evt) => {
                showContextMenu(evt, module_data);
              })
              .then(elem => cyto.onRightClick(elem, (evt) => {
                showContextMenu(evt, module_data);
              }))
          }
        })
      })
      .catch(err => {
        warn('Error loading Elements', err);
      })
  } else {
    info('Smart Life v', Config.modules.smartlife.version, '. Les modules ne sont pas visibles, vous pouvez mettre le paramètre displayNode dans le fichier de config sur (true) pour les affichés.');
  }
}

// Sauvegarde les modules (nodes) à la fermeture du serveur
exports.onAvatarClose = function(callback) {
  cyto.saveAllGraphElements(nodeType)
    .then(() => {
      callback();
    })
    .catch(err => {
      if (debug) warn('Error saving Elements', err)
      callback();
    })
}

exports.init = function() {
  Avatar.listen('smartlife', function(data) {
    let client = data.client;

    let params = Config.modules.smartlife.devices[data.module];
    let debug = Config.modules.smartlife.debug;
    let sonoff = Config.modules.smartlife.sonoff;



    if (Config.modules.smartlife.devices.hasOwnProperty(data.module)) {

      module_data = { "name": data.module, "room": data.room, "icone": iconeName, "set": data.set } ;
      set_command(module_data, client);

    } else {
      if (Config.modules.smartlife.sonoff) {
        info('La commande à été envoyée au plugin SonOff');
        Avatar.trigger('sonoff', { module: data.module, room: data.room, set: data.set, client: client });
      } else {
        Avatar.speak('Je n\'ai pas trouvé le module.', client, function() {
          Avatar.Speech.end(client);
        });
      }
    }
  });
}


exports.action = function(data, callback) {
  sentence = data.action.sentence;
  data_module = data.action.req_module;
  data_room = data.action.req_room;
  data_value = data.action.req_value;
  data_enabled = data.action.req_enabled;

  debug = Config.modules.smartlife.debug;
  let client = data.client;
  let devices = Config.modules.smartlife.devices;

  if (!data_room) data_room = data.client.toLowerCase();

  if (debug) info('Smart Life Sentence:', sentence, 'req_module:', data_module, ' Pièce:', data_room);

  var tblCommand = {
    turn_on: function() {
      module_data = { "name": data_module, "room": data_room, "icone": iconeName, "set": true } ;
      set_command(module_data, client);
    },

    turn_off: function() {
      module_data = { "name": data_module, "room": data_room, "icone": iconeName, "set": false } ;
      set_command(module_data, client);
    }
  };

  info("Smart Life v", Config.modules.smartlife.version, " Command:", data.action.command, " From:", data.client, " To:", client);
  tblCommand[data.action.command]();
  callback();
}


function set_command (module_data, client) {
  let tts;
  if (module_data.set){
    tts = ' est allumé.';
  } else {
    tts = ' est éteint.';
  }

  if (Config.modules.smartlife.devices.hasOwnProperty(module_data.name)) {
    let tuya = new TuyaDevice({
      id: Config.modules.smartlife.devices[module_data.name].id,
      key: Config.modules.smartlife.devices[module_data.name].key,
      ip: Config.modules.smartlife.devices[module_data.name].ip
    });

    tuya.set({set: module_data.set}).then();
      addSmartlifeGraph(module_data);
    Avatar.speak(module_data.name + ' ' + module_data.room + tts, client, function() {
      Avatar.Speech.end(client);
    });
  } else {
    Avatar.speak('Je n\'ai pas trouvé le module.', client, function() {
      Avatar.Speech.end(client);
    });
  }

}

/* PARTIE POUR AFFICHER UN NODE SUR LA PARTIE SERVEUR */

function addSmartlifeGraph(module_data) {
  let style = { };
  let id;

  id = module_data.name.toLowerCase() + '_' + module_data.room.toLowerCase();

  style.x = 150;
  style.y = 150;
  style.img = '';

  cyto.removeGraphElementByID(id);

  if ((Config.modules.smartlife.node.delNodeAfterCommand) && (module_data.set == 'false')) {
    return;
  } else {
    if (fs.existsSync('./resources/core/plugins/smartlife/modules.json')) {
      let prop = fs.readJsonSync('./resources/core/plugins/smartlife/modules.json', {
        throws: false
      });
      if (prop[id]) {
        style.x = prop[id].x;
        style.y = prop[id].y;
      }
    }

    if (fs.existsSync('./resources/core/plugins/smartlife/assets/nodes/' + module_data.name + '.json')) {
      let prop = fs.readJsonSync('./resources/core/plugins/smartlife/assets/nodes/' + module_data.name + '.json', {
        throws: false
      });
      if (prop) {
        style.x = prop.position.x;
        style.y = prop.position.y;
      }
    }

    return new Promise((resolve, reject) => {
      cyto.getGraph()
        .then(cy => cyto.addGraphElement(cy, id))
        .then(elem => cyto.addElementName(elem, id))
        .then(elem => cyto.addElementClass(elem, nodeType))
        .then(elem => cyto.addElementImage(elem, __dirname + '/assets/images/modules/' + module_data.icone + '.png'))
        .then(elem => cyto.addElementSize(elem, 45))
        .then(elem => cyto.selectElement(elem, false))
        .then(elem => cyto.addElementRenderedPosition(elem, style.x, style.y))
        .then(elem => cyto.onClick(elem, (evt) => {
          // cyto.selectElement(evt, !cyto.isElementSelected(evt))
          showContextMenu(evt, module_data);
        }))

        .then(elem => {
          resolve(elem);
        })
        .catch(err => {
          reject();
        })
    })
  }
}

// menu contextuel pour les modules
function showContextMenu(elem, module_data) {

  let id = elem.id();

  data_room = id.substring(id.lastIndexOf("_"));
  data_room = data_room.replace('_', '');
  data_module = id.slice(0, id.indexOf("_"));

  let pluginMenu = [{
      label: 'Allumer / Ouvrir',
      icon: 'resources/app/images/icons/activate.png',
      click: () => {
        module_data = { "name": data_module, "room": data_room, "icone": iconeName, "set": true } ;
        set_command(module_data, Config.default.client);
        mute_Client(Config.default.client);
      }
    },
    {
      label: 'Eteindre / Fermer',
      icon: 'resources/app/images/icons/desactivate.png',
      click: () => {
        module_data = { "name": data_module, "room": data_room, "icone": iconeName, "set": false } ;
        set_command(module_data, Config.default.client);
        mute_Client(Config.default.client);
      }
    },
    {
      label: 'Sauvegarder',
      icon: 'resources/app/images/icons/save.png',
      click: () => {
        Avatar.Interface.onAvatarClose(0, function() {
          let module_data = {
            "name": data_module,
            "room": data_room
          };
          saveModuleNode(module_data, elem);
          info(elem.id() + ' sauvegardé !');
        })
      }
    },
    {
      label: 'Effacer',
      icon: 'resources/app/images/icons/trash.png',
      click: () => {
        cyto.removeGraphElementByID(elem.id());
        info(elem.id() + ' à été éffacé !');
      }
    }
  ];

  // Création du menu
  var handler = function(e) {
    e.preventDefault();
    menu.popup({
      window: remote.getCurrentWindow()
    });
    window.removeEventListener('contextmenu', handler, false);
  }
  const menu = Menu.buildFromTemplate(pluginMenu);
  window.addEventListener('contextmenu', handler, false);
}

// Sauvegarde les infos des modules dans le fichier modules.json
// Cette fonction est appelée lorsque vous enregistrez individuellement les modules (clic droit).
// Enregistre l'emplacement du module, utilsée pour réafficher à l'emplacement enregistré !

function saveModuleNode(module_data, elem) {
  let id = elem.id();

  let moduleJSON = fs.readJsonSync('./resources/core/plugins/smartlife/modules.json', 'utf-8', (err) => {
    if (err) throw err;
    info('Le fichier n\'existe pas');
  });

  moduleJSON[id] = {};
  moduleJSON[id].name = module_data.name;
  moduleJSON[id].room = module_data.room;
  moduleJSON[id].icone = module_data.icone;
  moduleJSON[id].x = elem.renderedPosition('x');
  moduleJSON[id].y = elem.renderedPosition('y');

  fs.writeFileSync('./resources/core/plugins/smartlife/modules.json', JSON.stringify(moduleJSON, null, 4), 'utf8');

}

// lors de l'action sur un node, test la valeur de muteOnOffClient
function mute_Client (client) {
  let muteClient = fs.readJsonSync('./resources/core/muteClient.json', 'utf-8', (err) => {
          if (err) throw err;
          if (debug) info('Le fichier muteClient.json n\'existe pas');
  });
          if (muteClient[client] == true) {
                setTimeout(function () {
                Avatar.call('generic', {command: 'muteOnOffClient', set : '0', client: client});
        }, 10000);
      }
}
