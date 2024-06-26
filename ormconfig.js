const devConfig = {
  type: 'postgres',
  host: process.env.DEV_DB_HOST,
  port: process.env.DEV_DB_PORT,
  username: process.env.DEV_DB_USER,
  password: process.env.DEV_DB_PASS,
  database: process.env.DEV_DB_NAME,
  synchronize: true,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers',
  },
};

const testConfig = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST,
  port: process.env.TEST_DB_PORT,
  username: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASS,
  database: process.env.TEST_DB_NAME,
  synchronize: true,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers',
  },
};

module.exports = process.env.NODE_ENV === 'test' ? testConfig : devConfig;
