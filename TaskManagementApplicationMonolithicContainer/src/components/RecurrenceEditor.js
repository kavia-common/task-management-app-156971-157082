import React from 'react';

// PUBLIC_INTERFACE
export default function RecurrenceEditor({ value, onChange }) {
  /** Simple recurrence control for frequency and interval. */
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="inline" aria-label="Recurrence editor">
      <select
        value={value.frequency || 'none'}
        onChange={(e) => set({ frequency: e.target.value })}
        aria-label="Recurrence frequency"
      >
        <option value="none">No repeat</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <input
        type="number"
        min="1"
        value={value.interval || 1}
        onChange={(e) => set({ interval: Number(e.target.value) || 1 })}
        aria-label="Recurrence interval"
        style={{ width: 80 }}
      />
    </div>
  );
}
