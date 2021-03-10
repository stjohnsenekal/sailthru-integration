export const User = {

  unpack(message) {
     return this._translate(JSON.parse(message));
  },

  _translate(jsonMessage) {
  
    let userMessage = {};

    userMessage.id = jsonMessage.email;

    userMessage.vars = {};

    if(jsonMessage.is_new == "n") { //update operation

      if(jsonMessage.email =! jsonMessage.original_data.email) { 
        userMessage.keys = {};
        userMessage.keys.email = jsonMessage.email;
      }

      userMessage.vars = this._createUserAttrHelper(userMessage.vars, jsonMessage);

    } else { //create operation

      jsonMessage.signup_location = "checkout";

      userMessage.lists = {
        "master_list": 1
      };

      userMessage.vars = this._createUserAttrHelper(userMessage.vars, jsonMessage);
      
    }

    return userMessage;

  },

  _createUserAttrHelper(userVars, jsonMessage) {

    if(jsonMessage.first_name) { 
      userVars.first_name = jsonMessage.first_name; 
    }
    if(jsonMessage.last_name) { 
      userVars.last_name = jsonMessage.last_name; 
    }
    if(jsonMessage.gender) { 
      userVars.gender = jsonMessage.gender; 
    }
    if(jsonMessage.signup_location) { 
      userVars.signup_location = jsonMessage.signup_location; 
    }
    if(jsonMessage.phone) { 
      userVars.phone = jsonMessage.phone; 
    }
    if(jsonMessage.source) { 
      userVars.source = jsonMessage.source; 
    }
    if(jsonMessage.campaign) { 
      userVars.campaign = jsonMessage.campaign; 
    }
    if(jsonMessage.signup_date) { 
      userVars.signup_date = jsonMessage.signup_date; 
    }
    if(jsonMessage.birth_date) { 
      userVars.birth_date = jsonMessage.birth_date; 
    }
    if(jsonMessage.postal_province) { 
      userVars.postal_province = jsonMessage.postal_province; 
    }
    if(jsonMessage.postal_source) { 
      userVars.postal_source = jsonMessage.postal_source; 
    }
    if(jsonMessage.postal_source) { 
      userVars.postal_source = jsonMessage.postal_source; 
    }
    if(jsonMessage.postal_code) { 
      userVars.postal_code = jsonMessage.postal_code; 
    }
    if(jsonMessage.domain) { 
      userVars.domain = jsonMessage.domain; 
    }

    return userVars;

  },

}