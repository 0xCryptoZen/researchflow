// Writing Reminder Service - Auto reminder mechanism for writing progress
import { writingProgressRepository, type WritingProgress, type Milestone } from '../repositories/writingProgressRepository';
import { sendNotification, type NotificationPayload } from './notifications';

export interface ReminderConfig {
  enabled: boolean;
  advanceDays: number[]; // Days before deadline to send reminder
  channels: ('email' | 'telegram' | 'feishu')[];
}

const DEFAULT_CONFIG: ReminderConfig = {
  enabled: true,
  advanceDays: [7, 3, 1], // Remind 7 days, 3 days, and 1 day before
  channels: ['telegram'],
};

let config: ReminderConfig = { ...DEFAULT_CONFIG };

export const reminderService = {
  configure(newConfig: Partial<ReminderConfig>) {
    config = { ...config, ...newConfig };
  },

  getConfig(): ReminderConfig {
    return { ...config };
  },

  isEnabled(): boolean {
    return config.enabled;
  },

  // Check and send reminders for all writing progress items
  async checkAndSendReminders(): Promise<{
    sent: number;
    failed: number;
    details: string[];
  }> {
    const results = { sent: 0, failed: 0, details: [] as string[] };
    
    if (!config.enabled) {
      results.details.push('提醒功能已关闭');
      return results;
    }

    const allProgress = writingProgressRepository.getAll();
    const now = new Date();

    for (const progress of allProgress) {
      const deadline = new Date(progress.submissionDeadline);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if we should send a reminder today
      if (config.advanceDays.includes(daysRemaining)) {
        const message = this.buildReminderMessage(progress, daysRemaining);
        
        try {
          for (const channel of config.channels) {
            await this.sendReminder(channel, message, progress);
          }
          results.sent++;
          results.details.push(`已发送 ${progress.paperTitle} 的 ${daysRemaining} 天前提醒`);
        } catch (error) {
          results.failed++;
          results.details.push(`发送 ${progress.paperTitle} 提醒失败: ${error}`);
        }
      }

      // Check for milestone reminders
      for (const milestone of progress.milestones) {
        const milestoneDate = new Date(milestone.deadline);
        const milestoneDaysRemaining = Math.ceil((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!milestone.completed && config.advanceDays.includes(milestoneDaysRemaining)) {
          const milestoneMessage = this.buildMilestoneReminderMessage(progress, milestone, milestoneDaysRemaining);
          
          try {
            for (const channel of config.channels) {
              await this.sendReminder(channel, milestoneMessage, progress);
            }
            results.sent++;
            results.details.push(`已发送里程碑 "${milestone.name}" 的 ${milestoneDaysRemaining} 天前提醒`);
          } catch (error) {
            results.failed++;
            results.details.push(`发送里程碑提醒失败: ${error}`);
          }
        }
      }
    }

    return results;
  },

  // Send reminder to specific channel
  async sendReminder(channel: 'email' | 'telegram' | 'feishu', message: string, progress: WritingProgress): Promise<void> {
    const title = `📝 写作进度提醒: ${progress.paperTitle}`;
    const fullMessage = title + '\n\n' + message;
    
    const payload: NotificationPayload = {
      title,
      message: fullMessage,
      channel,
    };
    
    try {
      await sendNotification(payload);
    } catch (error) {
      console.error('[Reminder] 发送提醒失败:', error);
      throw error;
    }
  },

  // Build reminder message for deadline
  buildReminderMessage(progress: WritingProgress, daysRemaining: number): string {
    const completedMilestones = progress.milestones.filter(m => m.completed).length;
    const totalMilestones = progress.milestones.length;
    const progressPercent = Math.round((completedMilestones / totalMilestones) * 100);

    let message = `截稿日期: ${progress.submissionDeadline} (还有 ${daysRemaining} 天)\n`;
    message += `当前进度: ${progressPercent}% (${completedMilestones}/${totalMilestones} 里程碑完成)\n\n`;
    
    // List incomplete milestones
    const incompleteMilestones = progress.milestones.filter(m => !m.completed);
    if (incompleteMilestones.length > 0) {
      message += '待完成里程碑:\n';
      incompleteMilestones.forEach(m => {
        const days = Math.ceil((new Date(m.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        message += `• ${m.name} (${days > 0 ? `${days}天后` : '已逾期'})\n`;
      });
    }

    if (daysRemaining <= 3) {
      message += '\n⚠️ 紧急: 请尽快完成剩余任务！';
    }

    return message;
  },

  // Build reminder message for milestone
  buildMilestoneReminderMessage(progress: WritingProgress, milestone: Milestone, daysRemaining: number): string {
    let message = `里程碑: ${milestone.name}\n`;
    message += `截止日期: ${milestone.deadline} (还有 ${daysRemaining} 天)\n`;
    message += `论文: ${progress.paperTitle}\n`;
    message += `截稿日期: ${progress.submissionDeadline}`;

    if (daysRemaining <= 1) {
      message += '\n\n⚠️ 紧急: 请尽快完成此里程碑！';
    }

    return message;
  },

  // Get upcoming reminders for display in UI
  getUpcomingReminders(): {
    paperTitle: string;
    deadline: string;
    daysRemaining: number;
    type: 'deadline' | 'milestone';
    milestoneName?: string;
  }[] {
    const reminders: any[] = [];
    const now = new Date();
    const allProgress = writingProgressRepository.getAll();

    for (const progress of allProgress) {
      // Check deadline
      const deadline = new Date(progress.submissionDeadline);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0 && daysRemaining <= 14) {
        reminders.push({
          paperTitle: progress.paperTitle,
          deadline: progress.submissionDeadline,
          daysRemaining,
          type: 'deadline',
        });
      }

      // Check milestones
      for (const milestone of progress.milestones) {
        if (milestone.completed) continue;
        
        const milestoneDate = new Date(milestone.deadline);
        const milestoneDaysRemaining = Math.ceil((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (milestoneDaysRemaining > 0 && milestoneDaysRemaining <= 14) {
          reminders.push({
            paperTitle: progress.paperTitle,
            deadline: milestone.deadline,
            daysRemaining: milestoneDaysRemaining,
            type: 'milestone',
            milestoneName: milestone.name,
          });
        }
      }
    }

    // Sort by days remaining
    return reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  // Send immediate reminder for a specific paper
  async sendImmediateReminder(paperId: string): Promise<boolean> {
    const progress = writingProgressRepository.getById(paperId);
    if (!progress) return false;

    const daysRemaining = writingProgressRepository.getDaysRemaining(paperId);
    if (daysRemaining === null) return false;

    const message = this.buildReminderMessage(progress, daysRemaining);
    
    for (const channel of config.channels) {
      await this.sendReminder(channel, message, progress);
    }

    return true;
  },
};

// Auto-check reminder on load (for browser)
if (typeof window !== 'undefined') {
  // Check on startup (delayed to not block UI)
  setTimeout(() => {
    reminderService.checkAndSendReminders().then(results => {
      if (results.sent > 0) {
        console.log('[Reminder] 自动提醒结果:', results.details);
      }
    }).catch(console.error);
  }, 5000);

  // Check every hour
  setInterval(() => {
    reminderService.checkAndSendReminders().catch(console.error);
  }, 60 * 60 * 1000);
}
