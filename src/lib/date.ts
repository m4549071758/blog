export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // ビルド環境と閲覧環境のタイムゾーン差でhydration不一致(React #418)にならないよう固定する
    timeZone: 'Asia/Tokyo',
  });
