const mongoose = require('mongoose');

const User = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    maxlength: 50,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Please select a gender'],
  },
  phone: {
    type: String,
  },
  maritalStatus: {
    type: String,
    enum: ['Married', 'Single', 'Divorce'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  address: {
    type: String,
    required: [true, 'Please enter an address'],
    maxlength: 100,
  },
  departments: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
  membershipType: {
    type: String,
    enum: ['Existing Member', 'New Member'],
    required: [true, 'Please select membership type'],
  },
  position: {
    type: String,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  dob: {
    type: Date,
    required: [true, 'Please enter Date of Birth'],
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
});

module.exports = mongoose.model('User', User);
