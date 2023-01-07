const mysql2 = require('mysql2/promise');
require('dotenv').config()

const pol = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
})

const poolPromise = (query:string, params:any[]) =>
    pol
        .promise()
        .query(query, params)
        .then((res:any) => res)
        .catch((err:any) => err);

module.exports = poolPromise
