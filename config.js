// キューピッズ 文字数チャット 共通設定
// Firebaseは既存サイト（電話・チャット）と同じ cupids-chat プロジェクトを共用する。
// 会員(users)・ポイント(points)・チャージコード(chargeCodes)は既存資産をそのまま使う。
const CUPIDS = {
  firebase: {
    apiKey: "AIzaSyA52uJ31HzLkbz32lA-3WWSmhM10xYjjCg",
    authDomain: "cupids-chat.firebaseapp.com",
    projectId: "cupids-chat",
    storageBucket: "cupids-chat.firebasestorage.app",
    messagingSenderId: "44532110483",
    appId: "1:44532110483:web:d6266e8abba8582b8b6966"
  },
  region: "asia-northeast1", // mojiSendMessage のデプロイ先リージョン
  // 1文字6pt。既存の100文字チャット(お客さん100字+返信100字=800円=実質4円/字)より
  // 常に5割高いプレミアム設定。「既存サイトのほうがお得」が崩れないこと
  rate: 6, // pt / 文字

  // みなみさん（fortuneTellers のドキュメントID = 本人のuid）
  teller: {
    id: "8FpR8u9oQgSgUaQUgpS8TRYgiQg2",
    name: "みなみ"
  },

  replyEtaText: "通常24時間以内にお返事します",

  // ポイント購入（STORES。既存の電話サイトと同じ商品）
  purchaseLinks: [
    { label: "¥1,600（1,600pt）", url: "https://qpizzu.stores.jp/items/6940310ad493260333c4e495" },
    { label: "¥3,100（3,200pt）", url: "https://qpizzu.stores.jp/items/69403184f09fa01f4cd34dcb" },
    { label: "¥6,200（6,400pt）", url: "https://qpizzu.stores.jp/items/694031efaad66f2a49a06a8d" },
    { label: "¥10,000（10,400pt）", url: "https://qpizzu.stores.jp/items/694032acaad66f37f7a06a85" }
  ]
};
