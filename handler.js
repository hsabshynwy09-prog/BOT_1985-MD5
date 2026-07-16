
import { generateWAMessageFromContent } from '@itsliaaa/baileys'
import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import fs, { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'

const { proto } = await import('@itsliaaa/baileys')

const isNumber = (x) => typeof x === 'number' && !isNaN(x)
const delay = (ms) => isNumber(ms) && new Promise((resolve) => setTimeout(() => resolve(), ms))
const isGroupJid = (jid) => typeof jid === 'string' && jid.endsWith('@g.us')
const isNewsletterJid = (jid) => typeof jid === 'string' && jid.endsWith('@newsletter')

export async function handler(chatUpdate) {
    if (!this.pushMessage) {
        this.pushMessage = async (messages) => {
            try {
                if (!Array.isArray(messages)) messages = [messages]
                for (const message of messages) {
                    if (!message?.key?.id) continue
                    const jid = message.key.remoteJid
                    if (!jid) continue
                    if (!this.chats) this.chats = {}
                    if (!this.chats[jid]) this.chats[jid] = { id: jid }
                }
            } catch (e) {
                console.error('[BOT1985] Error:', e)
            }
        }
    }

    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()

    if (!chatUpdate) return
    if (!chatUpdate?.messages) return

    try {
        await this.pushMessage(chatUpdate.messages).catch(console.error)
    } catch (e) {
        console.error('[BOT1985] Failed:', e)
    }

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    // ✅ البوت يعمل في المجموعات والقنوات
    const rawJid = m?.chat || m?.key?.remoteJid || m?.jid
    const inGroup = m?.isGroup === true || isGroupJid(rawJid)
    const inNewsletter = isNewsletterJid(rawJid)
    if (!inGroup && !inNewsletter) return

    if (global.db.data == null) await global.loadDatabase()

    try {
        m = await smsg(this, m) || m
        if (!m) return
        console.log('[DBG] conn set:', !!m.conn, '| sender:', m.sender, '| participant:', m.key?.participant, '| topParticipant:', m.participant, '| chat:', m.chat)
        m.exp = 0

        // ========== إعدادات المستخدم (أساسية + اقتصاد/RPG) ==========
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') global.db.data.users[m.sender] = {}
            if (user) {
                if (!('name' in user)) user.name = m.name
                if (!('exp' in user) || !isNumber(user.exp)) user.exp = 0
                if (!('coin' in user) || !isNumber(user.coin)) user.coin = 0
                if (!('bank' in user) || !isNumber(user.bank)) user.bank = 0
                if (!('level' in user) || !isNumber(user.level)) user.level = 0
                if (!('health' in user) || !isNumber(user.health)) user.health = 100
                if (!('genre' in user)) user.genre = ''
                if (!('birth' in user)) user.birth = ''
                if (!('marry' in user)) user.marry = ''
                if (!('description' in user)) user.description = ''
                if (!('packstickers' in user)) user.packstickers = null
                if (!('premium' in user)) user.premium = false
                if (!isNumber(user.premiumTime)) user.premiumTime = 0
                if (!('banned' in user)) user.banned = false
                if (!('bannedReason' in user)) user.bannedReason = ''
                if (!('BannedReason' in user)) user.BannedReason = ''
                if (!('commands' in user) || !isNumber(user.commands)) user.commands = 0
                if (!('afk' in user) || !isNumber(user.afk)) user.afk = -1
                if (!('afkReason' in user)) user.afkReason = ''
                if (!('warn' in user) || !isNumber(user.warn)) user.warn = 0
            } else {
                global.db.data.users[m.sender] = {
                    name: m.name,
                    exp: 0,
                    coin: 0,
                    bank: 0,
                    level: 0,
                    health: 100,
                    genre: '',
                    birth: '',
                    marry: '',
                    description: '',
                    packstickers: null,
                    premium: false,
                    premiumTime: 0,
                    banned: false,
                    bannedReason: '',
                    BannedReason: '',
                    commands: 0,
                    afk: -1,
                    afkReason: '',
                    warn: 0
                }
            }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}

            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('isMute' in chat)) chat.isMute = false
                if (!('welcome' in chat)) chat.welcome = true
                if (!('detect' in chat)) chat.detect = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('delete' in chat)) chat.delete = false
                if (!('stickers' in chat)) chat.stickers = false
                if (!('autosticker' in chat)) chat.autosticker = false
                if (!('audios' in chat)) chat.audios = true
                if (!('reaction' in chat)) chat.reaction = true
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('modoadmin' in chat)) chat.modoadmin = false
                if (!('autorespond' in chat)) chat.autorespond = true
                if (!('game' in chat)) chat.game = true
                if (!('game2' in chat)) chat.game2 = true
                if (!('simi' in chat)) chat.simi = false
                if (!('primaryBot' in chat)) chat.primaryBot = null
                if (!('antiLink' in chat)) chat.antiLink = true
                if (!('nsfw' in chat)) chat.nsfw = false
                if (!('economy' in chat)) chat.economy = true
                if (!('gacha' in chat)) chat.gacha = true
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    isMute: false,
                    welcome: true,
                    detect: true,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: false,
                    stickers: false,
                    autosticker: false,
                    audios: false,
                    reaction: true,
                    viewonce: false,
                    modoadmin: false,
                    autorespond: true,
                    game: true,
                    game2: true,
                    simi: false,
                    primaryBot: null,
                    antiLink: true,
                    nsfw: false,
                    economy: true,
                    gacha: true,
                    expired: 0
                }
            }

            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = false
                if (!('jadibotmd' in settings)) settings.jadibotmd = true
                if (!('prefix' in settings)) settings.prefix = opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    autoread: false,
                    restrict: false,
                    jadibotmd: true,
                    prefix: opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'
                }
            }
        } catch (e) {
            console.error(e)
        }

        if (typeof m.text !== 'string') m.text = ''

        const user = global.db.data.users[m.sender]

        // تحديث الاسم إذا تغيّر
        try {
            const actual = user.name || ''
            const nuevo = m.pushName || (this.getName ? await this.getName(m.sender) : actual)
            if (typeof nuevo === 'string' && nuevo.trim() && nuevo !== actual) {
                user.name = nuevo
            }
        } catch {}

        const chat = global.db.data.chats[m.chat]

        // ========== إعدادات البادئة ==========
        var settings = global.db.data.settings[this.user.jid] || {}
        let prefix
        const defaultPrefix = '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'
        if (settings.prefix) {
            if (settings.prefix.includes(',')) {
                const prefixes = settings.prefix.split(',').map(p => p.trim())
                prefix = new RegExp('^(' + prefixes.map(p => p.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&')).join('|') + ')')
            } else if (settings.prefix === defaultPrefix) {
                prefix = new RegExp('^[' + settings.prefix.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']')
            } else {
                prefix = new RegExp('^' + settings.prefix.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&'))
            }
        } else {
            prefix = new RegExp('')
        }

        // ========== الصلاحيات ==========
        const detectwhat = '@s.whatsapp.net'

        const isROwner = [...global.owner.map(n => n)].map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isPrems = isROwner
            || (global.prems || []).map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
            || user.premium === true
            || (global.db.data.users[m.sender]?.premiumTime > 0)
        const isOwners = [this.user.jid, ...global.owner.map(n => n + detectwhat)].includes(m.sender)

        // طابور الرسائل لغير المميزين (من الكود الثاني)
        if (opts['queque'] && m.text && !isPrems) {
            const queque = this.msgqueque
            const time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            const _interval = setInterval(async () => {
                if (queque.indexOf(previousID) === -1) clearInterval(_interval)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return

        m.exp += Math.ceil(Math.random() * 10)

        // ========== تصفية الرسائل ==========
        if (m.id?.startsWith('EVO') || m.id?.startsWith('Lyru-') || m.id?.startsWith('EvoGlobalBot-') ||
            (m.id?.startsWith('BAE5') && m.id?.length === 16) || m.id?.startsWith('B24E') ||
            (m.id?.startsWith('8SCO') && m.id?.length === 20) || m.id?.startsWith('FizzxyTheGreat-') ||
            m.id?.startsWith('NJX-')) {
            return
        }

        if (opts['nyimak']) return
        if (!isROwner && opts['self']) return
        if (opts['pconly'] && m.chat?.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat?.endsWith('g.us')) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return

        // ========== معالج الأزرار ==========
        try {
            let buttonId = null

            if (m.message?.buttonsResponseMessage) {
                buttonId = m.message.buttonsResponseMessage.selectedButtonId
            }
            else if (m.message?.templateButtonReplyMessage) {
                const templateMsg = m.message.templateButtonReplyMessage
                buttonId = templateMsg.selectedId || templateMsg.selectedDisplayText
            }
            else if (m.message?.interactiveResponseMessage) {
                const intMsg = m.message.interactiveResponseMessage

                if (intMsg.nativeFlowResponseMessage) {
                    const native = intMsg.nativeFlowResponseMessage
                    buttonId = native.id
                    if (!buttonId && native.paramsJson) {
                        try {
                            const params = JSON.parse(native.paramsJson)
                            buttonId = params.id || params.selected_id
                        } catch (e) {}
                    }
                }

                if (!buttonId && intMsg.listResponseMessage) {
                    const listMsg = intMsg.listResponseMessage
                    buttonId = listMsg.singleSelectReply?.selectedRowId
                    if (!buttonId) {
                        buttonId = listMsg.title || listMsg.description
                    }
                }
            }

            if (buttonId) {
                let finalId = buttonId.trim()
                if (!finalId.startsWith('.')) finalId = '.' + finalId
                finalId = finalId.replace(/^\.\./, '.')
                m.text = finalId
                m.isCommand = true
            }
        } catch (err) {
            console.error('[BOT1985-BUTTON ERROR]', err)
        }

        // ========== تسجيل آخر 30 رسالة ==========
        if (!global.lastMessages) global.lastMessages = []
        global.lastMessages.push({
            sender: m.sender,
            senderName: m.pushName || m.name || 'مجهول',
            text: m.text || m.body || m.message?.conversation || '',
            body: m.body || '',
            isGroup: m.isGroup,
            chat: m.chat,
            time: Date.now()
        })
        if (global.lastMessages.length > 30) global.lastMessages.shift()

        let usedPrefix

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        // تذكر ذا المكان يلويد
        const groupMetadata = null
        const participants = []
        const userGroup = {}
        const botGroup = {}

        // ========== حلقة الأوامر ==========
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            if (plugin.disabled) continue

            const __filename = join(___dirname, name)

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename,
                        conn: this,
                        user,
                        chat,
                        settings
                    })
                } catch (e) {
                    console.error(e)
                }
            }

            if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

            const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : prefix

            let matchCandidates = _prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                [[null, null]]

            let match = null
            for (let i = 0; i < matchCandidates.length; i++) {
                if (matchCandidates[i][0]) {
                    match = matchCandidates[i]
                    break
                }
            }

            if (typeof plugin.before === 'function') {
                try {
                    const beforeResult = await plugin.before.call(this, m, {
                        match, conn: this, participants, groupMetadata,
                        userGroup, botGroup,
                        user: {}, bot: {}, isROwner, isOwner,
                        isRAdmin: false, isAdmin: m.isAdmin || false, isPrems,
                        isBotAdmin: m.isBotAdmin || false,
                        chatUpdate, __dirname: ___dirname, __filename,
                        user, chat, settings
                    })
                    if (beforeResult) continue
                } catch (e) {
                    console.error('[before]', name, e.message)
                }
            }

            if (typeof plugin !== 'function') continue
            if (!match) continue

            usedPrefix = (match[0] || [])[0] || ''
            let noPrefix = m.text.slice(usedPrefix.length)
            let parts = noPrefix.trim().split(/\s+/).filter(v => v)
            let command = parts[0] ? parts[0].toLowerCase() : ''
            let args = parts.slice(1)
            let _args = noPrefix.trim().split(/\s+/).slice(1)
            let text = _args.join(' ')

            global.comando = command

            if (!isOwners && settings.self) return

            let isAccept = false
            if (plugin.command instanceof RegExp) {
                isAccept = plugin.command.test(command)
            } else if (Array.isArray(plugin.command)) {
                for (let i = 0; i < plugin.command.length; i++) {
                    const cmd = plugin.command[i]
                    if (cmd instanceof RegExp) {
                        if (cmd.test(command)) { isAccept = true; break }
                    } else if (cmd.toLowerCase() === command) {
                        isAccept = true; break
                    }
                }
            } else if (typeof plugin.command === 'string') {
                isAccept = plugin.command.toLowerCase() === command
            }

            // ========== تنسيق البوت الأساسي (primaryBot) للتعدد ==========
            if (global.db.data.chats[m.chat]?.primaryBot && global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
                const primaryBotConn = (global.conns || []).find(c => c.user.jid === global.db.data.chats[m.chat].primaryBot && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
                const realParticipants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
                const primaryBotInGroup = realParticipants.some(p => p.jid === global.db.data.chats[m.chat].primaryBot)
                if ((primaryBotConn && primaryBotInGroup) || global.db.data.chats[m.chat].primaryBot === this.user.jid) {
                    throw false
                } else {
                    global.db.data.chats[m.chat].primaryBot = null
                }
            }

            if (!isAccept) continue
            m.plugin = name
            global.db.data.users[m.sender].commands = (global.db.data.users[m.sender].commands || 0) + 1

            // ========== استخدام الصلاحيات مباشرة من m ==========
            const isAdmin = m.isAdmin || false
            const isBotAdmin = m.isBotAdmin || false

            // ========== فحص الحظر ==========
            if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                let botId = this.user.jid
                let primaryBotId = chat?.primaryBot

                if (!['مطور-حظر.js'].includes(name) && chat?.isBanned && !isROwner) {
                    if (!primaryBotId || primaryBotId === botId) {
                        const aviso = `ꕥ البوت *${typeof botname !== 'undefined' ? botname : this.user.jid}* معطّل في هذه المجموعة\n\n> ✦ *المشرف* يقدر يفعّله بالأمر:\n> » *${usedPrefix}bot on*`.trim()
                        await m.reply(aviso)
                    }
                    return
                }
                if (name !== 'مطور-حظر.js' && name !== 'مطور-مشمهم.js' && name !== 'مطور-مشمهم².js' && name !== 'جروب-مسح.js' && chat?.isBanned && !isROwner) return

                if (m.text && user?.banned && !isROwner) {
                    const mensaje = `ꕥ أنت محظور، ما تقدر تستخدم أوامر البوت!\n\n> ● *السبب ›* ${user.bannedReason || user.BannedReason || ''}\n\n> ● إذا تحس إن هذا خطأ، تواصل مع المشرف.`.trim()
                    if (!primaryBotId || primaryBotId === botId) {
                        m.reply(mensaje)
                    }
                    return
                }
            }

            let adminMode = global.db.data.chats[m.chat]?.modoadmin
            if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin) continue

            // فحص الصلاحيات
            if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                global.dfail('owner', m, this); continue
            }
            if (plugin.rowner && !isROwner) {
                global.dfail('rowner', m, this); continue
            }
            if (plugin.owner && !isOwner) {
                global.dfail('owner', m, this); continue
            }
            if (plugin.premium && !isPrems) {
                global.dfail('premium', m, this); continue
            }
            if (plugin.group && !m.isGroup && !m.isNewsletter) {
                global.dfail('group', m, this); continue
            } else if (plugin.botAdmin && !isBotAdmin) {
                global.dfail('botAdmin', m, this); continue
            } else if (plugin.admin && !isAdmin) {
                global.dfail('admin', m, this); continue
            }
            if (plugin.private && m.isGroup) {
                global.dfail('private', m, this); continue
            }

            m.isCommand = true
            m.exp += plugin.exp ? parseInt(plugin.exp) : 10

            let extra = {
                match, usedPrefix, noPrefix, _args, args, command, text,
                conn: this, participants, groupMetadata,
                userGroup, botGroup,
                user: {}, bot: {},
                isROwner, isOwner, isRAdmin: false, isAdmin: isAdmin,
                isBotAdmin: isBotAdmin, isPrems,
                chatUpdate, __dirname: ___dirname, __filename,
                user, chat, settings
            }

            try {
                await plugin.call(this, m, extra)
            } catch (e) {
                m.error = e
                console.error(e)
                if (e) m.reply(format(e) || 'خطأ غير معروف')
            } finally {
                if (typeof plugin.after === 'function') {
                    try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
                }
            }
            break
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m?.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key?.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }

        if (m?.sender) {
            const user = global.db.data.users[m.sender]
            if (user) user.exp += m.exp || 0
        }

        try {
            if (!opts['noprint']) await (await import('./lib/print.js')).default(m, this)
        } catch (e) {
            console.warn(e)
        }

        if (opts['autoread'] && m) await this.readMessages([m.key])
    }
}

