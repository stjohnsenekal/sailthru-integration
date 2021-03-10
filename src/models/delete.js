import { ImageUrls } from '../image/imageUrls';

export const Delete = {

  unpack(message) {
    return this._translate(JSON.parse(message));
  },

  _translate(jsonMessage) {

    let addContentMessage = {};

    addContentMessage.id = jsonMessage.vars.product_id;
    addContentMessage.key = "sku";

    return addContentMessage;
  },

}