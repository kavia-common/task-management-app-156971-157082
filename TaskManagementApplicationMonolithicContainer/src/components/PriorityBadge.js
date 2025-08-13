import React from 'react';

// PUBLIC_INTERFACE
export default function PriorityBadge({ priority }) {
  /** Displays a colored badge based on priority. */
  const cls = priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'medium';
  const label = priority[0].toUpperCase() + priority.slice(1);
  return <span className={`badge ${cls}`} aria-label={`Priority ${label}`}>Priority: {label}</span>;
}
