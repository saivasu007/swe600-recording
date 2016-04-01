var ids = {
  facebook: {
    clientID: '959527280828650',
    clientSecret: '954e690c922e8eed37984645ebe7aec9',
    callbackURL: 'https://swe600-recording.herokuapp.com/auth/facebook/callback'
  },
  google: {
    clientID: '989088271842-2u16eo2sboegvsec287jnhtmcsl1r7nn.apps.googleusercontent.com ',
    clientSecret: 'KVkGD4EyN1fntLf8wVJvr3BN',
    returnURL: 'https://swe600-recording.herokuapp.com/auth/google/callback'
  },
   linkedin: {
    consumerKey: '7515ix697gi6oz',
    consumerSecret: 'zPbAKreoQuQg3U3H',
    callbackURL: 'https://swe600-recording.herokuapp.com/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_basicprofile']
  }
};

module.exports = ids;
