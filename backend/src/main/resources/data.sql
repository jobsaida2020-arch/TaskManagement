DELETE FROM task;

INSERT INTO task (title, description, due_date, priority, status, created_at, updated_at) VALUES
('プロジェクトのセットアップ', 'gitリポジトリとCI設定を初期化する', '2026-08-05', 'MEDIUM', 'DONE', NOW(), NOW()),
('データベース設計', 'Taskエンティティとテーブル構造を定義する', '2026-08-06', 'HIGH', 'DONE', NOW(), NOW()),
('タスクREAD APIの実装', 'GET /api/tasks と GET /api/tasks/{id} を実装する', '2026-08-10', 'HIGH', 'IN_PROGRESS', NOW(), NOW()),
('リポジトリの単体テストを書く', 'statusとpriorityによる絞り込みをカバーする', '2026-08-14', 'MEDIUM', 'NOT_STARTED', NOW(), NOW()),
('CIパイプラインの構築', 'GitHub Actionsでビルド・テストを自動化する', '2026-08-20', 'LOW', 'NOT_STARTED', NOW(), NOW()),
('カンバンボードUIの設計', '列のレイアウトを検討する', '2026-08-25', 'LOW', 'NOT_STARTED', NOW(), NOW()),
('期限切れタスクの棚卸し', '前スプリントの積み残しを整理する', '2026-08-01', 'HIGH', 'NOT_STARTED', NOW(), NOW()),
('依存ライブラリの更新', 'Spring BootとPostgreSQLドライバのバージョンを上げる', '2026-08-15', 'MEDIUM', 'IN_PROGRESS', NOW(), NOW());
