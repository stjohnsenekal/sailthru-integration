import encode from 'nodejs-base64-encode';
import redis from 'redis';
import { logAt, levels } from '../log';

const publisher = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST
});

export const ImageProcessing = {

  request(productId, type, rand, url, savings, pill, isBestSeller, priority, isTheLunchTimeDeal, isLandscape, multiplier) {    

    const channel = "image-request";

    const artifact = {
      productId: productId,
      type: type,
      random: rand,
      url: url,
      savings: savings,
      pill: pill,
      isBestSeller: isBestSeller,
      priority: priority,
      hasLunch: isTheLunchTimeDeal,
      isLandscape: isLandscape,
      multiplier: multiplier
    };

    publisher.publish(channel, JSON.stringify(artifact));
    logAt(levels.info, `${channel} published for processing of: ${JSON.stringify(artifact)}`);
    
  },

}







