const asyncMiddleware = require('../utils/asyncMiddleware');
const Search = require('../domain/search');
const individual = require('../domain/manager').individual;
const realState = require('../domain/manager').realstate;
const houses = require('../utils/house');
const House = require('../data/house');
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

exports.searchAPI = asyncMiddleware(async (req, res, next) => {
    let minArea = req.query.minArea;
    let buildingType = req.query.buildingType;
    let dealType = req.query.dealType;
    let maxPrice = req.query.maxPrice;
    try {
        let searchHouses = new Search(minArea, buildingType, dealType, maxPrice);
        let requestedHouses = await searchHouses.getRequestedHousesFromAllUsers(searchHouses);
        let result = {'houses': requestedHouses[0]};
        res.status(200).send(JSON.stringify(result));
    }
    catch (error) {
        res.status(400).json({'msg': "Error in find houses! Try Again! " + error.message});
    }
});

exports.addHouseAPI = asyncMiddleware(async (req, res, next) => {
    try {
        let house = await houses.createHouseFromRequest(req);
        await House.addHouse(house);
        res.status(200).end();
    }
    catch (e) {
        res.status(400).json({'msg': 'Illegal Argument in request: ' + e.message});
    }
});

exports.getInfo = asyncMiddleware(async (req, res, next) => {
    try {
        let house = await realState.getHouseByID(req.params.houseID);
        if (house === undefined) {
            house = await House.getHouse(req.params.houseID);
        }
        let resHouse = {
            id: house.id, buildingType: house.buildingType, address: house.address,
            imageURL: house.imageURL, phone: house.phone, expireTime: house.expireTime, area: house.area,
            basePrice: house.basePrice, rentPrice: house.rentPrice, sellPrice: house.sellPrice,
            dealType: house.dealType, persianBuildingType: house.getPersianBuildingType(),
            persianDealType: house.getDealTypeString(), description: house.description
        };
        res.status(200).json({'house': resHouse});
    } catch (e) {
        res.status(400).json({'msg': 'Error in finding house with given ID: ' + e.message});
    }
});

