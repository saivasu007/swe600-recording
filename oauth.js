var ids = {
  facebook: {
    clientID: '959527280828650',
    clientSecret: '954e690c922e8eed37984645ebe7aec9',
    callbackURL: 'https://swe600-recording.herokuapp.com/auth/facebook/callback'
  },
  google: {
    clientID: '1003631882203-h39iko7mudtca2h2mmqjpi1ekpac8q6s.apps.googleusercontent.com',
    clientSecret: 'KWuXkAMVlf4aXuuXrYTK8cC0',
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
