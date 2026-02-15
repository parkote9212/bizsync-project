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
      // 추후 실제 API 연동
      // const response = await apiClient.get(`/projects/${selectedProjectId}/kanban`);
      // setColumns(response.data.columns);

      // 임시 데이터
      setTimeout(() => {
        setColumns([
          {
            columnId: 1,
            name: 'To Do',
            position: 0,
            tasks: [
              {
                taskId: 1,
                title: 'Next.js 프로젝트 셋업',
                description: 'Next.js 15 초기 설정 및 기본 구조 구성',
                priority: 'HIGH' as TaskPriority,
                dueDate: '2025-02-20',
                columnId: 1,
                position: 0,
                workerId: 1,
                workerName: '홍길동',
                createdAt: '2025-02-15T00:00:00',
              },
              {
                taskId: 2,
                title: 'API 클라이언트 구현',
                description: 'Axios 기반 HTTP 클라이언트',
                priority: 'MEDIUM' as TaskPriority,
                columnId: 1,
                position: 1,
                createdAt: '2025-02-15T00:00:00',
              },
            ],
          },
          {
            columnId: 2,
            name: 'In Progress',
            position: 1,
            tasks: [
              {
                taskId: 3,
                title: '칸반 보드 구현',
                description: '드래그 앤 드롭 기능 포함',
                priority: 'HIGH' as TaskPriority,
                dueDate: '2025-02-18',
                columnId: 2,
                position: 0,
                workerId: 2,
                workerName: '김철수',
                createdAt: '2025-02-15T00:00:00',
              },
            ],
          },
          {
            columnId: 3,
            name: 'Review',
            position: 2,
            tasks: [],
          },
          {
            columnId: 4,
            name: 'Done',
            position: 3,
            tasks: [
              {
                taskId: 4,
                title: '프로젝트 구조 설계',
                description: 'DDD 구조로 리팩토링',
                priority: 'HIGH' as TaskPriority,
                columnId: 4,
                position: 0,
                createdAt: '2025-02-10T00:00:00',
              },
            ],
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('칸반 보드 로딩 실패:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">칸반 보드</h1>
          <p className="mt-2 text-gray-600">프로젝트 업무를 드래그하여 관리하세요</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          + 새 업무
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
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
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {column.name}
          <span className="ml-2 text-sm text-gray-500">({column.tasks.length})</span>
        </h3>
      </div>

      <Droppable droppableId={column.columnId.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] space-y-3 ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            } rounded-md transition-colors`}
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
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
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
          className={`bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-move ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
              {task.title}
            </h4>
            <span
              className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                priorityColors[task.priority]
              }`}
            >
              {priorityLabels[task.priority]}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {task.dueDate && (
                <span className="flex items-center">
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
        </div>
      )}
    </Draggable>
  );
}
