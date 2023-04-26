import { camelCase, constantCase } from 'change-case';
import type {
  JSONType,
  ParsedJSONType,
  IAbstractConfig,
  OptionsType,
} from './types';
import { codeFormat } from './utils';

export type { JSONType, IAbstractConfig, OptionsType, EnumItem } from './types';

let interfaceStr = '';
class Parser {
  abstractConfig = {} as IAbstractConfig;
  abstractResult: ParsedJSONType[] = [];
  /** 遍历数据 并且处理是否拆分 */
  transformJson = (
    jsonData: ParsedJSONType,
    curDepth: number,
    path: string,
    curKey: string,
    isArrayChild?: boolean
  ) => {
    const { maxDepth, abstractType, abstractEnum } = this.abstractConfig;
    const type = jsonData?.type;
    if (type === 'object') {
      Object.keys(jsonData.properties || {}).forEach((typeKey) => {
        const curJson = jsonData.properties![typeKey];
        if (curJson) {
          const _typeKey = camelCase(`${path}/${typeKey}`);
          this.transformJson(curJson, curDepth + 1, _typeKey, typeKey);
        }
      });
      if (
        curDepth === 1
        || (curDepth <= maxDepth
          && (abstractType.includes(type)
            || (isArrayChild && abstractType.includes('array'))))
      ) {
        if (!jsonData.alias) {
          jsonData.alias = `${path}`;
        }
        this.abstractResult.push(jsonData);
      }
    } else if (type === 'array' && jsonData.item) {
      jsonData.item.description = jsonData.description;
      jsonData.item.required = jsonData.required;
      if (jsonData.item.type === 'array' || jsonData.item.type === 'object') {
        if (
          curDepth === 1
          || (curDepth <= maxDepth && abstractType.includes(type))
        ) {
          jsonData.alias = `${path}Item[]`;
          jsonData.item.alias = `${path}Item`;
        }
      }
      this.transformJson(jsonData.item, curDepth, path, curKey, true);
    } else if (type === 'enum') {
      if (
        !jsonData.enum.some(
          v => typeof v.key === 'undefined' || v.key === null
        )
        && abstractEnum
      ) {
        jsonData.alias = constantCase(`${curKey}/Enum`);
        this.abstractResult.push(jsonData);
      }
    }
  };

  /**
   * types 拆分
   */
  abstractDataType = (jsonData: ParsedJSONType, typeName: string) => {
    this.abstractResult.length = 0;
    this.transformJson(jsonData, 1, typeName, typeName);
    return this.abstractResult
      .map(v => this.jsonToType(v, v.alias!))
      .join('\n');
  };

  /**
   * 根据 JSON 对象生产 TypeScript 类型定义。
   *
   * @param json JSON 对象
   * @param typeName 类型名称
   * @returns TypeScript 类型定义
   */
  jsonToType = (jsonData: ParsedJSONType, typeName: string) => {
    if (Object.keys(jsonData || {}).length === 0) {
      return `export interface ${typeName} {}`;
    }
    interfaceStr = '';
    const code = this.compileJson(jsonData, typeName, true);
    // return '';
    return code.trim();
  };

  /** 获取注释 */
  getComment = (comment: string = '') => {
    if (comment === '') {
      return '';
    }
    return `\n/**
       * ${comment}
       */`;
  };

  compileJson = (jsonData: ParsedJSONType, keyName: string, isTop = false) => {
    if (jsonData.alias && !isTop) {
      interfaceStr += `${this.getComment(jsonData.description)}\n${keyName}${
        jsonData.required ? '' : '?'
      }: ${jsonData.alias}`;
    } else {
      // array类型会在处理对应子类型时创建注释
      if (jsonData.type !== 'array') {
        interfaceStr += this.getComment(jsonData.description);
      }
      switch (jsonData.type) {
        case 'enum':
          if (isTop) {
            interfaceStr += `\nexport enum ${keyName} {
            ${jsonData.enum
    .map(v => `${this.getComment(v.description)}\n${constantCase(v.key!)} = ${v.value}`)
    .join(',')}
          }`;
          } else {
            interfaceStr += `\n${keyName}${
              jsonData.required ? '' : '?'
            }: ${jsonData.enum
              .map(v => (typeof v.value === 'number' ? v.value : `'${v.value}'`))
              .join('|')}`;
          }
          break;
        case 'object':
          if (isTop) {
            interfaceStr += `\nexport interface ${keyName} {`;
          } else {
            interfaceStr += `\n${keyName}${jsonData.required ? '' : '?'}: {`;
          }
          Object.entries(jsonData.properties!).forEach((v) => {
            const [key, val] = v;
            this.compileJson(val, key);
          });
          interfaceStr += '}';
          break;
        case 'array':
          this.compileJson(jsonData.item!, keyName);
          interfaceStr += '[]';
          break;
        case 'number':
          interfaceStr += `\n${keyName}${jsonData.required ? '' : '?'}: number`;
          break;
        case 'boolean':
        case 'string':
        case 'null':
        case 'any':
          interfaceStr += `\n${keyName}${jsonData.required ? '' : '?'}: ${
            jsonData.type
          }`;
          break;
        default:
          break;
      }
    }
    return interfaceStr;
  };
  parse = (
    /** JSON数据 */
    data: JSONType,
    /** 类型声明名称 */
    keyName: string,
    options: OptionsType = {}
  ) => {
    const { prettierOptions = {}, abstractConfig = {} } = options;
    this.abstractConfig = {
      maxDepth: Number.MAX_SAFE_INTEGER,
      abstractType: ['object', 'array'],
      abstractEnum: true,
      ...abstractConfig,
    };
    const code = this.abstractDataType(data, keyName);
    return codeFormat(code, prettierOptions);
  };
}

const parser = new Parser();
export const { parse } = parser;
