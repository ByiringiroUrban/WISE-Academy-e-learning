
const { InternalServerError } = require("./errors");
const { env } = require("../../../config");
const nodemailer = require("nodemailer");

exports.sendEmail = (emailData, errorMsg) => {
  return new Promise((resolve, reject) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.example.com",
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true" || false,
      auth: {
        user: process.env.EMAIL_USER || "your_email@example.com",
        pass: process.env.EMAIL_PASSWORD || "your_password",
      },
    });

    // Send the email
    transporter.sendMail(
      {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      },
      (error, info) => {
        if (error) {
          console.error("Email sending error:", error);
          return reject(
            new InternalServerError(errorMsg || "Failed to send email")
          );
        }
        console.log("Email sent successfully:", info.messageId);
        resolve(true);
      }
    );
  });
};
