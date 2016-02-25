module.exports = {
  postgres: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    name: "postgres",
    connector: "postgresql"
  }
};
