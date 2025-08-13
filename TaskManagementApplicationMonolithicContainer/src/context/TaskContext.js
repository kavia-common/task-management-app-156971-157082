import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { getJSON, setJSON } from '../utils/storage';

const STORAGE_KEY = 'tasks_v1';
const FILTERS_KEY = 'filters_v1';

const initialState = {
  tasks: [],
  filters: {
    query: '',
    status: 'all', // all|todo|in-progress|done
    priority: 'all', // all|low|medium|high
    sortBy: 'created-desc', // created-desc|created-asc|due-asc|due-desc|priority
  },
};

const TaskContext = createContext(undefined);

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTask(input) {
  const now = new Date().toISOString();
  return {
    id: input.id || generateId(),
    title: input.title?.trim() || 'Untitled',
    description: input.description || '',
    dueDate: input.dueDate || '',
    priority: input.priority || 'medium',
    status: input.status || 'todo',
    tags: input.tags || [],
    createdAt: input.createdAt || now,
    updatedAt: now,
    subtasks: Array.isArray(input.subtasks) ? input.subtasks : [],
    recurrence: input.recurrence || { frequency: 'none', interval: 1 },
  };
}

function computeNextDueDate(dueDate, recurrence) {
  if (!dueDate) return '';
  const base = new Date(dueDate);
  if (Number.isNaN(base.getTime())) return '';

  const interval = Number(recurrence.interval || 1);
  const freq = recurrence.frequency || 'none';

  const d = new Date(base);
  if (freq === 'daily') d.setDate(d.getDate() + interval);
  else if (freq === 'weekly') d.setDate(d.getDate() + 7 * interval);
  else if (freq === 'monthly') d.setMonth(d.getMonth() + interval);
  else return '';

  return d.toISOString().slice(0, 10);
}

function shouldSpawnNext(task, newStatus) {
  if (!task.recurrence || task.recurrence.frequency === 'none') return false;
  // spawn only when transitioning to 'done'
  return newStatus === 'done';
}

function reorder(array, startIndex, endIndex) {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

const ACTIONS = {
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_TASK_DONE: 'TOGGLE_TASK_DONE',
  ADD_SUBTASK: 'ADD_SUBTASK',
  UPDATE_SUBTASK: 'UPDATE_SUBTASK',
  TOGGLE_SUBTASK: 'TOGGLE_SUBTASK',
  DELETE_SUBTASK: 'DELETE_SUBTASK',
  REORDER_TASKS: 'REORDER_TASKS',
  SET_FILTERS: 'SET_FILTERS',
  BULK_DELETE_COMPLETED: 'BULK_DELETE_COMPLETED',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_TASK: {
      const task = normalizeTask(action.payload);
      return { ...state, tasks: [task, ...state.tasks] };
    }
    case ACTIONS.UPDATE_TASK: {
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      };
    }
    case ACTIONS.DELETE_TASK: {
      const id = action.payload;
      return { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
    }
    case ACTIONS.TOGGLE_TASK_DONE: {
      const { id } = action.payload;
      const tasks = [...state.tasks];
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return state;
      const old = tasks[idx];
      const newStatus = old.status === 'done' ? 'todo' : 'done';
      const updated = { ...old, status: newStatus, updatedAt: new Date().toISOString() };
      tasks[idx] = updated;

      if (shouldSpawnNext(old, newStatus)) {
        const nextDue = computeNextDueDate(old.dueDate, old.recurrence);
        if (nextDue) {
          const nextTask = normalizeTask({
            ...old,
            id: undefined,
            status: 'todo',
            dueDate: nextDue,
          });
          tasks.splice(idx, 0, nextTask);
        }
      }

      return { ...state, tasks };
    }
    case ACTIONS.ADD_SUBTASK: {
      const { taskId, title } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                updatedAt: new Date().toISOString(),
                subtasks: [
                  ...t.subtasks,
                  { id: generateId(), title: title || 'Subtask', done: false },
                ],
              }
            : t
        ),
      };
    }
    case ACTIONS.UPDATE_SUBTASK: {
      const { taskId, subtaskId, title } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                updatedAt: new Date().toISOString(),
                subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, title } : s)),
              }
            : t
        ),
      };
    }
    case ACTIONS.TOGGLE_SUBTASK: {
      const { taskId, subtaskId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                updatedAt: new Date().toISOString(),
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, done: !s.done } : s
                ),
              }
            : t
        ),
      };
    }
    case ACTIONS.DELETE_SUBTASK: {
      const { taskId, subtaskId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                updatedAt: new Date().toISOString(),
                subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
              }
            : t
        ),
      };
    }
    case ACTIONS.REORDER_TASKS: {
      const { sourceIndex, destinationIndex } = action.payload;
      if (destinationIndex === undefined || destinationIndex === null) return state;
      if (sourceIndex === destinationIndex) return state;
      return {
        ...state,
        tasks: reorder(state.tasks, sourceIndex, destinationIndex),
      };
    }
    case ACTIONS.SET_FILTERS: {
      const { filters } = action.payload;
      return { ...state, filters: { ...state.filters, ...filters } };
    }
    case ACTIONS.BULK_DELETE_COMPLETED: {
      return { ...state, tasks: state.tasks.filter((t) => t.status !== 'done') };
    }
    default:
      return state;
  }
}

