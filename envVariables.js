/**
 * name : envVariables.js.
 * author : Aman Karki.
 * created-date : 19-June-2020.
 * Description : Required Environment variables .
 */

const Log = require("log");
let log = new Log("debug");
let table = require("cli-table");
const certificateService = require(GENERICS_FILES_PATH + "/services/certificate");

let tableData = new table();

let enviromentVariables = {
  "APPLICATION_PORT" : {
    "message" : "Please specify the value for e.g. 4201",
    "optional" : false
  },
  "APPLICATION_ENV" : {
    "message" : "Please specify the value for e.g. local/development/qa/production",
    "optional" : false
  },
  "MONGODB_URL" : {
    "message" : "Required mongodb url",
    "optional" : false
  },
  "INTERNAL_ACCESS_TOKEN" : {
    "message" : "Required internal access token",
    "optional" : false
  },
  "KAFKA_COMMUNICATIONS_ON_OFF" : {
    "message" : "Enable/Disable kafka communications",
    "optional" : false
  },
  // "KAFKA_URL" : {
  //   "message" : "Required",
  //   "optional" : false
  // },
  // "USER_SERVICE_URL" : {
  //   "message" : "Required user service base url",
  //   "optional" : false
  // },
  "SERVICE_NAME" : {
    "message" : "current service name",
    "optional" : true,
    "default" : "ml-projects-service"
  },
  "CERTIFICATE_SERVICE_URL" : {
    "message" : "certificate service base url",
    "optional" : true,
    "default" : "http://registry-service:8081",
    "requiredIf" : {
      "key": "PROJECT_CERTIFICATE_ON_OFF",
      "operator" : "EQUALS",
      "value" : "ON"
    }
  },
  "PROJECT_CERTIFICATE_ON_OFF" : {
    "message" : "Enable/Disable project certification",
    "optional" : false,
    "default" : "ON"
  },
  // "CLOUD_STORAGE" : {
  //   "message" : "Enable/Disable cloud services",
  //   "optional" : false
  // },
  // "GCP_PATH" : {
  //   "message" : "Required Gcp path",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "GC"
  //   }
  // },
  // "DEFAULT_GCP_BUCKET_NAME" : {
  //   "message" : "Required Gcp bucket name",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "GC"
  //   }
  // },
  // "AZURE_ACCOUNT_NAME" : {
  //   "message" : "Required Azure Account name",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "AZURE"
  //   }
  // },
  // "AZURE_ACCOUNT_KEY" : {
  //   "message" : "Required Azure Account key",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "AZURE"
  //   }
  // },
  // "AWS_ACCESS_KEY_ID" : {
  //   "message" : "Required Aws access key id",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "AWS"
  //   }
  // }, 
  // "AWS_SECRET_ACCESS_KEY" : {
  //   "message" : "Required Aws secret access key",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "AWS"
  //   }
  // }, 
  // "DEFAULT_AWS_BUCKET_NAME" : {
  //   "message" : "Required Aws bucket name",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "AWS"
  //   }
  // }, 
  // "AWS_BUCKET_REGION" : {
  //   "message" : "Required Aws bucket region",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "AWS"
  //   }
  // },
  // "OCI_ACCESS_KEY_ID" : {
  //   "message" : "Required oracle access key id",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "OCI"
  //   }
  // }, 
  // "OCI_SECRET_ACCESS_KEY" : {
  //   "message" : "Required Oracle secret access key",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "OCI"
  //   }
  // }, 
  // "OCI_BUCKET_NAME" : {
  //   "message" : "Required Oracle bucket name",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "OCI"
  //   }
  // }, 
  // "OCI_BUCKET_REGION" : {
  //   "message" : "Required Oracle bucket region",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "OCI"
  //   }
  // }, 
  // "OCI_BUCKET_ENDPOINT" : {
  //   "message" : "Required Oracle bucket endpoint",
  //   "optional" : true,
  //   "requiredIf" : {
  //     "key": "CLOUD_STORAGE",
  //     "operator": "EQUALS",
  //     "value" : "OCI"
  //   }
  // },




  "CLOUD_STORAGE_PROVIDER" : {
    "message" : "Require cloud storage provider",
    "optional" : false
  },
  "CLOUD_STORAGE_BUCKETNAME" : {
    "message" : "Require client storage bucket name",
    "optional" : false
  },
  "CLOUD_STORAGE_SECRET" : {
    "message" : "Require client storage provider identity",
    "optional" : false
  },
  "CLOUD_STORAGE_REGION" : {
    "message" : "Require client region",
    "optional" : false
  },
  "CLOUD_ENDPOINT" : {
    "message" : "Require client endpoint",
    "optional" : false
  },
  "CLOUD_STORAGE_ACCOUNTNAME" : {
    "message" : "Require client storage account name",
    "optional" : false
  },
  "CLOUD_STORAGE_BUCKET_TYPE" : {
    "message" : "Require client storage bucket type",
    "optional" : false
  },
  "PUBLIC_ASSET_BUCKETNAME" : {
    "message" : "Require public asset bucket name",
    "optional" : false
  },

  
}

