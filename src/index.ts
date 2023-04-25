import { camelCase, constantCase } from 'change-case';
import prettier from 'prettier/standalone';
import { Options } from 'prettier';
import { JSONType, ParsedJSONType } from './types';
import parserTypeScript from "prettier/parser-typescript";
export { JSONType } from './types' 

const abstractResult:ParsedJSONType[] = [];
/** 遍历数据 并且处理是否拆分 */
const transformJsonSchema = (
  jsonSchema: ParsedJSONType,
  curDepth:number,
  maxDepth: number,
  path: string,
  curKey: string,
  abstractType: Array<'object'| 'array'>,
  abstractEnum: boolean,
  isArrayChild?: boolean
) => {
  const type = jsonSchema?.type;
  if (type === 'object') {
    Object.keys(jsonSchema.properties || {}).forEach((typeKey) => {
      const curSchema = jsonSchema.properties![typeKey];
      if (curSchema) {
        const _typeKey = camelCase(`${path}/${typeKey}`);
        transformJsonSchema(curSchema, curDepth + 1, maxDepth, _typeKey, typeKey, abstractType, abstractEnum);
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
      if (!jsonSchema.alias) {
        jsonSchema.alias = `${path}`;
      }
      abstractResult.push(jsonSchema);
    }
  } else if (type === 'array' && jsonSchema.item) {
    jsonSchema.item.description = jsonSchema.description;
    jsonSchema.item.required = jsonSchema.required;
    if (jsonSchema.item.type === 'array' || jsonSchema.item.type === 'object') {
      if (
        curDepth === 1 ||
        (curDepth <= maxDepth && abstractType.includes(type))
      ) {
        jsonSchema.alias = `${path}Item[]`;
        jsonSchema.item.alias = `${path}Item`;
      }
    }
    transformJsonSchema(jsonSchema.item, curDepth, maxDepth, path ,curKey, abstractType, abstractEnum, true);
  } else if (type === 'enum') {
    if (!jsonSchema.enum.some(v => typeof v.key === 'undefined' || v.key === null) && abstractEnum) {
      jsonSchema.alias = constantCase(`${curKey}/Enum`);
      abstractResult.push(jsonSchema);
    }
  }
};

/**
 * types 拆分
 */
const abstractDataType = (
  jsonSchema: ParsedJSONType,
  typeName: string,
  /** 声明拆分配置 */
  abstractConfig: {
    /** 最大拆分深度 仅作用于object和array */
    maxDepth: number;
    /** 拆分类型 */
    abstractType: Array<'object'|'array'>;
    /** 是否拆分枚举值 */
    abstractEnum: boolean;
  }
) => {
  const { maxDepth, abstractEnum, abstractType } = abstractConfig;
  abstractResult.length = 0;
  transformJsonSchema(
    jsonSchema,
    1,
    maxDepth,
    typeName,
    typeName,
    abstractType,
    abstractEnum,
  );
  return abstractResult.map(v => jsonSchemaToType(v, v.alias!)).join('\n');
}

let interfaceStr = '';
/**
 * 根据 JSONSchema 对象生产 TypeScript 类型定义。
 *
 * @param jsonSchema JSONSchema 对象
 * @param typeName 类型名称
 * @returns TypeScript 类型定义
 */
const jsonSchemaToType = (jsonSchema: ParsedJSONType, typeName: string) => {
  if (Object.keys(jsonSchema || {}).length === 0) {
    return `export interface ${typeName} {}`;
  }
  interfaceStr = '';
  const code = compileJsonSchema(jsonSchema, typeName, true);
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
const compileJsonSchema = (jsonSchema: ParsedJSONType, keyName: string, isTop = false) => {
  if (jsonSchema.alias && !isTop) {
    interfaceStr+= `${getComment(jsonSchema.description)}\n${keyName}${jsonSchema.required ? '' : '?'}: ${jsonSchema.alias}`;
  } else {
    // array类型会在处理对应子类型时创建注释
    if (jsonSchema.type !== 'array') {
      interfaceStr += getComment(jsonSchema.description);
    }
    switch (jsonSchema.type) {
      case 'enum':
        if (isTop) {
          interfaceStr += `\nexport enum ${keyName} {
            ${jsonSchema.enum
              .map(v => `${getComment(v.description)}\n${v.key} = ${v.value}`)
              .join(',')
            }
          }`;
        } else {
          interfaceStr += `\n${keyName}${jsonSchema.required ? '' : '?'}: ${jsonSchema.enum.map(v => typeof v.value === 'number' ? v.value : `'${v.value}'`).join('|')}`;
        }
        break;
      case 'object':
        if (isTop) {
          interfaceStr += `\nexport interface ${keyName} {`;
        } else {
          interfaceStr += `\n${keyName}${jsonSchema.required ? '' : '?'}: {`;
        }
        Object.entries(jsonSchema.properties!).forEach((v) => {
          const [key, val] = v;
          compileJsonSchema(val, key);
        })
        interfaceStr+= `}`
        break;
      case 'array':
        compileJsonSchema(jsonSchema.item!, keyName);
        interfaceStr+= `[]`
        break;
      case 'number':
        interfaceStr+= `\n${keyName}${jsonSchema.required ? '' : '?'}: number`;
        break;
      case 'boolean':
      case 'string':
      case 'null':
      case 'any':
        interfaceStr+= `\n${keyName}${jsonSchema.required ? '' : '?'}: ${jsonSchema.type}`
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
  options: {
    /** prettier配置 */
    prettierOptions?: Options;
    /** 声明拆分配置 */
    abstractConfig?: {
      /** 最大拆分深度 仅作用于object和array */
      maxDepth?: number;
      /** 拆分类型 */
      abstractType?: Array<'object'|'array'>;
      /** 是否拆分枚举值 */
      abstractEnum?: boolean;
    }
  } = {}
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