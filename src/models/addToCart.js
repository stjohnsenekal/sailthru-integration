export const AddToCart = {

  unpack(message) {
     return this._translate(JSON.parse(message));
  },

  _translate(jsonMessage) {

    let addToCartMessage = {};

    addToCartMessage.email = jsonMessage.email;
    
    let submitItems = [];
    for(let item in jsonMessage.items) {
      submitItems.push(jsonMessage.items[item]);
    }

    addToCartMessage.items = submitItems;

    addToCartMessage.message_id = jsonMessage.sailThruBid ?? '';
    addToCartMessage.adjustments = jsonMessage.adjustments;
    addToCartMessage.incomplete = 1;
    addToCartMessage.channel = (jsonMessage.channel == 'app') ? 'app' : 'online';
    addToCartMessage.vars = jsonMessage.vars;

    return addToCartMessage;
  },

}