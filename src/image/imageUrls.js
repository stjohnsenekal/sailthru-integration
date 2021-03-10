import encode from 'nodejs-base64-encode';

export const ImageUrls = {

  createQueryString(paramData) {    
    let searchParameters = new URLSearchParams();
    
    Object.keys(paramData).forEach(function(parameterName) {
       searchParameters.append(parameterName, paramData[parameterName]);
    });
  
    return searchParameters.toString();
  },

  addSavingsBlockAndScale(url, width, height, savings) {

    let h, txtSize, w;

    switch(parseInt(width)) {
      case 240:
      case 365:
      case 480:
        h = 25;
        txtSize = 16;
        w = 53;
        break;
      case 750:
        h = 30;
        txtSize = 18;
        w = 60;
        break;
      default:
        console.log("broken request for image size");
    }

    let saveData = {
       "bg" : "ec2e5e",
       "h" : h,
       "txt64" : encode.encode("SAVE", 'base64'),
       "txtalign" : "center, bottom",
       "txtclr" : "fff",
       "txtfont" : "Helvetica Neue Bold, sans-serif, bold",
       "txtpad" : 0,
       "txtsize" : (txtSize + 2),
       "w" : w,
    };
  
    let saveDataUrl = `https://assets.imgix.net/~text?${this.createQueryString(saveData)}`;
  
    let percentData = {
       "bg" : "ec2e5e",
       "h" : h,
       "txt64" : encode.encode(savings, 'base64'),
       "txtalign" : "center, top",
       "txtclr" : "fff",
       "txtfont" : "Helvetica Neue Bold, sans-serif, bold",
       "txtpad" : 0,
       "txtsize" : txtSize,
       "w" : w,
    };
  
    let percentDataUrl = `https://assets.imgix.net/~text?${this.createQueryString(percentData)}`;
  
    let imageData = {
       "balph" : 100,
       "blend64" : encode.encode(saveDataUrl, 'base64'),
       "bm" : "normal",
       "bx" : (width - (w + 15)),
       "by" : 0,
       "mark64":  encode.encode(percentDataUrl, 'base64'),
       "markpad" : 0,
       "markx" : (width - (w + 15)),
       "marky" : h
    }
  
    let imageUrl = `${url}?h=${height}&w=${width}&bg=fff&fit=fill&${this.createQueryString(imageData)}`;

    return imageUrl;
  },

  addScaleOnly(url, width, height) {
    let result = `${url}?h=${height}&w=${width}&bg=fff&fit=fill`;
    console.log(result);
    return result;
  }

}
