import fetch from 'node-fetch'

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `حط رابط المستودع اللي تبي تحمله يا بعدي.\n*مثال:* ${usedPrefix + command} https://github.com/GataNina-Li/GataBot-MD`

    if (!regex.test(args[0])) throw `الرابط اللي دخلته مو رابط جيتهاب صحيح، تأكد منه.`

    try {   
        let [_, user, repo] = args[0].match(regex) || []
        repo = repo.replace(/.git$/, '')

        let url = `https://api.github.com/repos/${user}/${repo}/zipball`
        let response = await fetch(url, { method: 'HEAD' })
        let filename = response.headers.get('content-disposition')?.match(/attachment; filename=(.*)/)?.[1]

        if (!filename) throw `صار فيه مشكلة وأنا أجيب اسم الملف.`

        await conn.sendMessage(m.chat, { react: { text: '🌑', key: m.key } })
        m.reply(`جاري التحميل، اصبر شوي...`)
        conn.sendFile(m.chat, url, filename, null, m)

    } catch (e) { 
        await conn.reply(m.chat, `يا ساتر، صار فيه مشكلة وأنا أنفذ الأمر.\n\n🔹 *للإبلاغ عن الخطأ:* #report\n🔹 *الأمر اللي استخدمته:* ${usedPrefix + command}`, m)
        console.error(`❗❗ خطأ في الأمر ${usedPrefix + command} ❗❗\n`, e)
    }
}

handler.help = ['تحميل من الإنترنت مثال .جتهاب <الرابط>']
handler.tags = ['downloader']
handler.command = /gitclone|جتهاب|جيتهاب|جيتهوب|clonarepo|clonarrepo|repoclonar/i
handler.limit = 2
handler.level = 1
handler.register = true

export default handler