function sortTasks(tasks, sortBy) {
  const copy = [...tasks];
  switch (sortBy) {
    case 'created-asc':
      return copy.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    case 'created-desc':
      return copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    case 'due-asc':
      return copy.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    case 'due-desc':
      return copy.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
    case 'priority':
      const rank = { high: 3, medium: 2, low: 1 };
      return copy.sort((a, b) => (rank[b.priority] || 0) - (rank[a.priority] || 0));
    default:
      return copy;
  }
}

function filterTasks(tasks, filters) {
  return tasks.filter((t) => {
    const q = (filters.query || '').toLowerCase();
    const matchesQuery =
      !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchesStatus =
      filters.status === 'all' || (filters.status === 'todo' && t.status !== 'done')
        ? filters.status === 'all' || (filters.status === 'todo' && t.status !== 'done')
        : t.status === filters.status;
    const matchesPriority =
      filters.priority === 'all' || t.priority === filters.priority;

    // refine matchesStatus for explicit states
    if (filters.status === 'in-progress') {
      return matchesQuery && matchesPriority && t.status === 'in-progress';
    }
    if (filters.status === 'done') {
      return matchesQuery && matchesPriority && t.status === 'done';
    }
    if (filters.status === 'todo') {
      return matchesQuery && matchesPriority && (t.status === 'todo' || t.status === 'in-progress');
    }
    return matchesQuery && matchesPriority;
  });
}

// PUBLIC_INTERFACE
export function TaskProvider({ children }) {
  /**
   * Context provider for task state and actions.
   */
  const persistedTasks = getJSON(STORAGE_KEY, []);
  const persistedFilters = getJSON(FILTERS_KEY, initialState.filters);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    tasks: Array.isArray(persistedTasks) ? persistedTasks : [],
    filters: persistedFilters || initialState.filters,
  });

  useEffect(() => {
    setJSON(STORAGE_KEY, state.tasks);
  }, [state.tasks]);

  useEffect(() => {
    setJSON(FILTERS_KEY, state.filters);
  }, [state.filters]);

  // Derived visible tasks
  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(state.tasks, state.filters);
    return sortTasks(filtered, state.filters.sortBy);
  }, [state.tasks, state.filters]);

  // Actions
  const addTask = (task) => dispatch({ type: ACTIONS.ADD_TASK, payload: task });
  const updateTask = (id, updates) =>
    dispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates } });
  const deleteTask = (id) => dispatch({ type: ACTIONS.DELETE_TASK, payload: id });
  const toggleTaskDone = (id) => dispatch({ type: ACTIONS.TOGGLE_TASK_DONE, payload: { id } });
  const addSubtask = (taskId, title) =>
    dispatch({ type: ACTIONS.ADD_SUBTASK, payload: { taskId, title } });
  const updateSubtask = (taskId, subtaskId, title) =>
    dispatch({ type: ACTIONS.UPDATE_SUBTASK, payload: { taskId, subtaskId, title } });
  const toggleSubtask = (taskId, subtaskId) =>
    dispatch({ type: ACTIONS.TOGGLE_SUBTASK, payload: { taskId, subtaskId } });
  const deleteSubtask = (taskId, subtaskId) =>
    dispatch({ type: ACTIONS.DELETE_SUBTASK, payload: { taskId, subtaskId } });
  const reorderTasks = (sourceIndex, destinationIndex) =>
    dispatch({ type: ACTIONS.REORDER_TASKS, payload: { sourceIndex, destinationIndex } });
  const setFilters = (filters) =>
    dispatch({ type: ACTIONS.SET_FILTERS, payload: { filters } });
  const bulkDeleteCompleted = () =>
    dispatch({ type: ACTIONS.BULK_DELETE_COMPLETED });

  const value = {
    state,
    visibleTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    addSubtask,
    updateSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTasks,
    setFilters,
    bulkDeleteCompleted,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTasks() {
  /** Hook to access TaskContext. */
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
}
