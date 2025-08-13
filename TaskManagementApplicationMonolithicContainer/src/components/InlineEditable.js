import React, { useEffect, useRef, useState } from 'react';

// PUBLIC_INTERFACE
export default function InlineEditable({
  value,
  onChange,
  placeholder = 'Click to edit',
  className = '',
  ariaLabel = 'Editable text',
}) {
  /** Text element that becomes an input when focused to allow inline editing. */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = (draft || '').trim();
    if (trimmed !== value) onChange(trimmed);
    setEditing(false);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(value || '');
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <span
        className={className}
        onClick={() => setEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
        aria-label={ariaLabel}
        title="Click to edit"
        style={{ cursor: 'text' }}
      >
        {value || <span style={{ color: 'var(--muted)' }}>{placeholder}</span>}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      aria-label={ariaLabel}
    />
  );
}
