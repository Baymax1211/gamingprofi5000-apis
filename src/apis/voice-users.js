const Discord = require('discord.js');

module.exports = {
    data: {
        name: 'voice-users',
        method: 'POST'
    },

    async execute(req, res) {
        let token = req.headers.authorization;
        const {
            channelId
        } = req.query;

        if (!token || !channelId) {
            return res.status(400).json({
                error: "No bot token or channelId provided"
            });
        }

        let client = null;

        try {
            client = new Discord.Client({
                intents: Object.keys(Discord.GatewayIntentBits)
                    .map((intents) => {
                        return Discord.GatewayIntentBits[intents];
                    }),
                partials: Object.keys(Discord.Partials)
                    .map((partials) => {
                        return Discord.Partials[partials];
                    })
            });

            token = token.replace('Bot ', '');

            client.once('ready', () => {
                console.log(`New Discord Client logged in: ${new Date()}`);
                console.log(`Logged in as ${client.user.username} || User id: ${client.user.id}`);
            });

            await client.login(token);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: error.message
            });
        }

        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            client.destroy();
            return res.status(400).json({
                error: "Voice channel not found."
            });
        }

        if (channel.type !== Discord.ChannelType.GuildVoice) {
            client.destroy();
            return res.status(400).json({
                error: 'Provided channel is not a voice channel'
            });
        }

        try {
            const membersInVC = channel.members.map((member) => ({
                id: member.id,
                username: member.user.username
            }));

            if (membersInVC.length === 0) {
                return res.json({
                    error: "No users found."
                });

            }

            return res.json({
                members: membersInVC
            });
        } catch (error) {
            if (error.code === 50035 || error.code === 40006) {
                return res.status(429).json({
                    error: 'Rate limit reached, please try again later.'
                });
            }
            console.log(error);
            return res.status(500).json({
                error: error.message
            });
        } finally {
            client.destroy();
        }
    }
};