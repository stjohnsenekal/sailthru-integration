import sailthruclient from 'sailthru-client';

var sailthru = {

  init() {  
    this.api = sailthruclient.createSailthruClient(process.env.API_KEY, process.env.SECRET);
    return this.api;
  },

  async saveUserByKey(data) {

    let save = new Promise((resolve, reject) => {

      this.api.saveUserByKey(data.id, 'email', data, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await save;

  },

  async addToCart(data) {

    let cartUpdate = new Promise((resolve, reject) => {

      this.api.purchase(data.email, data.items, data, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await cartUpdate;

  },

  async purchase(data) {

    let purchaseFinalize = new Promise((resolve, reject) => {

      this.api.purchase(data.email, data.items, data, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await purchaseFinalize;

  },

  async content(data) {

    let addContent = new Promise((resolve, reject) => {

      this.api.pushContent(data.title, data.url, data, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await addContent;

  },

  async deleteContent(data) {

    let deleted = new Promise((resolve, reject) => {

      this.api.apiDelete('content', data, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await deleted;

  },

  async importEmailsToList(list, fileName) {

    const options = { list: list, file: `${process.env.JOBFILES_LOCATION}/${fileName}` };
    const reportEmail = 'john.senekal@gmail.com';
    const postbackUrl = false; 
    const binaryDataParams = ['file'];

    let importUsers = new Promise((resolve, reject) => {

      this.api.processJob('import', options, reportEmail, postbackUrl, binaryDataParams, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await importUsers;

  },

  async importUsersHistorical(fileName) {

    const options = { file: `${process.env.JOBFILES_LOCATION}/${fileName}` };
    const reportEmail = 'john.senekal@gmail.com';
    const postbackUrl = false;
    const binaryDataParams = ['file'];

    let importUsers = new Promise((resolve, reject) => {

      this.api.processJob('update', options, reportEmail, postbackUrl, binaryDataParams, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await importUsers;

  },

  async importPurchasesHistorical(fileName) {

    const options = { file: `${process.env.JOBFILES_LOCATION}/${fileName}` };
    const reportEmail = 'john.senekal@onedayonly.co.za';
    const postbackUrl = false; 
    const binaryDataParams = ['file'];

    let importPurchases = new Promise((resolve, reject) => {

      this.api.processJob('purchase_import', options, reportEmail, postbackUrl, binaryDataParams, (err, response) => {
        if (err) reject(err);
        if (response.error) reject(response);

        resolve(response);
      });

    });
    
    return await importPurchases;

  },

};


export default {
  sailthru,
};
