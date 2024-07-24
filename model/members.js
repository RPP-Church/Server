const mongoose = require('mongoose');
var attendanceSchema = mongoose.Schema({
  date: String,
  serviceName: String,
  serviceId: mongoose.Schema.Types.ObjectId,
  time: String,
  attendance: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Absent',
  },
  _id: false,
});
const Members = mongoose.Schema({
  title: {
    type: String,
    enum: ['Pastor', 'Mr', 'Miss', 'Mrs', 'Dcn', 'Asst. Pastor', 'Elder'],
  },
  profilePicture: {
    type: String,
  },
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    maxlength: 50,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    maxlength: 50,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Please select a gender'],
  },
  phone: {
    type: String,
    minLength: 11,
    maxLength: 11,
    unique: true,
    match: [
      /^(?:(?:(?:\+?234(?:\h1)?|01)\h*)?(?:\(\d{3}\)|\d{3})|\d{4})(?:\W*\d{3})?\W*\d{4}$/gm,
      'Please provide a phone number e.g 09012345678',
    ],
  },
  category: {
    type: String,
    enum: ['Adult', 'Teen', 'Children'],
  },
  maritalStatus: {
    type: String,
    enum: ['Married', 'Single', 'Divorce'],
  },
  spouseName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
    lowercase: true,
  },
  address: {
    type: String,
    // required: [true, 'Please enter an address'],
    maxlength: 100,
    trim: true,
  },
  departments: [
    {
      type: mongoose.Types.ObjectId,
      name: String,
    },
  ],
  membershipType: {
    type: String,
    enum: ['Existing Member', 'New Member'],
    required: [true, 'Please select membership type'],
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  dateOfBirth: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{2}-\d{2}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid date, please enter MM/DD.`,
    },
    required: [true, 'Please provide a valid date of birth'],
  },
  attendance: [attendanceSchema],
});

module.exports = mongoose.model('Members', Members);
