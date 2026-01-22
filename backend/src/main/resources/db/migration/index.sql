CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_project_member_user ON project_member(user_id);
CREATE INDEX idx_project_member_project ON project_member(project_id);
CREATE INDEX idx_task_worker ON task(worker_id);
CREATE INDEX idx_task_column ON task(column_id);
CREATE INDEX idx_approval_line_approver ON approval_line(approver_id, status);