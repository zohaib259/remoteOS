import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  mail: string
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or Mailgun, SendGrid, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `<p>RemoteOs: <b>${mail}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
};
