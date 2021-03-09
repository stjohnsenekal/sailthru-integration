
import { logAt, levels } from '../log';
import 'dotenv/config';
import redis from 'redis';
import { AddToCart } from '../models/addToCart';
import { Content } from '../models/content';
import { Purchase } from '../models/purchase';
import { User } from '../models/user';
import { Delete } from '../models/delete';
import bridge from '../sailthru';

const initResponse = bridge.sailthru.init();

const startConsumer = () => {

  const publisher = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
  });
  const consumer = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
  });

  const handleErrorState = (channel, err, message) => {

    const error = JSON.stringify(err);
    let outboundMessage = JSON.parse(message);
    if(typeof outboundMessage.retry != 'undefined') {
      outboundMessage.retry = parseInt(outboundMessage.retry) + 1;
      if(outboundMessage.retry == 3) {
        logAt(levels.error, `${channel} channel has permanently failed message ${JSON.stringify(outboundMessage)} with error ${error}.`);
        return;
      };
    } else {
      outboundMessage.retry = 0;
    }
    logAt(levels.error, `${channel} channel has failed message ${JSON.stringify(outboundMessage)} on retry ${JSON.stringify(outboundMessage.retry)} with error ${error}.`);
    publisher.publish(channel, JSON.stringify(outboundMessage)); 

  };

  const deleteToUpdateDuplicateContent = (sku) => {

    const jsonPacket =
    {
      "key" : "sku",
      "id" : sku
    }

    logAt(levels.info, `delete-content request for ${JSON.stringify(jsonPacket)}.`);

    let request = bridge.sailthru.deleteContent(jsonPacket);

    request.then((data) => {
      logAt(levels.info, `delete-content message send success.`);
    }).catch((err) => {
      logAt(levels.info, `delete-content message send failure for ${jsonPacket.key} ${jsonPacket.id}: ${JSON.stringify(err)}.`);
    });
    
    
  };

  consumer.on('ready', function () {

    const subscriptions = JSON.parse(process.env.SUBSCRIPTIONS);
    for(let item of subscriptions) {
      consumer.subscribe(item);
    }

  });

  //TODO: add logic for max retries etc, maybe a failed-queue for each case.

  consumer.on('message', function (channel, message) {
    logAt(levels.info, `channel ${channel} consumer received message:  ${message}.`);
    let request, jsonPacket, error;
    switch(channel) {
      case "user":

        jsonPacket = User.unpack(message);
        logAt(levels.info, `channel ${channel} outgoing packet:  ${JSON.stringify(jsonPacket)}.`);
        
        request = bridge.sailthru.saveUserByKey(jsonPacket);

        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure for ${jsonPacket.id}: ${JSON.stringify(err)}.`);
          handleErrorState(channel, err, message);
        });
        
        break;
      case "add-to-cart":

        jsonPacket = AddToCart.unpack(message);
        logAt(levels.info, `channel ${channel} outgoing packet:  ${JSON.stringify(jsonPacket)}.`);
      
        request = bridge.sailthru.addToCart(jsonPacket);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure: ${JSON.stringify(err)}.`);
          handleErrorState(channel, err, message);
        });

        break;
      case "purchase":

        jsonPacket = Purchase.unpack(message);
        logAt(levels.info, `channel ${channel} outgoing packet:  ${JSON.stringify(jsonPacket)}.`);
      
        request = bridge.sailthru.purchase(jsonPacket);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure: ${JSON.stringify(err)}.`);
          handleErrorState(channel, err, message);
        });

        break;
      case "content":

        jsonPacket = Content.unpack(message);
        logAt(levels.info, `channel ${channel} outgoing packet:  ${JSON.stringify(jsonPacket)}.`);
        
        request = bridge.sailthru.content(jsonPacket);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {

          if(err.error == 99 && 
            err.errormsg.substring(0, 42) == "There is already a content record with sku") {
              logAt(levels.info, `channel ${channel} message send failure: ${JSON.stringify(err)}.`);
              logAt(levels.info, `immediate delete to sailthru content on old sku and resending original request.`);
              deleteToUpdateDuplicateContent(jsonPacket.keys.sku);
          } else {
            logAt(levels.info, `channel ${channel} message send failure: ${JSON.stringify(err)}.`);
          }
          
          handleErrorState(channel, err, message); 
        });
        
        break;
      case "content-deleted":

        jsonPacket = Delete.unpack(message);
        logAt(levels.info, `channel ${channel} outgoing packet:  ${JSON.stringify(jsonPacket)}.`);
        
        request = bridge.sailthru.deleteContent(jsonPacket);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure: ${JSON.stringify(err)}.`);
          handleErrorState(channel, err, message); 
        });
        
        break;
      case "job-import-emails-to-list":

        const {list, fileName} = JSON.parse(message);
    
        request = bridge.sailthru.importEmailsToList(list, fileName);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure: ${err}.`);
          handleErrorState(channel, err, message);
        });

        break;
      case "job-import-users-historical":
  
        request = bridge.sailthru.importUsersHistorical(message);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure: ${err}.`);
          handleErrorState(channel, err, message); 
        });

        break;
      case "job-import-purchases-historical":

        request = bridge.sailthru.importPurchasesHistorical(message);
        
        request.then((data) => {
          logAt(levels.info, `channel ${channel} message send success.`);
        }).catch((err) => {
          logAt(levels.info, `channel ${channel} message send failure: ${err}.`);
          handleErrorState(channel, err, message);
        });

        break;

      default:
        logAt(levels.error, `channel ${channel} unrecognized:  ${message}.`);
        break;
    }
});

  consumer.on('subscribe', function (channel, count) {
    logAt(levels.info, `consumer subscribed to the ${channel} channel at ${count} total.`);
  });

  consumer.on('unsubscribe', function (channel, count) {
    logAt(levels.info, `consumer unsubscribed to the ${channel} channel at ${count} total.`);
  });

}

export { startConsumer };