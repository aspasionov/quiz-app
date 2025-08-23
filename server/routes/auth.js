const {Router} = require('express')
const User = require('../models/user');
const checkAuth = require('../helper/auth')

const router = Router()

router.get('/me', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if(!user) {
      return res.status(404).json({
        success: false,
        message: 'User is not found'
      })
    }

    const {  password,  ...userData } = user._doc
    res.status(200).json({
      success: true,
      data: {
        _id: userData._id,
        ...userData
      }
    })

  } catch (err) {
    console.error('Error in /auth/me:', err);
    res.status(500).json({
      success: false,
      message: 'No Access'
    })
  }
})



// Logout route
router.post('/logout', checkAuth, async (req, res) => {
  try {
    // In a stateless JWT implementation, logout is primarily handled client-side
    // by removing the token from localStorage. This endpoint acknowledges the logout.
    // In future implementations, you could add token blacklisting here.
    
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error during logout'
    });
  }
});

module.exports = router;
