import inbox from 'inbox';
import { simpleParser as parser } from 'mailparser';

function retrieveMessage(client, uid, callback) {
  const chunks = [];
  let chunklength = 0;
  const stream = client.createMessageStream(uid);

  stream.on('data', (chunk) => {
    chunks.push(chunk);
    chunklength += chunk.length;
  });

  stream.on('end', () => {
    const message = Buffer.concat(chunks, chunklength);

    callback(null, message);
  });
}

const fetchMessage = async (client, test) => new Promise((resolve, reject) => {
  client.openMailbox('INBOX', (err1) => {
    if (err1) reject(err1);

    client.listMessages(-10, (err2, messages) => {
      if (err2) reject(err2);

      const message = messages.find(test);

      if (message) {
        retrieveMessage(client, message.UID, (a, b) => {
          parser(b.toString('utf8'), (err3, result) => {
            if (err3) throw err3;

            resolve(result);
          });
        });
      } else {
        reject();
      }
    });
  });
});

class TestInbox {
  constructor({ host, user, password }) {
    this.host = host;
    this.user = user;
    this.password = password;
  }

  async connect() {
    this.client = inbox.createConnection(false, this.host, {
      secureConnection: true,
      auth: {
        user: this.user,
        pass: this.password,
      },
    });

    return new Promise((resolve) => {
      this.client.connect();

      this.client.on('connect', () => {
        resolve();
      });
    });
  }

  async findOne({ to, subject } = {}, options) {
    const message = await this.find(
      ({
        to: [{ address: testTo }],
        title: testSubject,
      }) => testTo === to && testSubject === subject,
      options,
    );

    return message;
  }

  async find(test, { timeout = 15000 } = {}) {
    const timer = setTimeout(() => {
      throw new Error('TIMEOUT');
    }, timeout);

    let message;

    while (!message) {
      try {
        message = await fetchMessage(this.client, test);
      } catch (e) {}
    }

    clearTimeout(timer);

    return message;
  }

  async close() {
    this.client.close();
  }
}

export default TestInbox;
