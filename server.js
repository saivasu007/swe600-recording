/*
 * @date : 03/31/2016
 * @author : Srinivas Thungathurti
 */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passPort = require('passport');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LinkedinStrategy = require("passport-linkedin-oauth2").Strategy;
var session = require('express-session');
var async = require("async");
var mailer = require("nodemailer");
var propertiesReader = require("properties-reader");
var moment = require("moment");
var connectFlash = require('connect-flash');
var path = require('path');
var templatesDir = path.resolve(__dirname + '/views/templates');
var pageDir = path.resolve(__dirname + '/views/partials');
var properties = propertiesReader('applicationResources.file');
var crypto = require("crypto");
var app = express();
var config = require('./oauth.js');
var port = properties.get('process.env.port');
app.use(express.static(__dirname + '/views'));
var mongodbUrl = properties.get('mongodb.connect.url');
mongoose.connect(mongodbUrl);
// models
var userModel = require('./models/userModel.js');
var fs  = require('fs');
var ejs = require('ejs');

//Added properties file to store and retrieve the static information.
var emailTransport = properties.get('app.email.transport');
var serviceUser = properties.get('SMTP.service.user');
var servicePasswd = properties.get('SMTP.service.passwd');
var emailFrom = properties.get('app.email.from');
var emailSubject = properties.get('app.email.subject');
var bodyText = properties.get('app.email.body.text');
var bodyHtml = properties.get('app.email.body.html');
var emailFooter = properties.get('app.email.body.footer');
var emailChangePwdSubject = properties.get('app.email.subjectChgPwd');
var regTemplate = properties.get("app.email.registrationTem");
var chgPwdTemplate = properties.get("app.email.changePwdTem");
var pwdResetSubject = properties.get("app.email.subjectResetPwd");
var resetPwdTemplate = properties.get("app.email.resetPwdTem");
var resetConfirmSubject = properties.get("app.email.subjectConfirmResetPwd");
var resetConfirmTemplate = properties.get("app.email.resetConfirmTem");

function encrypt(pass){
	  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
	  var crypted = cipher.update(pass,'utf8','hex')
	  crypted += cipher.final('hex');
	  return crypted;
	}

function decrypt(pass){
	  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
	  var dec = decipher.update(pass,'hex','utf8')
	  dec += decipher.final('utf8');
	  return dec;
}

function renderTemplate (name, data) {
	  var tpl = fs.readFileSync(path.resolve(__dirname+"/views/", 'templates', name + '.html')).toString();
	  return ejs.render(tpl, data);
}

// register middle-ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(cookieParser());
app.use(session({
	secret : "secret",
	resave : "",
	saveUninitialized : "",
	cookie:{maxAge:3 * 60 * 60 * 1000}
}));
app.use(passPort.initialize());
app.use(passPort.session());

// passport config
passPort.use(new localStrategy({
	usernameField : 'email',
	passwordField : 'password',
	session : false
}, function(username, password, done) {
	// authentication method
	userModel.findOne({
		email : username,
		password : encrypt(password)
	}, function (err, user) {
        if (err) return done(err);
        if (user) {
        	var date = new Date();
        	var formatDate = date.getMonth() + 1 + '/' + date.getDate() + '/' +  date.getFullYear();
            if (new Date(user.expiryDate) < new Date(formatDate)) {
            	console.log(user.email+" expired in Portal.Please contact Administrator.");
                return done(err+" expired");
            }
            return done(null, user)
        }
        return  done(null, false)
    })
}));

passPort.serializeUser(function(user, done) {
	done(null, user);
});

passPort.deserializeUser(function(user, done) {
	done(null, user);
});

//Facebook Social Login
passPort.use(new facebookStrategy({
	clientID: config.facebook.clientID,
	  clientSecret: config.facebook.clientSecret,
	  callbackURL: config.facebook.callbackURL
  },function(token, refreshToken, profile, done) {
          userModel.findOne({email:profile.username}, function(err, user) {
        	  console.log("Hello");
              if (err) {
            	  console.debug("err"+err);
            	  console.log(err);
            	  console.error(err);
                  return done(err);
              }
              if (user) {
            	  console.log("Whtz up");
                  return done(null, user); // user found, return that user
              } else {
                  // if there is no user found with that facebook id, create them
                  var newUser = new userModel();
                  // set all of the facebook information in our user model
                  //newUser._id  = profile.id;   
		  console.log(“name ”+ profile.username);     
		  console.log(“name ”+ profile.name.givenName); 
		  console.log(“name ”+ profile.name.familyName);         
                  newUser.firstName  = profile.name.givenName;
                  newUser.lastName = profile.name.familyName; 
                  newUser.email = profile.username;
                  newUser.role = "user";
                  newUser.activeIn = "Y";
                  newUser.subscriber = "No";
                  console.log("Before saving user info");
                  // save our user to the database
                  newUser.save(function(err) {
                      if (err)
                          throw err;
                      	return done(null, newUser);
                  });
              }
          });
  }));

