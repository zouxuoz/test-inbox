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

const fetchMessage = (client, test) => new Promise((resolve, reject) => {
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

  connect() {
    this.client = new Imap({
      tls: true,
      port: 993,
      host: this.host,
      user: this.user,
      password: this.password,
      authTimeout: 15000,
      connTimeout: 15000,
    });

    return new Promise((resolve, reject) => {
      this.client.connect();

      this.client.once('ready', () => {
        resolve();
      });

      this.client.once('error', function(err) {
        reject(err);
      });

      this.client.once('end', function() {
        reject();
      });
    });
  }

  findOne({ to, subject } = {}, options) {
    return this.find(
      msg => msg.to.text === to && msg.subject === subject,
      options,
    );
  }

  find(test, { timeout = 15000 } = {}) {
    let abort = false;

    const timer = setTimeout(() => {
      abort = true;
      throw new Error('TIMEOUT');
    }, timeout);

    var whileFetchMessage = (message) => {
      if (!message && !abort) {
        return fetchMessage(this.client, test).then(whileFetchMessage).catch(() => whileFetchMessage());
      }

      clearTimeout(timer);

      return Promise.resolve(message);
    };

    return whileFetchMessage();
  }

  close() {
    return this.client.end();
  }
}

module.exports = TestInbox;