// ========== معالج تغيير المشاركين ==========
export async function participantsUpdate({ id, participants, action }) {
    if (opts['self']) return
    if (this.isInit) return
    if (global.db.data == null) await global.loadDatabase()

    let chat = global.db.data.chats[id] || {}
    let text = ''

    try {
        let participantJid = ''
        if (Array.isArray(participants) && participants.length > 0) {
            const first = participants[0]
            if (typeof first === 'string') participantJid = first
            else if (first && typeof first === 'object') participantJid = first.id || first.jid || ''
        } else if (participants && typeof participants === 'string') {
            participantJid = participants
        } else if (participants && typeof participants === 'object') {
            participantJid = participants.id || participants.jid || ''
        }

        switch (action) {
            case 'promote':
                text = chat.sPromote || this.spromote || 'لقد اصبح مشرف @user'
                break
            case 'demote':
                text = chat.sDemote || this.sdemote || 'لقد نزل من الأدمن@user'
                break
            default: return
        }

        if (text && participantJid) {
            let cleanJid = await this.convertLidToRealJid(participantJid, id)

            if (!cleanJid || cleanJid.endsWith('@lid')) {
                const meta = this.chats?.[id]?.metadata || await this.groupMetadata(id)
                cleanJid = this.extractCleanJid(participantJid, meta)
            }

            if (cleanJid && !cleanJid.includes('@')) {
                cleanJid = cleanJid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            }

            if (!cleanJid || cleanJid === '@s.whatsapp.net') {
                cleanJid = String(participantJid).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            }

            const mention = cleanJid.split('@')[0]
            const finalText = text.replace('@user', '@' + mention)
            await this.sendMessage(id, { text: finalText, mentions: [cleanJid] })
        }
    } catch (err) {
        console.error('[participantsUpdate]', err.message)
    }
}