//Google Social Login
passPort.use(new GoogleStrategy({
	  clientID: config.google.clientID,
	  clientSecret: config.google.clientSecret,
	  returnURL: config.google.returnURL
	  },
	  function(request, accessToken, refreshToken, profile, done) {
	    userModel.findOne({email: profile.email }, function(err, user) {
	      if(err) {
	        console.log(err);  // handle errors!
	      }
	      if (!err && user !== null) {
	        done(null, user);
	      } else {
	        user = new userModel({
	          oauthID: profile.id,
	          name: profile.displayName,
	          created: Date.now()
	        });
	        user.save(function(err) {
	          if(err) {
	            console.log(err);  // handle errors!
	          } else {
	            console.log("saving user ...");
	            done(null, user);
	          }
	        });
	      }
	    });
	  }
	));

//Linkedin Social login
passPort.use(new LinkedinStrategy({
	  clientID: config.linkedin.consumerKey,
	  clientSecret: config.linkedin.consumerSecret,
	  callbackURL: config.linkedin.callbackURL,
	  scope: config.linkedin.scope
	  },
	  function(accessToken, refreshToken, profile, done) {
	    userModel.findOne({ email: profile.emails[0].value }, function(err, user) {
	      if(err) {
	        console.log(err);  // handle errors!
	      }
	      if (!err && user !== null) {
	        done(null, user);
	      } else {
	    	// if there is no user found with that facebook id, create them
              var newUser = new userModel();
              // set all of the facebook information in our user model
              //newUser._id  = profile.id;                
              newUser.firstName  = profile.name.givenName;
              newUser.lastName = profile.name.familyName; 
              newUser.email = profile.emails[0].value;
              newUser.role = "user";
              newUser.activeIn = "Y";
              newUser.subscriber = "No";
              // save our user to the database
              newUser.save(function(err) {
	          if(err) {
	            console.log(err);  // handle errors!
	          } else {
	            console.log("saving user ...");
	            done(null, user);
	          }
	        });
		   console.log(profile.id);
	      }
	    });
	  }
	));

// routes
app.post('/register', function(req, res) {
	var password = encrypt(req.body.password);
	req.body.password = password;
	userModel.findOne({
		email : req.body.email
	}, function(err, result) {
		if (result) {
			res.send("0");
		} else {
			var newUser = new userModel(req.body);
			newUser.save(function(err, user) {
				req.login(user, function() {
					res.json(user);
				});
             //sendMail(user,'registration',null);
			//send email after successful registration.
				var smtpTransport = mailer.createTransport(emailTransport, {
					service : "Gmail",
					auth : {
						user : serviceUser,
						pass : servicePasswd
					}
				});
				var data = {
						email: user.email,
			            password: decrypt(user.password),
			            url: "http://"+req.headers.host+"/login",
			            name: user.firstName
				}
				var mail = {
					from : emailFrom,
					to : req.body.email,
					subject : emailSubject,
					html: renderTemplate(regTemplate,data)
				}

				smtpTransport.sendMail(mail, function(error, response) {
					if (error) {
						console.log(error);
					} else {
						console.log("Message sent: " + response.message);
					}
				   smtpTransport.close();
				});
			    //End email communication here.
			})
		}
	});
	
});

app.post('/login', passPort.authenticate('local'),function(req, res) {
	var user = req.user;
	res.json(user);
});

app.get('/auth/facebook', passPort.authenticate('facebook'), function(req, res, next){
	/*var user = req.user;
	res.json(user);*/
});

app.get('/auth/facebook/callback',
	passPort.authenticate('facebook', { failureRedirect: '/' , successRedirect : '/home' }),function(req, res, next) {
	/*var user = req.user;
	res.json(user);*/
});

app.get('/auth/google',
		  passPort.authenticate('google', { scope: [
		    'https://www.googleapis.com/auth/plus.login',
		    'https://www.googleapis.com/auth/plus.profile.emails.read'
		  ] }
));

app.get('/auth/google/callback',
		  passPort.authenticate('google', { failureRedirect: '/' }),
		  function(req, res) {
		    res.redirect('/account');
});

