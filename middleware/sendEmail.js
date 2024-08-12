const nodemailer = require('nodemailer');

const SendEmail = async ({ message, email, title }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
      clientId: process.env.EMAIL_CLIENTID,
      clientSecret: process.env.EMAIL_SECRET,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      type: 'OAuth2',
    },
  });

  const mailConfigurations = {
    // It should be a string of sender email
    from: 'okoromivictorsunday@gmail.com',

    // Comma Separated list of mails
    to: 'okoromivictorsunday@gmail.com',

    // Subject of Email
    subject: title,

    // This would be the text of email body
    html: message,
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) throw Error(error);
    console.log('Email Sent Successfully');
    console.log(info);
  });
};

module.exports = SendEmail;
