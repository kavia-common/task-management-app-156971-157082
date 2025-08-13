import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import RecurrenceEditor from './RecurrenceEditor';

// PUBLIC_INTERFACE
export default function AddTask() {
  /** Form to add a new task with optional details. */
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [recurrence, setRecurrence] = useState({ frequency: 'none', interval: 1 });

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setRecurrence({ frequency: 'none', interval: 1 });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask({ title: trimmed, description, dueDate, priority, recurrence });
    reset();
  };

  return (
    <form className="inline" onSubmit={onSubmit} data-testid="add-task-form">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Task title"
        data-testid="task-title-input"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Due date"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        aria-label="Priority"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <RecurrenceEditor value={recurrence} onChange={setRecurrence} />
      <button className="btn" type="submit" data-testid="add-task-button">Add</button>
    </form>
  );
}
