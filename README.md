# @bryce94/json-to-ts

## 简介

将json转为typescript声明

## 安装

```bash
# 安装依赖
npm install @bryce94/json-to-ts -S
```

## 使用

```ts
import { parse } from '@bryce94/json-to-ts'
parse(jsonData, 'getListReq')
```

## 例子
- mockData:
```ts
import { JSONType } from "./types";

export const mockData: JSONType = {
  type: "object",
  properties: {
    firstName: {
      type: "string",
      required: true,
    },
    obj: {
      type: "object",
      description: '1213',
      required: true,
      properties: {
        objname: {
          type: "string",
          required: true,
        },
        objlist: {
          type: "array",
          description: "Age in array",
          item: {
            type: "object",
            properties: {
              objlistage: {
                description: "Age in years",
                type: "number",
              },
            },
          },
        },
        stringlist: {
          type: "array",
          description: "Age in array",
          item: {
            type: "string",
          },
        },
        hairColor: {
          type: 'enum',
          enum: [
            {
              key: 'red',
              value: '1',
              description: '红色'
            },
            {
              key: 'blue',
              value: '2',
            },
          ],
        },
      },
    },
    list: {
      type: "array",
      description: "Age in array",
      item: {
        type: "object",
        properties: {
          age: {
            description: "Age in years",
            type: "number",
          },
        },
      },
    },
    hairColor: {
      type: "string",
    },
  },
};

```

- use:
```ts
import { parse } from '@bryce94/json-to-ts'

const output = await parse(mockData, 'test', {
  abstractConfig: {
    abstractEnum: false,
    abstractType: ['array', 'object'],
  },
});
```
- output:
```ts
/**
 * Age in array
 */
export interface testObjObjlistItem {
  /**
   * Age in years
   */
  objlistage?: number;
}
export enum HAIR_COLOR_ENUM {
  /**
   * 红色
   */
  red = 1,
  blue = 2,
}
/**
 * 1213
 */
export interface testObj {
  objname: string;
  /**
   * Age in array
   */
  objlist?: testObjObjlistItem[];
  /**
   * Age in array
   */
  stringlist?: string[];
  hairColor?: HAIR_COLOR_ENUM;
}
/**
 * Age in array
 */
export interface testListItem {
  /**
   * Age in years
   */
  age?: number;
}
export interface test {
  firstName: string;
  /**
   * 1213
   */
  obj: testObj;
  /**
   * Age in array
   */
  list?: testListItem[];
  hairColor?: string;
}

```

## API

```ts
parse(json, key, options)
```

##### Props

| name | 类型 |  默认值 |是否必填 | 说明 |
| - | - | - | - | - |
| json | `JSONType` | - | 是 | 需要转换的json数据 |
| key | `string` | - | 是 | ts声明名称 |
| options | `OptionsType` | - | 否 | 配置 |

##### JSONType

| key | 类型 |  默认值  | 说明 |
| - | - | - | - |
| type | `string` \| `number` \| `boolean` \| `null` \| `any` \| `array` \| `object` \| `enum` | - | 数据类型 |
| description | `string` | - | 注释 |
| required | `boolean` | false | 是否必填 |
| enum | `EnumItem[]` | - | 枚举列表，当类型为enum时必填 |
| properties | `{ [key: string]: JSONType }` | - | object内容描述，当类型为object时必填 |
| item | `JSONType` | - | array内容描述，当类型为array时必填 |

##### EnumItem

| key | 类型  |是否必填 | 说明 |
| - | - | - | - |
| value | `string` \| `number` | 是 | 枚举value |
| key | `string` | 否 | 枚举key |
| description | `string` |  否 | 注释 |
##### OptionsType

| key | 类型  |是否必填 | 说明 |
| - | - | - | - |
| prettierOptions | - | 否 | prettier配置 |
| abstractConfig | `IAbstractConfig` | 否 | 类型拆分配置 |
##### IAbstractConfig

| key | 类型  |是否必填 |默认值 | 说明 |
| - | - | - | - | -|
| maxDepth | `number` | 否 | `Number.MAX_SAFE_INTEGER`|最大拆分深度 仅作用于object和array |
| abstractType | `Array<'object'|'array'>` | 否 |`['object', 'array']`| 拆分类型 |
| abstractEnum | `boolean` | 否|`true` | 是否拆分枚举值 |
