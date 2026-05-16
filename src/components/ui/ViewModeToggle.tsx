import { LayoutGrid, List, AlignJustify } from 'lucide-react';
import type { ViewMode } from '@/lib/scanFilters';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const VIEW_MODES: { mode: ViewMode; icon: typeof List; label: string }[] = [
  { mode: 'list', icon: List, label: 'Danh sách' },
  { mode: 'grid', icon: LayoutGrid, label: 'Lưới' },
  { mode: 'compact', icon: AlignJustify, label: 'Chi tiết' },
];

export default function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
      {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-label={label}
          className={`p-2 rounded-md transition-colors ${
            viewMode === mode
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
