// plugins/بلوقن.js

// ✧ 2B - YoRHa Unit No.2 Type B - إدارة البلوقنات 📦

import fs from "fs";

import path from "path";

import { downloadContentFromMessage, generateWAMessageFromContent, proto, generateMessageIDV2 } from "@itsliaaa/baileys";

let handler = async (m, { conn, args, usedPrefix }) => {

    const react = async (e) => {

        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}

    };

    const pluginsDir = path.dirname(global.__filename(import.meta.url, true));

    const currentFile = path.basename(global.__filename(import.meta.url, true));

    const getPlugins = () => fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js") && f !== currentFile);

    const findPlugin = (name) => {

        let searchName = name.replace(/\.js$/i, "").trim().toLowerCase();

        searchName = searchName.replace(/\s+/g, '-');

        const allFiles = getPlugins();

        

        let found = allFiles.find(f => f.toLowerCase() === searchName + ".js") ||

                    allFiles.find(f => f.replace(/-/g, '_').toLowerCase() === searchName.replace(/-/g, '_') + ".js") ||

                    allFiles.find(f => f.toLowerCase().includes(searchName)) ||

                    allFiles.find(f => searchName.includes(f.replace(".js", "").toLowerCase()));

        return found || null;

    };

    const action = (args[0] || "").toLowerCase();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    //  عرض — عرض الكود

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (/^(عرض|show|get)$/i.test(action)) {

        const nameArg = args.slice(1).join(" ").trim();

        if (!nameArg) return m.reply(`📄 *عـرض بـلـوقـن*\n📌 *الاستخدام:* ${usedPrefix}بلوقن عرض <اسم>`);

        const foundFile = findPlugin(nameArg);

        if (!foundFile) {

            await react("❌");

            return m.reply(`❌ *خـطـأ*\nالملف "${nameArg}" غير موجود\n\n💡 جرب .بلوقن لست لعرض كل الملفات`);

        }

        const filePath = path.join(pluginsDir, foundFile);

        const code = fs.readFileSync(filePath, "utf-8");

        await react("📄");

        try {

            const codeLines = code.split('\n');

            const codeBlocks = codeLines.map((line) => ({

                highlightType: line.trim().startsWith('//') ? 2 : line.trim().startsWith('import') ? 3 : 4,

                codeContent: line + '\n'

            }));

            const richMessage = {

                richResponseMessage: {

                    messageType: 1,

                    submessages: [

                        { messageType: 2, messageText: `\n📄 *${foundFile}*\n📦 الحجم: ${(code.length / 1024).toFixed(2)} KB\n📝 ${codeLines.length} سطر\n` },

                        { messageType: 5, codeMetadata: { codeLanguage: "javascript", codeBlocks: codeBlocks.slice(0, 100) } }

                    ],

                    contextInfo: { isForwarded: true, forwardingScore: 1, forwardOrigin: 4 }

                }

            };

            const msg = await generateWAMessageFromContent(m.chat, { botForwardedMessage: { message: richMessage } }, {

                senderId: conn.user.id, userJid: conn.user.id, messageId: generateMessageIDV2(conn.user.id), quoted: m

            });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (metaErr) {

            const menuText = `*${foundFile}*\n📦 الحجم: ${(code.length / 1024).toFixed(2)} KB\n\n⚔️ اضغط على الزر أدناه لنسخ الكود`;

            const msg2 = generateWAMessageFromContent(m.chat, {

                viewOnceMessage: {

                    message: {

                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({

                            body: { text: menuText },

                            footer: { text: '✧ 𝟐𝐁 - YoRHa Unit ✧' },

                            nativeFlowMessage: { buttons: [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: '📋 نسخ الكود', copy_code: code }) }] }

                        })

                    }

                }

            }, { userJid: conn.user.jid, quoted: m });

            await conn.relayMessage(m.chat, msg2.message, { messageId: msg2.key.id });

        }

        return;

    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    //  لست — عرض كل البلوقنات

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (/^(لست|list)$/i.test(action)) {

        const plugins = getPlugins();

        if (!plugins.length) return m.reply("📂 *لا يوجد بلوقنات حالياً*");

        let txt = `📦 *قـائـمـة الـبـلـوقـنـات*\n\n`;

        plugins.forEach((f, i) => txt += `│ ${i + 1}. ${f.replace(".js", "")}\n`);

        txt += `\n📊 *المجموع:* ${plugins.length} بلوقن`;

        await react("📦");

        return m.reply(txt);

    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    //  حذف — حذف البلوقن

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (/^(حذف|delete|del|remove)$/i.test(action)) {

        const nameArg = args.slice(1).join(" ").trim();

        if (!nameArg) return m.reply("🗑️ *حـذف بـلـوقـن*\n📌 *الاستخدام:* .بلوقن حذف <اسم>");

        const foundFile = findPlugin(nameArg);

        if (!foundFile) return m.reply(`❌ الملف "${nameArg}" غير موجود`);

        const filePath = path.join(pluginsDir, foundFile);

        const code = fs.readFileSync(filePath, "utf-8");

        fs.unlinkSync(filePath);

        

        await react("🗑️");

        return m.reply(`🗑️ *تم حذف الملف بنجاح*\n📄 الملف: ${foundFile}\n📦 الحجم: ${(code.length / 1024).toFixed(2)} KB`);

    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    //  اضف — إضافة بلوقن

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (/^(اضف|اضافه|اضافة|add)$/i.test(action)) {

        if (!m.quoted) return m.reply("❌ *رد على كود أو ملف البلوقن للإضافة*");

        let code = m.quoted.text || "";

        let fileName = (args.slice(1).join(" ").trim() || `plugin_${Date.now()}`).replace(/\.js$/i, "").replace(/\s+/g, '-') + ".js";

        fs.writeFileSync(path.join(pluginsDir, fileName), code, "utf-8");

        await react("✅");

        return m.reply(`✅ *تمت الإضافة بنجاح*\n📄 الملف: ${fileName}\n📝 الأسطر: ${code.split('\n').length}`);

    }

    // القائمة الافتراضية

    const helpText = `📦 *إدارة الـبـلـوقـنـات*\n\n` +

                     `📋 *لست*: عرض كل البلوقنات\n` +

                     `📄 *عرض*: عرض كود البلوقن\n` +

                     `➕ *اضف*: إضافة بلوقن جديد\n` +

                     `🗑️ *حذف*: حذف بلوقن`;

    return m.reply(helpText);

};

handler.help = ["بلوقن لست", "بلوقن عرض", "بلوقن اضف", "بلوقن حذف"];

handler.tags = ["owner"];

handler.command = /^(بلوقن|plugin|plugins)$/i;

handler.owner = true;

export default handler;

