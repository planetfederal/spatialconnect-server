module.exports = {
  postgres: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    name: "postgres",
    connector: "postgresql"
  }
};
