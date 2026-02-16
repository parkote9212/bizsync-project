'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import apiClient from '@/lib/api';
import type { Task, TaskPriority } from '@/types';

interface Column {
  columnId: number;
  name: string;
  position: number;
  tasks: Task[];
}

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);

  useEffect(() => {
    loadKanbanBoard();
  }, [selectedProjectId]);

  const loadKanbanBoard = async () => {
    try {
      const response = await apiClient.get(`/kanban/${selectedProjectId}`);
      setColumns(response.data.columns || []);
      setLoading(false);
    } catch (error) {
      console.error('칸반 보드 로딩 실패:', error);
      setColumns([]);
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 드롭 위치가 없으면 무시
    if (!destination) return;

    // 같은 위치면 무시
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumnIndex = columns.findIndex(
      (col) => col.columnId.toString() === source.droppableId
    );
    const destColumnIndex = columns.findIndex(
      (col) => col.columnId.toString() === destination.droppableId
    );

    const sourceColumn = columns[sourceColumnIndex];
    const destColumn = columns[destColumnIndex];

    const taskId = parseInt(draggableId.split('-')[1]);
    const movedTask = sourceColumn.tasks.find((t) => t.taskId === taskId);

    if (!movedTask) return;

    // 새로운 columns 배열 생성
    const newColumns = [...columns];

    if (source.droppableId === destination.droppableId) {
      // 같은 컬럼 내에서 이동
      const newTasks = Array.from(sourceColumn.tasks);
      newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);

      newColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: newTasks,
      };
    } else {
      // 다른 컬럼으로 이동
      const sourceTasks = Array.from(sourceColumn.tasks);
      sourceTasks.splice(source.index, 1);

      const destTasks = Array.from(destColumn.tasks);
      const updatedTask = { ...movedTask, columnId: destColumn.columnId };
      destTasks.splice(destination.index, 0, updatedTask);

      newColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: sourceTasks,
      };
      newColumns[destColumnIndex] = {
        ...destColumn,
        tasks: destTasks,
      };

      // API 호출 (추후 구현)
      // await apiClient.patch(`/tasks/${taskId}/move`, {
      //   columnId: destColumn.columnId,
      //   position: destination.index,
      // });
    }

    setColumns(newColumns);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">칸반 보드</h1>
          <p className="text-sm text-gray-500">프로젝트 업무를 드래그하여 관리하세요</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          + 새 업무
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn key={column.columnId} column={column} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function KanbanColumn({ column }: { column: Column }) {
  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {column.name}
          <span className="ml-2 text-xs text-gray-500 font-medium tabular-nums">({column.tasks.length})</span>
        </h3>
      </div>

      <Droppable droppableId={column.columnId.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] space-y-2 ${
              snapshot.isDraggingOver ? 'bg-blue-50 border border-blue-200 p-2' : ''
            }`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard key={task.taskId} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  const priorityColors = {
    LOW: 'bg-gray-50 text-gray-700 border-gray-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    URGENT: 'bg-red-50 text-red-700 border-red-200',
  };

  const priorityLabels = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  };

  return (
    <Draggable draggableId={`task-${task.taskId}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border border-gray-200 p-3 cursor-move ${
            snapshot.isDragging ? 'border-blue-400 shadow-sm' : 'hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
              {task.title}
            </h4>
            <span
              className={`inline-flex px-2 py-0.5 border text-xs font-medium flex-shrink-0 ml-2 ${
                priorityColors[task.priority]
              }`}
            >
              {priorityLabels[task.priority]}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {task.dueDate && (
              <span className="flex items-center tabular-nums">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.workerName && (
              <span className="flex items-center">
                👤 {task.workerName}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
