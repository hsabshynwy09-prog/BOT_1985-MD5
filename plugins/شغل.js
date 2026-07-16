// plugins/exec-message.js

import { generateWAMessageFromContent, proto } from "@itsliaaa/baileys";

let handler = async (m, { conn, text }) => {

    // نتحقق من وجود كود JSON بعد الأمر

    if (!text) throw "⚠️ يرجى إرسال كود الـ JSON الخاص بالرسالة بعد الأمر.";

    try {

        // تنظيف النص (في حال كان هناك علامات ``` )

        let jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let json = JSON.parse(jsonStr);

        // إرسال الرسالة باستخدام relayMessage

        // نستخدم m.chat ليرسلها في نفس المكان، أو يمكنك استبدال m.chat بـ ID الجروب

        await conn.relayMessage(m.chat, json, { messageId: null });

        

        await m.reply("✅ تم تنفيذ وبناء الرسالة بنجاح.");

    } catch (e) {

        await m.reply("❌ حدث خطأ في معالجة الكود، تأكد أنه JSON صحيح:\n" + e.message);

    }

};

handler.command = /^(runmsg|تشغيل_رسالة)$/i;

handler.owner = true;

export default handler;

