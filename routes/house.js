const asyncMiddleware = require('../utils/asyncMiddleware');
const individual = require('../domain/manager');
const debug = require('debug')('http')
    , http = require('http')
    , name = 'KhaneBeDoosh';

exports.phoneAPI = asyncMiddleware(async (req, res, next) => {
    debug('purchasing phone number for id ' + req.params.houseID + '... current balance is ' + individual.balance);
    let isBought = await individual.isPhoneNumBought(req.params.houseID);
    debug('value is ' + isBought);
    if (individual.balance >= 1000 && !isBought) {
        debug('balance is more than 1000');
        await individual.addBoughtHouseID(req.params.houseID);
        await individual.decreaseBalance();
        res.status(200).json({'purchaseSuccessStatus': 'true'});
    }
    else if (individual.balance < 1000 && !isBought) {
        res.status(200).json({'purchaseSuccessStatus': 'false'});
    }
    else if (isBought) {
        res.status(200).json({'purchaseSuccessStatus': 'true'});
        debug('phone number is already bought');
    }
    else throw Error('failed to purchase phone number!');
});