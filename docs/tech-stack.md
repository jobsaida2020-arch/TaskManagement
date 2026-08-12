# 技術スタック

親ドキュメント: [要件定義書](requirements.md)

## 1. 全体構成

| 区分 | 技術 | バージョン |
|------|------|-----------|
| フロントエンド | TypeScript / React(Next.jsなどのフレームワークは今回は対象外) | TypeScript 7.0.2 / React 19.2.8 |
| バックエンド | Java / Spring Boot | Java 21 / Spring Boot 3.3.4 |
| データベース | PostgreSQL | 16 |
| データ永続化 | PostgreSQLへのDB保存(詳細は[要件定義書 4章](requirements.md#4-データの保存方法)を参照) | - |

その他の周辺ツール(ビルドツール・パッケージ管理など)は、上記言語・フレームワークに準拠したものを選定する。バージョンは実装時点(2026年8月時点)の各`package.json`/`build.gradle`等の記載に準拠しており、依存更新に伴い変動しうる。

## 2. フロントエンド

| 項目 | 内容 | バージョン |
|------|------|-----------|
| 言語 | TypeScript | 7.0.2 |
| フレームワーク | React | 19.2.8 |
| メタフレームワーク | 使用しない(Next.jsなどは今回は対象外) | - |
| ビルドツール | Vite | 8.2.0 |
| Lint | oxlint | 1.75.0 |
| パッケージ管理 | npm | React標準構成に準拠 |

## 3. バックエンド

| 項目 | 内容 | バージョン |
|------|------|-----------|
| 言語 | Java | 21(Gradle toolchain指定) |
| フレームワーク | Spring Boot | 3.3.4 |
| ビルドツール | Gradle(Wrapper) | 8.10 |
| 主要ライブラリ | spring-boot-starter-web / spring-boot-starter-data-jpa / postgresql driver | Spring Bootに準拠 |

## 4. データベース

| 項目 | 内容 | バージョン |
|------|------|-----------|
| DBMS | PostgreSQL(Docker Compose上で起動) | 16 |
| テーブル定義 | [データ設計(ER図)](data-design.md) を参照 | - |
