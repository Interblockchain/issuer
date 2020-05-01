'use strict';

let environment = require('./environments/environment');

let mongoose = require('mongoose');
const MongoDB = require("./config/mongoDB");
const mongoDB = new MongoDB(environment.mongoUser, environment.mongoPsw, environment.mongoHost, environment.mongoDB, environment.mongoPort);

const translib = new (require('translib'))();
const axios = require('axios');
const fs = require("fs");
const CronJob = require('cron').CronJob;
const Inventory = require('./models/inventory');
let debug = true;

// sendTLD();
new CronJob('0 * * * *', () => {  // every hour
  sendTLD();
}, null, true);

async function sendTLD() {
  let inventories = await Inventory.find({ paid: true, cleared: false });
  // let inventories = await Inventory.find({ "transactionID" : "6219995a-d4e1-4d2d-b941-2818e3faccb0" });
  for (let inventory of inventories) {

    console.log('treating transactionID :', inventory.transactionID);

    let networkFees = await getNetworkFees(inventory.issuance.network, environment.currency);
    console.log(`networkFees: ${networkFees}`);

    let withdrawalObj = {
      transactionID: inventory.transactionID,
      destinationNetwork: inventory.issuance.network,
      ticker: environment.currency,
      amount: inventory.quantity.toString(),
      destinationAddress: inventory.issuance.address,
    }

    let keyObj = await translib.getKeyObj(environment.pemPrivateKey, environment.pemPublicKey);
    let payload = await translib.sign(withdrawalObj, keyObj);

    let airgapObj = {
      transferRequestObj: withdrawalObj,
      signatureV: payload.signature,
      networkFees: networkFees
    }

    let timestamp = new Date().getTime();
    let requestLocation = `${environment.requestFile}/${timestamp}.txt`;
    fs.writeFile(requestLocation, JSON.stringify(airgapObj), function (err) {
      if (err) throw err;
      console.log(`withdrawal request file saved: ${timestamp}.txt`);
    });
    await Inventory.updateOne({ transactionID: inventory.transactionID }, { $set: { cleared: true, clearingTime: timestamp } });
    return true;
  }
}

async function getNetworkFees(network, currency) {
  let http = axios.create({
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'apiCode': environment.ledgerAPIcode
    }
  });
  try {
    debug ? console.log(`${logTime()} [tokens:getNetworkFees] from ledger -> ${network}:${currency}`) : null;
    // const response = await http.get(`${environment.ledgerServer}:${environment.ledgerPort}/fees/${network}/${currency}`);
    let response = { };
    response.data = {};
    response.data.fees = "0.0001";
    response.message = "OK";
    if (response) {
      debug ? console.log(`${logTime()} [tokens:getNetworkFees] received from ledger -> data:${JSON.stringify(response.data)}, status:${response.status}, message:${response.message}`) : null;
      if (response.data) {
        return response.data.fees;
      } else {
        throw {};
      }
    }
  } catch (error) {
    debug ? console.error(`${logTime()} [tokens:getNetworkFees]: Error communicating with ledger -> ${error.message}`) : null;
    if (error.code === 'ECONNABORTED')
      return ({ status: 500, message: 'Internal error' }); // internal server error
    else if (error.response.status)
      return { status: error.response.status, message: error.message }; // error returned by Ledger
    else
      return ({ status: 500, message: 'Internal error' }); //internal server error
  }
}

function logTime() { return Date().toString().substring(0, 24) }
