var common = require('./common.js');
var nodemailer = common.nodemailer
var smtpTransport = common.smtpTransport
var config = common.config
var smtpConfig = {
  host: config.mail.smtp_host,
  port: config.mail.smtp_port,
  port: 465,
  secure: true, // use SSL
  auth: {
    user: config.mail.smtp_user,
    pass: config.mail.smtp_password
  }
};

var transporter = nodemailer.createTransport(smtpConfig);

exports.sendEmail = function (contents) {
  return common.transporter.sendMail(contents, function (error, info) {
    if (error) {
      console.log(error);
      var response = { status: 202, success: false, data: -1 };

    }
    var response = { status: 202, success: true, data: 1 };

  });

}

