const mongoose = require("mongoose");
const joi = require("joi");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Customer = new mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = {
    name: joi.string().min(5).max(50).required(),
    phone: joi.string().min(5).max(50).required(),
    isGold: joi.Boolean(),
  };
  return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
