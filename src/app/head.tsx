// src/app/head.tsx
export default function Head() {
  return (
    <>
      {/* PWA マニフェスト */}
      <link rel="manifest" href="/manifest.json" />

      {/* テーマカラー */}
      <meta name="theme-color" content="#FF6B35" />

      {/* ファビコン */}
      <link rel="icon" href="/icon/icon-192.png" />

      {/* iOS ホーム画面用 */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="ラクワリ" />
      <link rel="apple-touch-icon" href="/icon/icon-192.png" />
      {/* 必要なら sizes 属性も */}
      <link
        rel="apple-touch-icon"
        sizes="512x512"
        href="/icon/icon-512.png"
      />
    </>
  );
}