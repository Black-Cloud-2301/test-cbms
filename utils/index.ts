import {formatDateToString} from './date.utils';
import {Page} from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const getParamsFromUrl = (url: string): Record<string, string> => {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  const paramPairs: { [key: string]: string } = {};
  params.forEach((value, key) => {
    paramPairs[key] = value;
  });

  return paramPairs;
}

export const screenshot = async (page: Page, module: string) => {
  const currentDay = formatDateToString(new Date(), 'YYYY/MM/DD');
  const currentTime = formatDateToString(new Date(), 'HHmmss');
  await page.screenshot({path: `errors/${currentDay}/${module}-${currentTime}.png`});
}

const variablePath = path.resolve('constants', 'variable', 'index.meta.json');

export const setGlobalVariable = (field: string, value: string) => {
  fs.writeFileSync(variablePath, JSON.stringify({ [field]:value }), 'utf-8');
}

export const getGlobalVariable = (field: string) => {
  const meta = JSON.parse(fs.readFileSync(variablePath, 'utf-8'));
  return meta[field];
}