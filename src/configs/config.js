// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

dotenv.config();

const getPrefix = () => {
  const env = process.env.NODE_ENV || 'production';
  const envPrefixMap = {
    development: 'DATABASE',
    test: 'TEST_DATABASE',
    production: 'PROD_DATABASE',
  };
  const prefix = envPrefixMap[env];
  return prefix;
};

const getDatabaseConfig = () => {
  const prefix = getPrefix();
  const config = {
    secret: process.env.JWT_SECRET || 'secret',
  };

  if (prefix === 'PROD_DATABASE') {
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    };
  }
  return config;
};

module.exports = getDatabaseConfig;