export async function groupsUpdate(groupsUpdate) {
    if (opts['self']) return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let text = ''
        if (!text) continue
        await this.sendMessage(id, { text, mentions: this.parseMention(text) })
    }
}

export async function callUpdate(callUpdate) {
    for (let nk of callUpdate) {
        if (!nk.isGroup && nk.status === 'offer') {
            await this.updateBlockStatus(nk.from, 'block')
        }
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant, remoteJid } = message
        if (fromMe) return
        let msg = await this.serializeM(this.loadMessage(id))
        let chat = global.db.data.chats[msg?.chat] || {}
        if (!chat?.delete) return
        if (!msg) return
        let isGroup = remoteJid.endsWith('@g.us')
        let isPrivate = !isGroup && remoteJid.endsWith('@s.whatsapp.net')
        if (!isGroup && !isPrivate) return
        const antideleteMessage = `*╭━━⬣ حماية الحذف ⬣━━*\n*┃📑 المحذوف من:* @${participant.split('@')[0]}\n*┃💬 الرسالة:* ${msg.text}\n*╰━━━⬣ حماية الحذف ⬣━━╯*`
        await this.sendMessage(msg.chat, { text: antideleteMessage, mentions: [participant] }, { quoted: msg })
        this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
    } catch (e) {
        console.error(e)
    }
}

