'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import apiClient from '@/lib/api';
import type { Task, TaskPriority } from '@/types';
import { ArrowLeftIcon, PlusIcon, ChatIcon, SendIcon, XIcon, OrganizationIcon, CashIcon } from '@/components/icons';

/** 백엔드 프로젝트 상태 (PLANNING 등) */
type ProjectStatusBackend = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED' | 'ARCHIVED';

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

interface ProjectDetail {
  projectId: number;
  name: string;
  status: ProjectStatusBackend;
  budget?: number;
  spentAmount?: number;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusChanging, setStatusChanging] = useState(false);

  // 모달 상태
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  // 폼 상태
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDescription, setNewColumnDescription] = useState('');
  const [newColumnType, setNewColumnType] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (!projectId) return;
    loadProjectAndBoard();
  }, [projectId]);

  const loadProjectAndBoard = async () => {
    setLoading(true);
    await Promise.all([loadProject(), loadKanbanBoard()]);
  };

  const loadProject = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      const data = res.data?.data ?? res.data;
      setProject({
        projectId: data.projectId,
        name: data.name,
        status: data.status,
        budget: data.budget,
        spentAmount: data.spentAmount || 0,
      });
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error);
      setProject(null);
    }
  };

  const loadKanbanBoard = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/board`);
      const data = response.data?.data ?? response.data;
      const raw = data?.columns ?? [];
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
    } catch (error) {
      console.error('칸반 보드 로딩 실패:', error);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<string, string> = {
    PLANNING: '기획',
    IN_PROGRESS: '진행',
    COMPLETED: '완료',
    ON_HOLD: '보류',
    CANCELLED: '취소',
    ARCHIVED: '아카이빙',
  };

  const changeStatus = async (action: 'start' | 'complete' | 'reopen') => {
    setStatusChanging(true);
    try {
      await apiClient.patch(`/projects/${projectId}/${action}`);
      await loadProject();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setStatusChanging(false);
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
      await apiClient.put(`/tasks/${taskId}/move`, {
        targetColumnId: targetColumnId,
        newSequence: destination.index,
      });
    } catch (error) {
      console.error('태스크 이동 실패:', error);
      loadKanbanBoard(); // 실패 시 롤백
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    try {
      const payload: any = {
        name: newColumnName,
      };
      if (newColumnDescription) {
        payload.description = newColumnDescription;
      }
      if (newColumnType) {
        payload.columnType = newColumnType;
      }
      await apiClient.post(`/projects/${projectId}/columns`, payload);
      setNewColumnName('');
      setNewColumnDescription('');
      setNewColumnType('');
      setShowColumnModal(false);
      loadKanbanBoard();
    } catch (error) {
      console.error('컬럼 추가 실패:', error);
      alert('컬럼 추가에 실패했습니다.');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || selectedColumnId === null) return;
    try {
      const payload: any = {
        title: newTaskTitle,
      };
      if (newTaskContent) {
        payload.content = newTaskContent;
      }
      if (newTaskDeadline) {
        payload.deadline = newTaskDeadline;
      }
      await apiClient.post(`/columns/${selectedColumnId}/tasks`, payload);
      setNewTaskTitle('');
      setNewTaskContent('');
      setNewTaskDeadline('');
      setShowTaskModal(false);
      setSelectedColumnId(null);
      loadKanbanBoard();
    } catch (error) {
      console.error('태스크 추가 실패:', error);
      alert('태스크 추가에 실패했습니다.');
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await apiClient.post(`/projects/${projectId}/invite`, {
        email: inviteEmail,
      });
      setInviteEmail('');
      setShowInviteModal(false);
      alert('팀원 초대가 완료되었습니다.');
    } catch (error) {
      console.error('팀원 초대 실패:', error);
      alert('팀원 초대에 실패했습니다.');
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

  const formatCurrency = (amount?: number) => {
    if (amount == null) return '-';
    return `${amount.toLocaleString()}원`;
  };

  const calculateBudgetUsage = () => {
    if (!project?.budget || project.budget === 0) return 0;
    return Math.min(Math.round(((project.spentAmount || 0) / project.budget) * 100), 100);
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              프로젝트 목록
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{project?.name || '프로젝트 보드'}</h1>
            {project?.status && (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                    project.status === 'PLANNING'
                      ? 'bg-gray-100 text-gray-800'
                      : project.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : project.status === 'ON_HOLD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabel[project.status] ?? project.status}
                </span>
                {project.status === 'PLANNING' && (
                  <button
                    onClick={() => changeStatus('start')}
                    disabled={statusChanging}
                    className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    진행 시작
                  </button>
                )}
                {project.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => changeStatus('complete')}
                    disabled={statusChanging}
                    className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                  >
                    완료
                  </button>
                )}
                {(project.status === 'COMPLETED' || project.status === 'ON_HOLD') && (
                  <button
                    onClick={() => changeStatus('reopen')}
                    disabled={statusChanging}
                    className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    재진행
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColumnModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <PlusIcon className="w-4 h-4" />
              컬럼 추가
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <OrganizationIcon className="w-4 h-4" />
              팀원 초대
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md ${
                chatOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChatIcon className="w-4 h-4" />
              채팅
            </button>
          </div>
        </div>

        {/* 예산 정보 */}
        {project?.budget && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CashIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">예산:</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(project.budget)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">소진:</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(project.spentAmount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">소진율:</span>
              <span className={`font-semibold tabular-nums ${calculateBudgetUsage() > 90 ? 'text-red-600' : calculateBudgetUsage() > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {calculateBudgetUsage()}%
              </span>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${calculateBudgetUsage() > 90 ? 'bg-red-600' : calculateBudgetUsage() > 70 ? 'bg-amber-600' : 'bg-emerald-600'}`}
                style={{ width: `${calculateBudgetUsage()}%` }}
              />
            </div>
          </div>
        )}
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
                  className="shrink-0 w-80 bg-gray-100 border border-gray-200 flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-gray-200 bg-white">
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
                  <div className="px-3 py-2 border-t border-gray-200 bg-white">
                    <button
                      onClick={() => {
                        setSelectedColumnId(column.columnId);
                        setShowTaskModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                    >
                      <PlusIcon className="w-4 h-4" />
                      태스크 추가
                    </button>
                  </div>
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
                  <div className="bg-gray-100 px-3 py-2 rounded text-gray-900">{msg.content}</div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="메시지 입력..."
                  className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600"
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

      {/* 컬럼 추가 모달 */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">컬럼 추가</h3>
              <button onClick={() => setShowColumnModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">컬럼 이름</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="예: 진행중"
                  className="w-full px-3 py-2 text-gray-900 font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">설명</label>
                <textarea
                  value={newColumnDescription}
                  onChange={(e) => setNewColumnDescription(e.target.value)}
                  placeholder="이 컬럼에 대한 설명을 입력하세요 (선택)"
                  rows={3}
                  className="w-full px-3 py-2 text-gray-900 font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">상태</label>
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 font-semibold bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827' }}
                >
                  <option value="" style={{ color: '#111827' }}>자동 판별</option>
                  <option value="TODO" style={{ color: '#111827' }}>할 일 (TODO)</option>
                  <option value="IN_PROGRESS" style={{ color: '#111827' }}>진행 중 (IN_PROGRESS)</option>
                  <option value="DONE" style={{ color: '#111827' }}>완료 (DONE)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddColumn}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 태스크 추가 모달 */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">태스크 추가</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="태스크 제목"
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  style={{ color: '#111827' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  placeholder="태스크 내용 (선택)"
                  rows={3}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                <input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 팀원 초대 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">팀원 초대</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  style={{ color: '#111827' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  초대
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
