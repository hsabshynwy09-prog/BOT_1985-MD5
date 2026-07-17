import { watchFile, unwatchFile } from "fs"

import chalk from "chalk"

import { fileURLToPath } from "url"

import fs from "fs"


global.botNumber = ""

global.botNumberCode = ""+212719505828


global.owner = [""] +212636391221

global.suittag = [""] 

global.prems = []



global.sessions = "Sessions/sos"

global.bots = "Sessions/bots"

global.botsofon = true



global.botname = "𝐁𝐎𝐓 𝟏𝟗𝟖𝟓"
global.dev = "𝐋𝐎𝐘𝐃"
global.packname = '𝐋𝐎𝐘𝐃'
global.author = '...'
global.geld = "Euro"


// ملكش دعوة هنا🐦
global.ch = {
  ch1: '120363402804601196@newsletter',
  ch2: '120363377374711810@newsletter'
}


global.yt = 'https://youtube.com/@anrod_edit?si=usQAE3GtH6TJqkst'
global.tk = 'https://www.tiktok.com/@mohammad_bln_1985?_r=1&_t=ZS-983g2mOq6u0'
global.sp = 'https://chat.whatsapp.com/KJIgAhbqtj2KSXOKR4NKPM?s=cl&p=a&ilr=1&amv=2'


let file = fileURLToPath(import.meta.url)

watchFile(file, () => {

unwatchFile(file)

console.log(chalk.redBright("Update 'settings.js'"))

import(`${file}?update=${Date.now()}`)

})

