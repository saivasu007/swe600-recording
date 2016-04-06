var app = angular.module('recordApp', ['ngRoute', 'highcharts-ng','toggle-switch','timer','ui.bootstrap']);

app.controller('DatepickerCtrl', function ($scope) {
	  	  $scope.today = function() {
		    $scope.dt = new Date();
		  };
		  $scope.today();

		  $scope.clear = function () {
		    $scope.dt = null;
		  };

		  // Disable weekend selection
		  $scope.disabled = function(date, mode) {
		    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
		  };

		  $scope.toggleMin = function() {
		    $scope.minDate = new Date(1947, 5, 22);
		  };
		  $scope.toggleMin();
		  $scope.maxDate = new Date(2050, 5, 22);

		  $scope.open = function($event) {
		    $scope.status.opened = true;
		  };

		  $scope.setDate = function(year, month, day) {
		    $scope.dt = new Date(year, month, day);
		  };

		  $scope.dateOptions = {
		    formatYear: 'yy',
		    startingDay: 1
		  };

		  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy','mm/dd/yyyy', 'shortDate'];
		  $scope.format = $scope.formats[0];

		  $scope.status = {
		    opened: false
		  };
		  
		  var tomorrow = new Date();
		  tomorrow.setDate(tomorrow.getDate() + 1);
		  var afterTomorrow = new Date();
		  afterTomorrow.setDate(tomorrow.getDate() + 2);
		  $scope.events =
		    [
		      {
		        date: tomorrow,
		        status: 'full'
		      },
		      {
		        date: afterTomorrow,
		        status: 'partially'
		      }
		    ];

		  $scope.getDayClass = function(date, mode) {
		    if (mode === 'day') {
		      var dayToCheck = new Date(date).setHours(0,0,0,0);

		      for (var i=0;i<$scope.events.length;i++){
		        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

		        if (dayToCheck === currentDay) {
		          return $scope.events[i].status;
		        }
		      }
		    }

		    return '';
		  };
});

app.controller('indexCtrl', function($scope, ObserverService, $location, $anchorScroll) {
	$scope.gototop = function() {
		$location.hash('top');
		$anchorScroll();
	};
	$scope.$on('timer-stopped', function () {
		console.log('notify');
		ObserverService.notify('timeUp','timer');
	});
});

