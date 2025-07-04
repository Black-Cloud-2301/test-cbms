import {expect, Page} from '@playwright/test';
import {screenshot} from '../utils';

export const testPageable = async ({page, url, module}: { page: Page, url: string, module: string }) => {
  const pageable = page.locator('span.p-paginator-pages');
  const pageButtons = pageable.locator('button');
  const seenIds = new Set<string>();

  const pageCount = await pageButtons.count();

  for (let i = 0; i < pageCount; i++) {
    const [res] = await Promise.all([
      page.waitForResponse(res =>
        res.url().includes(url) && res.status() === 200
      ),
      pageButtons.nth(i).click()
    ]);

    const responseData = await res.json();
    const items = responseData.data?.content ?? responseData.data.content ?? responseData.data ?? [];

    for (const item of items) {
      const id = String(item.id); // đảm bảo là string để Set hoạt động ổn định
      const isDuplicate = seenIds.has(id);

      // ✅ Expect: không được trùng
      if (isDuplicate) {
        console.log(`🔴 Trùng ID '${id}' tại trang ${i + 1}`);
        await screenshot(page, module)
        expect(isDuplicate).toBeFalsy();
      }

      seenIds.add(id);
    }
  }

  await page.getByRole('combobox', {name: 'Rows per page'}).click();
  await page.getByRole('option', {name: '100'}).click();
  const res = await page.waitForResponse(res =>
    res.url().includes(url) && res.status() === 200
  )
  const responseData = await res.json();
  expect(responseData.type).toEqual('SUCCESS');
  const totalElements = await responseData.data?.totalElements;
  expect(totalElements).toEqual(responseData.data?.totalElements);

  let tableRow = page.locator('tbody tr');
  let countBidder = await tableRow.count();

  if (totalElements > 100) {
    expect(countBidder).toEqual(100);
  } else {
    expect(countBidder).toEqual(totalElements);
  }
}