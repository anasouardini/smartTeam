const pool = require('./dbPool');

const initQueries = {
  clearDB: 'drop table users, portfolios, projects, tasks'
}

const initi = async ()=>{
  let res = '';
  // res = await pool(initQueries.clearDB);
  // console.log(res)
  console.log('initializing db from model db.tsx')
  return {}
}

module.exports = {initi}
