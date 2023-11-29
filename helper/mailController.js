const nodemailer = require('nodemailer');
const { contactAdmin } = require('../core/constant/constantData');

const adminEmail = contactAdmin.email;

const addEmployMail = async (name, email, password) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Onboarding Mail",
            html:
                "<p>Hi " +
                name + ', Welcome to IMS.<br><br>' +
                'Login Credentials<br><b>Email:- </b>' + email + ' <br><b>Password:- </b>' + password + ' <br><br>Thank You<br>' + adminEmail + '</a><br>IMS',
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    addEmployMail
}