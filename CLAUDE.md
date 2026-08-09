# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際に**厳密に守るべきGitHubワークフロールール**を定義する。

## GitHubワークフロールール

### 1. Issue駆動で作業する
- 新しい作業(機能追加・バグ修正・改善など)を始める前に、必ず対応するGitHub Issueを作成する。
  ```
  gh issue create --title "<タイトル>" --body "<内容>"
  ```
- 既存のIssueがある場合はそれを使う。Issueが存在しない状態で作業ブランチを切らない。

### 2. ブランチ命名規則
- 形式: `<種別>/#<issue番号>-<短い説明>`
- 種別は内容に応じて使い分ける: `feature`(新機能), `fix`(バグ修正), `chore`(雑務・設定変更), `docs`(ドキュメント)
- 例: `feature/#12-add-task-priority-sort`, `fix/#15-login-error`
- mainブランチから最新の状態で分岐すること。

### 3. mainブランチへの直接コミット・プッシュ禁止
- mainブランチに直接コミットしたり `git push origin main` したりしない。
- 必ずfeatureブランチを作成し、GitHub Pull Requestを経由してmainにマージする。
- mainブランチはGitHub側のBranch Protectionにより直接pushがブロックされている。

### 4. Pull Requestのルール
- PR本文に、対応するIssueをcloseするリンクを含める: `Closes #<issue番号>`
- PRタイトルは変更内容が分かるように簡潔に書く。
- 作業が完了したらPRをマージし、不要になったブランチは削除する。

### 5. コミットメッセージ
- 変更の意図(なぜ)が分かるように書く。Issue番号があれば言及する。
