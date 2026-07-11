# キューピッズ 文字数チャット（cupids-chat）

GitHub: `marjoly88-svg/cupids-chat` ／ ローカル: `C:\Users\marjo\cupids-chat`

1文字6ptの量り売りチャット占いサイト ＋ 占い師（みなみさん）管理アプリ。
（既存100文字チャット=往復800円・実質4円/字より常に5割高いプレミアム設定。2026-07-12決定）
設計メモ: `cupids-moji-chat-spec`（Claude Codeのメモリー参照）

## 構成

| ファイル | 役割 |
|---|---|
| `index.html` | お客さん用サイト（ログイン・チャット・チャージ・相談終了/再開） |
| `admin.html` | みなみさん管理アプリ（PWA。ホーム/チャット/待機の3タブ） |
| `config.js` | Firebase設定・レート・みなみさんのID・STORES購入リンク |
| `manifest.json` / `sw.js` | 管理アプリのPWA化（ホーム画面追加用） |

Firebaseは既存サイトと同じ **cupids-chat** プロジェクトを共用。
会員(users)・ポイント(points)・チャージコード(chargeCodes)は既存資産をそのまま使う。

## サーバー側（cupids-denwa リポジトリ側にある）

- `functions/mojiChat.js` … `mojiSendMessage`（メッセージ送信・課金の心臓部）
  - 有料/無料の送信、残高チェック＋減算＋書き込みをトランザクションで原子的に処理
  - 退室（相談終了）後・7日無反応後の有料送信をサーバー側で拒否
  - 占い師返信時にお客さんへメール通知（30分間引き）
- `firestore.rules` … mojiConversations / mojiMessages のルール追記済み
- `firestore.indexes.json` … 複合インデックス4件追記済み

## データ構造（新規コレクション）

- `mojiConversations/{clientId}_{tellerId}`
  - clientId, clientName, tellerId, tellerName, status('active'|'ended'), endedAt,
    clientLastActiveAt, lastMessageText, lastMessageAt, lastSenderRole,
    unreadByTeller, unreadByClient, clientNotifiedAt, createdAt, updatedAt
- `mojiMessages/{auto}`
  - conversationId, senderId, senderRole('client'|'teller'), text, paid, cost, createdAt
- `fortuneTellers/{uid}` に追加したフィールド（既存ドキュメントに追記）
  - `mojiChatOpen`(bool) … チャット新規受付
  - `nextLoginText`(string) … 次回ログイン予定（空文字で非表示）
  - `phoneStatus` は既存の電話サイトと同じ値をそのまま使用（'waiting'/'offline'）

## デプロイ手順（未実施）

1. **Functions**（cupids-denwaフォルダで）
   ```
   firebase deploy --only functions:mojiSendMessage
   ```
   ⚠ 裸の `--only functions` は既存の決済系Functionを消そうとするので絶対に使わない

2. **Firestoreルール＋インデックス**（cupids-denwaフォルダで）
   ```
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   ⚠ ルールはプロジェクト全体に効く。デプロイ前にFirebaseコンソールの現行ルールと
   ローカルの firestore.rules に差分がないか確認すること

3. **フロント**: このフォルダをGitHubの新リポジトリに push → Vercelで新規プロジェクト作成
   - デプロイ後、確定したURLを `functions/mojiChat.js` の `SITE_URL` に反映して関数を再デプロイ

4. **動作確認の順序**
   - 管理アプリにみなみさんのアカウントでログイン → 待機タブで「チャット新規受付」ON
   - お客さんテストアカウントで index.html からメッセージ送信（残高減算を確認）
   - 管理アプリで有料/無料それぞれ返信（バッジ・残高・メール通知を確認）
   - お客さん側で「相談を終了」→ 管理アプリから有料送信できないことを確認

## ローカル確認

静的ファイルなのでローカルサーバーで開くだけ（Firestore読み取りは本物につながる）。
メッセージ送信はFunctionsデプロイ後でないと動かない。
