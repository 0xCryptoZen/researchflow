// Notification Service - Multi-channel notification delivery
// Supports: Email, Feishu, Telegram

export type NotificationChannel = 'email' | 'feishu' | 'telegram';

export interface NotificationPayload {
  title: string;
  message: string;
  channel: NotificationChannel;
  userId?: string;  // For telegram/feishu
  email?: string;   // For email
}

// Email notification (client-side - opens mailto)
export function sendEmailNotification(payload: NotificationPayload): void {
  const { title, message, email } = payload;
  
  if (!email) {
    console.warn('[Notification] No email provided');
    return;
  }
  
  // Open mailto link
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(message);
  window.open(`mailto:${email}?subject=${subject}&body=${body}`);
}

// Feishu webhook notification
export async function sendFeishuNotification(
  webhookUrl: string, 
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: {
          text: `【${payload.title}】\n${payload.message}`,
        },
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[Notification] Feishu webhook failed:', error);
    return false;
  }
}

// Telegram Bot notification
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `【${payload.title}】\n${payload.message}`,
          parse_mode: 'Markdown',
        }),
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('[Notification] Telegram failed:', error);
    return false;
  }
}

// Notification settings storage
export interface NotificationSettings {
  email: string;
  feishuWebhook: string;
  telegramBotToken: string;
  telegramChatId: string;
  enabledChannels: NotificationChannel[];
  reminderDays: number[]; // Days before deadline to remind
}

const STORAGE_KEY = 'researchflow_notification_settings';

export const defaultSettings: NotificationSettings = {
  email: '',
  feishuWebhook: '',
  telegramBotToken: '',
  telegramChatId: '',
  enabledChannels: ['email'],
  reminderDays: [7, 3, 1],
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('[Notification] Failed to load settings:', e);
  }
  return defaultSettings;
}

export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
  try {
    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[Notification] Failed to save settings:', e);
  }
}

// Main send function - routes to appropriate channel
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const settings = getNotificationSettings();
  
  switch (payload.channel) {
    case 'email':
      if (settings.email) {
        sendEmailNotification({ ...payload, email: settings.email });
        return true;
      }
      break;
      
    case 'feishu':
      if (settings.feishuWebhook) {
        return sendFeishuNotification(settings.feishuWebhook, payload);
      }
      break;
      
    case 'telegram':
      if (settings.telegramBotToken && settings.telegramChatId) {
        return sendTelegramNotification(
          settings.telegramBotToken, 
          settings.telegramChatId, 
          payload
        );
      }
      break;
  }
  
  return false;
}

// Broadcast to all enabled channels
export async function broadcastNotification(
  title: string, 
  message: string
): Promise<void> {
  const settings = getNotificationSettings();
  
  for (const channel of settings.enabledChannels) {
    await sendNotification({
      title,
      message,
      channel,
    });
  }
}

export default {
  sendEmailNotification,
  sendFeishuNotification,
  sendTelegramNotification,
  sendNotification,
  broadcastNotification,
  getNotificationSettings,
  saveNotificationSettings,
};
