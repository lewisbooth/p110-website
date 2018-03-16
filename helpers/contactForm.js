const pug = require('pug')
const mail = require("./sendMail");

// Emails a simple template which contains the formatted messageData object

exports.contactForm = async ({
  toAddress = [process.env.MAIL_TO],
  fromAddress = process.env.MAIL_FROM,
  templateFile = process.env.ROOT + "/views/emails/contactForm.pug",
  messageData = {}
}) => {
  return new Promise(resolve => {
    console.log("New contact form message");

    const messageTemplate = pug.renderFile(
      templateFile,
      messageData
    );

    const mailData = {
      to: toAddress,
      from: fromAddress,
      subject: "P110 Website Enquiry | " + messageData.name,
      html: messageTemplate
    };

    const mailCallback = (err) => {
      if (err) {
        console.log("🔥  Email Error: " + err);
        resolve(true)
      } else {
        console.log("📧  Email sent successfully");
        resolve(false)
      }
    };

    mail.send(mailData, mailCallback);
  })
};