app.controller('registerCtrl', function($scope, $location, $rootScope, $http) {
	$scope.error = false;
	$scope.checkEmail = false;
	//Added by Srinivas Thungathurti for ASQ Upgrade 2.0.
	$scope.passwordErr = false;
    $scope.usernameErr = false;
    $scope.passwordShort = false;
	$scope.states = [
	                 {
	                     "name": "Alabama",
	                     "abbreviation": "AL"
	                 },
	                 {
	                     "name": "Alaska",
	                     "abbreviation": "AK"
	                 },
	                 {
	                     "name": "Arizona",
	                     "abbreviation": "AZ"
	                 },
	                 {
	                     "name": "Arkansas",
	                     "abbreviation": "AR"
	                 },
	                 {
	                     "name": "California",
	                     "abbreviation": "CA"
	                 },
	                 {
	                     "name": "Colorado",
	                     "abbreviation": "CO"
	                 },
	                 {
	                     "name": "Connecticut",
	                     "abbreviation": "CT"
	                 },
	                 {
	                     "name": "Delaware",
	                     "abbreviation": "DE"
	                 },
	                 {
	                     "name": "District Of Columbia",
	                     "abbreviation": "DC"
	                 },
	                 {
	                     "name": "Florida",
	                     "abbreviation": "FL"
	                 },
	                 {
	                     "name": "Georgia",
	                     "abbreviation": "GA"
	                 },
	                 {
	                     "name": "Hawaii",
	                     "abbreviation": "HI"
	                 },
	                 {
	                     "name": "Idaho",
	                     "abbreviation": "ID"
	                 },
	                 {
	                     "name": "Illinois",
	                     "abbreviation": "IL"
	                 },
	                 {
	                     "name": "Indiana",
	                     "abbreviation": "IN"
	                 },
	                 {
	                     "name": "Iowa",
	                     "abbreviation": "IA"
	                 },
	                 {
	                     "name": "Kansas",
	                     "abbreviation": "KS"
	                 },
	                 {
	                     "name": "Kentucky",
	                     "abbreviation": "KY"
	                 },
	                 {
	                     "name": "Louisiana",
	                     "abbreviation": "LA"
	                 },
	                 {
	                     "name": "Maine",
	                     "abbreviation": "ME"
	                 },
	                 {
	                     "name": "Maryland",
	                     "abbreviation": "MD"
	                 },
	                 {
	                     "name": "Massachusetts",
	                     "abbreviation": "MA"
	                 },
	                 {
	                     "name": "Michigan",
	                     "abbreviation": "MI"
	                 },
	                 {
	                     "name": "Minnesota",
	                     "abbreviation": "MN"
	                 },
	                 {
	                     "name": "Mississippi",
	                     "abbreviation": "MS"
	                 },
	                 {
	                     "name": "Missouri",
	                     "abbreviation": "MO"
	                 },
	                 {
	                     "name": "Montana",
	                     "abbreviation": "MT"
	                 },
	                 {
	                     "name": "Nebraska",
	                     "abbreviation": "NE"
	                 },
	                 {
	                     "name": "Nevada",
	                     "abbreviation": "NV"
	                 },
	                 {
	                     "name": "New Hampshire",
	                     "abbreviation": "NH"
	                 },
	                 {
	                     "name": "New Jersey",
	                     "abbreviation": "NJ"
	                 },
	                 {
	                     "name": "New Mexico",
	                     "abbreviation": "NM"
	                 },
	                 {
	                     "name": "New York",
	                     "abbreviation": "NY"
	                 },
	                 {
	                     "name": "North Carolina",
	                     "abbreviation": "NC"
	                 },
	                 {
	                     "name": "North Dakota",
	                     "abbreviation": "ND"
	                 },
	                 {
	                     "name": "Ohio",
	                     "abbreviation": "OH"
	                 },
	                 {
	                     "name": "Oklahoma",
	                     "abbreviation": "OK"
	                 },
	                 {
	                     "name": "Oregon",
	                     "abbreviation": "OR"
	                 },
	                 {
	                     "name": "Pennsylvania",
	                     "abbreviation": "PA"
	                 },
	                 {
	                     "name": "Rhode Island",
	                     "abbreviation": "RI"
	                 },
	                 {
	                     "name": "South Carolina",
	                     "abbreviation": "SC"
	                 },
	                 {
	                     "name": "South Dakota",
	                     "abbreviation": "SD"
	                 },
	                 {
	                     "name": "Tennessee",
	                     "abbreviation": "TN"
	                 },
	                 {
	                     "name": "Texas",
	                     "abbreviation": "TX"
	                 },
	                 {
	                     "name": "Utah",
	                     "abbreviation": "UT"
	                 },
	                 {
	                     "name": "Vermont",
	                     "abbreviation": "VT"
	                 },
	                 {
	                     "name": "Virginia",
	                     "abbreviation": "VA"
	                 },
	                 {
	                     "name": "Washington",
	                     "abbreviation": "WA"
	                 },
	                 {
	                     "name": "West Virginia",
	                     "abbreviation": "WV"
	                 },
	                 {
	                     "name": "Wisconsin",
	                     "abbreviation": "WI"
	                 },
	                 {
	                     "name": "Wyoming",
	                     "abbreviation": "WY"
	                 }
	               ];

	$scope.user = {
		email:'',
		firstName:'',
		lastName:'',
		passwd1:'',
		passwd2:'',
		address1:'',
		city:'',
		state:'',
		zipcode:'',
		role:'',
		activeIn:'',
		expiryDate:'',
		subscriber:'',
		birthDate:''
		
	};

	$scope.verify = function () {

		if ($scope.user.passwd1 !== $scope.user.passwd2) {
			$scope.error = true;
			$scope.myClass = "has-error";
		}
		else {
			$scope.error = false;
			$scope.myClass = "";
		}

	};
	
	$scope.clear = function () {
        if(confirm("Are you sure to clear the form?")) { 
        	$scope.user = {}
        	$scope.selectedState = "";
        }
    };
    
    //listen to keypress on first and last name input boxes.
    $('#fName, #lName').keypress(function(key) {
        //prevent user from input non-letter chars.
        if((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90)
            && ($.inArray(key.charCode, [0, 8, 16, 20, 45, 46]))) {
            //show a tooltip to let user know why the keystroke is not working.
            $('[data-toggle="tooltip"]').tooltip('show');
            return false;
        } else {
            $('[data-toggle="tooltip"]').tooltip('hide');
        }
    });
    
    $('#zip').keypress(function(key) {
    	var re = /^(\d{5}-\d{4}|\d{5})$/;
    	if(((key.charCode < 48 && key.charCode != 45) || key.charCode > 57) && ($.inArray(key.charCode, [0, 8, 16, 20, 46]))) {
	            //show a tooltip to let user know why the keystroke is not working.
	    		$('[data-toggle="tooltip2"]').tooltip('show');
	            return false;
	    } else {
	        	$('[data-toggle="tooltip2"]').tooltip('hide');
	        	if($scope.user.zipcode != "") {
	        		$scope.zipCodeErr = !re.test($scope.user.zipcode);
	        	} else {
	        		$scope.zipCodeErr = false;
	        	}
	    }
    });
    
    $('#city').keypress(function(key) {
        //prevent user from input non-letter chars.
        if(((key.charCode < 97 && key.charCode != 32) || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90)
            && ($.inArray(key.charCode, [0, 8, 16, 20, 45, 46]))) {
            //show a tooltip to let user know why the keystroke is not working.
            $('[data-toggle="tooltip3"]').tooltip('show');
            return false;
        } else {
            $('[data-toggle="tooltip3"]').tooltip('hide');
        }
    });
    
    //regex to test the email pattern, gets invoked after the blur event of email input.
    $scope.testUsername = function () {
        var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if($scope.user.email != "") {
           $scope.usernameErr = !re.test($scope.user.email);
        } else {
           $scope.usernameErr = false;
        }
    };
    
    $scope.testBirthDate = function () {
        var re = /^(0?[1-9]|1[012])[\/](0?[1-9]|[12][0-9]|3[01])[\/]\d{4}$/;
        $scope.birthDateErr = !re.test($scope.user.birthDate);
        console.log($scope.user.birthDate);
    };

    //test on the length of first password.
    $scope.testPassword = function () {
        $scope.passwordShort = $scope.user.passwd1.length <= 5
    };

    //test if both passwords match.
    $scope.testPassword2 = function () {
        $scope.passwordErr = ($scope.user.passwd1 != $scope.user.passwd2);
    };

	$scope.test = function(obj) {
		var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		if(re.test(obj)) {
			$scope.checkEmail = false;
			$scope.error = false;
		}
		else {
			$scope.checkEmail = true;
			$scope.error = true;
		}
	};

	$scope.register = function (user){
		
		var currentDate = new moment();
		var expDate = moment(currentDate.add(3,'months')).format('MM/DD/YYYY');
		
		if ($scope.user.email == "" || $scope.user.firstName == "" || $scope.user.lastName == "" || $scope.user.passwd1 == "" || $scope.user.passwd2 == "" || $scope.user.address1 == "" || $scope.user.city == "" || $scope.user.state.name == "" || $scope.user.zipcode == "" || $scope.user.birthDate == "" || $scope.user.birthDate == undefined) {
			alert("We need your complete personal information! Please fill in all the blanks.");
		}
		else {
			$scope.user.state = $scope.user.state.name;
			$scope.user.password = $scope.user.passwd1;
			$scope.user.expiryDate = expDate;
			$scope.user.role = "user";
			$scope.user.activeIn = "Y";
			$scope.user.subscriber = "No";
			$scope.user.state = $scope.selectedState;
			$scope.user.birthDate = moment($scope.user.birthDate).format('MM/DD/YYYY');
			$scope.user.authType = "local";

			$http.post('/register', user).success(function (response) {
				if (response != "0") {
					alert("Success! Please login with your registered email \"" + user.email + "\" and password you created.");
					$rootScope.currentUser = response;					
					$location.path('/login');
				} else {
					alert("Sorry, the account \"" + user.email + "\" has already been registered! Please create a new one.")
				}
			})
		}
	};
});

