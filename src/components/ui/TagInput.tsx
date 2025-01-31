import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/styles';
import { Badge } from './Badge';
import { useSkills } from '@/lib/hooks/useSkills';
import { useUsers } from '@/lib/hooks/useUsers';
import { Button } from './Button';
import { Plus } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter to add tags...',
  className
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { skills, createSkill } = useSkills();
  const { isAdmin } = useUsers();
  const suggestions = skills.map(s => s.name);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const trimmedInput = input.trim();
      if (!value.includes(trimmedInput)) {
        onChange([...value, trimmedInput]);
        // If admin and this is a new skill, add it to the database
        if (isAdmin && !suggestions.includes(trimmedInput)) {
          createSkill({ name: trimmedInput });
        }
      }
      setInput('');
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const addSuggestion = (suggestion: string) => {
    if (!value.includes(suggestion)) {
      onChange([...value, suggestion]);
    }
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !value.includes(suggestion) && 
      suggestion.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="relative z-50">
      <div 
        className={cn(
          "flex flex-wrap gap-2 p-2 min-h-[2.5rem] rounded-md border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500",
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(tag => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 py-0.5 pl-2 pr-1"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-1 min-w-[200px] border-0 p-0 focus:ring-0 text-sm"
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-[100] mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-1">
            {isAdmin && input.trim() && !suggestions.includes(input.trim()) && (
              <li
                onClick={() => {
                  const newSkill = input.trim();
                  createSkill({ name: newSkill });
                  addSuggestion(newSkill);
                }}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-indigo-600 font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add "{input.trim()}" as new skill
              </li>
            )}
            {filteredSuggestions.map(suggestion => (
              <li
                key={suggestion}
                onClick={() => addSuggestion(suggestion)}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}