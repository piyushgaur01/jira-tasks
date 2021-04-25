const winston = require('winston');
const fs = require('fs');

const options = {
  file: {
    level: 'info',
    filename: './logs/app.log',
    handleExceptions: true,
    format: winston.format.simple(),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true,
    timestamp() {
      return (new Date()).toISOString();
    },
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console(options.console));
}

logger.stream = {
  write(message, encoding) { // eslint-disable-line no-unused-vars
    logger.info(message);
  },
};

function loggerSetup() {
  const dir = './logs';
  const file = 'app.log';
  if (fs.existsSync(dir)) {
    if (fs.existsSync(`${dir}/${file}`)) {
      logger.info(`${dir} directory and ${file} exists.`);
    } else {
      fs.writeFileSync(`${dir}/${file}`, () => { logger.info(`${file} created!`); });
    }
  } else {
    fs.mkdirSync(dir);
    fs.writeFileSync(`${dir}/${file}`);
    logger.info(`${dir} directory and ${file} created.`);
  }
}

loggerSetup();

module.exports = logger;
