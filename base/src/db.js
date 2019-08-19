const mongoose = require('mongoose');
const config = require('config').get('database');

const connectionOptions = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
};

if (config.get('user') && config.get('password')) {
  connectionOptions.auth = {
    user: config.get('user'),
    password: config.get('password')
  };
}

const connect = () => mongoose.connect(config.get('url'), connectionOptions);

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0); // eslint-disable-line no-process-exit
});

module.exports = {
  connect
};