let success = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
  
    let tableObj = {
      [eachEnvironmentVariable] : "PASSED"
    };
  
    let keyCheckPass = true;
    let validRequiredIfOperators = ["EQUALS","NOT_EQUALS"]

    if(enviromentVariables[eachEnvironmentVariable].optional === true
      && enviromentVariables[eachEnvironmentVariable].requiredIf
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key != ""
      && enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      && validRequiredIfOperators.includes(enviromentVariables[eachEnvironmentVariable].requiredIf.operator)
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value != "") {
        switch (enviromentVariables[eachEnvironmentVariable].requiredIf.operator) {
          case "EQUALS":
            if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] === enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
              enviromentVariables[eachEnvironmentVariable].optional = false;
            }
            break;
          case "NOT_EQUALS":
              if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] != enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
                enviromentVariables[eachEnvironmentVariable].optional = false;
              }
              break;
          default:
            break;
        }
    }
      
    if(enviromentVariables[eachEnvironmentVariable].optional === false) {
      if(!(process.env[eachEnvironmentVariable])
        || process.env[eachEnvironmentVariable] == "") {
        success = false;
        keyCheckPass = false;
      } else if (enviromentVariables[eachEnvironmentVariable].possibleValues
        && Array.isArray(enviromentVariables[eachEnvironmentVariable].possibleValues)
        && enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0) {
        if(!enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])) {
          success = false;
          keyCheckPass = false;
          enviromentVariables[eachEnvironmentVariable].message += ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`
        }
      }
    }

    if((!(process.env[eachEnvironmentVariable])
      || process.env[eachEnvironmentVariable] == "")
      && enviromentVariables[eachEnvironmentVariable].default
      && enviromentVariables[eachEnvironmentVariable].default != "") {
      process.env[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].default;
      success = true;
      keyCheckPass = true;
    }

    if(!keyCheckPass) {
      if(enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`;
      }
    }
    tableData.push(tableObj);
  })

  log.info(tableData.toString());
  // getKid();
  return {
    success : success
  }
}

async function getKid(){
  if ( process.env.PROJECT_CERTIFICATE_ON_OFF === "ON" ) {
      // get certificate issuer kid from sunbird-RC
      let kidData = await certificateService.getCertificateIssuerKid();
      if( !kidData.success ) {
        console.log("failed to get kid value from registry service : ",kidData)
        if( process.env.CERTIFICATE_ISSUER_KID && process.env.CERTIFICATE_ISSUER_KID != "" ) {
          global.CERTIFICATE_ISSUER_KID = process.env.CERTIFICATE_ISSUER_KID;
        }
        // console.log("Server stoped . Failed to set certificate issuer Kid value")
        // process.exit();
      } else {
        console.log("Kid data fetched successfully : ",kidData.data)
        global.CERTIFICATE_ISSUER_KID = kidData.data
      }
      console.log(JSON.stringify(kidData))
      // global.CERTIFICATE_ISSUER_KID = kidData.data
  }
};



