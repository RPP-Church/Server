const mongoose = require('mongoose');

const Departments = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name of department'],
      maxlength: 50,
      unique: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'admin',
      required: [true, 'Please provide a user'],
    },
    modifiedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Departments', Departments);
