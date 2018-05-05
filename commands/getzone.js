exports.run = (client, config, message, args) => {
  let userID = message.mentions.members.first().id;
  //message.channel.send('User ID: ' + userID)

  let guildID = message.guild.id;

  // Access JSON file that stores user timezone info
  const fs = require('fs');

  fs.readFile(('./guildFiles/timezones'+guildID+'.json'), 'utf8', function readFileCallback(err, data){
  	if (err) {
  		console.log(err);
  	} else {
  		timezones = JSON.parse(data);

  		// First check if this userID already exists somewhere in the JSON file
  		numOfZones = Object.keys(timezones.zones).length;
  		hasZone = false;
  		for (var index = 0; index < numOfZones; ++index) {

  			let indexName = Object.keys(timezones.zones)[index];
  			let tmp = timezones.zones[indexName];

  			if (tmp.includes(userID)) {
  				// Display
          currentZone = Object.keys(timezones.zones)[index];

          if (currentZone.includes('n')) {
            currentZone = currentZone.replace(/n/g ,'-');
          } else
          if (currentZone.includes('p')) {
            currentZone = currentZone.replace(/p/g ,'+');
          }

  				message.channel.send('User is currently set to ' + currentZone)
  				hasZone = true;
  			}
  		}

  		if (hasZone === false) {
  			message.channel.send('User is not currently assigned to any timezones')
  		}
 
  	}
  })

}