app.controller('loginCtrl', function ($scope, $rootScope, $http, $routeParams, $location) {
	$scope.login = function (user){
		$http.post('/login', user).success(function (response){
			console.log(response);
			$rootScope.currentUser = response;
			$location.url('/home');
		}).error(function (err) {
			if(err == "Unauthorized") {
				alert("Email or password does not match! Please login again.");
			} else if(err != "Bad Request") {
				alert("User account expired in SWE-600 Portal."+"\n"+"      	    Please contact administrator.");
			} else {
				alert("Please enter Username or Password.");
			}
		})
	};
	
	//Test on the length of first password.
    $scope.testPasswordLen = function () {
        $scope.passwordShort = $scope.user.password1.length <= 5
    };
    
	//Test if both passwords match.
    $scope.testPassword = function () {
    	if($scope.user.password2 != "") {
           $scope.passwordErr = ($scope.user.password1 != $scope.user.password2);
    	}
    };
    
    //Validate the email entered is valid.
    $scope.testLoginName = function () {
        var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if($scope.user.email != "") {
           $scope.loginEmailErr = !re.test($scope.user.email);
        } else {
           $scope.loginEmailErr = false;
        }
    };

    //test on the length of the password entered.
    $scope.testPassword = function () {
        $scope.passwordShort = $scope.user.password.length <= 5
    };
    
    if($scope.email == undefined) $scope.disable = true;

	$scope.testEmail = function() {
		var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if($scope.email == undefined || $scope.email == "") {
			$scope.emailErr = false;
			$scope.disable = true;
		}
		else {
			$scope.emailErr = !re.test($scope.email);
			if($scope.emailErr == true) $scope.disable = true;
			else $scope.disable = false;
		}
	};
	
	$scope.forgot = function (emailID){
		var postData = {
			email: emailID
		}
		$http.post('/forgot', postData).success(function (response){
			console.log(response);
			alert("Please check the registered email for instructions.");
			$location.url('/login');
		}).error(function (err) {
			if(err = "NotFound" ) {
				alert("Email ID not registered in the Portal.");
			}
		})
	};
	
	$scope.pwReset = function (user){
		var postData = {
				password: user.password1,
				token: $routeParams.token
		}
		$http.post('/reset', postData).success(function (response){
			console.log(response);
			alert("Password Updated Successfully.");
			$location.url('/login');
		}).error(function (err) {
			if(err) {
				alert("Error while updating password.Please try again!.");
			}
		})
	};

	$scope.pressEnter = function (e,user) {
		if (e.keyCode == 13){
			$scope.login(user);
		}
	};
});

