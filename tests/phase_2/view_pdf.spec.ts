import {expect, Page, test} from '@playwright/test';
import {login} from '../login';

const contractorName = 'TA autotest 1';

test('import bid evaluation', async ({page}) => {
  test.setTimeout(120000);

  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Xem chi tiết'});
  let table = mainDialog.locator('.p-treetable-tbody');
  let tableRow = table.locator('tr');
  let countBidder = await tableRow.count();
  while (countBidder <= 1) {
    countBidder = await tableRow.count();
    await page.waitForTimeout(100);
  }
  for (let i = 1; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.getByTitle('Xem văn bản').click();
    let resPromise = await page.waitForResponse('**/cbms-service/contractor/view-file');
    let resJson = await resPromise.json();
    expect(resJson.type).toEqual('SUCCESS');
    expect(resJson.data.filePath).not.toBe(null);
  }
})

const loginAndSearch = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Xem chi tiết').first().click();
}