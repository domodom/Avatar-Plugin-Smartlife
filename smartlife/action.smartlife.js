'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const _helpers = require('../../node_modules/ava-ia/lib/helpers');

exports.default = function(state) {

  return new Promise(function(resolve, reject) {

      let request, req_value, req_room, req_module;

      let turn_on = ["allume", "ouvre"];
      let turn_off = ["éteins", "éteint", "éteindre", "ferme", "coupe"];
      let turn_state = ["statut", "valeur"];
      let piece = ["salon", "chambre", "cuisine", "sdb", "couloir"];

      for (let i = 0; i < turn_on.length; i++) {
         if (state.rawSentence.indexOf(turn_on[i]) != -1 ) {
           req_value = "true";
         }
      }
      for (let i = 0; i < turn_off.length; i++) {
         if (state.rawSentence.indexOf(turn_off[i]) != -1 ) {
           req_value = "false";
         }
      }
      for (let i = 0; i < turn_state.length; i++) {
         if (state.rawSentence.indexOf(turn_state[i]) != -1 ) {
           req_value = "";
         }
      }

      for (let i = 0; i < piece.length; i++) {
         if (state.rawSentence.indexOf(piece[i]) != -1 ) {
           req_room = piece[i];
         }
      }
      req_module = state.rawSentence.supprimer();

    /* pour la pièce en multiroom */
    let room = Avatar.ia.clientFromRule(state.rawSentence);

    for (var rule in Config.modules.smartlife.rules) {
      let match = (0, _helpers.syntax)(state.sentence, Config.modules.smartlife.rules[rule]);
      if (match) break;
    }

    if (state.debug) info('ActionSmartLife'.bold.yellow, rule.yellow);

    setTimeout(function() {
      state.action = {
        module: 'smartlife',
        command: rule,
        req_value: req_value,
        req_room: req_room,
        req_module: req_module,
        room: room,
        sentence: state.rawSentence
      };
      resolve(state);
    }, 500);
  });
};

String.prototype.supprimer = function () {
    let TERM = ["allume", "ouvre", "éteins", "éteint", "ferme", "donne", "le", "la", "du", "de", "coupe", "statut", "valeur", "salon", "chambre", "cuisine", "sdb","couloir" ];
    let str = this;
    for (let i = 0; i < TERM.length; i++) {
        let reg= new RegExp(TERM[i], "i");
        str = str.replace(reg, "").replace(':', '').trim();
    }
    return str;
};
