import dotenv from 'dotenv';
import SendGrid from 'sendgrid';
import TestInbox from '../build';

dotenv.config({
  silent: process.env.NODE_ENV === 'production',
});

global.sendgrid = new SendGrid(process.env.TEST_SENDGRID_API_KEY);

global.inbox = new TestInbox({
  host: process.env.TEST_EMAIL_HOST,
  user: process.env.TEST_EMAIL_USER,
  password: process.env.TEST_EMAIL_PASSWORD,
});
