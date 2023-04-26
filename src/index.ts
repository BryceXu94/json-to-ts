import { camelCase, constantCase } from 'change-case';
import prettier from 'prettier/standalone';
import { Options } from 'prettier';
import type { JSONType, ParsedJSONType, IAbstractConfig, OptionsType } from './types';
import parserTypeScript from "prettier/parser-typescript";
export type { JSONType, IAbstractConfig, OptionsType, EnumItem } from './types' 

const abstractResult:ParsedJSONType[] = [];
/** 遍历数据 并且处理是否拆分 */
const transformJson = (
  jsonData: ParsedJSONType,
  curDepth:number,
  maxDepth: number,
  path: string,
  curKey: string,
  abstractType: Array<'object'| 'array'>,
  abstractEnum: boolean,
  isArrayChild?: boolean
) => {
  const type = jsonData?.type;
  if (type === 'object') {
    Object.keys(jsonData.properties || {}).forEach((typeKey) => {
      const curJson = jsonData.properties![typeKey];
      if (curJson) {
        const _typeKey = camelCase(`${path}/${typeKey}`);
        transformJson(curJson, curDepth + 1, maxDepth, _typeKey, typeKey, abstractType, abstractEnum);
      }
    })
    if (
      curDepth === 1 ||
      (
        curDepth <= maxDepth
        && (
          abstractType.includes(type)
          || (
            isArrayChild
            && abstractType.includes('array') 
          )
        )
      )
    ) {
      if (!jsonData.alias) {
        jsonData.alias = `${path}`;
      }
      abstractResult.push(jsonData);
    }
  } else if (type === 'array' && jsonData.item) {
    jsonData.item.description = jsonData.description;
    jsonData.item.required = jsonData.required;
    if (jsonData.item.type === 'array' || jsonData.item.type === 'object') {
      if (
        curDepth === 1 ||
        (curDepth <= maxDepth && abstractType.includes(type))
      ) {
        jsonData.alias = `${path}Item[]`;
        jsonData.item.alias = `${path}Item`;
      }
    }
    transformJson(jsonData.item, curDepth, maxDepth, path ,curKey, abstractType, abstractEnum, true);
  } else if (type === 'enum') {
    if (!jsonData.enum.some(v => typeof v.key === 'undefined' || v.key === null) && abstractEnum) {
      jsonData.alias = constantCase(`${curKey}/Enum`);
      abstractResult.push(jsonData);
    }
  }
};

/**
 * types 拆分
 */
const abstractDataType = (
  jsonData: ParsedJSONType,
  typeName: string,
  /** 声明拆分配置 */
  abstractConfig: IAbstractConfig
) => {
  const { maxDepth, abstractEnum, abstractType } = abstractConfig;
  abstractResult.length = 0;
  transformJson(
    jsonData,
    1,
    maxDepth,
    typeName,
    typeName,
    abstractType,
    abstractEnum,
  );
  return abstractResult.map(v => jsonToType(v, v.alias!)).join('\n');
}

let interfaceStr = '';
/**
 * 根据 JSON 对象生产 TypeScript 类型定义。
 *
 * @param json JSON 对象
 * @param typeName 类型名称
 * @returns TypeScript 类型定义
 */
const jsonToType = (jsonData: ParsedJSONType, typeName: string) => {
  if (Object.keys(jsonData || {}).length === 0) {
    return `export interface ${typeName} {}`;
  }
  interfaceStr = '';
  const code = compileJson(jsonData, typeName, true);
  // return '';
  return code.trim();
}

/** 获取注释 */
const getComment = (comment: string = '') => {
  if (comment === '') {
    return ``;
  } else {
    return `\n/**
       * ${comment}
       */`
  }
};
const compileJson = (jsonData: ParsedJSONType, keyName: string, isTop = false) => {
  if (jsonData.alias && !isTop) {
    interfaceStr+= `${getComment(jsonData.description)}\n${keyName}${jsonData.required ? '' : '?'}: ${jsonData.alias}`;
  } else {
    // array类型会在处理对应子类型时创建注释
    if (jsonData.type !== 'array') {
      interfaceStr += getComment(jsonData.description);
    }
    switch (jsonData.type) {
      case 'enum':
        if (isTop) {
          interfaceStr += `\nexport enum ${keyName} {
            ${jsonData.enum
              .map(v => `${getComment(v.description)}\n${v.key} = ${v.value}`)
              .join(',')
            }
          }`;
        } else {
          interfaceStr += `\n${keyName}${jsonData.required ? '' : '?'}: ${jsonData.enum.map(v => typeof v.value === 'number' ? v.value : `'${v.value}'`).join('|')}`;
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
          compileJson(val, key);
        })
        interfaceStr+= `}`
        break;
      case 'array':
        compileJson(jsonData.item!, keyName);
        interfaceStr+= `[]`
        break;
      case 'number':
        interfaceStr+= `\n${keyName}${jsonData.required ? '' : '?'}: number`;
        break;
      case 'boolean':
      case 'string':
      case 'null':
      case 'any':
        interfaceStr+= `\n${keyName}${jsonData.required ? '' : '?'}: ${jsonData.type}`
        break;
    }
  }
  return interfaceStr;
};
/**
 * 代码格式化
 * @param code 代码字符串
 * @param opts prettier配置
 */
const codeFormat = (code: string, options: Options):string => {
  return prettier.format(code, {
    ...options,
    parser: 'typescript',
    plugins: [parserTypeScript],
  });
}

export const parse = (
  /** JSON数据 */
  data: JSONType,
  /** 类型声明名称 */
  keyName: string,
  options: OptionsType = {}
) => {
  const {
    prettierOptions = {},
    abstractConfig = {}
  } = options;
  const code = abstractDataType(data, keyName, {
    maxDepth: Number.MAX_SAFE_INTEGER,
    abstractType: ['object', 'array'],
    abstractEnum: true,
    ...abstractConfig,
  });
  return codeFormat(code, prettierOptions);
};