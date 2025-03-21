const corsInfo = require('./cors');
const ServerConfigs = require('./server.json')

const configs = {
    corsInfo,
    ServerConfigs
};

module.exports = {
    configs
}