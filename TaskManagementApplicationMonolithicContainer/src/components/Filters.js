import React from 'react';
import { useTasks } from '../context/TaskContext';

// PUBLIC_INTERFACE
export default function Filters() {
  /** Controls for filtering and sorting tasks. */
  const { state, setFilters, bulkDeleteCompleted } = useTasks();
  const f = state.filters;

  return (
    <div className="inline" data-testid="filters">
      <input
        type="text"
        placeholder="Search..."
        value={f.query}
        onChange={(e) => setFilters({ query: e.target.value })}
        aria-label="Search tasks"
        data-testid="search-input"
      />
      <select
        value={f.status}
        onChange={(e) => setFilters({ status: e.target.value })}
        aria-label="Status filter"
      >
        <option value="todo">Todo</option>
        <option value="inprogress">In progress</option>
        <option value="done">Done</option>
      </select>
      <select
        value={f.priority}
        onChange={(e) => setFilters({ priority: e.target.value })}
        aria-label="Priority filter"
      >
        <option value="all">Any priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <select
        value={f.sortBy}
        onChange={(e) => setFilters({ sortBy: e.target.value })}
        aria-label="Sort by"
      >
        <option value="created-desc">Newest</option>
        <option value="created-asc">Oldest</option>
        <option value="due-asc">Due date ↑</option>
        <option value="due-desc">Due date ↓</option>
        <option value="priority">Priority</option>
      </select>
      <button className="btn secondary" onClick={bulkDeleteCompleted} type="button">
        Clear completed
      </button>
    </div>
  );
}
