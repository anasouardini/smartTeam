const fs = require("fs");

const mysql2 = require('mysql2');
require('dotenv').config()

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
})

// const pool = mysql2.createConnection(process.env.DB_URL);

const poolPromise = async (query, params) =>{

  const response = await pool
        .promise()
        .query(query, params)
        .then((res) => res)
    .catch((err) => err);

  if(!response){ console.log('pool error'); return {err: 'poolError'}}
  if(response.errno){ console.log('query error: ', response); return {err: 'queryError'}}

  return response;
}



module.exports = poolPromise
