const defaultConfig = require('./config.example.json');
const package = require('./package.json');
const commander = require('commander');
const chalk = require('chalk');
const fs = require('fs');

let debugMode = false;
let sensitiveMode = false;

const ERR_PARSE = 2;
const ERR_FS = 3;
const FS_FILE_MISSING = 300;

function parseJSONData(rawJSONData) {
  try {
    let parsedJSONData = JSON.parse(rawJSONData);
    if (debugMode) console.log(chalk.cyan("[DEBUG]"), "JSON data parsed sucessfully!")
    return parsedJSONData;
  } catch (err) {
    if (debugMode) console.error(err);
    else console.error(chalk.red("[ERROR]"), "Unable to parse file data.", "Use -d to debug.");
    process.exit(ERR_PARSE);
  }
}

function getRawData(filePath) {
  try {
    let rawData = fs.readFileSync(filePath);
    if (debugMode) console.log(chalk.cyan("[DEBUG]"), "JSON file readed successfully!")
    return rawData;
  } catch (err) {
    if (debugMode) console.error(err);
    else console.error(chalk.red("[ERROR]"), "Unable to read file (", chalk.green(filePath), ").", "Use -d to debug.");
    process.exit(ERR_FS);
  }
}

function checkFS(filePath, exitOnMissing = false) {
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        if (debugMode) console.log(chalk.cyan("[DEBUG]"), "The config file (", chalk.green(filePath) ,") exists!")
        return filePath;
      } else if (exitOnMissing) {
        console.error(chalk.red("[ERROR]"), "File is missing (", chalk.green(filePath), ")");
        process.exit(FS_FILE_MISSING);
      } else return false;
    } catch (err) {
      if (debugMode) console.error(err);
      else console.error(chalk.red("[ERROR]"), "Unable to read file (", chalk.green(filePath), ").", "Use -d to debug.");
      process.exit(ERR_FS);
    }
  }
  return false;
}

function generateConfigFile(configPath, defaultConfig) {
  let configData = JSON.stringify(defaultConfig, null, 2);
  try {
    fs.writeFileSync(configPath, configData);
    if (debugMode) console.log(chalk.cyan("[DEBUG]"), "Config file created sucessfully !");
  } catch (err) {
    if (debugMode) console.error(err);
    else console.error(chalk.red("[ERROR]"), "Unable to write file (", chalk.green(filePath), ").", "Use -d to debug.");
    process.exit(ERR_FS);
  }
}

function checkConfigData(configData) {
  if (configData.hasOwnProperty('twitch_cred')
    && configData.hasOwnProperty('twitch_channel')
    && configData.twitch_cred
    && configData.twitch_channel
    && typeof configData.twitch_cred === "object"
    && typeof configData.twitch_channel === "object"
    && configData.twitch_cred.hasOwnProperty('client_id')
    && configData.twitch_cred.hasOwnProperty('client_secret')
    && configData.twitch_cred.hasOwnProperty('client_name')
    && typeof configData.twitch_cred.client_id === 'string'
    && typeof configData.twitch_cred.client_secret === 'string'
    && typeof configData.twitch_cred.client_name === 'string'
    && configData.twitch_channel.hasOwnProperty('id')
    && configData.twitch_channel.hasOwnProperty('name')
    && typeof (configData.twitch_channel.id || configData.twitch_channel.name) === 'string'
    ) if (debugMode) console.log(chalk.cyan("[DEBUG]"), "Config JSON data seems to be correct!");
}

const program = new commander.Command();

program.name(package.name);
program.description(package.description);
program.version(package.version);
program
  .option('-d, --debug', 'Enable debug mode')
  .option('-s, --sensitive', 'Enable display of sensitive data')
  .option('-c, --config-path <config.json>', 'Path to custom config file');
program.parse(process.argv);

const options = program.opts();

debugMode = options.debug;
sensitiveMode = options.sensitive;

let configPath = checkFS(options.configPath, true) || "config.json";
if (debugMode) console.log(chalk.cyan("[DEBUG]"), "Config file path:", chalk.green(configPath));
if (!checkFS(configPath)) generateConfigFile(configPath, defaultConfig);
let rawConfigData = getRawData(configPath);
let configData = parseJSONData(rawConfigData);

checkConfigData(configData);
let commonStr = chalk.cyan("[DEBUG]") + " Config file data:";
if (debugMode)
  if (sensitiveMode) console.log(commonStr + "\n%o", configData);
  else console.log(commonStr, chalk.red("You should use -s to allow sensitive data to be displayed!"));
