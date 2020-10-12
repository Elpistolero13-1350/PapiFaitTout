const Discord = require('discord.js');
const Client = new Discord.Client();
const fs = require('fs');
const bdd = require('./bdd.json');
const config = require('./config.json');
const colors = require('./colors.json');
const { Menu } = require('discord.js-menu');
const { MessageEmbed } = require('discord.js');
const ms = require('ms')
const moment = require('moment');
require('moment-duration-format');
const os = require('os');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { send } = require('process');
const { isBuffer } = require('util');
const dbdb = new FileSync("bdd2.json");
const db = low(dbdb);
const Dashboard = require("./dashboard/dashboard.js");
const humanizeDuration = require('humanize-duration');
db.defaults({ Infos_membres: [] }).write()

Client.on('ready', async () => {
  setInterval(function () {
    const stats = [
      "Contacter Elpistolero13🔫#1350 en cas de problème !",
      "Créé par Elpistolero13🔫#1350",
      "Bêta 0.0.1",
      "*help",
      `sur ${Client.guilds.cache.size} serveur`
    ];
    let status = stats[Math.floor(Math.random() * stats.length)];
    Client.user.setActivity(status, { type: 'STREAMING', url: 'https://www.twitch.tv/xxxelpistolero13xxx' });
  }, 10000)
  Client.user.setStatus()
  let Guild = Client.guilds.cache.get('739863456425050145');
  Dashboard(Client);
  console.log(`[ ${moment().locale('FR').format('LTS')} ] ✅ Le bot fr est on ! ✅`)
});

