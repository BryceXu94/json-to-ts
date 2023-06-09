import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mockData } from './mock';
import { parse } from '../src/index';

const run = async () => {
  const output = await parse(mockData, 'test', {
    abstractConfig: {
      abstractEnum: true,
      abstractType: ['array', 'object'],
    },
  });
  writeFileSync(resolve(__dirname, './data.ts'), output);
};
run();
