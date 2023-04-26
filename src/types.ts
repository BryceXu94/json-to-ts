import { Options } from 'prettier';
interface exportBaseType {
  description?: string;
  type: 'string'|'number'|'boolean'| 'null' | 'any';
  required?: boolean;
};
interface exportEnumType {
  description?: string;
  type: 'enum';
  required?: boolean;
  enum: {
    key?: string;
    value: string|number;
    description?: string;
  }[];
};

interface exportObjectType {
  description?: string;
  required?: boolean;
  type: 'object';
  properties: {
    [key: string]: exportBaseType|exportObjectType|exportArrayType|exportEnumType;
  }
}
interface exportArrayType {
  description?: string;
  required?: boolean;
  type: 'array';
  item: exportBaseType|exportObjectType|exportArrayType|exportEnumType;
}
interface BaseType {
  description?: string;
  required?: boolean;
  type: 'string'|'number'|'boolean'| 'null' | 'any';
  alias?: string;
};

export type EnumItem = {
  key?: string;
  value: string|number;
  description?: string;
}

interface EnumType {
  description?: string;
  type: 'enum';
  required?: boolean;
  alias?: string;
  enum: EnumItem[];
};

interface ObjectType {
  description?: string;
  required?: boolean;
  type: 'object';
  alias?: string;
  properties: {
    [key: string]: BaseType|ObjectType|ArrayType|EnumType;
  }
}
interface ArrayType {
  description?: string;
  required?: boolean;
  type: 'array';
  item: BaseType|ObjectType|ArrayType|EnumType;
  alias?: string;
}

export type JSONType = exportObjectType;
export type ParsedJSONType = BaseType|ObjectType|ArrayType|EnumType;

export type OptionsType = {
  /** prettier配置 */
  prettierOptions?: Options;
  /** 声明拆分配置 */
  abstractConfig?: Partial<IAbstractConfig>
};
export type IAbstractConfig = {
  /** 最大拆分深度 仅作用于object和array */
  maxDepth: number;
  /** 拆分类型 */
  abstractType: Array<'object'|'array'>;
  /** 是否拆分枚举值 */
  abstractEnum: boolean;
}