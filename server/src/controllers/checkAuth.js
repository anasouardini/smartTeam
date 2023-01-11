const checkAuth = async (req, res, next)=>{

  const tokenValid = false;
  if(req?.jwt){
    // verify token (expDate, hash)
  }

  if(!tokenValid && req?.refreshToken){
    // send a new jwt
  }


  const exceptionRoutes = ['/login', '/signup', '/oauth', '/initDB'];
  // console.log(req.path, exceptionRoutes.includes(req.path))

  if(exceptionRoutes.includes(req.path) && tokenValid){
    return res.json({data: 'you are already logged in'})
  }

  if(!exceptionRoutes.includes(req.path) && !tokenValid){
    return res.json({data: 'you have to log in first'})
  }

  // the other two cases are passed to the proper route
  next();
}

module.exports = checkAuth;