app.controller('homeCtrl', function ($q, $scope, $rootScope, $http, $location, $interval) {

	$rootScope.wrong = 0;
	$rootScope.report = {type:'',wrong:[]};
	$scope.disableStop = true;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	var videoRecorder;
    var audioRecorder;
    var videoElement = document.querySelector('video');
    var isRecordOnlyAudio = !!navigator.mozGetUserMedia;
    var recordRTC;
	var video = document.querySelector('video');
	//var preview = document.getElementById('videoPreview');
	$('#preview').hide();
	$('#btn-save-disk').hide();
    $('#btn-open-new').hide();
	
    $scope.random = function getRandomStr() {
        if (window.crypto) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
        }
    }
	
	$scope.initRecorder = function () {
		//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		if (navigator.getUserMedia) {
			navigator.getUserMedia({ audio: true, video: { width: 600, height: 450 } },
			function(stream) {
			var video = document.querySelector('video');
			video.src = window.URL.createObjectURL(stream);
			video.onloadedmetadata = function(e) {
			video.play();
			};
			},
			function(err) {
			console.log("The following error occurred: " + err.name);
			}
			);
		} else {
			console.log("getUserMedia not supported");
		}
	}
	
	$scope.record = function () {
        $scope.disable = true;
        $scope.disableStop = false;
        $('#btn-save-disk').hide();
        $('#btn-open-new').hide();
        
        if (navigator.getUserMedia) {
			navigator.getUserMedia({ audio: true, video: { width: 600, height: 450 } },
			function(stream) {
			video = document.querySelector('video');
			video.src = window.URL.createObjectURL(stream);
			video.onloadedmetadata = function(e) {
				video.play();
			};
			recordRTC = RecordRTC(stream,{type:"video",mimeType: 'video/webm'});
			recordRTC.initRecorder();
		    recordRTC.startRecording();
			},
			function(err) {
			alert("error "+err);
			console.log("The following error occurred: " + err.name);
			}
			);
		} else {
			console.log("getUserMedia not supported");
		}
       
	};
	
	$scope.stopRecord = function () {
		$scope.disable = false;
        $scope.disableStop = true;
        recordRTC.stopRecording(function (audioVideoWebMURL) {
        	//$('#preview').show();
        	//preview.src = audioVideoWebMURL;
        	video.src = audioVideoWebMURL;
            var recordedBlob = recordRTC.getBlob();
            var reader = new FileReader();
            reader.readAsArrayBuffer(recordedBlob);
            var buffer;
            var filename;
            reader.onload = function(event) {
                buffer = event.target.result;
                alert(buffer.byteLength);
            };
            $('#btn-save-disk').show();
            $('#btn-open-new').show();
            recordRTC.getDataURL(function(dataURL) {
            	fileName = $scope.random();
        		var files = {
                        name: fileName + '.webm',
                        type: 'video/webm',
                        contents: dataURL
                };
                
        		$http.post('/uploadStream',files).success(function (response) {
        			alert("Upload to MongoDB success.");
        		}).error(function (err) {
        			if(err) {
        				alert("Error while uploading to MongoDB and Please try again!.");
        			}
        		})
        		
                $http.post('/uploadVideo',files).success(function (response) {
        			$location.url('/record');
        		}).error(function (err) {
        			if(err) {
        				alert("Error while uploading file to server and Please try again!.");
        			}
        		})
            	//uploadFile(dataURL);
            	/*
            	var postData = {
        				email: $rootScope.currentUser.email,
        				media: recordedBlob,
        				contentType: "video/webm",
        				tempURL: ""
        		}
            	$http.post('/uploadVideo', postData).success(function (response) {
    				if (response != "0") {
    					alert("Success! Video uploaded to MongoDB User Database");
    					//$rootScope.currentUser = response;					
    					$location.path('/list');
    				} else {
    					alert("Sorry, There is a problem while storing video to database.")
    				}
    			})
    			*/
            });
        });
	};
	
	var fileName;
	function uploadFile(videoDataURL) {
		fileName = $scope.random();
		var files = {
                name: fileName + '.webm',
                type: 'video/webm',
                contents: videoDataURL
        };
        
        $http.post('/uploadVideo',files).success(function (response) {
			$location.url('/record');
			//$rootScope.currentUser = undefined;
			//$rootScope.user = undefined;
		}).error(function (err) {
			if(err) {
				alert("Error while uploading file to server and Please try again!.");
			}
		})
            
        /*
        uploadContents('/upload', JSON.stringify(files), function(_fileName) {
            var href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
            alert(href + 'upload/' + _fileName);
            //video.src = href + 'upload/' + _fileName;
            //video.play();
            /* Create the blob URL hyperlink
            var h4 = document.createElement('h4');
            h4.innerHTML = '<a href="' + video.src + '">' + video.src + '</a>';
            document.body.appendChild(h4);
            */
        /*});*/
	}
	/*
    function uploadContents(url, data, callback) {
    	alert("Upload");
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                callback(request.responseText);
            }
        };
        request.open('POST', url);
        request.send(data);
    }
    */
	
	$scope.saveDisk = function () {
		  var fileName = $scope.random();
          recordRTC.save(fileName);
	};
	
	$scope.openNew = function () {
		window.open(recordRTC.toURL());
	};

	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
			$rootScope.user = undefined;
		})
	};
});

