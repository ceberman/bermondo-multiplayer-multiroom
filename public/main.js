// ceb placing these into global scope
// ... appears to work for switchroom,
//     but haven't put the time into making this more consistent

var socket;
function switchRoom(room){
  socket.emit('switchRoom', room);
}

// --------------start of onload-------------------------
$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login-div'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // added by ceb
  var $contentPageDiv = $('.all-other-content');
  var $bandChatterDiv = $('.band-chatter-div');
  $contentPageDiv.hide();
  $(".dropdown-toggle").hide();

  var welcomeMessage = "Welcome to Your Music Video";


  var allMenus;

  // ceb  up event handling

  // for buttons may not need this!
  $('#tonicButton').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    console.log ("tonicButton click");
    });


  // for HTML select objects (not sure if the best)
  var menuItemVal = '';
  var menuName = '';
  var ccToggle=0;
  $('select').click(function () {
        ccToggle++;
        if (ccToggle==2) {
                    $(this).change();
                    ccToggle = 0;
        }

    })
  .change(function () {
          menuItemVal = $(this).val();
          menuName = this.id;            // not sure this is the right way
          setServerMenuItem(menuName, menuItemVal);
          ccToggle = 0;
  });





  // end of ceb adds


  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  socket = io();

  //added by ceb
  function getMenu(menuName) { return allMenus[menuName] }

  function setServerMenuItem (menuName, menuItem) {
    var majorMenuSubMenu;
    var message = "";

    majorMenuSubMenu = getMenu(menuName);
    message = '{RemoteMenu,' + menuName + "," + menuItem + '}';
    addChatMessage({
                     username: username,
                     message: message
                     });

    socket.emit('RemoteMenu', {
                          menuName: menuName,
                          menuItem: menuItem,
                          arg1: "",
                          arg2: "",
                          arg3: "",
                          arg4: "",
                          arg5: ""
                    });
    checkMenuForPlayerPosition(menuName);
  }

  function checkMenuForPlayerPosition(menuName) {
    if ((menuName === "Drum Preset") || (menuName === "Kit Type")) {
        sendPlayerPosition(1.35, 2.5, 14.5, 0.0, 175.0, 0.0);
    } else if (menuName === "Bass Pattern") {
        sendPlayerPosition(4.1, 2.6, 14, 0.0, 0.0, 0.0);
    } else if (menuName === "Piano") {
        sendPlayerPosition(7.0, 2.6, 12.0, 0.0, 145.0, 0.0);
    } else if (menuName === "Tonic") {
        sendPlayerPosition(-7, 3.5, 5.5, 0.0, 60.0, 0.0);
    } else if (menuName === "Scale") {
        sendPlayerPosition(-8.5, 3.6, 11.2, 0.0, 0.0, 0.0);


    } else if (menuName === "SynthTonal") {
      sendPlayerPosition(0.6, 1.5, 10.5, 22.0, -171.0, -20.0);
    } else if (menuName === "SynthRhythm") {
      sendPlayerPosition(0.6, 1.5, 10.5, 22.0, -171.0, -20.0);
    } else if (menuName === "SynthUpDown") {
      sendPlayerPosition(0.6, 1.5, 10.5, 22.0, -171.0, -20.0);
    } else if (menuName === "SynthOctave") {
      sendPlayerPosition(0.6, 1.5, 10.5, 22.0, -171.0, -20.0);


    } else if (menuName === "Video OffOn") {
      sendPlayerPosition(3.0, 3.8, -12.0, 0.0, 0.0, 0.0);
    } else if (menuName === "Video Clip") {
      sendPlayerPosition(3.0, 3.8, -12.0, 0.0, 0.0, 0.0);
    } else if (menuName === "DancerOffOn") {
      sendPlayerPosition(3.0, 3.8, -12.0, 0.0, 0.0, 0.0);
    } else if (menuName === "Dancer Size") {
      sendPlayerPosition(3.0, 3.8, -12.0, 0.0, 0.0, 0.0);
    }

  }

    function sendPlayerPosition (posX, posY, posZ, rotX, rotY, rotZ) {
       socket.emit('Player Position' , {
                          playerName: '',
                          positionX: posX,
                          positionY: posY,
                          positionZ: posZ,
                          rotationX: rotX,
                          rotationY: rotY,
                          rotationZ: rotZ
                    });
    }

  function createMenusAndSubMenus () {
      var
      i=0,
      subName,
      optionMenuOrDiv,
      majorMenuName,
      majorMenuSubMenu;

      for (var name in allMenus) {
          if (allMenus.hasOwnProperty(name)) {
              majorMenuName = name ;
//             console.log ("majorMenuName: " + majorMenuName);
              majorMenuSubMenu = getMenu(name);
              optionMenuOrDiv = document.getElementById(majorMenuName);
              if (optionMenuOrDiv != null) {
                  for (i= 0; i < majorMenuSubMenu.length; i++ ) {
                      subName = majorMenuSubMenu[i];
//                      console.log ("subName: " + subName);
                      createRadioButton(majorMenuName, optionMenuOrDiv, subName);

                  }
              }
          }
      }
  }

  function createSubMenu(docElement, subName){
      var menuItem = document.createElement('option');
      menuItem.setAttribute('value', subName);
      menuItem.appendChild(document.createTextNode(subName));
      docElement.appendChild(menuItem);

  }

  $('#radiobutton').on('click', function(event) {
           var thisType = $(this).attr('type');
   });

  function createRadioButton(majorMenuName, parentDocElement, subName) {
        var buttonName;
        var subDiv = document.createElement('div');
        var label = document.createElement('label');

        subDiv.setAttribute('class', 'radio');
        parentDocElement.appendChild(subDiv);
        subDiv.appendChild(label);
        var radioButton = document.createElement('input');

        buttonName = majorMenuName + '-' + subName;
        radioButton.setAttribute('type', 'radio');
        radioButton.setAttribute('name', majorMenuName);
        radioButton.setAttribute('id', buttonName);
        radioButton.setAttribute('value', subName);
        radioButton.addEventListener('click',
            function() {
             var thisType = $(this).attr('type');
                // better be of type 'radio'
                 if (thisType != 'radio') {
                     console.log("bad event on type" + thisType)
                 } else { // ok!!
                      setServerMenuItem(this.name, this.value)
                 }

        });

        label.appendChild(radioButton);
        label.appendChild(document.createTextNode(subName));

  }



  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }


  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();

      $chatPage.show(); //changed by ceb

      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds an arbitrary string to the message list
  function addArbitraryMessage (unameFromMessage, arbitraryString) {

    addChatMessage({
      username: unameFromMessage,
      message: arbitraryString
    });
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }



  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = welcomeMessage;
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  socket.on('set menus', function (data) {
    allMenus = data;
    createMenusAndSubMenus();

    // added by ceb
    $chatPage.show(); //changed by ceb, not working
    $('.dropdown-toggle').fadeIn();
    $contentPageDiv.fadeIn();
    $bandChatterDiv.fadeIn();


  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  socket.on('RemoteMenu', function (data) {
    // addChatMessage(data);

    var userNameFromMessage = data.username;
    var messageContents = data.message;
    var menuNameFromMessage = messageContents.menuName;
    var menuItemFromMessage = messageContents.menuItem;
    var messageString = menuNameFromMessage + ': ' + menuItemFromMessage;
    addArbitraryMessage(userNameFromMessage, messageString);

  });

  socket.on('Player Position', function (data) {
    addChatMessage(data);
  });


  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  // for multiroom
  // listener, whenever the server emits 'updaterooms', this updates the room the client is in
	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});
    // ceb
    $('#currentRoom').empty();
    $('#currentRoom').append('Current room: ');
    $('#currentRoom').append(current_room);
	});



});
