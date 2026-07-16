// هذا الملف يعمل كـ middleware - لا يحتاج default export
// يوقف الأوامر في المجموعات المكتومة لغير المشرفين

export async function before(m, { chat }) {
  try {
    if (!m.isGroup) return false
    if (!chat?.isMute) return false
    if (m.isAdmin) return false  // المشرفون يمكنهم دائماً استخدام الأوامر
    // إيقاف الأمر
    return true
  } catch {
    return false
  }
}
