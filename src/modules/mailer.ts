import nodemailer from 'nodemailer';
import mail from '../config/mail.json';

const {host, port, user, pass} = mail;

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
});

export default transport;
