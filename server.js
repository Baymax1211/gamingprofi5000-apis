const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const {
    configs
} = require('./src/configs/main');
const fs = require('fs');
const {
    red,
    cyan,
    yellow,
    green
} = require('colorette');

(async () => {
    const APIs = express();
    APIs.use(express.json());
    APIs.use(express.urlencoded({
        extended: true
    }));
    APIs.use(cors(configs.corsInfo));
    APIs.use(morgan('dev'))
    APIs.set('trust proxy', true);

    const API_Files = fs.readdirSync('./src/apis')
        .filter(file => file.endsWith('.js'));

    if (API_Files.length === 0) {
        console.log(red('No API Files found'));
        process.exit(1);
    }

    for (const file of API_Files) {
        console.log(cyan(`Loading ${file}`));
        const API = require(`./src/apis/${file}`);

        if (API.data && API.data.name && API.data.method && API.execute) {
            const routePath = `/${API.data.name}`;
            APIs[API.data.method.toLowerCase()](routePath, API.execute);
            return console.log(green(`API ${API.data.name} loaded at ${routePath} with method ${API.data.method.toUpperCase()}`));
        } else {
            continue;
        }
    }

    APIs.listen(configs.ServerConfigs.PORT, () => {
        console.log(green(`APIs Ready on port ${configs.ServerConfigs.PORT}`));
    });
})();