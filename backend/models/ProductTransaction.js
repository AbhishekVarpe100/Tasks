// models/ProductTransaction.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductTransactionSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    category: String,
    sold: Boolean
});

module.exports = mongoose.model('ProductTransaction', ProductTransactionSchema);
