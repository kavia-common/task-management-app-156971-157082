import React from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';

// PUBLIC_INTERFACE
export default function TaskList() {
  /** Renders tasks with drag-and-drop reordering. */
  const { visibleTasks, reorderTasks } = useTasks();

  const onDragEnd = (result) => {
    const { destination, source } = result || {};
    if (!destination) return;
    if (destination.index === source.index) return;
    reorderTasks(source.index, destination.index);
  };

  if (!visibleTasks.length) {
    return <p className="description" data-testid="empty-state">No tasks yet. Add your first task!</p>;
  }

  return (
    <div className="task-list" data-testid="task-list">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks-droppable">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {visibleTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(p, s) => (
                    <div
                      ref={p.innerRef}
                      {...p.draggableProps}
                      className={`task-item ${s.isDragging ? 'dragging' : ''}`}
                    >
                      <div {...p.dragHandleProps} className="drag-handle" aria-label="Drag handle">⠿</div>
                      <TaskItem task={task} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
