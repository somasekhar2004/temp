// filename: client/src/components/molecules/SearchBar/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import styles from './SearchBar.module.scss';
import Icon from '../../atoms/Icon/Icon';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when parent value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange, debounceMs]);

  return (
    <div className={styles.searchBar}>
      <Icon name="search" size={16} className={styles.searchIcon} />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={styles.input}
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className={styles.clearButton}
        >
          <Icon name="x-close" size={14} />
        </button>
      )}
    </div>
  );
};
export default SearchBar;
