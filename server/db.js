const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "RP2001MINHAJ.CSECU",
  host: "localhost",
  port: 5432,
  database: "PST"
});

module.exports = pool;