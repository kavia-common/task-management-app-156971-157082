import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useTasks } from './context/TaskContext';
import AddTask from './components/AddTask';
import Filters from './components/Filters';
import TaskList from './components/TaskList';

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Application root component: renders header, theme toggle,
   * filter controls, add-task form, and the draggable TaskList.
   */
  const [theme, setTheme] = useState('light');
  const { state } = useTasks();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const tasksCount = state.tasks.length;
  const doneCount = useMemo(
    () => state.tasks.filter((t) => t.status === 'done').length,
    [state.tasks]
  );

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          data-testid="theme-toggle"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <h1 className="title" data-testid="app-title">Task Management</h1>
        <p className="subtitle">
          Keep track of tasks with priorities, subtasks, recurrence, filtering, and drag-and-drop.
        </p>
        <div className="stats" aria-live="polite">
          <span>Total: {tasksCount}</span>
          <span>Done: {doneCount}</span>
        </div>

        <div className="toolbar">
          <Filters />
        </div>

        <div className="panel">
          <AddTask />
        </div>

        <div className="panel">
          <TaskList />
        </div>
      </header>
    </div>
  );
}