app.get('/auth/linkedin',
		  passPort.authenticate('linkedin',{state:'CA'}),
		  function(req, res){
			var user = req.user;
			res.json(user);
});
		
app.get('/auth/linkedin/callback',
		  passPort.authenticate('linkedin', { failureRedirect: '/' , successRedirect : '/home' }),
		  function(req, res) {
			var user = req.user;
			res.json(user);
});

app.post('/logout', function(req, res) {
	console.log(req.user.email + " has logged out.")
	req.logout();
	res.sendStatus(200);
});

app.get('/loggedin', function(req, res) {
	if(req.user != undefined) {
	userModel.find({
		email : req.user.email
	}, function(err, result) {
		res.send(req.isAuthenticated() ? result[0] : "0")
	});
	} else {
		res.send("0");
	}
});

//Added for ASQ Upgrade2.0.Forgot Password functionality.
app.post('/forgot', function(req, res) {
	      crypto.randomBytes(20, function(err, buf) {
	        token = buf.toString('hex');
	        console.log("token "+token);
	    	userModel.findOne({ email: req.body.email }, function(err, user) {
	        if (!user) {
	          console.log('No account with that email address exists.');
	          return res.send('NotFound');
	        }
	        userModel.update({
				email : req.body.email
			}, {
				resetPasswordToken : token,
				resetPasswordExpires : Date.now() + 3600000
			}, false, function(err) {
				res.send(err);
			})
			//Send forgot password email
			var smtpTransport = mailer.createTransport(emailTransport, {
		        service: 'Gmail',
		        auth: {
		          user: serviceUser,
		          pass: servicePasswd
		        }
		      });
		      var data = {
				  url: "http://"+req.headers.host+"/reset/"+token,
				  name: user.firstName
			  }
		      var mailOptions = {
		        to: req.body.email,
		        from: emailFrom,
		        subject: pwdResetSubject,
		        html: renderTemplate(resetPwdTemplate,data)
		      };
		      smtpTransport.sendMail(mailOptions, function(err,response) {
		        if (err) {
					console.log(err);
					res.send(err);
				 } else {
					console.log('An e-mail has been sent to ' + req.body.email + ' with further instructions.');
					console.log("Message sent: " + response.message);
				 }
		    	 smtpTransport.close();
		    	 //res.send("success");
		      });
	      });
	   });
	});

app.get('/reset/:token', function(req, res) {
	userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires : { $gt: new Date() } }, function(err, user) {
	    if (!user) {
	      console.log('Password reset token is invalid or has expired.');
	      return res.send('Password reset URL is invalid or has expired.');
	    }
	 res.redirect('/reset?token='+req.params.token);
	});
});

app.post('/reset', function(req, res) {
	userModel.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires : { $gt: new Date() } }, function(err, user) {
        if (!user) {
          console.log('Password reset token is invalid or has expired.');
          return res.send('Password reset URL is invalid or has expired.');
        }
        user.password = req.body.password;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = "";
        userModel.update({
			email : user.email
		}, {
			password : encrypt(user.password),
			resetPasswordToken : user.resetPasswordToken,
			resetPasswordExpires : user.resetPasswordExpires
		}, false, function(err) {
			if(err) res.send(err);
			else console.log('Success! Your password has been changed.');
		})
		//Send email after succeesful password reset.
		var smtpTransport = mailer.createTransport(emailTransport, {
	        service: 'Gmail',
	        auth: {
	          user: serviceUser,
	          pass: servicePasswd
	        }
	      });
	      var data = {
	    		  email: user.email,
				  password: req.body.password,
				  name: user.firstName,
				  url: "http://"+req.headers.host+"/login"
	      }
	      var mailOptions = {
	        to: user.email,
	        from: emailFrom,
	        subject: resetConfirmSubject,
	        html: renderTemplate(resetConfirmTemplate,data)
	      };
	      smtpTransport.sendMail(mailOptions, function(err,response) {
	    	 if (err) {
				console.log(err);
				res.send(err);
			 } else {
				console.log("Message sent: " + response.message);
			 }
	    	 smtpTransport.close();
	    	 res.send("success");
	      });
      });
});
//End Forgot Password functionality here.

app.all('/*', function(req, res, next) {
	// Just send the index.html for other files to support HTML5Mode
	res.sendFile('index.html', {
		root : __dirname + "/views"
	});
});

app.listen(process.env.PORT || 1337,function() {
	console.log('http://127.0.0.1:' + port + '/');
});