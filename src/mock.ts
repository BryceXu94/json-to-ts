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
