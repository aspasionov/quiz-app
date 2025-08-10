const User = require('../models/user')

module.exports = async function(req, res, next) {
    try {
      const userDoc = await User.findById(req.userId)

      if(userDoc?.roles && userDoc.roles.includes('admin')) {
        next()
      } else  {
        return res.status(403).json({
          message: 'No Access'
        })
      }
    } catch(err) {
      console.log(err);
      return res.status(403).json({
        message: 'No Access'
      })
    }
}
