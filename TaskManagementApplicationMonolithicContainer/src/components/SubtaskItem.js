import React from 'react';
import { useTasks } from '../context/TaskContext';
import InlineEditable from './InlineEditable';

// PUBLIC_INTERFACE
export default function SubtaskItem({ taskId, subtask }) {
  /** Renders a single subtask line with actions. */
  const { toggleSubtask, updateSubtask, deleteSubtask } = useTasks();

  return (
    <div className="subtask-item">
      <input
        type="checkbox"
        checked={subtask.done}
        onChange={() => toggleSubtask(taskId, subtask.id)}
        aria-label="Toggle subtask"
      />
      <InlineEditable
        value={subtask.title}
        onChange={(v) => updateSubtask(taskId, subtask.id, v)}
        ariaLabel="Subtask title"
      />
      <button className="btn secondary" type="button" onClick={() => deleteSubtask(taskId, subtask.id)}>
        Remove
      </button>
    </div>
  );
}
