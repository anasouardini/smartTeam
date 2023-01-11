const Db = require('../models/db')

const init = async (req, res)=>{
  const response = await Db.initi();

  if(response){
    return res.json({data: 'database re-initialized successfully'})
  }

  return res.status(500).json({data: 'database could not be initialized'})
}

module.exports = {init};
