# TaskManagement

Trello風のタスク管理アプリ。個人利用を想定し、ログイン機能や複数人での共有は行わない、学習目的のアプリケーション。

タスクの追加・状態変更(未着手/進行中/完了)・削除・並び替え(手動ドラッグ&ドロップ / 優先度順 / 期限順)を、列(ステータス)ごとにボードUIで管理できる。

## 目次

- [ドキュメント](#ドキュメント)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [セットアップ](#セットアップ)
- [開発サーバーの起動](#開発サーバーの起動)
- [開発ルール](#開発ルール)

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義書](docs/requirements.md) | 背景・目的、機能要件の概要、スコープ、技術スタック概要 |
| [機能要件書](docs/functional-requirements.md) | 機能一覧・タスクが持つ情報・ユースケース詳細 |
| [画面設計](docs/screens.md) | 画面一覧・画面遷移 |
| [データ設計(ER図)](docs/data-design.md) | テーブル定義・ER図 |
| [技術スタック](docs/tech-stack.md) | フロントエンド/バックエンド/DBの技術・バージョン一覧 |

## 技術スタック

| 区分 | 技術 | バージョン |
|---|---|---|
| フロントエンド | TypeScript / React / Vite | TypeScript 7.0.2 / React 19.2.8 / Vite 8.2.0 |
| バックエンド | Java / Spring Boot / Gradle | Java 21 / Spring Boot 3.3.4 / Gradle 8.10 |
| データベース | PostgreSQL | 16 |
| Lint | oxlint(フロントエンド) | 1.75.0 |

詳細は [技術スタック](docs/tech-stack.md) を参照。

## ディレクトリ構成

```
.
├── backend/          # Spring Boot (Java 21) バックエンド。Dockerfile あり
├── frontend/          # React + TypeScript (Vite) フロントエンド
├── docs/              # 要件定義・機能要件・画面設計・データ設計・技術スタック
├── prototype/         # 初期プロトタイプ(素のHTML/CSS/JS)
├── docker-compose.yml # PostgreSQL + backend のローカル起動用
└── .env.example       # DB接続用の環境変数サンプル
```

## セットアップ

### 必要環境

- Java 21
- Node.js(npm が利用できるバージョン)
- Docker / Docker Compose(PostgreSQLをコンテナで起動する場合)

### 初回セットアップ

```bash
# 環境変数ファイルを用意
cp .env.example .env

# フロントエンドの依存パッケージをインストール
cd frontend
npm install
```

バックエンドは Gradle Wrapper を使うため追加のインストール作業は不要。

## 開発サーバーの起動

バックエンドは `8080`、フロントエンドは `5173` の固定ポートで起動する。バックエンドの CORS 許可オリジンが `http://localhost:5173`、フロントエンドの `VITE_API_BASE_URL` が `http://localhost:8080` に固定されているため、ポートを変更すると通信できなくなる。詳細・ポート競合時の対処は [サーバー起動ルール](CLAUDE.md#サーバー起動ルール) を参照。

```bash
# PostgreSQL をコンテナで起動
docker compose up -d postgres

# バックエンド(Spring Boot, port 8080)
cd backend
./gradlew bootRun

# フロントエンド(Vite, port 5173)
cd frontend
npm run dev
```

起動後、ブラウザで `http://localhost:5173` を開く。

## 開発ルール

本リポジトリはIssue駆動・ブランチ運用・PRベースのGitHubワークフロールールに従う。詳細は [CLAUDE.md](CLAUDE.md) を参照。
