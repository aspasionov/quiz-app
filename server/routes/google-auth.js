const { Router } = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const router = Router();

// Function to create OAuth client
function createOAuthClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_URL || 'http://localhost:4000'}/auth/google/callback`
  );
}

// Route to initiate Google OAuth
router.get('/google', (req, res) => {
  try {
    console.log('Initiating Google OAuth...');
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing');
    console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Missing');
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=config_error`);
    }
    
    const redirectUri = `${process.env.SERVER_URL || 'http://localhost:4000'}/auth/google/callback`;
    console.log('Redirect URI:', redirectUri);
    
    const client = createOAuthClient();
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      include_granted_scopes: true,
      response_type: 'code',
    });
    
    console.log('Generated auth URL:', authorizeUrl);
    res.redirect(authorizeUrl);
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_init_failed`);
  }
});

// Google OAuth callback route
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }

    // Create client and exchange authorization code for tokens
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Create new user
      user = new User({
        googleId,
        name,
        email,
        avatar,
        // Set a random password for Google users (they won't use it)
        password: require('crypto').randomBytes(32).toString('hex')
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id },
      process.env.SECRET,
      { expiresIn: '30d' }
    );

    // Redirect to client with token
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/google/success?token=${token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
});

module.exports = router;
