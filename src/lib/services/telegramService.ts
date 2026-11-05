export interface TelegramNotificationData {
  questionId: string;
  questionText: string;
  category: string;
  difficulty: string;
  acceptedAnswersCount: number;
}

/**
 * Sends a Telegram notification with inline action buttons to approve or reject a candidate question.
 */
export async function sendTelegramCandidateNotification(data: TelegramNotificationData): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!token || !chatId) {
    console.log(`[Telegram Mock] Candidate ${data.questionId} ready for review: "${data.questionText}"`);
    return false;
  }

  const messageText = `
🎯 *New Trivia Candidate Generated*
━━━━━━━━━━━━━━━━━━━━
*Question:* ${data.questionText}
*Category:* ${data.category} (${data.difficulty})
*Accepted Answers:* ${data.acceptedAnswersCount} entities

Review & Approve in Admin Dashboard:
${appUrl}/admin
`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ View & Approve", url: `${appUrl}/admin?id=${data.questionId}` },
            ],
          ],
        },
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to deliver Telegram notification:", err);
    return false;
  }
}

