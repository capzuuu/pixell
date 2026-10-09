import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SearchPreviewDropdown } from './SearchPreviewDropdown';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  showDropdownPreview?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search movies, TV series, genres, or keywords...',
  onClear,
  showDropdownPreview = true,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(true);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-[#888888] pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#181818] text-white placeholder:text-[#666666] border border-white/15 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/40 focus:outline-none transition-all shadow-2xl text-sm sm:text-base font-medium"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setDropdownOpen(false);
              if (onClear) onClear();
            }}
            className="absolute right-4 p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Preview Dropdown directly attached at the bottom of the input */}
      {showDropdownPreview && value.trim().length >= 2 && (
        <SearchPreviewDropdown
          query={value}
          isOpen={dropdownOpen}
          align="full"
          onClose={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
};
