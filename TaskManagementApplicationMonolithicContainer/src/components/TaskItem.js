import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import InlineEditable from './InlineEditable';
import PriorityBadge from './PriorityBadge';
import SubtaskItem from './SubtaskItem';
import Modal from './Modal';

// PUBLIC_INTERFACE
export default function TaskItem({ task }) {
  /** Single task row with actions, subtasks, and inline editing. */
  const {
    updateTask,
    deleteTask,
    toggleTaskDone,
    addSubtask,
  } = useTasks();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const onToggle = () => {
    toggleTaskDone(task.id);
  };

  const onDelete = () => {
    deleteTask(task.id);
    setConfirmOpen(false);
  };

  const onAddSubtask = () => {
    const t = newSubtaskTitle.trim();
    if (!t) return;
    addSubtask(task.id, t);
    setNewSubtaskTitle('');
  };

  const statusLabel = task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In progress' : 'Todo';

  return (
    <div>
      <div className="row">
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={onToggle}
          aria-label={`Mark task ${task.title} as done`}
          data-testid={`toggle-${task.id}`}
        />
        <InlineEditable
          className="task-title"
          value={task.title}
          onChange={(v) => updateTask(task.id, { title: v })}
          ariaLabel="Task title"
        />
      </div>
      <div className="row">
        <InlineEditable
          value={task.description}
          onChange={(v) => updateTask(task.id, { description: v })}
          placeholder="Add a description..."
          ariaLabel="Task description"
        />
      </div>
      <div className="task-meta">
        <PriorityBadge priority={task.priority} />
        {task.dueDate ? <span>Due: {task.dueDate}</span> : <span>No due date</span>}
        <span>Status: {statusLabel}</span>
        {task.recurrence?.frequency !== 'none' ? <span>Recurs: {task.recurrence.frequency}</span> : null}
      </div>
      <div className="row">
        <select
          value={task.priority}
          onChange={(e) => updateTask(task.id, { priority: e.target.value })}
          aria-label="Change priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={task.dueDate || ''}
          onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
          aria-label="Change due date"
        />
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value })}
          aria-label="Change status"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button className="btn danger" type="button" onClick={() => setConfirmOpen(true)} data-testid={`delete-${task.id}`}>
          Delete
        </button>
      </div>

      <div className="subtasks">
        {task.subtasks.map((s) => (
          <SubtaskItem key={s.id} taskId={task.id} subtask={s} />
        ))}
        <div className="inline" style={{ marginTop: 8 }}>
          <input
            type="text"
            placeholder="New subtask"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            aria-label="New subtask title"
          />
          <button className="btn secondary" type="button" onClick={onAddSubtask}>Add subtask</button>
        </div>
      </div>

      {confirmOpen && (
        <Modal title="Delete task?" onClose={() => setConfirmOpen(false)}>
          <p>Are you sure you want to delete “{task.title}”?</p>
          <div className="inline" style={{ justifyContent: 'flex-end', width: '100%' }}>
            <button className="btn secondary" onClick={() => setConfirmOpen(false)} type="button">Cancel</button>
            <button className="btn danger" onClick={onDelete} type="button">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
