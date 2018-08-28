/**
 * To read errors and map the error messages from Apollo Errors returned by server
 */
import Reactotron from 'reactotron-react-native';
const cycleErrors = (errors) => {
    return errors.map(err=>{
        // Reactotron.log(err);
        if(err.data) {
            return {
                id: err.data.errorID,
                name: errorCodeList(err.data.errorCode),
                details: err.data.errorMessage
            }
        }else{
            return{
                details:err.message,
            }
        }
    })
};

const errorCodeList = (code)=>{
    switch(code){
        case 1500:
            return "Not Authorized";
        case 1501:
            return "No token can be found in the header";
        case 1502:
            return "Token creation error";
        case 1503:
            return "Token Expired";
        case 1504:
            return "Token Verification Error";
        case 1505:
            return "Invalid Token";
        case 1511:
            return "Request doesn't have necessary scope";
        case 1512:
            return "Generated GUID is not valid";
        case 1513:
            return "Invalid Object ID";
        case 1000:
            return "Mongo error";
        case 2000:
            return "Internal Server Error";
        case 1550:
            return "Validation Error";
        default:
            return "Some error occurred";
    }
};

export {cycleErrors};
