
// custom module
const { emailTemplate } = require("./utils/baseEmailTemplate");
const { sendEmail } = require("./utils/sendEmail");
const { mailFrom, appName } = require("../../config");

// send email
exports.sendEmailService = async ({ body, email, subject, errorMsg }) => {
  try {
    const html = emailTemplate(body);

    await sendEmail(
      {
        from: mailFrom,
        to: email,
        subject: `${appName} ${subject}`,
        html,
      },
      errorMsg
    );
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email: ${errorMsg || 'Email sending failed'}`, error);
    // Don't throw the error, just return false to indicate failure
    return false;
  }
};

// Additional utility for checking publication status
exports.isPublishedStatus = (status) => {
  // Status 2 and 3 are both considered "published" states
  return status === 2 || status === 3;
};
