// 静的エクスポート (output: 'export') では、
// すべてのページが同じルートレベルにエクスポートされるため、
// 常にルートパス '.' を返します
export const useRootPath = () => {
  return '.';
};
