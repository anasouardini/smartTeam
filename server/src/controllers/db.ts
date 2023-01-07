const Db = require('../models/db')

const init = async (req:any, res:any)=>{
  console.log('initializing db from controller initDB.ts')
  const response = await Db.initi();

  if(response[0].affectedRows){
    return res.json({data: 'database re-initialized successfully'})
  }

  return res.status(500).json({data: 'database could not be initialized'})
}

module.exports = {init};
