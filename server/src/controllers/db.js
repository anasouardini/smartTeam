const Db = require('../models/db')

const init = async (req, res)=>{
  const response = await Db.init();

  if(response){
    return res.json({data: 'database re-initialized successfully'})
  }

  return res.status(500).json({err: 'database could not be initialized'})
}

module.exports = {init};
