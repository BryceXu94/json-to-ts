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

interface EnumType {
  description?: string;
  type: 'enum';
  required?: boolean;
  alias?: string;
  enum: {
    key?: string;
    value: string|number;
    description?: string;
  }[];
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