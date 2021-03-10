export const Purchase = {

  unpack(message) {
     return this._translate(JSON.parse(message));
  },

  _translate(jsonMessage) { 

    let purchaseMessage = {};

    purchaseMessage.email = jsonMessage.email;
    
    let submitItems = [];
    for(let item in jsonMessage.items) {
      if(!jsonMessage.items[item].qty) { jsonMessage.items[item].qty = 1; }; 
      submitItems.push(jsonMessage.items[item]);
    }

    purchaseMessage.items = submitItems;
    purchaseMessage.message_id = jsonMessage.sailThruBid ?? '';
    purchaseMessage.adjustments = jsonMessage.adjustments;
    purchaseMessage.incomplete = 0;
    purchaseMessage.channel = (jsonMessage.channel == 'app') ? 'app' : 'online';
    purchaseMessage.vars = jsonMessage.vars;

    return purchaseMessage;
  },

}