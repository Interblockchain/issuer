'use strict';

let environment = require('./environments/environment');

let mongoose = require('mongoose');
const MongoDB = require("./config/mongoDB");
const mongoDB = new MongoDB(environment.mongoUser, environment.mongoPsw, environment.mongoHost, environment.mongoDB, environment.mongoPort);

const nodemailer = require("nodemailer");
const translib = new (require('translib'))();
const axios = require('axios');
const fs = require("fs");
const CronJob = require('cron').CronJob;
const Inventory = require('./models/inventory');
let debug = true;

let startDate = new Date(environment.startDate);    // start bonus period                              // bonus period in days
let endDate = new Date(startDate.getTime());        // end bonus period
endDate.setDate(startDate.getDate() + environment.bonusPeriod);
console.log(`endDate: ${endDate}`);

// sendTLD();
// sendReminder();
// new CronJob('*/2 * * * *', async () => {
  new CronJob('0 9 */2 * *', () => {  // every 2 days at 9 AM
  await sendTLD();
  await sendReminder();
}, null, true);

// sendThankYou();
new CronJob('*/5 * * * *', () => {  // every 5 minutes
  sendThankYou();
}, null, true);

async function sendTLD() {  // everything is fine --> send TLD
  console.log(`${logTime()} sending TLD...`);
  let incentive;
  let amountTLD;
  let updateIncentive = false;
  // let inventories = await Inventory.find({ "transactionID" : "6219995a-d4e1-4d2d-b941-2818e3faccb0" });
  let inventories = await Inventory.find({ paid: true, cleared: false, "issuance.network": environment.networks, "issuance.address": { $ne: "N/A" } });
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
    console.log(`send tld to ${inventory.userID}`);
    // no need to set emailSent --> cleared is now true
    await sendMail(environment.emailFrom, environment.emailPass, inventory.userID, environment.sbjThankyou, environment.msgThankyou);
  }
  return true;
}

async function sendReminder() {   // tokens are paid and no network and/or address has been set
  console.log(`${logTime()} sending reminders...`);
  let timestamp = new Date().getTime();
  let inventories = await Inventory.find({ paid: true, cleared: false, $or: [{ "issuance.network": "N/A" }, { "issuance.address": "N/A" }] });
  for (let inventory of inventories) {
    // console.log(JSON.stringify(inventory, null, 2));
    if (!inventory.emailSent) {
      console.log("email not sent: send reminder");
      await Inventory.updateOne({ transactionID: inventory.transactionID }, { $set: { "emailSent": timestamp } });
      await sendMail(environment.emailFrom, environment.emailPass, inventory.userID, environment.sbjReminder, environment.msgReminder);
    } else {
      // send reminder only if sendThankYou was sent at least 24 hours ago...
      let yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      // yesterday.setMinutes(yesterday.getMinutes() - 3);
      let emailSentDate = new Date(inventory.emailSent);
      if (emailSentDate < yesterday) {
        console.log("email sent more than 2 days ago: send reminder");
        await Inventory.updateOne({ transactionID: inventory.transactionID }, { $set: { "emailSent": timestamp } });
        await sendMail(environment.emailFrom, environment.emailPass, inventory.userID, environment.sbjReminder, environment.msgReminder);
      }
    }
  }
}

async function sendThankYou() {   // paid is true: TLD are coming...
  console.log(`${logTime()} sending ThankYou/warnings...`);
  let timestamp = new Date().getTime();
  // 1) Thank You, TLD are coming soon...
  let inventories = await Inventory.find({ paid: true, cleared: false, "issuance.network": environment.networks, "issuance.address": { $ne: "N/A" }, "emailSent": null });
  for (let inventory of inventories) {
    // console.log(inventory);
    console.log("send thankYou");
    await Inventory.updateOne({ transactionID: inventory.transactionID }, { $set: { "emailSent": timestamp } });
    await sendMail(environment.emailFrom, environment.emailPass, inventory.userID, environment.sbjAcknowledge, environment.msgAcknowledge);
  }
  // 2) Thank, TLD are coming soon, You but please provide network and address
  let warnings = await Inventory.find({ paid: true, cleared: false, $or: [{ "issuance.network": "N/A" }, { "issuance.address": "N/A" }], "emailSent": null });
  for (let warning of warnings) {
    // console.log(warning);
    console.log("send Warnings");
    await Inventory.updateOne({ transactionID: warning.transactionID }, { $set: { "emailSent": timestamp } });
    await sendMail(environment.emailFrom, environment.emailPass, warning.userID, environment.sbjWarning, environment.msgWarning);
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
    let response = {};
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

async function sendMail(from, pass, recipient, subject, content) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail.transledger.io",
    port: 465,    // 465/587
    secure: true, // true for 465, false for other ports
    auth: {
      user: from,
      pass: pass
    }
  });

  // let x = await transporter.verify();
  // console.log('x :', x);

  let info = await transporter.sendMail({
    from: `"transledger" <${environment.emailFrom}>`, // sender address
    to: recipient, // list of receivers
    // bcc: environment.emailCMO,
    subject: subject,
    text: content // plain text body
    // text: JSON.stringify(content) // plain text body
    // html: "<b>Hello world?</b>" // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // console.log('info :', info);

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

function logTime() { return Date().toString().substring(0, 24) }