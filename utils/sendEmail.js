const mailer = require("express-mailer");
const keys = require('../config/keys')

// Configure express-mail and setup default mail data.
exports.mailerSetup =(app)=> mailer.extend(app, {
	from: keys.FROM_EMAIL,
	host: keys.SMTP_HOST, // hostname
	secureConnection: true, // use SSL
	port: keys.SMTP_PORT, // port for secure SMTP
	transportMethod: "SMTP", // default is SMTP. Accepts anything that nodemailer accepts
	auth: {
		user: keys.SMTP_EMAIL, // gmail id
		pass: keys.SMTP_PASSWORD // gmail password
	}
});


exports.sendMail = (req,res,next,options,template)=>{
    res.mailer.send(template, options, function(
        err,
        message
    ) {
        if (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}