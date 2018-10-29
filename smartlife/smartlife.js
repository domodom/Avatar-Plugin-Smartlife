const TuyaDevice = require('./node_modules/tuyapi/index.js');

let sentence, debug,
    data_request, data_module, data_room, data_value;

exports.action = function(data, callback) {
        sentence = data.action.sentence;
        data_module = data.action.req_module;
        data_room = data.action.req_room;
        data_value = data.action.req_value;

    let debug = Config.modules.smartlife.debug;
    let client = data.client;
    let devices = Config.modules.smartlife.devices;

    if (!data_room) data_room = data.client.toLowerCase();

    if (debug) info('Smart Life Sentence:', sentence.yellow, ' Pièce:', data_room.yellow);

    var tblCommand = {
        turn_on: function() {
          if (Config.modules.smartlife.devices.hasOwnProperty(data_module) ) {
                    let tuya = new TuyaDevice({
                      id: Config.modules.smartlife.devices[data_module].id,
                      key: Config.modules.smartlife.devices[data_module].key,
                      ip: Config.modules.smartlife.devices[data_module].ip });

                       tuya.set({set: true}).then();
                       Avatar.speak(data_module + ' est allumé.', client, function () {
                           Avatar.Speech.end(client);
                       });
               } else {
                   Avatar.speak('Je n\'ai pas trouvé le module.', client, function () {
                       Avatar.Speech.end(client);
                   });
               }
          },

        turn_off: function() {
          if (Config.modules.smartlife.devices.hasOwnProperty(data_module) ) {
                    let tuya = new TuyaDevice({
                      id: Config.modules.smartlife.devices[data_module].id,
                      key: Config.modules.smartlife.devices[data_module].key,
                      ip: Config.modules.smartlife.devices[data_module].ip });

                       tuya.set({set: false}).then();
                       Avatar.speak(data_module + ' est arrêté.', client, function () {
                           Avatar.Speech.end(client);
                       });
               } else {
                   Avatar.speak('Je n\'ai pas trouvé le module.', client, function () {
                       Avatar.Speech.end(client);
                   });
               }
          }
    };

    info("Smart Life v", Config.modules.smartlife.version.yellow, " Command:",  data.action.command.yellow, " From:", data.client.yellow, " To:", client.yellow);
    tblCommand[data.action.command]();
    callback();
}
