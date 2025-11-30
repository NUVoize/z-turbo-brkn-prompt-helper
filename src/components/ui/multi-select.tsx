import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  maxHeight = "200px",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group options by their group property if it exists
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || "default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, MultiSelectOption[]>);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(value.filter(v => v !== optionValue));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find(opt => opt.value === value[0]);
      return option?.label || value[0];
    }
    return `${value.length} selected`;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Main trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-200 text-left",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-red-500"
        )}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1 min-h-[1.5rem]">
          {value.length === 0 ? (
            <span className="text-zinc-400">{placeholder}</span>
          ) : value.length <= 3 ? (
            // Show individual tags for 3 or fewer selections
            value.map(val => {
              const option = options.find(opt => opt.value === val);
              const label = option?.label || val;
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-200"
                >
                  <span className="truncate max-w-[100px]" title={label}>
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => removeOption(val, e)}
                    className="flex items-center justify-center w-3 h-3 hover:bg-red-400/30 rounded-sm transition-colors"
                    disabled={disabled}
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })
          ) : (
            // Show count for more than 3 selections
            <div className="flex items-center gap-2">
              <span className="text-zinc-200">{value.length} selected</span>
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center justify-center w-4 h-4 text-zinc-400 hover:text-red-400 transition-colors"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "text-zinc-400 transition-transform duration-200 ml-2 flex-shrink-0",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
          <div 
            className="py-1 overflow-y-auto" 
            style={{ maxHeight }}
          >
            {Object.keys(groupedOptions).length > 1 && groupedOptions.default ? (
              // Render with groups
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  {groupName !== "default" && (
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-zinc-700/50 bg-zinc-900/50">
                      {groupName}
                    </div>
                  )}
                  {groupOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors",
                        value.includes(option.value) && "bg-red-500/20 text-red-200"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-4 h-4 border rounded transition-colors",
                        value.includes(option.value) 
                          ? "bg-red-500 border-red-500 text-white" 
                          : "border-zinc-500"
                      )}>
                        {value.includes(option.value) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1 truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              // Render without groups
              options.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors",
                    value.includes(option.value) && "bg-red-500/20 text-red-200"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-4 h-4 border rounded transition-colors",
                    value.includes(option.value) 
                      ? "bg-red-500 border-red-500 text-white" 
                      : "border-zinc-500"
                  )}>
                    {value.includes(option.value) && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="flex-1 truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};