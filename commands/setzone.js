exports.run = (client, config, message, args) => {
  let userID = message.mentions.members.first().id;
  //message.channel.send('User ID: ' + userID)

  let guildID = message.guild.id;
  let userZone = args[1];

  // Access JSON file that stores user timezone info
  const fs = require('fs');

  fs.readFile(('./guildFiles/timezones'+guildID+'.json'), 'utf8', function readFileCallback(err, data){
  	if (err) {
  		console.log(err);
  	} else {
  		timezones = JSON.parse(data);

  		// Convert + or - sign to p or n, respectively
  		if (userZone.includes('-')) {
  			timeSign = 'n';
  			utcVal = userZone.split('-');
  		}
  		if (userZone.includes('+')) {
  			timeSign = 'p';
  			utcVal = userZone.split('+');
  		}

  		currentZone = utcVal[0] + timeSign + utcVal[1];

      // Throw error if the currentZone argument is not formatted correctly
      if (utcVal[1].length !== 4) {
        message.channel.send('Please use the correct UTC format (see !help @Chronus)')
        return;
      } else
      if (utcVal[0] !== 'utc') {
        message.channel.send('Please use the correct UTC format (see @help @Chronus)')
        return;
      }

      // Set UTC 00:00 to negative by default
      if (utcVal[1] === '0000') {
        timeSign = 'n';
        currentZone = utcVal[0] + timeSign + utcVal[1];
      }

  		// Search for matching UTC timezone
  		let currentUsers = timezones.zones[currentZone];
  		//message.channel.send('Users in ' + userZone + ': ' + JSON.stringify(currentUsers));


  		// First check if this userID already exists somewhere in the JSON file
  		numOfZones = Object.keys(timezones.zones).length;
  		for (var index = 0; index < numOfZones; ++index) {

  			let indexName = Object.keys(timezones.zones)[index];
  			let tmp = timezones.zones[indexName];

  			if (tmp.includes(userID)) {
  				// Display
  				//message.channel.send('User is currently set to ' + Object.keys(timezones.zones)[index])

  				// Find where in the current utc the subject is
  				function matchID(tmp) {
  					return tmp == userID;
  				}
  				
  				userIndex = tmp.findIndex(matchID);

  				// Delete where it currently stands so you can replace
  				tmp.splice(userIndex)
  				//message.channel.send('Removed from old timezone')
  			}
  		}

  		// Add userID to list of users in current timezone
  		timezones.zones[currentZone].push(userID);
  		message.channel.send('Registered timezone updated')


  		// Finally, push to object and rewrite into file
  		fs.writeFile(('./guildFiles/timezones'+guildID+'.json'), JSON.stringify(timezones), function (err) {
  			if (err) {
  				console.log(err);
  			}
  		});
 
  	}
  })

}