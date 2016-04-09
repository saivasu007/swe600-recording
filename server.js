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
var userMediaModel = require('./models/userMediaModel.js');
var fs  = require('fs');
var ejs = require('ejs');
var MongoClient = require('mongodb').MongoClient,
GridStore = require('mongodb').GridStore,
ObjectID = require('mongodb').ObjectID;


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
app.use(bodyParser.json({
	limit: '50mb'
}));
app.use(bodyParser.urlencoded({
	extended : true,
	limit: '50mb'
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
	  callbackURL: config.facebook.callbackURL,
	  profileFields: ['id', 'displayName', 'photos', 'email','name']
  },function(token, refreshToken, profile, done) {
          userModel.findOne({email:profile.emails[0].value}, function(err, user) {
              if (err) {
            	  console.debug("err"+err);
            	  console.log(err);
            	  console.error(err);
                  return done(err);
              }
              if (user) {
            	  console.log("User exists in application");
            	  console.log(user);
                  return done(null, user); // If user found then return the same user.
              } else {
                  // if there is no user found in the application with that facebook user-id then create them.
                  var newUser = new userModel();
                  // Set all of the facebook information in application user model.        
                  newUser.firstName  = profile.name.givenName;
                  newUser.lastName = profile.name.familyName; 
                  newUser.email = profile.emails[0].value;
                  newUser.role = "user";
                  newUser.activeIn = "Y";
                  newUser.subscriber = "No";
                  newUser.authType = "facebook";
                  newUser.accessToken = token;
                  console.log("Before saving user info");
                  // save our user to the database
                  newUser.save(function(err) {
                      if (err)
                          throw err;
                      	return done(null, user);
                  });
              }
          });
  }));

