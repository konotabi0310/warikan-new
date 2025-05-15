// postcss.config.js
module.exports = {
  plugins: {
    // Tailwind CSS を使っているなら
    tailwindcss: {},
    // ベンダープレフィックス自動付与
    autoprefixer: {},
    // 必要なら他のプラグインもここに並べる
    // e.g. 'postcss-nested': {},
  },
};