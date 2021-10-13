import 'dotenv/config'
import Discord from 'discord.js'
import createLogger from './logger'
import { slashCommands, triggers } from './commands'

const log = createLogger()

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
})

client.once('ready', () => {
  log.info('Bot is ready.')

  // While developing slashCommands it's better to use guild, as it's refresh instantly (https://youtu.be/pXehoXnFxPM?t=101)

  const guildId = '896713182326968351'
  const guild = client.guilds.cache.get(guildId)
  let commands

  if (guild) {
    commands = guild.commands
  } else {
    commands = client.application?.commands
  }

  for (const command of slashCommands) {
    commands?.create({
      name: command.name,
      description: command.description,
    })
  }
})

client.on('messageCreate', message => {
  for (const trigger of triggers) {
    if (message.content === trigger.name) {
      message.channel.send(trigger.reply)
    }
  }
})

client.on('interactionCreate', async (interaction) => {
  // Make sure that interaction is a command
  if (!interaction.isCommand()) {
    return
  }

  for (const command of slashCommands) {
    if (interaction.commandName === command.name) {
      interaction.reply(command.reply)
    }
  }
})

client.login(process.env.DISCORD_TOKEN)