//Google Social Login
passPort.use(new GoogleStrategy({
	  clientID: config.google.clientID,
	  clientSecret: config.google.clientSecret,
	  callbackURL: config.google.returnURL
	  },
	  function(request, accessToken, refreshToken, profile, done) {
	    userModel.findOne({email: profile.email }, function(err, user) {
	      if(err) {
	        console.log(err);  // handle errors!
	      }
	      if (!err && user !== null) {
	        done(null, user);
	      } else {
	        var user = new userModel();
              	// set all of the facebook information in our user model
              	//newUser._id  = profile.id;                
              	user.firstName  = profile.name.givenName;
              	user.lastName = profile.name.familyName; 
              	user.email = profile.emails[0].value;
              	user.role = "user";
              	user.activeIn = "Y";
              	user.subscriber = "No";
              	user.authType = "google";
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
	  scope: config.linkedin.scope,
	  state: true
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
              newUser.authType = "linkedin";
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

app.get('/auth/facebook', passPort.authenticate('facebook',{ scope : 'email' }), function(req, res, next){
	var user = req.user;
	res.json(user);
});

app.get('/auth/facebook/callback',
	passPort.authenticate('facebook', { failureRedirect: '/' , successRedirect : '/home', scope: 'email' }),function(req, res, next) {
	var user = req.user;
	res.json(user);
});

app.get('/auth/google',
		  passPort.authenticate('google', { scope: [
		    'https://www.googleapis.com/auth/plus.login',
		    'https://www.googleapis.com/auth/plus.profile.emails.read'
		  ] }),function(req, res) {
		    	var user = req.user;
		    	res.json(user);
});

app.get('/auth/google/callback',
		  passPort.authenticate('google', { failureRedirect: '/', successRedirect : '/home' }),
		  function(req, res) {
		    var user = req.user;
		    res.json(user);
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

app.post('/uploadStream', function(req, res) {
	console.log("uploading stream to MongoDB");
	MongoClient.connect(mongodbUrl, function(err, db) {
		  var gridStore = new GridStore(db, new ObjectID(),req.user.firstName+"_"+req.body.name, "w",{
			  "content_type": "video/webm",
			  "metadata":{
			      "author": req.user.lastName
			  }
			  });
		  gridStore.open(function(err, gridStore) {
			var stream = gridStore.stream(true);
		    gridStore.write(req.body.contents, function(err, gridStore) {
		      gridStore.close(function(err, result) {
		      });
		      stream.on("end", function(err) {
		    	  db.close();
		      });
		   });
		  });
		  console.log("Finished stream upload to MongoDB");
		});
	res.sendStatus(200);
});

app.post('/uploadVideo', function(req, res) {
	var fileRootName = req.body.name.split('.').shift(),
    fileExtension = req.body.name.split('.').pop(),
    filePathBase = './upload' + '/',
    fileRootNameWithBase = filePathBase + fileRootName,
    filePath = fileRootNameWithBase + '.' + fileExtension,
    fileID = 2,
    fileBuffer;
    req.body.contents = req.body.contents.split(',').pop();
    
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    fileBuffer = new Buffer(req.body.contents, "base64");
    fs.writeFileSync(filePath, fileBuffer);
    res.sendStatus(200);
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

app.post('/getVideos', function(req, res) {
	MongoClient.connect(mongodbUrl, function(err, db) {
		db.collection('fs.files')
		  .find()
		  .toArray(function(err, files) {
		    if (err) throw err;
		    files.forEach(function(file) {
		      console.log(file);
		    });
		    res.send(files);
		  });
   });
});

app.post('/viewStream', function(req, res) {
	console.log("Getting stream from MongoDB");
	MongoClient.connect(mongodbUrl, function(err, db) {
		  var gridStore = new GridStore(db, req.body.name,"r");
		  gridStore.open(function(err, gridStore) {
			var stream = gridStore.stream(true);
		    gridStore.read(function(err, dataURL) {
		    	res.send(dataURL);
		   });
		   stream.on("end", function(err) {
		       db.close();
		   });
		  });
		  console.log("Finished stream retrieval from MongoDB");
		});
});

app.post('/delStream', function(req, res) {
	console.log("Started removing selected stream from MongoDB");
	MongoClient.connect(mongodbUrl, function(err, db) {
		  var gridStore = new GridStore(db, req.body.name,"w");
		  gridStore.open(function(err, gridStore) {
			  var stream = gridStore.stream(true);
			  gridStore.unlink(db, req.body.name, function(err, gridStore) {
				  stream.on("end", function(err) {
				       db.close();
				   });
				});
		  });
		  console.log("Successfully removed stream from MongoDB.");
		});
		res.sendStatus(200);
});

//Added for User Profile Update functionality.
app.post('/updateProfile', function(req, res) {
	userModel.findOne({
		email : req.body.email
	}, function(err, result) {
		if (result && result.email) {
			userModel.update({
				email : req.body.email
			}, {
				firstName : req.body.firstName,
				lastName : req.body.lastName,
				address1 : req.body.address1,
				address2 : req.body.address2,
				city : req.body.city,
				state : req.body.state,
				zipcode : req.body.zipcode,
				birthDate : req.body.birthDate
			}, false, function(err, num) {
				if (num.ok = 1) {
					console.log('success');
					res.send('success')
				} else {
					console.log('error');
					res.send('error')
				}
			})
		}
	})
});

//Added for Forgot Password functionality.
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

//Change user password for local authenticated users.
app.post('/changePasswd', function (req, res) {
	userModel.find({email:req.body.email, password:encrypt(req.body.oldPassword)}, function (err, result) {
        if (result && result.length != 0) {
            userModel.update({email:req.body.email},{$set:{password:encrypt(req.body.password2)}},false,function (err, num){
                if (num.ok == 1){
                	console.log('success');
                	//sendMail(null,'changePassword',decrypt(req.body.password2));
                	//send email after successful registration.
    				var smtpTransport = mailer.createTransport(emailTransport, {
    					service : "Gmail",
    					auth : {
    						user : serviceUser,
    						pass : servicePasswd
    					}
    				});
    				var data = {
    			            password: req.body.password2,
    			            name: result.firstName,
    			            url: "http://"+req.headers.host+"/login"
    			            
    				}
    				var mail = {
    					from : emailFrom,
    					to : req.body.email,
    					subject : emailChangePwdSubject,
    					html: renderTemplate(chgPwdTemplate,data)
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
                    res.send('success')
                } else {
                	console.log('error');
                    res.send('error')
                }
            })
        } else {
            res.send('incorrect')
        }
    })
});

app.all('/*', function(req, res, next) {
	// Just send the index.html for other files to support HTML5Mode
	res.sendFile('index.html', {
		root : __dirname + "/views"
	});
});

app.listen(process.env.PORT || 1337,function() {
	console.log('http://127.0.0.1:' + port + '/');
});