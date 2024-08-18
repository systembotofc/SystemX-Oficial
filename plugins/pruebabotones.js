import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

let tags = {
  'main': 'INFO',
  'game': 'JUEGOS',
  'serbot': 'SUB BOTS',
  'rpg': 'ECONOMÍA',
  'rg': 'REGISTRO',
  'downloader': 'DESCARGAS',
  'marker': 'LOGO - MAKER',
  'nable': 'ACTIVADORES',
  'group': 'GRUPOS',
  'search': 'BUSCADOR',
  'img': 'IMÁGENES',
  'tools': 'HERRAMIENTAS',
  'fun': 'DIVERCIÓN',
  'audio': 'EFECTO DE AUDIOS',
  'sticker': 'STICKERS',
  'nsfw': 'NSFW',
  'owner': 'CREADOR',
  'advanced': 'AVANZADO',
}

const defaultMenu = {
  before: `
╭━━━━━━━∙⋆⋅⋆∙━━━━━━━━╮
➤📝 Nombre : %name
➤🪙 Euros : %limit
➤🤖 User : %taguser
➤📈 Nivel : %level
➤⭐ XP : %totalexp
╰━━━━━━━∙⋆⋅⋆∙━━━━━━━━╯

╭━━━━━━━∙⋆⋅⋆∙━━━━━━━━╮
➤🗣 Creador : 𝘽𝙀𝙉𝙅𝘼𝙈𝙄𝙉
➤📲 Número : Wa.me/51936732723
➤⌛ Tiempo : %uptime
╰━━━━━━━∙⋆⋅⋆∙━━━━━━━━╯

%readmore
`.trimStart(),
  header: 'MENU X %category\n\n╭━━━━━━━∙⋆⋅⋆∙━━━━━━━━╮',
  body: '➤ %cmd\n',
  footer: '╰━━━━━━━∙⋆⋅⋆∙━━━━━━━━╯\n',
  after: '',
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(() => ({}))) || {}
    let { exp, star, level } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let d = new Date(new Date + 3600000)
    let locale = 'es'
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        star: plugin.star,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    for (let plugin of help)
      if (plugin && 'tags' in plugin)
        for (let tag of plugin.tags)
          if (!(tag in tags) && tag) tags[tag] = tag
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : ``) + defaultMenu.after
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%isstar/g, menu.star ? '˄' : '')
                .replace(/%isPremium/g, menu.premium ? '˄' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    let text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: _p, uptime, muptime,
      taguser: '@' + m.sender.split("@s.whatsapp.net")[0],
      wasp: '@0',
      me: conn.getName(conn.user.jid),
      npmname: package.name,
      version: package.version,
      npmdesc: package.description,
      npmmain: package.main,
      author: package.author.name,
      license: package.license,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]',
      level, star, name, weton, week, date, dateIslamic, time, totalreg, rtotalreg,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])
    
    let listSections = []    
    listSections.push({
      title: '',
      rows: [
        { header: "📚 MENU COMPLETO", title: "", id: '.allmenu', description: 'Muestra todos los comandos del bot.' },
        { header: "🤖 SUD BOT", title: "", id: '.serbot', description: 'Convierte en SudBot.' },
        { header: "LISTAS🇵🇪", title: "", id: '.ejemplo🇵🇪', description: 'Ejemplo de comando para Perú.' },
        { header: "LISTAS🇨🇱", title: "", id: '.ejemplo🇨🇱', description: 'Ejemplo de comando para Chile.' },
        { header: "LISTAS🇦🇷", title: "", id: '.ejemplo🇦🇷', description: 'Ejemplo de comando para Argentina.' }
      ]
    })
    
    await conn.sendList(m.chat, '*\╭━〔 OPCIONES | LISTAS 〕━╮\*\n┃➔ 👑 Desarrollador: Benjamin\n┃➔ ☑ Versión: 1.0.0\n╰━━━━━━━━━━━━━╯', null, 'OPCIONES | LISTAS', listSections, { mentions: [m.sender] }, { quoted: m })
    
  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.\n' + e, m)
  }
}
handler.help = ['menu4', 'help4']
handler.tags = ['main4']
handler.command = /^(menu4|help4)$/i
handler.exp = 0
export default handler
