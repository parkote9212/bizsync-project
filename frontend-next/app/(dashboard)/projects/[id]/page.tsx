'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import apiClient from '@/lib/api';
import type { Task, TaskPriority } from '@/types';
import { ArrowLeftIcon, PlusIcon, ChatIcon, SendIcon } from '@/components/icons';

interface Column {
  columnId: number;
  name: string;
  position?: number;
  sequence?: number;
  tasks: Task[];
}

interface ChatMessage {
  messageId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!projectId) return;
    loadKanbanBoard();
  }, [projectId]);

  const loadKanbanBoard = async () => {
    try {
      const response = await apiClient.get<{ data?: { columns?: Column[] }; columns?: Column[] }>(
        `/kanban/${projectId}`
      );
      const raw = response.data?.data?.columns ?? response.data?.columns ?? [];
      const list = Array.isArray(raw) ? raw : [];
      setColumns(
        list.map((col: any) => ({
          columnId: col.columnId,
          name: col.name,
          position: col.position ?? col.sequence ?? 0,
          tasks: (col.tasks || []).map((t: any) => ({
            ...t,
            dueDate: t.dueDate ?? t.deadline,
            description: t.description ?? t.content,
            priority: t.priority ?? 'MEDIUM',
            columnId: col.columnId,
            position: t.position ?? t.sequence ?? 0,
          })),
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error('칸반 보드 로딩 실패:', error);
      setColumns([]);
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = parseInt(draggableId.replace('task-', ''), 10);
    const targetColumnId = parseInt(destination.droppableId.replace('column-', ''), 10);

    // 낙관적 UI 업데이트
    const newColumns = [...columns];
    const sourceCol = newColumns.find((c) => c.columnId === parseInt(source.droppableId.replace('column-', ''), 10));
    const destCol = newColumns.find((c) => c.columnId === targetColumnId);

    if (sourceCol && destCol) {
      const [movedTask] = sourceCol.tasks.splice(source.index, 1);
      destCol.tasks.splice(destination.index, 0, { ...movedTask, columnId: targetColumnId });
      setColumns(newColumns);
    }

    // API 호출
    try {
      await apiClient.patch(`/kanban/tasks/${taskId}/move`, {
        columnId: targetColumnId,
        position: destination.index,
      });
    } catch (error) {
      console.error('태스크 이동 실패:', error);
      loadKanbanBoard(); // 실패 시 롤백
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return '높음';
      case 'MEDIUM':
        return '보통';
      case 'LOW':
        return '낮음';
      default:
        return priority;
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;
    // TODO: WebSocket 연동 (현재는 임시)
    const tempMsg: ChatMessage = {
      messageId: Date.now(),
      senderId: 1,
      senderName: '나',
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            프로젝트 목록
          </button>
          <h1 className="text-lg font-semibold text-gray-900">프로젝트 보드</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md">
            <PlusIcon className="w-4 h-4" />
            컬럼 추가
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md">
            <PlusIcon className="w-4 h-4" />
            태스크 추가
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md ${
              chatOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChatIcon className="w-4 h-4" />
            {chatOpen ? '채팅 닫기' : '채팅 열기'}
          </button>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 칸반 보드 */}
        <div className={`flex-1 overflow-x-auto ${chatOpen ? 'pr-80' : ''}`}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 p-6 h-full">
              {columns.map((column) => (
                <div
                  key={column.columnId}
                  className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{column.name}</h3>
                      <span className="text-xs text-gray-500 tabular-nums">{column.tasks.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={`column-${column.columnId}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-3 space-y-2 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable
                            key={task.taskId}
                            draggableId={`task-${task.taskId}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border border-gray-200 p-3 rounded hover:shadow-sm cursor-pointer ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <div className="text-sm font-medium text-gray-900 mb-1">{task.title}</div>
                                {task.description && (
                                  <div className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</div>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`px-2 py-0.5 border rounded-full ${getPriorityColor(task.priority)}`}>
                                    {getPriorityLabel(task.priority)}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-gray-500">{task.dueDate}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* 채팅 패널 */}
        {chatOpen && (
          <div className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">프로젝트 채팅</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.messageId} className="text-sm">
                  <div className="text-xs text-gray-500 mb-0.5">{msg.senderName}</div>
                  <div className="bg-gray-100 px-3 py-2 rounded">{msg.content}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="메시지 입력..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={sendChatMessage}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <SendIcon className="w-4 h-4" />
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
