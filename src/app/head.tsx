// src/app/head.tsx
export default function Head() {
  return (
    <>
      {/* PWA 用マニフェスト */}
      <link rel="manifest" href="/manifest.json" />

      {/* ファビコン */}
      <link rel="icon" href="/favicon.ico" />

      {/* Android Chrome 用テーマカラー */}
      <meta name="theme-color" content="#FF6B35" />

      {/* iOS ホーム画面追加用アイコン */}
      <link rel="apple-touch-icon" href="/icon/icon-192.png" />
      {/* 必要に応じて 512x512 も */}
      <link rel="apple-touch-icon" sizes="512x512" href="/icon/icon-512.png" />
    </>
  );
}