const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const environment = require("../environments/environment.js");

// define the schema for our user model
const inventorySchema = mongoose.Schema({
  documentType: { type: String, required: true, enum: ["inventory"] },
  transactionID: { type: String, required: true },
  accountID: { type: String, index: true, required: true },
  from: { type: String, required: true },
  userID: { type: String, index: true, required: true },
  quantity: { type: Number, required: true },   // represents amount of TLD
  reference: { type: String, required: true },  // reference to db.tokens
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  network: { type: String, required: true },
  initialValue: { type: Number, required: true },
  paid: { type: Boolean, required: true },
  cleared: { type: Boolean, required: true },
  clearingTime: { type: Number },
  timestamp: { type: Number },
  issuance: {
    network: { type: String, enum: environment.networks },
    address: { type: String, required: true },
    incentive: { type: Number, required: false, default: 0 }, // represents amount of TLD
    stake: {type: Boolean, required: false, default: false} // use this account for staked TLD to calculate fees
  }
});

inventorySchema.plugin(mongoosePaginate);

inventorySchema.index({ transactionID: 1, reference: 1 }, { unique: true });
// inventorySchema.index({accountID:1}, { unique: false });
inventorySchema.index({ from: 1 }, { unique: false });
inventorySchema.index({ reference: 1 }, { unique: false });

// create the model for wallet and expose it to our app
module.exports = mongoose.model('Inventory', inventorySchema);