exports.run = (client, config, message) => {

  // Don't let any user intentionally call this command
  // Should only be called through index.js
  if (message.content.indexOf(config.prefix) === 0) return;

  // Get unique guild ID
  let guildID = message.guild.id;

  // Access the empty template JSON file for storing timezones
  const fs = require('fs');

  fs.readFile('./guildFiles/timezonesEmpty.json', 'utf8', function readFileCallback(err, data){
  	if (err) {
  		console.log(err);
  	} else {
  		// Add current guild ID to file and create new
  		timezones = JSON.parse(data);

  		// Finally, push to object and rewrite into file
  		fs.writeFile(('./guildFiles/timezones'+guildID+'.json'), JSON.stringify(timezones), function (err) {
  			if (err) {
  				console.log(err);
  			}
  		});
  	}
  })


}