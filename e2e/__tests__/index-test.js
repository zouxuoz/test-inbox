import { sendTestMessage } from '../utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;

beforeAll(async () => {
  try {
    await inbox.connect();
  } catch (e) {
    console.log(e);
  }
});

it('find one message by subject', async () => {
  const email = process.env.TEST_EMAIL_USER.replace('@', `+${Math.round(Math.random() * 10 ** 10)}@`);
  const subject = `test-inbox subject ${Math.random()}`;

  await sendTestMessage({ email, subject });

  const message = await inbox.findOne({
    to: email,
    subject,
  }, { timeout: 180000 });

  expect(message).toBeDefined();
});

afterAll(async () => {
  try {
    await inbox.close();
  } catch (e) {
    console.log(e);
  }
});
