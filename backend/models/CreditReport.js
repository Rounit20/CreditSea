const mongoose = require('mongoose');

const creditAccountSchema = new mongoose.Schema({
  type: String,
  bank: String,
  accountNumber: String,
  amountOverdue: Number,
  currentBalance: Number
});

const addressSchema = new mongoose.Schema({
  addressLine: String,
  city: String,
  state: String,
  pincode: String
});

const creditReportSchema = new mongoose.Schema({
  // Basic Details
  name: {
    type: String,
    required: true
  },
  mobilePhone: String,
  pan: String,
  creditScore: Number,
  
  // Report Summary
  reportSummary: {
    totalAccounts: Number,
    activeAccounts: Number,
    closedAccounts: Number,
    currentBalanceAmount: Number,
    securedAccountsAmount: Number,
    unsecuredAccountsAmount: Number,
    last7DaysCreditEnquiries: Number
  },
  
  // Credit Accounts Information
  creditAccounts: [creditAccountSchema],
  
  // Addresses
  addresses: [addressSchema],
  
  // Metadata
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CreditReport', creditReportSchema);