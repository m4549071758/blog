import { join } from 'path';

export const joinPath = (...paths: (string | undefined | null)[]) => {
  // undefinedやnullをフィルタリングして、有効な文字列のみを使用
  const validPaths = paths.filter((p): p is string => typeof p === 'string');

  if (validPaths.length === 0) {
    return ''; // パスが一つもない場合は空文字を返す
  }

  return join(...validPaths).replace('https:/', 'https://');
};
