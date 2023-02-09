import { MagicPrototyperContext } from '../src/MagicPrototyper/MagicPrototyperTypes';
import { MagicPrototyper } from '../src';
import { when } from 'jest-when';
import fs from 'fs';

let readFileSyncSpy: jest.SpyInstance;
let writeFileSyncSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;

afterEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  // suppress output on console log
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

  // suppress output on console warn
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  // readFileSyncSpy
  readFileSyncSpy = jest.spyOn(fs, 'readFileSync');

  // writeFileSyncSpy
  writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
});

test('Check main call', async () => {
  const magicPrototyperContext: MagicPrototyperContext = {} as MagicPrototyperContext;
  const result = await MagicPrototyper(magicPrototyperContext);
  console.log({ result });
});