global.dfail = async (type, m, conn) => {
    let msg = {
    rowner: `✯ مرحبا، هذا الأمر مخصص لـ *مُنشئ* البوت فقط.`,
    owner: `✯ مرحبا، هذا الأمر مخصص لـ *مُنشئ* البوت و *مساعدي البوت*.`,
    mods: `✯ مرحبا، هذا الأمر مخصص لـ *المُديرين* فقط.`,
    premium: `✯ مرحبا، هذا الأمر مخصص للمستخدمين *المُميزين* فقط.`,
    group: `✯ مرحبا، هذا الأمر يعمل في *المجموعات* فقط.`,
    private: `✯ مرحبا، هذا الأمر يعمل في الدردشة *الخاصة* فقط.`,
    admin: `✯ مرحبا، هذا الأمر مخصص لـ *مشرفي* المجموعة فقط.`,
    botAdmin: `✯ مرحبا، يجب أن تكون البوت *مشرفة* لتنفيذ هذا الأمر.`,
    unreg: `✯ مرحبا، يجب أن تكون *مسجل* لاستخدام هذا الأمر.\n\nلتستخدم البوت يجب التسجيل أولاً\n\nاستخدم: */reg اسم.عمر*\n\n_مثال: */reg محمد.25*_\n\nلا تضع النجوم * *`,
    restrict: `✯ مرحبا، هذه الميزة *مُعطلة*.`
    }[type]

    if (!msg) return
    try {
        const imageUrl = 'https://files.catbox.moe/g4bd9q.jpg'
        const imgRes = await fetch(imageUrl)
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
        const contentMsg = { orderMessage: { orderId: 'BOT1985-ERROR', thumbnail: imgBuffer, itemCount: 1, status: 1, surface: 1, message: msg, orderTitle: '🤖 𝐁𝐎𝐓 𝟏𝟗𝟖𝟓 🤖', sellerJid: conn.user.jid, token: '1', messageVersion: 1 } }
        const webMsg = proto.Message.fromObject(contentMsg)
        const waMsg = await generateWAMessageFromContent(m.chat, webMsg, { userJid: conn.user.jid, quoted: m })
        await conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id })
    } catch (err) {
        console.error('[dfail error]', err?.message || err)
        return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("✅ تم تحديث ملف handler.js بنجاح"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})