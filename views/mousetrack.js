

	var userId;
    var sendTries = 0;

	//
	// Mouse Tracking
	//

	var locationArray = [];
    var unsentLocationPackets = 0;
    var unsuccessfulLocationPackets = 0;

    //
    // Scroll Tracking
    //
    var scrollArray = [];
    var unsentScrollPackets = 0;
    var unsuccessfulScrollPackets = 0;

    //
    // Click Tracking, Resize Tracking
    //
    var clickArray = [];
    var sizeArray=[];

    //
    // Tracking of the hidden form section
    //
    var hiddenQuestionEvents = [];

    //
    // Tracking of the bugged button events
    //
    var buggedRadioEvents = [];

    //
    // User ID
    //
    function createCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }

    var userId = readCookie('uid');
    if(!userId) {
        // Use the timestamp as user identifier
        createCookie('uid',Date.now());
        userId = readCookie('uid');
    }
    // Add userId to form
    var hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "uid");
    hiddenInput.setAttribute("value", userId);
    document.getElementById("mainForm").appendChild(hiddenInput);

    //
    // Mouse Tracking
    //

	window.onmousemove = handleMouseMove;
    function handleMouseMove(event) {

    	var date = new Date();
        event = event || window.event; // IE-ism

        locationArray.push(event.screenX);
        locationArray.push(event.screenY);
        locationArray.push(date.getTime());

        // Send the location array
        if(locationArray.length > locationN) {
        	locationSendAttempt(locationArray,0);

        	// Reset the array
        	locationArray = [];
        }
    }

    function locationSendAttempt(array,i,callback) {
        if(i === 0) unsentLocationPackets++;
    	var http = new XMLHttpRequest();
		http.open("POST", locationUrl, true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() { //Call a function when the state changes.
		    if(http.readyState == 4) {
		    	if(http.status != 200) { //unsuccessful

		    		// wait a few seconds and try again
		    		if(i <= locationMaxAttempts) {
		    			setTimeout(function() { locationSendAttempt(array, i + 1); }, 5000);
		    		} else {
                        unsuccessfulLocationPackets++;
                    }
		    	} else {
                    unsentLocationPackets--;
                    if(callback !== undefined) callback();
                }
		    }
		}
		http.send("uid=" + userId + "&log=" + encodeURIComponent(JSON.stringify(array)));
    }


    //
	// Scroll Tracking
	//

    window.onscroll = handleScroll;
    function handleScroll(event) {

    	var date = new Date();
    	var pageY = window.pageYOffset || document.documentElement.scrollTop || document.getElementsByTagName("body")[0].scrollTop || 0;

    	scrollArray.push(pageY);
        scrollArray.push(date.getTime());

        // Send the location array
        if(scrollArray.length > scrollN) {
        	scrollSendAttempt(scrollArray,0);

        	// Reset the array
        	scrollArray = [];
        }
    }


    function scrollSendAttempt(array,i,callback) {
        if(i === 0) unsentScrollPackets++;
    	var http = new XMLHttpRequest();
		http.open("POST", scrollUrl, true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() { //Call a function when the state changes.
		    if(http.readyState == 4) {
		    	if(http.status != 200) { //unsuccessful

		    		// wait a few seconds and try again
		    		if(i <= scrollMaxAttempts) {
		    			setTimeout(function() { scrollSendAttempt(array, i + 1); }, 5000);
		    		} else {
                        unsuccessfulScrollPackets++;
                    }
		    	} else {
                    unsentScrollPackets++;
                    if(callback !== undefined) callback();
                }
		        
		    }
		}
		http.send("uid=" + userId + "&log=" + encodeURIComponent(JSON.stringify(array)));
    }



    //
    // Click Tracking & Resize Tracking
    //
    window.onclick = handleClick;
    function handleClick(event) {

        var date = new Date();
        clickArray.push(date.getTime());
    }

    window.addEventListener("orientationchange",handleResize);
    window.addEventListener("resize",handleResize);
    function handleResize(event) {
        var date = new Date();

        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var dh = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

        sizeArray.push(date.getTime());
        sizeArray.push(w);
        sizeArray.push(h);
        sizeArray.push(dh);
    }


    //
    // Viewport and navigator data
    //
    function getUserData() {

        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var userData = {
            "userAgent": navigator.userAgent,
            "language": navigator.languages ? navigator.languages[0]: (navigator.language || navigator.userLanguage),
            "w": Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            "h": Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        }
        return userData;
    }


    //
    // Hidden question events
    //
    document.getElementById("form-hidden-questions-btn").addEventListener('click',showHiddenQuestions);
    document.getElementById("form-hidden-questions").style.display = 'none';
    
    function showHiddenQuestions(event) {
        var date = new Date();

        document.getElementById("form-hidden-questions").style.display = 'block';
        document.getElementById("form-hidden-questions-btn").removeEventListener('click',showHiddenQuestions);
        document.getElementById("form-hidden-questions-btn").addEventListener('click',hideHiddenQuestions); 
        document.getElementById('form-hidden-questions-icon').className = 'fa fa-caret-up';

        // register the event
        hiddenQuestionEvents.push({ev:'show',t:date.getTime()});
    }

    function hideHiddenQuestions(event) {
        var date = new Date();

        document.getElementById("form-hidden-questions").style.display = 'none';
        document.getElementById("form-hidden-questions-btn").removeEventListener('click',hideHiddenQuestions);
        document.getElementById("form-hidden-questions-btn").addEventListener('click',showHiddenQuestions); 
        document.getElementById('form-hidden-questions-icon').className = 'fa fa-caret-down';

        // register the event
        hiddenQuestionEvents.push({ev:'hide',t:date.getTime()});
    }


    //
    // Bugged radios
    //

    // Bug the radios
    var buggedRadioIds = [31, 14]; // -> [19,97]
    var clickedRadioIds = [];
    for(var i = 0; i < buggedRadioIds.length; i++) {
        for(var j = 0; j < 5; j++) {
            document.getElementById("p"+buggedRadioIds[i]+"-"+(j+1)).addEventListener('click',handleBuggedRadioClick);
        }
    }
    function handleBuggedRadioClick(event) {
        var date = new Date();

        var id = event.target.id.split("-")[0];
        
        if(clickedRadioIds.indexOf(id) === -1) {
            clickedRadioIds.push(id);
            buggedRadioEvents.push({id:id,t:date.getTime()});
            event.preventDefault();
            return false;
        } else {
            buggedRadioEvents.push({id:id,t:date.getTime()});
        }
    }
    
    //
    // Submit
    //
    function handleSubmit(event) {

        var date = new Date();

        // Check that the form is filled
        var radios = document.getElementById("test").getElementsByTagName('input');
        var numberChecked = 0;

        var sum = 0;
        var unanswered = [];
        for (var i = 0; i < radios.length; i++) {
            if(radios[i].type === 'radio' && radios[i].checked) {
                sum += 1;
            }
            if((i+1) % 5 == 0) {
                if(sum == 0) {
                    unanswered.push(Math.floor((i+1)/5));
                }
                sum = 0;
            }
        }
        // If a radio is not checked
        if(unanswered.length != 0) {
            alert("Please rate all the items. The following are unanswered: "+unanswered.join(", "));
            return;
        }

        // Show the spinner
        var submitBtn = document.getElementById("submit-btn");
        var spinner = document.createElement("i");
        spinner.setAttribute("class", "fa fa-cog fa-spin fa-fw");
        submitBtn.appendChild(spinner);

        // Send the location info
        if(locationArray.length > 0) {
            locationSendAttempt(locationArray,0);

            // Reset the array
            locationArray = [];
        }
        window.removeEventListener("mousemove", handleMouseMove);

        // Send the scroll info
        if(scrollArray.length > 0) {
            scrollSendAttempt(scrollArray,0);

            // Reset the array
            scrollArray = [];
        }
        window.removeEventListener("scroll", handleScroll);

        // Send the user data
        var http = new XMLHttpRequest();
        http.open("POST", userUrl, true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function() { //Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                checkAllSent();
            }
        }
        http.send(
            "uid=" + userId + 
            "&agent=" + encodeURIComponent(JSON.stringify(getUserData())) +
            "&clicks=" + encodeURIComponent(JSON.stringify(clickArray)) +
            "&sizes=" + encodeURIComponent(JSON.stringify(sizeArray)) + 
            "&hiddenqev=" + encodeURIComponent(JSON.stringify(hiddenQuestionEvents)) +
            "&buggedradioev" + encodeURIComponent(JSON.stringify(buggedRadioEvents))
        );
    }

    function checkAllSent() {
        if(sendTries > sendMaxTries || (unsentScrollPackets === 0 && unsentLocationPackets === 0)) {
            // Send the form
            document.getElementById("mainForm").submit();
        } else {
            sendTries++;
            setTimeout(checkAllSent,200);
        }
    }
