exports.run = (client, config, message, args) => {

  // Define a few function-wide variables
  var userID;
  var hourFormat;
  var guildID = message.guild.id;

  // Decide to display in 12 or 24 hour time
  if (args.length > 1) {
    hourFormat = parseInt(args[1]);

    if ( !(hourFormat === 12 || hourFormat === 24)) {
      message.channel.send('Please enter a valid time format (12 or 24)'); return
    }
  } else {
    // Select 12 by default
    hourFormat = 12;
  }

  // Check who is mentioned
  let userMentioned = false;
  let everyoneMentioned = message.mentions.everyone;
  let mentionedUsers = message.mentions.members.first();

  if (everyoneMentioned === false) {
      if (typeof mentionedUsers === 'undefined') {
      message.channel.send('Please mention a user or here'); return
      } else {
        userID = mentionedUsers.id;
        userMentioned = true;
      }
  } else {
    //message.channel.send('Here/everyone mentioned')
  }

  // Create a function to display time
  function displayTime(typeOfTime, h, m, hourFormat) {
    // typeOfTime is like 'Server', 'Unit', 'User'
    if (hourFormat === 24) {
      // Display hours in 24

      if (h < 24) {
        if (m < 10) {
          message.channel.send(typeOfTime + ' time: ' + h + ':0' + m)
        } else
        // If minutes flow over
        if (m > 59) {
          if (h > 22) {
            message.channel.send(typeOfTime + ' time: ' + (h+1-24) + ':' + (m-60))
          } else {
            message.channel.send(typeOfTime + ' time: ' + (h+1) + ':' + (m-60))
          }
          
        } else {
          message.channel.send(typeOfTime + ' time: ' + h + ':' + m)
        }
      } else {
        // Wrap around if hour > 24
        if (m < 10) {
          message.channel.send(typeOfTime + ' time: ' + (h-24) + ':0' + m)
        } else
        if (m > 59) {
          message.channel.send(typeOfTime + ' time: ' + (h+1-24) + ':' + (m-60))
        } else {
          message.channel.send(typeOfTime + ' time: ' + (h-24) + ':' + m)
        }
      }

    } else
    if (hourFormat === 12) {
      // Display hours as am/pm
      // am (morning)
      if (h < 12) {
        if (m < 10) {
          message.channel.send(typeOfTime + ' time: ' + h + ':0' + m + ' am')
        } else
        // If minutes flow over
        if (m > 59) {
          if (h === 11) {
            message.channel.send(typeOfTime + ' time: ' + (h+1) + ':' + (m-60) + ' pm')
          } else {
            message.channel.send(typeOfTime + ' time: ' + (h+1) + ':' + (m-60) + ' am')
          }
        } else {
          message.channel.send(typeOfTime + ' time: ' + h + ':' + m + ' am')
        }

      } else
      // am (after midnight)
      if (h > 23) {
        if (m < 10) {
          message.channel.send(typeOfTime + ' time: ' + (h-24) + ':0' + m + ' am')
        } else
        // If minutes flow over
        if (m > 59) {
          message.channel.send(typeOfTime + ' time: ' + (h-24+1) + ':' + (m-60) + ' am')
        } else {
          message.channel.send(typeOfTime + ' time: ' + (h-24) + ':' + m + ' am')
        }

      } else
      // pm (at noon)
      if (h === 12) {
        if (m < 10) {
          message.channel.send(typeOfTime + ' time: ' + h + ':0' + m + ' pm')
        } else
        // If minutes flow over
        if (m > 59) {
          message.channel.send(typeOfTime + ' time: ' + (h-12+1) + ':' + (m-60) + ' pm')
        } else {
          message.channel.send(typeOfTime + ' time: ' + h + ':' + m + ' pm')
        }

      }
      // pm (any other time)
      else {
        if (m < 10) {
          message.channel.send(typeOfTime + ' time: ' + (h-12) + ':0' + m + ' pm')
        } else
        // If minutes flow over
        if (m > 59) {
          if (h === 23) {
            message.channel.send(typeOfTime + ' time: ' + (h+1-24) + ':' + (m-60) + ' am')
          } else {
            message.channel.send(typeOfTime + ' time: ' + (h-12+1) + ':' + (m-60) + ' pm')
          }
        } else {
          message.channel.send(typeOfTime + ' time: ' + (h-12) + ':' + m + ' pm')
        }
      }


    }
  }

  // Get your server time
  let d = new Date();

  // Truncate decimal info (take care of in modulus)
  let offset_h = Math.trunc(d.getTimezoneOffset()/60);
  let offset_m = d.getTimezoneOffset()%60;

  // Get UTC 0 time
  let h = d.getHours();
  let m = d.getMinutes();
  //displayTime('Server', h, m, hourFormat);
  
  let unit_h = h + offset_h;
  let unit_m = m + offset_m;
 //displayTime('Unit', unit_h, unit_m, hourFormat);
    
  
  ///////////////////////////////////////////////////////////////////////
  // Get time for an individual user
  //////////////////////////////////////////////////////////////////////

  if (userMentioned === true) {
    // Access JSON file that stores user timezone info
    const fs = require('fs');

    fs.readFile(('./guildFiles/timezones'+guildID+'.json'), 'utf8', function readFileCallback(err, data){
      if (err) {
        console.log(err);
      } else {
        var timezones = JSON.parse(data);

        // First check if this userID already exists somewhere in the JSON file
        let numOfZones = Object.keys(timezones.zones).length;
        let hasZone = false;
        for (var index = 0; index < numOfZones; ++index) {

          let indexName = Object.keys(timezones.zones)[index];
          let tmp = timezones.zones[indexName];

          if (tmp.includes(userID)) {
            var userZone = Object.keys(timezones.zones)[index]
            hasZone = true;
          }
        }

        if (hasZone === false) {
          message.channel.send('User is not currently assigned to any timezones'); return
        }

        // Work with time in this callback function to prevent scope issues
        // If we put this outside the function, then values do not update
        // Doesn't seem like we can pass variables either due to asynchrony?
        if (hasZone === true) {
          //message.channel.send('User zone: ' + userZone)

          // Process it so that we get utc_h and utc_m
          if (userZone.includes('n')) {
            timeSign = 'n';
            timeDirection = -1;
          }
          if (userZone.includes('p')) {
            timeSign = 'p'
            timeDirection = 1;
          }
          let utcVal = userZone.split(timeSign)[1];
          let utc_h = parseInt(utcVal.substr(0,2)) * timeDirection;
          let utc_m = parseInt(utcVal.substr(2,2)) * timeDirection;

          // Account for negativity/positivity (not stored in four character time)
          // e.g., 0800 doesn't tell you anything about + or -
          let user_h = unit_h + utc_h;
          let user_m = unit_m + utc_m;

          displayTime('User', user_h, user_m, hourFormat);

        }
   
      }
    })
    
  }


  ////////////////////////////////////////////////////////////////////////////
  // Get time for here / everyone who is active
  ////////////////////////////////////////////////////////////////////////////

  // return all who are active in current channel

  if (everyoneMentioned === true) {
    message.channel.send('Function in under construction...')

    // Figure out how to pull who all is active

    // Get all their IDs and search for them in timezones.JSON

    // Then organize display only the times for active timezones
    // And display usernames (not IDs) of people in each respective active zone
    
    message.channel.send('Here? status: ' + client.users.first().presence)
    message.channel.send('client.users: ' + client.users.username)
  }

}