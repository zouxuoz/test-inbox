# test-inbox

This is an IMAP client module for get confirm, reset and other messages from your inbox in your test scenarios.

## Usage

```js
import TestInbox from 'test-inbox';

const client = new TestInbox({
  host: process.env.TEST_EMAIL_HOST,
  user: process.env.TEST_EMAIL_USER,
  password: process.env.TEST_EMAIL_PASSWORD,
});

await client.connect();

const message = await client.findOne({
  to: 'test-inbox+12345678@yandex.ru',
  subject: 'Foo'
}, { timeout: 60000 });
```