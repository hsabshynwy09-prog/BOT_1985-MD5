let handler = async (m, { isAdmin, isOwner, conn }) => {
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
    }

    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!groupMetadata) throw 'ما قدرت أجيب بيانات المجموعة.'

    const participants = groupMetadata.participants
    const subject      = groupMetadata.subject || 'المجموعة'

    // baileys: p.id = @lid أو @s.whatsapp.net حسب وضع المجموعة
    // p.phoneNumber = رقم الهاتف الحقيقي إن كان p.id بصيغة @lid
    const getDisplay = p => (p.phoneNumber || p.id || '').split('@')[0]
    const getJid     = p => p.id

    const allMembers = participants.filter(p => p.id)
    const admins     = allMembers.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    const owner      = allMembers.find(p => p.admin === 'superadmin')
    const ownerTag   = owner ? `@${getDisplay(owner)}` : 'غير موجود'

    const listAdmin   = admins.map((p, i) => `*┃ \`${i + 1}\`.* @${getDisplay(p)}`).join('\n') || '┃ لا يوجد مشرفون'
    const listMembers = allMembers.map((p, i) => `*┃ \`${i + 1}\`.* @${getDisplay(p)}`).join('\n')

    const teks = `
*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┣*
*┃╻💬╹↵ ❮ منشن جماعي ❯ ↯*
*┃╻🔖╹↵ ٭ ❮ ${subject} ❯ ٭*
*┃╻👥╹↵ ❮ عدد الأعضاء: ${allMembers.length} ❯ ↯*
*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┣*
*┃╻👑╹↵ ❮ مالك المجموعة ❯ ↯*
*┃╻🔖╹↵ ${ownerTag}*
*┣┅ ━━━━━━━━━━━━━━━ ┅ ━┣*
*┃╻🕵🏻‍♂️╹↵ ❮ المشرفون ❯ ↯*
${listAdmin}
*┣┅ ━━━━━━━━━━━━━━━ ┅ ━┣*
*┃╻👥╹↵ ❮ الأعضاء ❯ ↯*
${listMembers}
*┗┅ ━━━━━━━━━━━━━━━ ┅ ━┣*
> *٭ ❞ 𝐁𝐎𝐓 𝟏𝟗𝟖𝟓 ❝ ٭*`.trim()

    // دفعات 50 لضمان عمل المنشن
    const chunkSize = 50
    for (let i = 0; i < allMembers.length; i += chunkSize) {
        const chunk   = allMembers.slice(i, i + chunkSize)
        const isFirst = i === 0

        if (isFirst) {
            await conn.sendMessage(m.chat, {
                image:    { url: 'https://files.catbox.moe/adslxf.png' },
                caption:  teks,
                mentions: chunk.map(getJid)
            })
        } else {
            await conn.sendMessage(m.chat, {
                text:     chunk.map(p => `@${getDisplay(p)}`).join(' '),
                mentions: chunk.map(getJid)
            })
        }
    }
}

handler.command = /^(منشن)$/i
handler.group   = true
handler.admin   = true

export default handler
