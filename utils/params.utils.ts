import {Page} from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {IAppParam} from '../constants/interface';

export const setupAppParams = async (page: Page, dataByParType: Record<string, IAppParam[]>) => {
  page.on('response', async res => {
    if (!res.url().includes('/app-param/getList') || res.status() !== 200) return;

    try {
      const body = res.request().postDataJSON();
      const parType = body?.parType;
      const json = await res.json();
      const items = json?.data ?? [];
      if (parType) {
        dataByParType[parType] = items;
      } else {
        const grouped: Record<string, IAppParam[]> = {};

        for (const item of items) {
          const key = item?.parType;
          if (!key) continue;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        }
        for (const [key, list] of Object.entries(grouped)) {
          dataByParType[key] = list;
        }
      }
    } catch (err) {
      console.warn('Bỏ qua lỗi lấy body/response:', err);
    }
  });
}

export const saveFileParam = async (page: Page, dataByParType: Record<string, IAppParam[]>) => {
  // ✅ Đợi các response tới (timeout tối đa 3s)
  await page.waitForTimeout(3000);

  // ✅ Ghi ra file TypeScript
  const outputPath = path.resolve('constants', 'common', 'app-param.constants.ts');
  const content = `export const APP_PARAMS = ${JSON.stringify(dataByParType, null, 2)};\n`;

  fs.writeFileSync(outputPath, content, 'utf-8');
}