import { useState } from 'react';
import { useConferences } from '@/hooks/useConferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterTabs } from '@/components/common';
import { ConferenceCard } from '@/components/conferences';
import { EmptyState } from '@/components/common';
import { ConfirmDialog } from '@/components/common';
import { Plus, Search, Calendar, Loader2 } from 'lucide-react';
import { discoverConference, KNOWN_CONFERENCE_URLS } from '@/services/conferences';

const FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'upcoming', label: '即将截稿' },
  { value: 'blockchain', label: '区块链' },
  { value: 'security', label: '安全' },
  { value: 'ai', label: '人工智能' },
  { value: 'network', label: '网络' },
  { value: 'other', label: '其他' },
];

export default function Conferences() {
  const {
    filteredConferences,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    addConference,
    updateConference,
    deleteConference,
    isEmpty,
  } = useConferences();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newConf, setNewConf] = useState({
    name: '',
    shortName: '',
    deadline: '',
    category: 'other' as const,
    website: '',
  });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverUrl, setDiscoverUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddConference = async () => {
    if (!newConf.name || !newConf.deadline) return;
    addConference(newConf);
    setShowAddForm(false);
    setNewConf({ name: '', shortName: '', deadline: '', category: 'other', website: '' });
  };

  const handleDiscover = async () => {
    if (!discoverUrl) return;
    setIsDiscovering(true);
    try {
      const info = await discoverConference(discoverUrl);
      if (info) {
        setNewConf({
          name: info.name,
          shortName: info.shortName,
          deadline: info.deadline,
          category: info.category,
          website: discoverUrl,
        });
      }
    } catch (error) {
      console.error('Discovery failed:', error);
    }
    setIsDiscovering(false);
  };

  const handleAddKnown = (key: string) => {
    const known = KNOWN_CONFERENCE_URLS[key];
    if (known) {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      addConference({
        name: known.name,
        shortName: known.shortName,
        deadline: known.deadline.replace('{year}', nextYear.toString()),
        category: known.category,
        website: known.url,
        year: nextYear,
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteConference(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl font-bold">会议追踪</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-2" />
          添加会议
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <FilterTabs
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索会议..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>添加新会议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="从URL自动发现..."
                value={discoverUrl}
                onChange={(e) => setDiscoverUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleDiscover} disabled={isDiscovering || !discoverUrl}>
                {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : '发现'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="会议全名 *"
                value={newConf.name}
                onChange={(e) => setNewConf({ ...newConf, name: e.target.value })}
              />
              <Input
                placeholder="会议简称"
                value={newConf.shortName}
                onChange={(e) => setNewConf({ ...newConf, shortName: e.target.value })}
              />
              <Input
                type="date"
                value={newConf.deadline}
                onChange={(e) => setNewConf({ ...newConf, deadline: e.target.value })}
              />
              <Select
                value={newConf.category}
                onValueChange={(value) => setNewConf({ ...newConf, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blockchain">区块链</SelectItem>
                  <SelectItem value="security">安全</SelectItem>
                  <SelectItem value="ai">人工智能</SelectItem>
                  <SelectItem value="network">网络</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="会议官网URL"
                value={newConf.website}
                onChange={(e) => setNewConf({ ...newConf, website: e.target.value })}
                className="col-span-2"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
              <Button onClick={handleAddConference} disabled={!newConf.name || !newConf.deadline}>
                添加
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Known Conferences Quick Add */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">快速添加知名会议</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(KNOWN_CONFERENCE_URLS).slice(0, 8).map(([key, conf]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => handleAddKnown(key)}
            >
              {conf.shortName}
            </Button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Calendar}
          title="暂无会议"
          description="添加一个会议来追踪截稿日期"
          action={{
            label: '添加会议',
            onClick: () => setShowAddForm(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredConferences.map((conference) => (
            <ConferenceCard
              key={conference.id}
              conference={conference}
              onDelete={handleDelete}
              onOpenUrl={(url) => window.open(url, '_blank')}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="删除会议"
        description="确定要删除这个会议吗？"
        confirmLabel="删除"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