Client.on('message', async message => {
  const args = message.content.trim().split(/ +/g);
  if (message.channel.type == "dm") return;
  if (message.author.bot) return;

  const prefix = bdd[message.guild.id]["prefix"] || "*"

  /*warn*/

  if(message.content.startsWith(prefix + 'warn')){ 
    let warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"));
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("tu n\'a pas le droit d\'utiliser cette commande !");

  let wUser = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);
  if (!wUser) return message.channel.send("Veuillez mentionner un membre du serveur !");
  if (wUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Tu ne peux pas warn un membre du staff !")

  let reason = args.slice(2).join(" ") || "Aucune raison fournie !";

  if (!warns[wUser.id])warns[wUser.id] = {
    warns: 0
  };

  warns[wUser.id].warns++;

  fs.writeFile("./warnings.json", JSON.stringify(warns), err => {
    if (err) console.log(err);
  });

  let warnembed = new Discord.MessageEmbed()
    .setTitle("Warn enregistré !")
    .setTimestamp()
    .setThumbnail(wUser.user.displayAvatarURL({dynamic: true, size: 512}))
    .addField("Personne warn", wUser, true)
    .addField("Raison", reason, true)
    .addField("Total de warn", warns[wUser.id].warns)
    .setColor(colors.RED);
  
  message.channel.send(warnembed);
    }

    if(message.content.startsWith(prefix + 'total-warns')){
      if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('tu n\'a pas le droit d\'utiliser cette commande !');
      let warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"));
      let wUser = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);
  if (!wUser) return message.channel.send("Veuillez mentionner un membre du serveur !");

  let warnembed = new Discord.MessageEmbed()
    .setTitle(`Le total de(s) warn(s) de ${wUser}`)
    .setTimestamp()
    .setThumbnail(wUser.user.displayAvatarURL({dynamic: true, size: 512}))
    .addField("Personne mentionner", wUser, true)
    .addField("Total de warn", warns[wUser.id].warns, true)
    .setColor(colors.RED);
  
  message.channel.send(warnembed);
    }

  /*config*/

  if (message.content.startsWith(prefix + 'config')) {
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply(`ce n\'est pas bien de toucher ça alors que tu n\'a pas le droit ! ${message.guild.owner}`)
    console.log(args)
    if (!args[1]) {
      return message.reply(`vous devez indiquer ce que vous voulez changer !\n__config disponible__ : prefix (${prefix}config prefix <votre nouveau prefix>).`)
    }
    else if (args[1] == "prefix") {
      if (!args[2]) {
        return message.reply('vous devez indiquer le prefix a changer !')
      }
      else {
        bdd[message.guild.id]["prefix"] = args[2]
        Savebdd();
        return message.reply(`L'ancien prefix a été changer en \`\`${args[2]}\`\` !`)
      };
    };
  };

  /*Level*/

  let msgauthorname = message.author.username;
  let msgserveurid = message.guild.id;
  if (!db.get("Infos_membres").find({ nom: msgauthorname }).value()) {
    db.get("Infos_membres").push({ nom: msgauthorname, serveur: msgserveurid, xp: 1, niveaux: 1, xp_p_niveau: 100 }).write();
  } else {
    const userxpdb = db.get("Infos_membres").filter({ nom: msgauthorname }).find("xp").value();
    const userxp = Object.values(userxpdb);
    const userniveaudb = db.get('Infos_membres').filter({ nom: msgauthorname }).find("niveaux").value();
    const userniveau = Object.values(userniveaudb);
    const userpniveaudb = db.get('Infos_membres').filter({ nom: msgauthorname }).find("xp_p_niveau").value();
    const userpniveau = Object.values(userpniveaudb);
    let chiffre = [1, 2, 3];
    let index = Math.floor(Math.random() * (chiffre.length - 1) + 1);
    db.get("Infos_membres").find({ nom: msgauthorname }).assign({ nom: msgauthorname, xp: userxp[2] += chiffre[index] }).write();
    if (userxp[2] >= userpniveau[4]) {
      db.get("Infos_membres").find({ nom: msgauthorname, serveur: msgserveurid }).assign({ nom: msgauthorname, xp: userxp[2] = 1 }).write();
      db.get("Infos_membres").find({ nom: msgauthorname, serveur: msgserveurid }).assign({ nom: msgauthorname, niveaux: userniveau[3] += 1 }).write();
      db.get("Infos_membres").find({ nom: msgauthorname, serveur: msgserveurid }).assign({ nom: msgauthorname, xp_p_niveau: userpniveau[4] += 50 }).write();
      Savebdd();
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(colors.RED)
          .setTitle('NIVEAUX')
          .setDescription('GG, tu viens d\'avancer en niveaux !')
          .addFields(
            { name: 'Tu est niveaux : ', value: `\`\`${userniveau[3]}\`\`!`, inline: true },
            { name: 'Il te manque :', value: `Il te manque \`\`${userpniveau[4]}\`\`, avant de passer au prochain niveau !`, inline: true }
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
          .setTimestamp()
      );
    };
    if (message.content.toLowerCase() === prefix + 'rank') {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(colors.RED)
          .setTimestamp()
          .setTitle('LEVEL')
          .setDescription(`${message.author.username} votre level`)
          .addFields(
            { name: 'Votre level est :', value: `\`\`${userniveau[3]}\`\``, inline: true },
            { name: 'Votre taux d\'xp :', value: `\`\`${userxp[2]}\`\``, inline: true },
            { name: 'Il vous manque autant d\'xp pour passer au prochain niveau :', value: `${userpniveau[4]}` }
          )
          .setFooter()
      )
    };
  };

  /*sondage*/

  if (args[0].toLowerCase() === prefix + "sondage") {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("Vous n'avez pas la permission d'exécutée cette commande");
    message.delete();
    let channelM = message.mentions.channels.first();
    if (args.slice(1) !== channelM);
    if (!channelM) return message.reply('vous devez mentionner un salon après le sondage !');
    if (!channelM.type == 'text') return message.reply('veuillez mettre un salon text !');
    let sondage = args.slice(2).join(" ");
    if (!sondage) return message.reply("Vous devez ajouter un text pour faire votre sondage !");
    var embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setDescription(`Sondage fait par ${message.author} \n\n\n ${sondage}`)
      .setTitle("SONDAGE");
    let msg = await channelM.send(embed);
    try {
      msg.react("✅")
      msg.react("❌")
    } catch (error) {
      console.log("t ki3")
    };
  };
  /*8ball*/

  if (message.content.startsWith(prefix + "8ball")) {
    let question = message.content.slice(prefix.length + 6);
    if (!question) {
      return message.channel.send(`${message.author} vous n'avez pas préciser votre question !`)
    } else {
      let reponses = [
        "Yep, mais...",
        "Hmm, franchement pas sûr !",
        "NON !",
        "Mouais",
        "OOUUUIII !!!!"
      ]
      let reponse = reponses[Math.floor(Math.random() * reponses.length - 1)];
      let embed = new Discord.MessageEmbed()
        .setTitle("8BALL")
        .addFields(
          { name: `Vous avez dis : ${question}`, value: `Et moi je vous répond ceci : ${reponse}` }
        )
        .setColor("RED")

      message.channel.send(embed)
    };
  };

  /*clear*/
  if (message.content.startsWith(prefix + 'clear')) {
    message.delete()
    let args = message.content.trim().split(" ").slice(1);
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return (await message.reply('vous n\'avez pas le droit d\'utiliser cette commande !').then(msg => msg.delete({ timeout: 10000 })));
    if (!args[0]) return message.reply('vous devez mettre le nombre de message a supprimer !');
    if (args[0] < 5) return message.reply('tu est serieux moins de 5 messages tu peux pas le faire tout seule ?');
    if (args[0] > 100) return message.reply('je ne peux pas supprimer plus de 100 messages !');
    message.channel.bulkDelete(args[0]);
    message.reply(`je vient de supprimer ${args[0]} message(s) !`).then(msg => {
      setTimeout(() => {
        msg.delete()
      }, 10000)
    });
  };

  /*kick*/
  if (message.content.startsWith("!kick")) {
    if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('Vous ne disposez pas des permissions nécessaires')

    let args = message.content.trim().split(/ +/g);
    const user = message.mentions.users.first();

    if (user) {

      const member = message.guild.member(user);

      if (member) {

        member
        member.kick(args.slice(2).join(' ') || 'Aucune raison donnée.')

          .then(() => {

            const embed = new Discord.MessageEmbed()
              .setColor('GREEN')
              .setDescription(`✅ ${user.username} a été kick avec succès ! \n Raison : ${args.slice(2).join(' ') || ('Aucune raison donnée.')}`)
            message.channel.send(embed);
          })
          .catch(err => {

            const embed = new Discord.MessageEmbed()
              .setDescription(' ❌ Je ne peut pas kick le membre...')
              .setColor('RED')
            message.channel.send(embed);

            console.error(err);
          });
      } else {
        const embed = new Discord.MessageEmbed()
          .setDescription(' ❌ Cet utilisateur ne se situe pas dans le serveur !')
          .setColor('RED')
        message.channel.send(embed);
      }
    } else {
      const embed = new Discord.MessageEmbed()
        .setDescription(` ❓ Vous devez mentionnez un utilisateur !`)
        .setColor('RED')
      message.channel.send(embed);
    };
  };

  /*ban*/
  if (message.content.startsWith(prefix + 'ban')) {
    let args = message.content.trim().split(/ +/g);
    const user = message.mentions.users.first();

    if (user) {

      const member = message.guild.member(user);

      if (member) {

        member
          .ban({
            reason: args.slice(2).join(' ') || ('Aucune raison donnée.'),
          })
          .then(() => {

            const embed = new Discord.MessageEmbed()
              .setColor(colors.RED)
              .setDescription(`✅ ${user.username} a été banni avec succès ! \n Raison : ${args.slice(2).join(' ') || ('Aucune raison donnée.')}`)
            message.channel.send(embed);
          })
          .catch(err => {

            const embed = new Discord.MessageEmbed()
              .setDescription(' ❌ Je ne peut pas bannir le membre...')
              .setColor(colors.RED)
            message.channel.send(embed);

            console.error(err);
          });
      } else {
        const embed = new Discord.MessageEmbed()
          .setDescription(' ❌ Cet utilisateur ne se situe pas dans le serveur !')
          .setColor(colors.RED)
        message.channel.send(embed);
      }
    } else {
      const embed = new Discord.MessageEmbed()
        .setDescription(` ❓ Vous devez mentionnez un utilisateur !`)
        .setColor(colors.RED)
      message.channel.send(embed);
    };
  };

  /*mute*/
  if (message.content.startsWith(prefix + 'mute')) {
    if (!message.member.hasPermission('MUTE_MEMBERS')) return message.reply('Vous avez pas la permission de mute des membres !')
    const member = message.mentions.members.first()
    if (!member) return message.reply('Vous devez mentionner un membre a mute !')
    if (member.id === message.guild.ownerID) return message.reply('Vous ne pouvez pas mute le SAINT-GRALE !!')
    if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && message.author.id !== message.guild.ownerID) return message.reply('Vous ne pouvez pas mute les membre avec un meilleur rôle !')
    if (!member.manageable) return message.reply('Je peux pas mute ce membre !')
    const reason = args.slice(2).join(' ') || 'Aucune raison fournie !'
    let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted')
    if (!muteRole) {
      muteRole = await message.guild.roles.create({
        data: {
          name: 'Muted',
          Permissions: 0
        }
      });
      message.guild.channels.cache.forEach(channel => channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        CONNECT: false,
        ADD_REACTIONS: false
      }));
    };
    await member.roles.add(muteRole)
    message.channel.send(`${member} est mute ! Pour \`\`${reason}\`\``)
  };

  /*unmute*/
  if (message.content.startsWith(prefix + 'unmute')) {
    if (!message.member.hasPermission('MUTE_MEMBERS')) return message.reply('Vous avez pas la permission de unmute des membres !')
    const member = message.mentions.members.first()
    if (!member) return message.reply('Vous devez mentionner un membre a unmute !')
    if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && message.author.id !== message.guild.ownerID) return message.reply('Vous ne pouvez pas unmute les membre avec un meilleur rôle !')
    if (!member.manageable) return message.reply('Je peux pas unmute ce membre !')
    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted')
    if (!muteRole) return message.reply('Cette personnes n\'est pas mute donc vous ne pouvez pas le unmute !')
    await member.roles.remove(muteRole)
    message.channel.send(`${member} est plus mute !`)
  };

  /*tempban*/
  if (message.content.startsWith(prefix + 'tempban')) {
    if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply('Vous avez pas la permission de bannir des membres !')
    const member = message.mentions.members.first()
    if (!member) return message.reply('Vous devez mentionner un membre a bannir !')
    if (member.id === message.guild.ownerID) return message.reply('Vous ne pouvez pas bannir le SAINT-GRALE !!')
    if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && message.author.id !== message.guild.ownerID) return message.reply('Vous ne pouvez pas bannir les membre avec un meilleur rôle !')
    if (!member.bannable) return message.channel.send('Je peux pas bannir ce membre !')
    const duration = parsaDuration(args[1])
    if (!duration) return message.reply('Vous devez mettre la durée du ban !')
    const reason = args.slice(2).join(' ') || 'Aucune raison fournie !'
    await member.ban({ reason })
    message.channel.send(`**${member.user.tag}** a été banni pendant ${humanizeDuration(duration, { language: 'fr' })}!`)
    setTimeout(() => {
      message.guild.members.unban(member)
      message.channel.send(`La durée du ban de **${member.user.tag}** a été terminer !`)
    }, duration)
  };

  /*ping*/
  if (message.content.toLowerCase() === prefix + "ping") {
    message.channel.send(Client.ws.ping + "ms pong" + "🏓");
  };

  /*stats-serveur*/
  if (message.content.toLowerCase() === prefix + "server-stats") {
    let onlines = message.guild.members.cache.filter(({ presence }) => presence.status !== 'offline').size;
    let totalmembers = message.guild.members.cache.size;

    const EmbedStats = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('STATS')
      .setURL('https://discord.js.org/')
      .setAuthor('PapiFaitTout', 'https://imgur.com/4yURtKz.png')
      .setDescription('Voici les statistique')
      .addFields(
        { name: 'Créateur :crown:', value: message.guild.owner, inline: true },
        { name: 'Région', value: message.guild.region, inline: true },
        { name: 'Niveaux de vérification', value: message.guild.verificationLevel, inline: true },
        { name: 'Nombre de rôle', value: message.guild.roles.cache.size, inline: true },
        { name: 'Nombre de salon', value: message.guild.channels.cache.size, inline: true },
        { name: 'Nombre de membre total dans le serveur : ', value: totalmembers, inline: true },
        { name: 'Nombre de membre connecté : ', value: onlines, inline: true }
      )
      .setFooter(`Serveur créé le ${message.guild.createdAt}`)
      .setTimestamp()

    message.channel.send(EmbedStats);
  };

  /*userinfo*/
  if (message.content.toLowerCase() === prefix + 'userinfo') {
    const status = {
      online: "✅En ligne",
      idle: "🌙Inactif",
      dnd: "❌Ne pas déranger",
      offline: "😴Hors ligne / invisible",
      streaming: "💻En Stream"

    }
    const flags = {
      DISCORD_EMPLOYEE: '<:staffD:762264211610927114>',
      DISCORD_PARTNER: '<:partenaireD:762264272976871454>',
      BUGHUNTER_LEVEL_1: '<:BugHunter1:762264523956027394>',
      BUGHUNTER_LEVEL_2: '<:BugHunter2:762264547746381834>',
      HYPESQUAD_EVENTS: '<:hypesquad:762265025754300427>',
      HOUSE_BRAVERY: '<:bravery:762263100648062976>',
      HOUSE_BRILLIANCE: '<:brilliance:585763004495298575>',
      HOUSE_BALANCE: '<:hypesquad:762265025754300427>',
      EARLY_SUPPORTER: '<:support:762263870651498496>',
      TEAM_USER: 'TEAM_USER',
      SYSTEM: 'SYSTEM',
      VERIFIED_BOT: '<:veriferBot:762262077749854220>',
      VERIFIED_DEVELOPER: '<:verifierDev:762260880187719730>'
    }
    const members = message.guild.member(message.mentions.users.first()) || message.member;
    const userFlags = members.user.flags.toArray();

    const getPresenceStatus = status => {
      let presence = ''

      switch (Object.keys(status)[0]) {
        case 'desktop':
          presence = 'Ordinateur';
          break;
        case 'mobile':
          presence = 'Mobile';
        case 'web':
          presence = 'Internet';
          break;
      }
      return presence
    };

    let embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setAuthor(members.user.username, members.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setThumbnail(members.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
      .addField('• Information sur :', `${members.user.tag}`, true)
      .addField('• Nickname :', `${members.user.nickname !== null ? `${members.nickname}` : "Aucun"}`, true)
      .addField('• ID :', `${members.user.id}`, true)
      .addField('• Bot :', `${members.user.bot ? '🤖 Oui' : '👤 Non'}`, true)
      .addField('• Status :', `${status[members.user.presence.status]}`, true)
      .addField('• Joue à :', `${members.user.presence.game || 'Rien'}`, true)
      .addField('• Platforme :', `${getPresenceStatus(members.user.presence.clientStatus)}`, true)
      .addField('• Compte crée :', `${moment(members.joinedAt).format('DD/MM/YYYY')}`, true)
      .addField('• A rejoint le server :', `${message.guild.joinedAt.toLocaleString()}`, true)
      .addField('• Badges :', `${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Aucun'}`, true)
      .addField('• Roles :', `${members.roles.cache.filter(r => r.name !== "@everyone").map(roles => `${roles}`).join(", ") || "Aucun rôles"}.`, true)
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
      .setTimestamp()
    message.channel.send(embed);

  };

  if (message.content.toLowerCase() === prefix + 'user_info') {
    const flags = {
      DISCORD_EMPLOYEE: '<:Discordstaff:754770896698343516>',
      DISCORD_PARTNER: '<:DiscordPartner:754770910971428924>',
      BUGHUNTER_LEVEL_1: '<:BugHunter:754770869091303534>',
      BUGHUNTER_LEVEL_2: '<:BugHunterLvl2:754770877362470922>',
      HYPESQUAD_EVENTS: '<:HypeSquad:754770832638869565>',
      HOUSE_BRAVERY: '<:Bravery:754772395952308414>',
      HOUSE_BRILLIANCE: '<:Brillance:754772406337536081>',
      HOUSE_BALANCE: '<:Balance:754772415615336589>',
      EARLY_SUPPORTER: '<:EarlySupporter:754770812124266588>',
      TEAM_USER: 'TEAM_USER',
      SYSTEM: 'SYSTEM',
      VERIFIED_BOT: '<:VerifiedBot:754775587117203587>',
      VERIFIED_DEVELOPER: '<:VerifiedDeveloper:754773209982828685>'
    };
    let members = message.member;
    if (args[0]) member = message.guild.member(message.mentions.users.first());
    const userFlags = members.user.flags.toArray();
    let presences = 'unknow';
    if (members.user.presence.status === 'online') presences = '<:online:756860007512801381>';
    if (members.user.presence.status === 'idle') presences = '<:idle:756860007424720989>';
    if (members.user.presence.status === 'dnd') presences = '<:dnd:756860008129364000>';
    if (members.user.presence.status === 'offline') presences = '<:offline:756860008498462761>';

    const userinfoembed = new MessageEmbed()
      .setColor(colors.RED)
      .setThumbnail(members.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addField(`Plus d'information à propos de **${members.user.tag}**`,
        `• Nom: ${members.user}
  • Type: ${members.user.bot ? 'Bot' : 'Utilisateur'}
  • Créé le: ${moment(members.user.createdAt).format('DD/MM/YYYY')}
  • Status: ${presences}
  • A rejoint le: ${moment(members.joinedAt).format('DD/MM/YYYY')}
  • Joue à: ${members.user.presence.game || 'Rien'}
  • Badges: ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Aucun'}
  • Roles: ${members.roles.cache.filter(r => r.name !== "@everyone").map(roles => `${roles}`).join(", ") || "Aucun rôles"}.`)

    message.channel.send(userinfoembed);

  };


  /*Invte*/
  if (message.content.toLowerCase() === prefix + 'invite') {
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setDescription(`Vous voulez [invite le bot](https://discord.com/oauth2/authorize?client_id=756851204780458075&permissions=8&scope=bot) ? Aucun probleme !`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
        .setTitle('INVITER LE BOT')
        .setURL('https://discord.com/oauth2/authorize?client_id=756851204780458075&permissions=8&scope=bot')
        .setTimestamp()
        .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
    )
  };

  /*botinfo*/
  if (message.content.toLowerCase() === prefix + 'botinfo') {
    const core = os.cpus()[0]
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setTitle(`BOTINFO`)
        .setThumbnail(Client.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields(
          { name: 'ID du bot :', value: Client.user.id, inline: true },
          { name: 'Nom du Bot :', value: Client.user.tag, inline: true },
          {
            name: '__**Info sur le Bot :**__', value: `** Status :** ${Client.user.presence.status}
        ** Serveurs :** ${Client.guilds.cache.size}
        ** Créé le: ** ${moment(Client.user.createdAt).format('MM/DD/YYYY')} `, inline: true
          },
          {
            name: '__**Info sur le Système**__', value: `** USAGE DES RAM:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
    ** Latence :** ${moment.duration(Client.uptime).format(' D [days], H [hrs}, m [mins], s [secs] ')}
        ** Platforme :** ${process.platform}
        ** Version de Node utiliser:** ${process.version}
        ** Version de Discord.js :** ${Discord.version}
        ** Type de CPU:**
  \u3000 Cores: ${os.cpus().length},
  \u3000 Model: ${core.model},
  \u3000 Vitesse: ${core.speed} MHZ,
        ** Memoire :**
  \u3000 Total: ${formatBytes(process.memoryUsage().heapTotal)},
  \u3000 Utiliser: ${formatBytes(process.memoryUsage().heapUsed)} `, inline: true
          }
        )
        .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
        .setTimestamp()
    )
  };

  /*help/aide*/
  if (message.content.toLowerCase() === prefix + 'aide') {
    message.delete()
    new Menu(message.channel, message.author.id, [{

      name: "main",
      content: new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setTitle('VOICI TOUTE LES COMMANDE')
        .setDescription('Vous aurez toutes les commandes de jeux, de modérations, commandes d\'infos et quelques autre commandes (sans leur description pour ceci il faut aller sur le [DASHBOARD](http://207.244.227.19:4934/)')
        .setTimestamp()
        .setFooter(`Faite ▶ pour aller à la prochaine page !\n(page 1/5)\nPapiFaitTout`, `https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg`),
      reactions: {
        "▶": "next"
      }
    }, {
      name: "otherPage",
      content: new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setTitle('Commande de MODERATION')
        .setDescription('Vous devez ignorez les \`\`<>\`\` sinon ca ne marcheras pas ! (les commandes serons sans leur description pour ceci il faut aller sur le [DASHBOARD](http://207.244.227.19:4934/)')
        .setTimestamp()
        .setFooter(`Faite ▶ pour aller à la prochaine page !\n(page 1/5)\nPapiFaitTout`, 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
        .addFields(
          { name: '👮‍♂️BANNISSEMENT👮‍♀️', value: `Vous devez faire : \`\`${prefix}ban <la personne>\`\``, inline: true },
          { name: '👮‍♂️BANNISSEMENT TEMPORRAIRE👮‍♀️', value: `Vous devez faire : \`\`${prefix}tepban <la personne> <le temp du ban>`},
          { name: '🛫EXPLUSION✈️', value: `Vous devez faire : \`\`${prefix}kick <la personne>\`\``, inline: true },
          { name: '🤐MUTE🤐', value: `Vous devez faire : \`\`${prefix}mute <la personne>\`\``, inline: true },
          { name: '🤫UNMUTE🤫', value: `Vous devez faire : \`\`${prefix}unmute <la personne>\`\``, inline: true},
          { name: '🗨️CLEAR🗨️', value: `Vous devez faire : \`\`${prefix}clear <le nombre de messages a supprimer>\`\``, inline: true },
          { name: '❓SUPPORT❓', value: `Vous devez faire : \`\`${prefix}support\`\``, inline: true }
        ),
      reactions: {
        "◀": "previous",
        "▶": "next"
      }
    }, {
      name: "otherPage",
      content: new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setTitle('🎲Commande de JEUX 🎲')
        .setDescription('Vous devez ignorez les \`\`<>\`\` sinon ca ne marcheras pas ! (les commandes serons sans leur description pour ceci il faut aller sur le [DASHBOARD](http://207.244.227.19:4934))')
        .setTimestamp()
        .setFooter(`Faite ▶ pour aller à la prochaine page !\n(page 1/5)\nPapiFaitTout`, `https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg`)
        .addFields(
          { name: '⚽8BALL⚽', value: `Vous devez faire : \`\`${prefix}8ball <une question>\`\``, inline: true },
          { name: '🐶DOGDROLE🐶', value: `Vous devez faire : \`\`${prefix}dogdr\`\``, inline: true },
          { name: '🐶DOG🐶', value: `Vous devez faire : \`\`${prefix}dog\`\``, inline: true },
          { name: '🐱CATDROLE🐱', value: `Vous devez faire : \`\`${prefix}catdr\`\``, inline: true },
          { name: '🐱CAT🐱', value: `Vous devez faire : \`\`${prefix}cat\`\``, inline: true },
          { name: '🦊FOXDROLE🦊', value: `Vous devez faire : \`\`${prefix}foxdr\`\``, inline: true },
          { name: '🦊FOX🦊', value: `Vous devez faire : \`\`${prefix}fox\`\``, inline: true },
          { name: '🐦BIRDDROLE🐦', value: `Vous devez faire : \`\`${prefix}birddr\`\``, inline: true },
          { name: '🐦BIRD🐦', value: `Vous devez faire : \`\`${prefix}bird\`\``, inline: true },
          { name: '⚪MORPION❌', value: `Vous devez faire : \`\`${prefix}morpion\`\``, inline: true },
          { name: '🥇RANK🥇', value: `Vous devez faire : \`\`${prefix}rank\`\``, inline: true },
          { name: '🔒CLOSE🔒', value: `Vous devez faire \`\`${prefix}close\`\``, inline: true },
          { name: '📊SONDAGE📊', value: `Vous devez faire \`\`${prefix}sondage <le salon ou le sondage sera> <votre sondage>\`\``, inline: true}
        ),
      reactions: {
        "◀": "previous",
        "▶": "next"
      }
    }, {
      name: "otherPage",
      content: new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setTitle('❓Commande d\'info❓')
        .setDescription('Vous devez ignorez les \`\`<>\`\` sinon ca ne marcheras pas ! (les commandes serons sans leur description pour ceci il faut aller sur le [DASHBOARD](http://207.244.227.19:4934))')
        .setTimestamp()
        .setFooter(`Faite ▶ pour aller à la prochaine page !\n(page 1/5)\nPapiFaitTout`, `https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg`)
        .addFields(
          { name: '🏓PING🏓', value: `Vous devez faire : \`\`${prefix}ping\`\``, inline: true },
          { name: '❓USERINFO❓', value: `Vous devez faire : \`\`${prefix}userinfo\`\``, inline: true },
          { name: '❓BOTINFO❓', value: `Vous devez faire : \`\`${prefix}botinfo\`\``, inline: true },
          { name: '❓SERVEUR-STATS❓', value: `Vous devez faire : \`\`${prefix}serveur-stats\`\``, inline: true },
          { name: '📩INVITE📨', value: `Vous devez faire \`\`${prefix}invite\`\``, inline: true }
        ),
      reactions: {
        "◀": "previous",
        "▶": "next"
      }
    }, {
      name: "otherPage",
      content: new Discord.MessageEmbed()
        .setColor(colors.RED)
        .setTitle('🤔Autres commande🤔')
        .setTimestamp()
        .setFooter(`Faite ▶ pour aller à la prochaine page !\n(page 1/5)\nPapiFaitTout`, `https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg`)
        .setDescription('Vous devez ignorez les \`\`<>\`\` sinon ca ne marcheras pas !')
        .addFields(
          { name: '\`\`*\`\`PREFIX\`\`*\`\`', value: 'Vous devez faire : \`\`*config prefix <votre nouveau prefix>\`\`', inline: true }
        ),
      reactions: {
        "◀": "previous"
      }
    }]);
  };

  /*Morpion*/
  if (message.content.toLowerCase() === prefix + 'morpion') {
    const { MessageEmbed } = require('discord.js')
    const emojis = { "1️⃣": "1", "2️⃣": "2", "3️⃣": "3", "4️⃣": "4", "5️⃣": "5", "6️⃣": "6", "7️⃣": "7", "8️⃣": "8", "9️⃣": "9" }
    let embed = new MessageEmbed()
      .setDescription('Qui veux faire un match ? `2 joueurs requis`')
      .setColor(colors.RED)

    message.channel.send(embed).then(async msg => {
      msg.react('🗡️')
      let filter = (reaction, user) => !user.bot && reaction._emoji.name === '🗡️'
      let reaction = await msg.awaitReactions(filter, { max: 2 })
      let number = Math.floor(Math.random() * 899) + 100

      let channel = await msg.guild.channels.create(`morpion-${number}`, { type: 'text', permissionOverwrites: [{ id: message.guild.id, deny: ["VIEW_CHANNEL"] }, { id: reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[0].id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }, { id: reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[1].id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }] })

      channel.send('VOUS DEVEZ ATTENDRE QUE TOUT LES EMOJI SOIT MIS SINON CA NE VA PAS MARCHER !!!!!');
      let embed = new MessageEmbed()
        .setDescription(`🗡️ FIGHT${reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[0]} VS ${reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[1]}
      `)
        .setColor(colors.RED)
        .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
      channel.send(`${reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[0]} VS ${reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[1]}`)
      let morpion = await channel.send(embed)

      let players = [
        { user: `${reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[0]}`, reaction: "X" },
        { user: `${reaction.get("🗡️").users.cache.filter(user => !user.bot).array()[1]}`, reaction: "O" }
      ]
      let Morpion = new MessageEmbed()
        .setTitle('Game : Morpion')
        .setColor(colors.RED)
        .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
        .setDescription
        (`Player : ${players[0].user}
\`\`\`
1  |  2  |  3
4  |  5  |  6
7  |  8  |  9
\`\`\``)
      morpion.edit(Morpion).then(async msg => {
        await Promise.all(["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"].map(r => msg.react(r)));
        let gameStatus = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let winners;
        await game(players, msg, gameStatus, winners)
      })
    })
    async function checkwinner(gameStatus, win, msg, players, player, winners) {
      for (const trio of win) {
        let one = trio[0];
        let two = trio[1]
        let three = trio[2];
        if (gameStatus[one] === gameStatus[two] && gameStatus[one] === gameStatus[three]) {
          winners = `Player ${player}`
          msg.edit({
            embed:
            {
              description: `
    Le joueur ${players[player].user} a gagné la partie
    Dans 5 secondes ce salon sera supprimé`,
              color: colors.RED,
              footer: 'PapiFaitTout'
            }
          })
          setTimeout(() => {
            msg.channel.delete()
          }, 5000)
          return true;

        }
      }
    }
    async function player(players, msg, gameStatus, player) {
      let reaction = (await msg.awaitReactions((reaction, user) => ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"].includes(reaction.emoji.name) && !user.bot && gameStatus[parseInt(emojis[reaction.emoji.name]) - 1] === emojis[reaction.emoji.name] && user.id === players[player].user.slice(2, -1), { max: 1 })).first();
      gameStatus[parseInt(emojis[reaction.emoji.name]) - 1] = players[player].reaction
      msg.edit({
        embed:
        {
          description:
            `Player : ${player === 0 ? players[1].user : players[0].user}\`\`\` 
    ${emojis[reaction.emoji.name] === "1" ? players[player].reaction : gameStatus[0]}  |  ${emojis[reaction.emoji.name] === "2" ? players[player].reaction : gameStatus[1]}  |  ${emojis[reaction.emoji.name] === "3" ? players[player].reaction : gameStatus[2]}
    ${emojis[reaction.emoji.name] === "4" ? players[player].reaction : gameStatus[3]}  |  ${emojis[reaction.emoji.name] === "5" ? players[player].reaction : gameStatus[4]}  |  ${emojis[reaction.emoji.name] === "6" ? players[player].reaction : gameStatus[5]}
    ${emojis[reaction.emoji.name] === "7" ? players[player].reaction : gameStatus[6]}  |  ${emojis[reaction.emoji.name] === "8" ? players[player].reaction : gameStatus[7]}  |  ${emojis[reaction.emoji.name] === "9" ? players[player].reaction : gameStatus[8]}
    \`\`\``, color: colors.RED, footer: 'PapiFaitTout'
        }
      });
    }
    function checktie(gameStatus, winners, msg) {
      if (gameStatus.every(value => ["O", "X"].includes(value))) {
        winners = "Égalité"
        msg.edit({
          embed:
          {
            description: `
    Aucun gagnant pour ce match.
    Dans 5 secondes ce salon sera supprimé`
            , color: colors.RED, footer: 'PapiFaitTout'
          }
        })
        setTimeout(() => {
          msg.channel.delete()
        }, 5000)
        return true;
      }
    }
    function game(players, msg, gameStatus, winners) {
      const win = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      new Promise(async (resolve, reject) => {
        do {
          if (winners) return;
          await player(players, msg, gameStatus, 0);
          if (await checkwinner(gameStatus, win, msg, players, 0, winners)) {
            resolve();
            break;
          }
          if (await checktie(gameStatus, winners, msg)) {
            resolve();
            break;
          }
          if (winners) return;
          await player(players, msg, gameStatus, 1);
          if (await checkwinner(gameStatus, win, msg, players, 1, winners)) {
            resolve();
            break;
          }
          if (await checktie(gameStatus, winners, msg)) {
            resolve();
            break;
          }
        }
        while (!winners)
      })
    }
  }

  /*les animaux*/

  if (message.content.toLowerCase() === prefix + 'dogdr') {
    const dogdr = [
      "https://media.giphy.com/media/51Uiuy5QBZNkoF3b2Z/giphy.gif",
      "https://media.giphy.com/media/21GCae4djDWtP5soiY/giphy.gif",
      "https://media.giphy.com/media/KGH8s2KHqWCYhd27W4/giphy.gif",
      "https://media.giphy.com/media/8vsW14FCMQVz7rKSuN/giphy.gif",
      "https://media.giphy.com/media/Xg4mqfGJM5YnCEshiM/giphy.gif",
      "https://media.giphy.com/media/xUA7aQaXbhnkX4znm8/giphy.gif",
      "https://media.giphy.com/media/yJHN2CCfPIw4o/giphy.gif",
      "https://media.giphy.com/media/Yjc9l1Q6Al1DO/giphy.gif",
      "https://media.giphy.com/media/dTJd5ygpxkzWo/giphy.gif",
      "https://media.giphy.com/media/3lxD1O74siiz5FvrJs/giphy.gif",
      "https://media.giphy.com/media/l4KhKdeCGzp0RORDW/giphy.gif",
      "https://media.giphy.com/media/mokQK7oyiR8Sk/giphy.gif",
      "https://media.giphy.com/media/cLcxtL1z8t8oo/giphy.gif"
    ]
    const dogd = dogdr[Math.floor(Math.random() * dogdr.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🐶 Wouf 🐶')
      .setImage(dogd)
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
      .setTimestamp()

    message.channel.send(embed);

    message.delete();
  }

  if (message.content.toLowerCase() === prefix + 'dog') {
    const dog = [
      "https://cdn.discordapp.com/attachments/732371156119584871/749328804589207604/2Q.png",
      "https://cdn.discordapp.com/attachments/732371156119584871/749329022747672607/chien-175531.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749329559349887126/cover-r4x3w1000-5eda126862738-german-shepherd-3404340-1920.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749329653835104347/sur-les-lieux-six-chiens.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749329873788600430/home-blanscape-et-istock-min-600x420.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749329991262797974/images.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330130303844402/1323917-chiens-de-traineaux-grande-odyssee-fra.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330239087313026/526207-puis-je-promener-mon-chien-pendant-le-co-953x0-3.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330344938963054/2362_fr_moyenvl-adoption-de-chiens-du-nord-du-quebec.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330466271789096/qui-sont-les-ancetres-chien.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330641593696276/12430318-chien-adulte-belle-le-husky-de-sibC3A9rie.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330776281186435/chien_berger_allemand_2-1024x576.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749330885941133352/26222970057_fd5fa9aeef_e.png"
    ]
    const dog2 = dog[Math.floor(Math.random() * dog.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🐶 Wouf 🐶')
      .setImage(dog2)
      .setTimestamp()
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')

    message.channel.send(embed);

    message.delete();
  }
  if (message.content.toLowerCase() === prefix + 'catdr') {
    const catdr = [
      "https://media.giphy.com/media/WXB88TeARFVvi/giphy.gif",
      "https://media.giphy.com/media/33OrjzUFwkwEg/giphy.gif",
      "https://media.giphy.com/media/8vQSQ3cNXuDGo/giphy.gif",
      "https://media.giphy.com/media/zP7rxBSqO4jRu/giphy.gif",
      "https://media.giphy.com/media/23eIaihzejUmUtIDkO/giphy.gif",
      "https://media.giphy.com/media/WnOBP6JeOBdhS/giphy.gif",
      "https://media.giphy.com/media/6byDVsPwzrz9K/giphy.gif",
      "https://media.giphy.com/media/JKb28stpt0gwg/giphy.gif",
      "https://media.giphy.com/media/tBxyh2hbwMiqc/giphy.gif",
      "https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif",
      "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
      "https://media.giphy.com/media/MCfhrrNN1goH6/giphy.gif",
      "https://media.giphy.com/media/H4DjXQXamtTiIuCcRU/giphy.gif"
    ]
    const catd = catdr[Math.floor(Math.random() * catdr.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🐱 MIAOU 🐱')
      .setImage(catd)
      .setTimestamp()
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')

    message.channel.send(embed);

    message.delete();
  }
  if (message.content.toLowerCase() === prefix + 'cat') {
    const cat = [
      "https://cdn.discordapp.com/attachments/702865356720570458/749332057049661490/images.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332145969037413/c8e06865-istock-909106260-copie-1200x675.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332260221747270/7794944772_deux-jeunes-chats-qui-se-reposent-photo-d-illustration.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332353679360070/les-10-points-clef-d-un-chat-en-forme.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332443940782160/e9eddf6_B3Y0d0aPpK74XJJv8JozssjG.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332541324132392/rts39c721.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332622953414686/le-sacre-de-birmanie-fait-partie-de-ces-chats-pot-de-colle-ils-s-entendent-bien-avec-les-autres-anim.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332717853736990/photo-1511275539165-cc46b1ee89bf.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332825777373214/033_5800455_5c7ac69389949_0.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332906660593704/Chat-clone7.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749332990630428772/5c92cf432300003300add93d.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749333097480323162/images.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749333183698567228/yerlin-matu-481826-unsplash.png"
    ]
    const cat2 = cat[Math.floor(Math.random() * cat.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🐱 MIAOU 🐱')
      .setImage(cat2)
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
      .setTimestamp()

    message.channel.send(embed);

    message.delete();
  }
  if (message.content.toLowerCase() === prefix + 'foxedr') {
    const foxdr = [
      "https://media.giphy.com/media/XijnjGLwbq5u8/giphy.gif",
      "https://media.giphy.com/media/Ful8UzCFYAjlu/giphy.gif",
      "https://media.giphy.com/media/bGl8yMNLsU7ao/giphy.gif",
      "https://media.giphy.com/media/qkdTy6tTmF7Xy/giphy.gif",
      "https://media.giphy.com/media/dZ3s1d6bsqQDK/giphy.gif",
      "https://media.giphy.com/media/Ko5dZRMv9uJFu/giphy.gif",
      "https://media.giphy.com/media/13Xy3MWV2Psz4I/giphy.gif",
      "https://media.giphy.com/media/fTne319LfO6Noh80qD/giphy.gif",
      "https://media.giphy.com/media/KsXe1cCROlJks/giphy.gif",
      "https://media.giphy.com/media/ZgBGTqC2Nbbws/giphy.gif",
      "https://media.giphy.com/media/iuRl3MucE9D8Y/giphy.gif",
      "https://media.giphy.com/media/l0HlMKxwnwT6J7gha/giphy.gif",
      "https://media.giphy.com/media/hBbxDNW8LFEA0/giphy.gif"
    ]
    const foxd = foxdr[Math.floor(Math.random() * foxdr.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🦊 AAA 🦊')
      .setImage(foxd)
      .setTimestamp()
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')

    message.channel.send(embed);

    message.delete();
  }
  if (message.content.toLowerCase() === prefix + 'fox') {
    const fox = [
      "https://cdn.discordapp.com/attachments/692324903432486952/749335532269469696/7794422396_un-renard-illustration.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749335665967366174/B9723500716Z.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749335770380238928/1200px-Zyuuzikitune.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749335873639678042/58c8a433459a45ed288b45a9.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749336013037371392/renard_shutterstock_754833847_ban.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749336131803545661/MulotageC2A9D.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749336302826291220/renard-polaire-pelage-hiver-web.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749339927073915040/0f9f104d15e5af864f430346b3075bf6-1546889811.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749340032745340988/allonge.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749340207152627872/images.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749340397972488232/533136.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749340475986542712/petit-renard-et-guirlande-de-lumiere-animaux-facile-renards-peinture-par-numeros-figuredart-free-shi.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749340564746403936/18f2fa9743_122742_12-2017ledoux-029-085.png"
    ]
    const fox2 = fox[Math.floor(Math.random() * fox.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🦊 AAA 🦊')
      .setImage(fox2)
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
      .setTimestamp()

    message.channel.send(embed);

    message.delete();
  }
  if (message.content.toLowerCase() === prefix + 'birddr') {
    const birddr = [
      "https://media.giphy.com/media/5PSPV1ucLX31u/giphy.gif",
      "https://media.giphy.com/media/LZElUsjl1Bu6c/giphy.gif",
      "https://media.giphy.com/media/bvnoMS2RpDuSY/giphy.gif",
      "https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif",
      "https://media.giphy.com/media/nQZVy7bYWEKK4/giphy.gif",
      "https://media.giphy.com/media/vsGnvQD0ZcQco/giphy.gif",
      "https://media.giphy.com/media/l0HlIo3bPNiMUABt6/giphy.gif",
      "https://media.giphy.com/media/1n5eMh3mUUw12/giphy.gif",
      "https://media.giphy.com/media/121rAYEbiE01oI/giphy.gif",
      "https://media.giphy.com/media/BU1rWEqbUTXWw/giphy.gif",
      "https://media.giphy.com/media/5Dr8VvwXGngbe/giphy.gif",
      "https://media.giphy.com/media/1hWHUCgi3wKT6/giphy.gif",
      "https://media.giphy.com/media/WP2ujrEnniG2mSyxgM/giphy.gif"
    ]
    const birdd = birddr[Math.floor(Math.random() * birddr.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🐦 CUICUI 🐦')
      .setImage(birdd)
      .setTimestamp()
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')

    message.channel.send(embed);

    message.delete();
  }
  if (message.content.toLowerCase() === prefix + 'bird') {
    const bird = [
      "https://cdn.discordapp.com/attachments/702865356720570458/749341891203432588/202984001.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749341979334279268/83553330_027624150-1.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342160792322138/les-plus-belles-photos-doiseaux-preselectionnees-pour-le-bird-photographer-of-the-year-2020.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342261015478343/91KsHZXfLPL.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342333455171714/frigatebird-5b045e571d640400376297a4.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342451118112783/maxresdefault.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342558378786836/63667361-480px.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342640767762488/blue-and-gold-macaw-credit-matts-lindh-creative-commons.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342730546577458/293884104_6090753213001_6090746198001-vs.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749342871961862164/al0cltzbklrx2nibjiy3eydhrjzmdobdqgkrmqj0wwisvg6fmaizzadaixrblhwb-.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749343006045503579/hqdefault.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749343095589568522/european_turtle_dove_streptopelia_turtur_websitec_revital_salomon.png",
      "https://cdn.discordapp.com/attachments/702865356720570458/749343171162538084/red-winged-blackbird-landing.png"
    ]
    const bird2 = bird[Math.floor(Math.random() * bird.length)];

    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('🐦 CUICUI 🐦')
      .setImage(bird2)
      .setFooter('PapiFaitTout', 'https://media.discordapp.net/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
      .setTimestamp()

    message.channel.send(embed);

    message.delete();
  }

  /*Ticket*/
  const embednopepermpourticket = new Discord.MessageEmbed()
    .setColor(colors.RED)
    .setDescription(`❌ Vous n'avez pas l'autorisation suivante : \n Administrateur <@!${message.author.id}>.`)
  if (message.content === prefix + "support") {
    if (!message.member.hasPermission('ADMINISTRATOR'))
      return message.channel.send(embednopepermpourticket);
    message.delete();
    let icon = message.guild.iconURL({ size: 2048 });
    const support = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle('Support')
      .setDescription('Support du serveur')
      .setThumbnail(icon)
      .addFields(
        { name: `Vous êtes sur le support du serveur ${message.guild.name} !`, value: "Cliquez sur la réaction ci-dessous et un salon privé s'ouvrira dans lequel vous pourrez parler avec l'administration." },
      )
      .setTimestamp()
      .setFooter('PapiFaitTout', 'https://cdn.discordapp.com/attachments/739863457331150863/761643723670552586/1438996367_small.jpg');

    message.channel.send(support).then(e => e.react('🎟'))
  }

  if (message.content.toLowerCase() === prefix + 'close') {
    if (message.channel.name.startsWith('ticket')) {
      message.channel.send("Le ticket ceras suprimer dans 30 secondes !")
      message.guild.channels.cache.get(message.channel.id).setName(`👍ticket-fermer`)
      setTimeout(() => {
        message.channel.delete()
      }, 30 * 600)
    }
  }
})

Client.on("messageReactionAdd", (reaction, user) => {
  let avatar = user.avatarURL({ size: 2048 });

  if (user.bot) return
  if (reaction.emoji.name === "🎟") {

    reaction.remove().then(r => r.message.react('🎟'));
    reaction.message.guild.channels.create(`ticket ${user.username}`)
      .then((chan) => {
        chan.updateOverwrite(reaction.message.guild.roles.everyone, {
          SEND_MESSAGES: false,
          VIEW_CHANNEL: false,
        })
        chan.updateOverwrite(user, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true,
        })
        chan.send(
          new Discord.MessageEmbed()
            .setColor(colors.RED)
            .setThumbnail(avatar)
            .setTitle('Support')
            .addFields(
              { name: 'Veuillez patientez :', value: `Le staff sera bientot a vous.` },
              { name: '\u200B', value: '\u200B' },
              { name: '🔒 Pour fermer le ticket de support,', value: `Utilisez \`\`${prefix}close\`\`.` },
            )
            .setTimestamp()
            .setFooter('PapiFaitTout', 'https://cdn.discordapp.com/attachments/739863457331150863/761643723670552586/1438996367_small.jpg')
        )
      }
      )
  }
})

/*rejoind un serveur*/

Client.on('guildCreate', guild => {
  bdd[guild.id] = {}
  Savebdd()
});

/*quitter un serveur*/

Client.on('guildDelete', async guild => {
  console.log('moi quitter serveur !')
  bdd[guild.id]
  Savebdd()
  const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle('POURQUOI M\'AVOIR FAIT QUITTER VOTRE SERVEUR ?')
    .setDescription(`Dites nous pourquoi m\'avoir fait quitter votre serveur ? Veuillez aller sur notre [🕵️‍♀serveur de support](https://discord.gg/CZ6WHEx) pour nous expliquer pourquoi m'avoir fait quitter votre serveur ?`)
    .setAuthor(`Dites nous TOUT !`)
    .addFields(
      { name: 'Support', value: `[🕵️‍♀️Serveur de support](https://discord.gg/CZ6WHEx)`, inline: true },
      { name: 'Nous aider a nous amélioré', value: `N\'hésitez surtout pas a aller sur notre [serveur de support](https://discord.gg/CZ6WHEx) pour nous dire des choses a changer et a nous amélioré !`, inline: true }
    )
  let ownerMSG = guild.owner;
  ownerMSG.send(embed)
})

/*fonction*/

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

function Savebdd() {
  fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
    if (err) message.channel.send("Une erreur est survenue !");
  });
};

function progressBar(num1, num2, length) {
  if (num1 < 0 || num2 < 0) return "Number can not be negative !"
  if (length <= 0) return "Text length can not be below 1"
  let result = {
    text: "",
    percent: null
  }
  const chars = {
    empty: "░",
    full: "█"
  }
  const percentProgress = Math.round((num1 / num2) * 100)
  const progressCharsFull = Math.round((num1 / num2) * length)
  do result.text += chars.full
  while (result.text.length <= progressCharsFull && result.text.length <= length)
  result.text = result.text.slice(0, -1)
  if (length >= result.text.length) {
    do result.text += chars.empty
    while (result.text.length <= length)
  }
  result.text = result.text.slice(0, -1)
  result.percent = percentProgress
  return result
}

Client.login(config.token);