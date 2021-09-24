const package = require('./package.json');
const commander = require('commander');

const command = new commander.Command();

command.name(package.name);
command.description(package.description);
command.version(package.version);

command.parse(process.argv);
