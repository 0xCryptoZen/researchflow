import { type SavedPaper } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Trash2 } from 'lucide-react';

interface PaperCardProps {
  paper: SavedPaper;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenUrl?: (url: string) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  arxiv: 'arXiv',
  scholar: 'Google Scholar',
  dblp: 'DBLP',
  ieee: 'IEEE',
  acm: 'ACM',
};

export function PaperCard({
  paper,
  onToggleFavorite,
  onDelete,
  onOpenUrl,
}: PaperCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2">{paper.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {paper.authors.join(', ')}
          </p>
        </div>
        <button
          onClick={() => onToggleFavorite(paper.id)}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-full transition-colors',
            paper.isFavorite 
              ? 'text-amber-500 hover:text-amber-600' 
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={paper.isFavorite ? '取消收藏' : '收藏'}
        >
          <Star className={cn('h-4 w-4', paper.isFavorite && 'fill-current')} />
        </button>
      </div>

      {paper.abstract && (
        <p className="text-xs text-muted-foreground line-clamp-3">
          {paper.abstract}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {SOURCE_LABELS[paper.source] || paper.source}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {paper.publishedDate}
        </Badge>
        {paper.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <button
          onClick={() => onOpenUrl?.(paper.url)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          查看原文
        </button>
        <button
          onClick={() => onDelete(paper.id)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive ml-auto"
        >
          <Trash2 className="h-3 w-3" />
          删除
        </button>
      </div>
    </div>
  );
}

export default PaperCard;
