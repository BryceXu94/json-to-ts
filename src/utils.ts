import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import parserTypeScript from 'prettier/parser-typescript';
/**
 * 代码格式化
 * @param code 代码字符串
 * @param options prettier配置
 * @return string
 */
export const codeFormat = (code: string, options: Options): string => {
  return prettier.format(code, {
    ...options,
    parser: 'typescript',
    plugins: [parserTypeScript],
  });
};
