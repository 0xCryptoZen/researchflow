import { type Conference } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Edit } from 'lucide-react';

interface ConferenceCardProps {
  conference: Conference;
  onEdit?: (conference: Conference) => void;
  onDelete: (id: string) => void;
  onOpenUrl?: (url: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  blockchain: '区块链',
  security: '安全',
  ai: '人工智能',
  network: '网络',
  other: '其他',
};

export function ConferenceCard({
  conference,
  onEdit,
  onDelete,
  onOpenUrl,
}: ConferenceCardProps) {
  const deadlineDate = new Date(conference.deadline);
  const now = new Date();
  const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntil > 0 && daysUntil < 30;
  const isPassed = daysUntil < 0;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{conference.name}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {conference.shortName} · {conference.year}
          </p>
        </div>
        <Badge variant={isUrgent ? 'default' : isPassed ? 'secondary' : 'outline'}>
          {isPassed ? '已截稿' : isUrgent ? `${daysUntil}天后` : `${daysUntil}天`}
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {CATEGORY_LABELS[conference.category] || conference.category}
        </Badge>
        <span className="text-xs text-muted-foreground">
          截稿: {conference.deadline}
        </span>
        {conference.conferenceDate && (
          <span className="text-xs text-muted-foreground">
            会议: {conference.conferenceDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <button
          onClick={() => onOpenUrl?.(conference.website)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          访问官网
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(conference)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
            编辑
          </button>
        )}
        <button
          onClick={() => onDelete(conference.id)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive ml-auto"
        >
          <Trash2 className="h-3 w-3" />
          删除
        </button>
      </div>
    </div>
  );
}

export default ConferenceCard;
