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

let startDate = new Date('May 7, 2020 9:00:00');    // start bonus period
let bonusPeriod = 14;                               // bonus period in days
let endDate = new Date(startDate.getTime());        // end bonus period
endDate.setDate(startDate.getDate() + bonusPeriod);
console.log(`endDate: ${endDate}`);

// sendTLD();
// new CronJob('0 * * * *', () => {  // every hour
new CronJob('0 9 */2 * *', () => {  // every 2 days at 9 AM
  sendTLD();
}, null, true);

async function sendTLD() {
  console.log(`${logTime()} sending TLD...`);
  let incentive;
  let amountTLD;
  let updateIncentive = false;
  // let inventories = await Inventory.find({ "transactionID" : "6219995a-d4e1-4d2d-b941-2818e3faccb0" });
  let inventories = await Inventory.find({ paid: true, cleared: false, "issuance.network": environment.networks, "issuance.address": {$ne: "N/A" } });
  // let inventories = await Inventory.find({ paid: true, cleared: false });
  // TODO: issuance: valid address ?
  if (inventories.length == 0) {
    console.log(`${logTime()} no TLD transaction to pay`);
  } else {
    console.log(`${logTime()} ${inventories.length} TLD transaction to pay`);
  }
  for (let inventory of inventories) {

    let currentDate = new Date();

    console.log('treating transactionID :', inventory.transactionID);

    let networkFees = await getNetworkFees(inventory.issuance.network, environment.currency);
    console.log(`networkFees: ${networkFees}`);
    amountTLD = inventory.quantity;

    if (currentDate < endDate) {  // bonus period
      updateIncentive = true;
      incentive = Math.floor(inventory.quantity * environment.incentiveRate);
      amountTLD += incentive;
    }

    let withdrawalObj = {
      transactionID: inventory.transactionID,
      destinationNetwork: inventory.issuance.network,
      ticker: environment.currency,
      amount: amountTLD.toString(),
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
    if (updateIncentive) {
      await Inventory.updateOne({ transactionID: inventory.transactionID }, { $set: { "issuance.incentive": incentive } });
    }
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
    const response = await http.get(`${environment.ledgerServer}:${environment.ledgerPort}/fees/${network}/${currency}`);
    // let response = { };
    // response.data = {};
    // response.data.fees = "0.0001";
    // response.message = "OK";
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
