const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

  if(token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET)
      req.userId = decoded._id
      next()
    } catch(err) {
      console.log(err);
      return res.status(403).json({
        message: 'No Access'
      })
    }
  } else {
    return res.status(403).json({
      message: 'No Access'
    })
  }
}