app.controller('videoCtrl', function ($scope, $http, $location, $rootScope){
	$scope.currentPage = 1;
	$scope.numPerPage = 10;
	$scope.maxSize = 5;
	var begin = (($scope.currentPage - 1) * $scope.numPerPage)
    , end = begin + $scope.numPerPage;
	
	$scope.$watch('currentPage + numPerPage', function() {
	    begin = (($scope.currentPage - 1) * $scope.numPerPage);
	    end = begin + $scope.numPerPage;
	    $scope.partialQuestions = $scope.allQuestions.slice(begin, end);
	});
	
	$scope.listVideos = function (currentUser){
		$scope.searchCat = currentUser.searchCat;
		$scope.count = 20;
		$scope.partialVideos = [];
		$scope.allVideos = [];
		if(currentUser.searchCat == undefined) {
			$scope.searchCat = $rootScope.searchCat;
		}
		var postData = { 
			category : $scope.searchCat,
			count : $scope.count
		};
		$http.post('/getVideos',postData).success(function (response){
			$scope.videosList = response;
			for(i=0;i<=$scope.videosList.length-1;i++) {
				$scope.allVideos.push($scope.videosList[i]);
			}
			$scope.partialVideos = $scope.allVideos.slice(begin, end);			
			$location.url('/list');
		}).error(function (err) {
			alert("Error!");
			console.log(err);
		})
	};
	
    $scope.logout = function () {
        $http.post('/logout',$rootScope.user).success(function () {
            $location.url('/');
            $rootScope.currentUser = undefined;
            $rootScope.user = undefined;
        })
    }
});

