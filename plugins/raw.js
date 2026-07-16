// plugins/tool-dumpraw.js

const MAX_CHUNK = 3800 

function safeStringify(obj) {

    return JSON.stringify(

        obj,

        (key, value) => {

            if (value && (value.type === 'Buffer' || value instanceof Uint8Array)) {

                return `[Buffer len=${value.length ?? value.data?.length ?? 0}]`

            }

            return value

        },

        2

    )

}

function buildRelaySnippet(jidPlaceholder, message, extra) {

    const messageStr = safeStringify(message)

    const extraStr = extra ? safeStringify(extra) : null

    let code = `/* تم توليده تلقائياً عبر .dumpraw */\n`

    code += `await sock.relayMessage(${JSON.stringify(jidPlaceholder)}, ${messageStr}`

    code += extraStr ? `, ${extraStr})` : `, {})`

    return code

}

const handler = async (m, { conn }) => {

    const quoted = m.quoted ? m.quoted : null

    if (!quoted) throw '⚠️ رد (reply) على الرسالة التي تريد استخراجها ثم اكتب: .dumpraw'

    const rawMessage = quoted.message || quoted.msg || quoted

    if (!rawMessage) throw '❌ تعذّر الوصول إلى محتوى الرسالة المردود عليها.'

    const jidPlaceholder = m.chat 

    const extraNodes = quoted.additionalNodes || rawMessage.additionalNodes || null

    const snippet = buildRelaySnippet(jidPlaceholder, rawMessage, extraNodes ? { additionalNodes: extraNodes } : null)

    // إرسال النتيجة كملف فقط

    await conn.sendMessage(m.chat, { 

        document: Buffer.from(snippet), 

        mimetype: 'text/plain', 

        fileName: 'raw_message.json',

        caption: "📄 تم استخراج بيانات الرسالة بنجاح." 

    }, { quoted: m })

}

handler.command = ['dumpraw', 'استخراج_خام', 'rawmsg']

export default handler

