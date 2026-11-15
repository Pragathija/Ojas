import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { BookOpen, Lock, Plus, Trash2, Calendar, ShieldCheck } from 'lucide-react';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: 'Gratitude' | 'Mission Experience' | 'Crew Reflections' | 'Personal';
  timestamp: string;
}

const DEFAULT_SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Earthrise during evening orbital pass',
    content: 'Caught the southern lights sweeping across Antarctica while running maintenance on the glovebox. It feels impossible to stay stressed when looking out at the auroral ribbons dancing across the ice cap.',
    category: 'Mission Experience',
    timestamp: '2026-11-14T21:15:00.000Z',
  },
  {
    id: 'entry-2',
    title: 'Adjusting to evening circadian protocols',
    content: 'Dimming cabin illumination 90 minutes before sleep has noticeably cut down my sleep latency. Feeling more grounded this morning.',
    category: 'Personal',
    timestamp: '2026-11-12T07:30:00.000Z',
  },
];

export const ReflectionJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem('ojas_journal_entries');
      return stored ? JSON.parse(stored) : DEFAULT_SAMPLE_ENTRIES;
    } catch {
      return DEFAULT_SAMPLE_ENTRIES;
    }
  });

  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalEntry['category']>('Mission Experience');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title,
      content,
      category,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem('ojas_journal_entries', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage save skipped:', err);
    }

    setTitle('');
    setContent('');
    setIsComposing(false);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try {
      localStorage.setItem('ojas_journal_entries', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage save skipped:', err);
    }
  };

  return (
    <Card className="p-6 tablet:p-8 space-y-6 border-[#EAE6F2] shadow-soft">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              CONFIDENTIAL HABITAT LOGS
            </span>
            <Badge variant="purple" size="sm">END-TO-END LOCAL ENCRYPTION</Badge>
          </div>
          <h2 className="font-heading text-xl tablet:text-2xl font-bold text-content-main mt-1">
            Reflection Journal
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Your private thoughts, observations, and gratitude notes. Never transmitted across mission telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isComposing && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsComposing(true)}
              className="gap-1.5 font-heading font-semibold text-xs shadow-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Entry</span>
            </Button>
          )}
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pastel-mint border border-[#C2EAD6] text-xs font-sans text-content-main">
        <Lock className="h-4 w-4 text-[#19A974] shrink-0" />
        <span className="text-[11px] leading-relaxed">
          <strong>Privacy Guaranteed:</strong> Journal reflections are kept strictly in local browser storage. They are neither ingested into backend telemetry databases nor shared with flight operations personnel.
        </span>
      </div>

      {/* Composition Form */}
      {isComposing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-[#FAF9FF] border border-primary/20 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-primary">New Reflection</h3>
            <div className="flex gap-2">
              {(['Mission Experience', 'Gratitude', 'Crew Reflections', 'Personal'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    category === cat
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-content-secondary border-[#EAE6F2] hover:text-content-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry Title..."
            className="w-full p-3 text-sm rounded-xl bg-white border border-[#EAE6F2] text-content-main font-heading font-semibold placeholder:text-content-muted focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />

          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely. Describe what you saw, felt, or learned today..."
            className="w-full p-3 text-xs rounded-xl bg-white border border-[#EAE6F2] text-content-main placeholder:text-content-muted focus:ring-2 focus:ring-primary focus:outline-none font-sans resize-none"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsComposing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-semibold shadow-soft">
              Save to Private Journal
            </Button>
          </div>
        </form>
      )}

      {/* List of Previous Entries */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-content-muted">
            No reflections logged yet. Click "New Entry" to write your first space reflection.
          </div>
        ) : (
          entries.map((entry) => {
            const dateStr = new Date(entry.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-white border border-[#EAE6F2] hover:border-primary/30 transition-all space-y-2 shadow-xs group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-content-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{dateStr}</span>
                      </span>
                      <Badge variant="purple" size="sm">{entry.category}</Badge>
                    </div>
                    <h4 className="font-heading text-base font-bold text-content-main mt-1">
                      {entry.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-content-muted hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-content-secondary leading-relaxed font-sans pt-1">
                  {entry.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};