app.controller('aboutCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
			$rootScope.user = undefined;
		})
	};

	function getStyle(obj, name) {
		if(obj.currentStyle) {
			return obj.currentStyle[name];
		}
		else {
			return getComputedStyle(obj, false)[name];
		}
	}

	function startMove(obj, json, fnEnd) {
		clearInterval(obj.timer);
		obj.timer=setInterval(function() {
			var bStop=true;

			for(var attr in json) {
				var cur=0;
				if(attr=="opacity") {
					cur=Math.round(parseFloat(getStyle(obj, attr))*100);
				}
				else {
					cur=parseInt(getStyle(obj, attr));
				}

				var speed=(json[attr]-cur)/8;
				speed=speed>0?Math.ceil(speed):Math.floor(speed);

				if(cur!=json[attr])
					bStop=false;

				if(attr=="opacity") {
					obj.style.filter="alpha(opacity:" + (cur+speed) + ")";
					obj.style.opacity=(cur+speed)/100;
				}
				else {
					obj.style[attr]=cur+speed+"px";
				}
			}

			if(bStop) {
				clearInterval(obj.timer);
				if(fnEnd) fnEnd();
			}
		}, 30)
	}
});

app.controller('changePwdCtrl', function ($q,$scope, $rootScope, $http, $location) {
	
	$scope.currentUser.oldPassword = "";
	$scope.currentUser.password2 = "";
	$scope.firstName = $rootScope.currentUser.firstName;
	$scope.lastName = $rootScope.currentUser.lastName;
	
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
			$rootScope.user = undefined;
		})
	};
	
	$scope.pwSave = function (currentUser) {
        var postData = {
            email: $rootScope.currentUser.email,
            oldPassword: currentUser.oldPassword,
            password2: currentUser.password2
        };
        
        $http.post('/changePasswd', postData).success(function (response) {
            if (response == 'success'){
                alert ('Password Updated Successfully!');
                $scope.currentUser=response;
                alert("Please connect the appliation using New Password.");
                $scope.logout();
            } else if (response == 'incorrect') {
                alert ('Old Password is not correct!');
                $scope.currentUser={};
                $location.url('/changePassword')
            } else if (response == 'error'){
                alert ('Error!')
                $scope.currentUser={};
            }
        })
    };
    
    $scope.wrong = false;
	$scope.errorClass = "";
	$scope.checkPasswd = function () {

		if ($scope.currentUser.password1 !== $scope.currentUser.password2) {
			$scope.wrong = true;
			$scope.passwdErr = true;
		}
		else {
			$scope.wrong = false;
			$scope.passwdErr = false;
		}

	};
	
	//test on the length of first password.
    $scope.testPass = function () {
        $scope.passwordSh = $scope.currentUser.password1.length <= 5
    };
});

app.controller('navCtrl', function ($scope, $http, $location, $rootScope){
    $scope.logout = function () {
        $http.post('/logout',$rootScope.user).success(function () {
            $location.url('/');
            $rootScope.currentUser = undefined;
            $rootScope.user = undefined;
        })
    }
});

app.config(function ($routeProvider, $httpProvider, $locationProvider) {
	var checkLoggedIn = function ($q, $timeout, $http, $location, $rootScope) {
		var deferred = $q.defer();
		$http.get('/loggedin').success(function (user) {
			$rootScope.errorMessage = null;
			if (user !== 0){
				$rootScope.currentUser =  user;
				$rootScope.currentUser.passwd1 = "";
				$rootScope.isLoggedIn = (user != 0);
				deferred.resolve();
			} else {
				$rootScope.errorMessage = "You are not login yet.";
				deferred.reject();
				$location.url('/login');
				$rootScope.isLoggedIn = (user != 0);
			}
		})
	};
	$locationProvider.html5Mode(true);
	$routeProvider.
		when('/', {
			templateUrl: 'partials/login.html',
			controller: 'loginCtrl'
		}).
		when('/login', {
			templateUrl: 'partials/login.html',
			controller: 'loginCtrl'
		}).
		when('/forgetPasswd', {
			templateUrl: 'partials/forgetPassword.html',
			controller: 'loginCtrl'
		}).
		when('/reset',{
			templateUrl : 'partials/resetPassword.html',
			controller : 'loginCtrl'
		}).when('/changePassword', {
			templateUrl: 'partials/changePassword.html',
			controller: 'changePwdCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'homeCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/about', {
			templateUrl: 'partials/about.html',
			controller: 'aboutCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/register', {
			templateUrl: 'partials/register.html',
			controller: 'registerCtrl'
		}).
		when('/record', {
			templateUrl: 'partials/record.html',
			controller: 'homeCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/list', {
			templateUrl: 'partials/videos.html',
			controller: 'homeCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/404', {
			templateUrl: 'partials/404.html'
		}).
		otherwise({
			redirectTo: '/'
		});
});