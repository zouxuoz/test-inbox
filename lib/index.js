const Imap = require('imap');
const parser = require('mailparser').simpleParser;

function retrieveMessage(stream, callback) {
  const chunks = [];
  let chunklength = 0;

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
  client.openBox('INBOX', (err1, box) => {
    if (err1) reject(err1);

    const f = client.seq.fetch(`${box.messages.total - 10}:${box.messages.total}`, {
      bodies: '',
      struct: true,
    });

    f.on('message', (msg) => {
      msg.on('body', (stream) => {
        retrieveMessage(stream, (a, b) => {
          parser(b.toString('utf8'), (err3, result) => {
            if (err3) throw err3;

            if (test(result)) {
              resolve(result);
            }
          });
        });
      });
    });

    f.once('error', () => {
      reject();
    });

    f.once('end', () => {
      reject();
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
    this.client = new Imap({
      tls: true,
      port: 993,
      host: this.host,
      user: this.user,
      password: this.password,
    });

    return new Promise((resolve) => {
      this.client.connect();

      this.client.once('ready', () => {
        resolve();
      });
    });
  }

  async findOne({ to, subject } = {}, options) {
    const message = await this.find(
      msg => msg.to.text === to && msg.subject === subject,
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
    this.client.end();
  }
}

module.exports = TestInbox;