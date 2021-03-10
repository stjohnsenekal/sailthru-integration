import { ImageUrls } from '../image/imageUrls';
import { ImageProcessing } from '../image/requestProcessing';
import { Round10, Floor10, Ceiling10 } from '../image/mathUtility';

export const Content = {

  unpack(message) {
    return this._translate(JSON.parse(message));
  },

  _translate(jsonMessage) {

    let addContentMessage = {};

    addContentMessage.id = jsonMessage.url;

    addContentMessage.key = "url";

    addContentMessage.keys = {};
    addContentMessage.keys.sku = jsonMessage.vars.product_id;

    //sanitise the brand out of the product short name field, should a buyer include it
    let shortName = jsonMessage.title;
    if(jsonMessage.vars.brand) {
      shortName = jsonMessage.title.replace(jsonMessage.vars.brand, '');
    }
    
    addContentMessage.title = shortName[0] === ' ' ? shortName.slice(1, shortName.length) : shortName;

    if(jsonMessage.description.description) {
      addContentMessage.description = jsonMessage.description.description;
    } else if (jsonMessage.description.short_description) {
      addContentMessage.description = jsonMessage.description.short_description;
    } else {
      addContentMessage.description = jsonMessage.description.more_detail;
    }
     
    /* on magento side structure:
    "description": {
      "description": "",
      "short_description": "",
      "more_detail": //holds most of description if not all
    }
    */

    addContentMessage.price = jsonMessage.vars.price;
    addContentMessage.inventory = jsonMessage.inventory;

    const priceStr = this._getPriceBracket(jsonMessage.vars.price);
    const discountStr = this._getDiscountBracket(jsonMessage.vars.price, jsonMessage.vars.retail);
    let brandStr = "";
    if(jsonMessage.vars.brand) {
      jsonMessage.vars.brand.replace(" ", "-").toLowerCase();
    }
    const categoriesStr = this._createCategoryTags(jsonMessage.vars.categories);

    addContentMessage.tags = `${priceStr}, ${discountStr}, ${brandStr}, ${categoriesStr}`;

    addContentMessage.date = jsonMessage.vars.special_from_date; 
    addContentMessage.expire_date = jsonMessage.expire_date; 
    // not vars.special_to_date which is the same often as special_from_date

    addContentMessage.vars = jsonMessage.vars;
    
    addContentMessage.vars.description = jsonMessage.description.description;
    addContentMessage.vars.short_description = jsonMessage.description.short_description;
    addContentMessage.vars.more_detail_description = jsonMessage.description.more_detail;

    //savings

    const intPrice = parseInt(jsonMessage.vars.price);
    const intRetail = parseInt(jsonMessage.vars.retail);

    let savings = "";
    if (jsonMessage.vars.display_savings_in_rands == "y") {
      let preRoundedSavings = ((intRetail-intPrice)*0.01).toFixed();
      savings = `R${Floor10(preRoundedSavings, 1)}`;
    } else {
      savings = `${((1 - intPrice/intRetail)*100).toFixed()}%`;
    }

    const retailSavingsAmount = intRetail - intPrice;

    if (addContentMessage.vars.has_multiple_prices == 'y') {
      addContentMessage.vars.placeHolderFromPrices = "From<br/>";
    } else {
      addContentMessage.vars.placeHolderFromPrices = "<br/>";
    }

    if(retailSavingsAmount > 0) {
      addContentMessage.vars.displayRetailIfSavings = `R${intRetail/100}`;
    } else {
      addContentMessage.vars.displayRetailIfSavings = "";
    }

    //pill

    addContentMessage.vars.display_message_from_tags = "";

    if (typeof jsonMessage.vars.blue_tag != "undefined" && 
      jsonMessage.vars.blue_tag != null && jsonMessage.vars.blue_tag.length > 0) {
        addContentMessage.vars.display_message_from_tags = jsonMessage.vars.blue_tag;
    } else if(typeof jsonMessage.vars.yellow_tag != "undefined" && 
      jsonMessage.vars.yellow_tag != null && jsonMessage.vars.yellow_tag.length > 0) {
        addContentMessage.vars.display_message_from_tags = jsonMessage.vars.yellow_tag;
    }

    addContentMessage.images = this._createAdditionalUrls(jsonMessage.images, 
      savings, jsonMessage.vars.product_id, addContentMessage.vars.display_message_from_tags, 
      addContentMessage.vars.is_best_seller, addContentMessage.vars.priority, 
      addContentMessage.vars.is_lunchtime_deal, retailSavingsAmount);

    addContentMessage.override_exclude = 1;

    return addContentMessage;
  },

  _getPriceBracket(price) {
    const priceArray = [5000, 10000, 20000, 30000, 50000, 100000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 5000000, 10000000, 50000000, 100000000]; //cents value, not rands

    let result = 0;
    for (let index in priceArray) {
      if(price <= priceArray[index]) {
        result = index;
        break;
      }
    }
  
    return `price-bracket-${result}`;  
  },

  _getDiscountBracket(price, retail) {
    const discount = (retail - price)/retail;
    const discountArray = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  
    let result = 0;
    for (let index in discountArray) {
      if(discount <= discountArray[index]) {
        result = index;
        break;
      }
    }
  
    return `discount-bracket-${result}`;
  },

  _createCategoryTags(categoryArray) {

    let finalResult = "";
  
    for (const category of categoryArray) {
  
      const result = category.split("/").filter(x => (x != "category"));
      result[result.length-1] = result[result.length-1].replace(".html", "");
  
      const tag1 = result[0] ? `cat1_${result[0]}` : "";
      const tag2 = result[1] ? `cat2_${result[1]}` : "";
  
      if (finalResult) {
        finalResult = `${finalResult},${tag1}`;
      } else {
        finalResult = `${tag1}`;
      }
      if(tag2) {
        finalResult = `${finalResult},${tag2}`;
      }
  
    }
  
    return finalResult;
  }, 

  _createAdditionalUrls(images, savings, productId, pill, isBestSellerChar, priority, isLtd, retailSavingsAmount) {

  images['thumb_120x120'] = {
    "url" : ImageUrls.addScaleOnly(images.thumb.url, 120, 120)
  };

  images['email_thumb_120x120'] = {
    "url" : ImageUrls.addScaleOnly(images.email_thumb.url, 120, 120)
  };

  images['thumb_240x240'] = {
    "url" : ImageUrls.addScaleOnly(images.thumb.url, 240, 240)
  };

  images['email_thumb_240x240'] = {
    "url" : ImageUrls.addScaleOnly(images.email_thumb.url, 240, 240)
  };

  images['email_240x240_savings'] = {
    "url" : ImageUrls.addSavingsBlockAndScale(images.email.url, 240, 240, savings)
  };

  images['email_365x365_savings'] = {
    "url" : ImageUrls.addSavingsBlockAndScale(images.email.url, 365, 365, savings)
  };

  images['email_480x480_savings'] = {
    "url" : ImageUrls.addSavingsBlockAndScale(images.email.url, 480, 480, savings)
  };

  images['email_750x300_savings'] = {
    "url" : ImageUrls.addSavingsBlockAndScale(images.email.url, 750, 'auto', savings)
  };

  //v2 Newsletter
  images['email_290x290'] = {
    "url" : ImageUrls.addScaleOnly(images.email.url, 290, 290)
  };

  images['email_290x290_small'] = {
    "url" : ImageUrls.addScaleOnly(images.email.url, 290, 290)
  };

  images['email_290x290_clean'] = {
    "url" : ImageUrls.addScaleOnly(images.email.url, 290, 290)
  };

  /* 
    retro fitting this one for the morning mailer before migration
    select for only the banner image
  */
  if (priority == 0) {

    images['email_750x300_morning_banner'] = {
      "url" : ImageUrls.addScaleOnly(images.email.url, 750, 'auto')
    };

  }    

  /* 
    NB in the case of no savings, zephyr templates use the clean image.
    This has a known edge case: no savings but pill.
    We decided we will not generate an image with a pill if there is no savings.
    This is to save a 100:1 ratio of useless image generation.
  */

  const isTheLunchTimeDeal = (isLtd == "y") ? true : false;

  const rand = Math.floor(Math.random() * 1000000);
  const isBestSeller = (isBestSellerChar == "y") ? true : false;
  const isLunchtimeMailerBannerLandscape = false;
  const isMorningMailerBannerLandscape = true;
  const threeColumnSavingsSizeMultiplier = 1; 
  const twoColumnSavingsSizeMultiplier = 0.65;

  ImageProcessing.request(productId, "email_290x290", rand, images['email_290x290'].url, 
    savings, pill, isBestSeller, priority, isTheLunchTimeDeal, isLunchtimeMailerBannerLandscape, threeColumnSavingsSizeMultiplier); 

  ImageProcessing.request(productId, "email_290x290_small", rand, images['email_290x290'].url, 
    savings, pill, isBestSeller, priority, isTheLunchTimeDeal, isLunchtimeMailerBannerLandscape, twoColumnSavingsSizeMultiplier);

  images['email_290x290'].url =  `https://cdn.onedayonly.co.za/mailers/2020/${productId}.email_290x290.${rand}.jpg`;
  images['email_290x290_small'].url =  `https://cdn.onedayonly.co.za/mailers/2020/${productId}.email_290x290_small.${rand}.jpg`;
  
  if (priority == 0) {

    ImageProcessing.request(productId, "email_750x300_morning_banner", rand, images['email_750x300_morning_banner'].url, savings, pill, isBestSeller, priority, isTheLunchTimeDeal, isMorningMailerBannerLandscape);

    images['email_750x300_morning_banner'].url =  `https://cdn.onedayonly.co.za/mailers/2020/${productId}.email_750x300_morning_banner.${rand}.jpg`;

  }
  
  //TODO: most of these above must be deleted.

  /* pushing logic back to sailthru content generation so that dynamic zephyr code not needed on frontend
    and this should refactored shortly to diminish number of images generated */

  if(retailSavingsAmount == 0) {
    images['ltd'] = {
      "url" : images['email_290x290_clean'].url
    }
  } else {
    images['ltd'] = {
      "url" : images['email_290x290'].url
    };
  
  }

  return images;

  }

}