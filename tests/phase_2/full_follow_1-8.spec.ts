import {expect, test} from '@playwright/test';
import {login} from '../login';

test('check form 7', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.locator(`input[name="keySearch"]`).fill('TA autotest 1');
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell',{name:'Tờ trình phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt KQLCNT'});

  let table = subDialog.locator('app-form-table').first();
  await table.locator('tbody tr').first().locator('input#validityNote').fill('Ông chủ từng đi tù');
  await table.locator('tbody tr').nth(1).locator('input#validityNote').fill('1 kế toán đi tù');
  await table.locator('tbody tr').nth(2).locator('input#validityNote').fill('2 kế toán đi tù');

  table = subDialog.locator('app-form-table').nth(1);
  await table.locator('tbody tr').first().locator('input#experienceNote').fill('Không có kinh nghiệm');
  await table.locator('tbody tr').nth(1).locator('input#experienceNote').fill('10 năm kinh nghiệm');
  await table.locator('tbody tr').nth(2).locator('input#experienceNote').fill('2 năm kinh nghiệm');

  table = subDialog.locator('app-form-table').nth(2);
  let row = table.locator('tbody tr').first();
  await row.locator('span[role=combobox]#sample').click();
  await page.getByRole('option', {name: 'Không đáp ứng'}).click();
  await row.locator('#technologyNote').fill('Hàng dễ vỡ khi vận chuyển');

  row = table.locator('tbody tr').nth(1);
  await row.locator('span[role=combobox]#sample').click();
  await page.getByRole('option', {name: 'Đáp ứng', exact: true}).click();
  await row.locator('#technologyNote').fill('Hàng vừa to vừa lâu');

  row = table.locator('tbody tr').nth(2);
  await row.locator('span[role=combobox]#sample').click();
  await page.getByRole('option', {name: 'Đáp ứng', exact: true}).click();
  await row.locator('#technologyNote').fill('Hàng to nhưng không lâu');

  table = subDialog.locator('app-form-table').nth(3);
  row = table.locator('tbody tr').first();
  await row.locator('#errorCorrectionValue').pressSequentially('100000');
  await row.locator('#adjustmentDifferenceValue').pressSequentially('50000');
  await row.locator('#exchangeRate').fill('Không biết là cái gì');
  row = table.locator('tbody tr').nth(1);
  await row.locator('#errorCorrectionValue').pressSequentially('200000');
  await row.locator('#adjustmentDifferenceValue').pressSequentially('100000');
  await row.locator('#exchangeRate').fill('Không biết là cái gì');
  row = table.locator('tbody tr').nth(2);
  await row.locator('#errorCorrectionValue').pressSequentially('300000');
  await row.locator('#adjustmentDifferenceValue').pressSequentially('150000');
  await row.locator('#exchangeRate').fill('Không biết là cái gì');

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật tờ trình phê duyệt KQLCNT thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

test('check form 8', async ({page}) => {
  page.set
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.locator(`input[name="keySearch"]`).fill('TA autotest 1');
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell',{name:'Báo cáo thẩm định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định KQLCNT'});

  let table = subDialog.locator('app-form-table').first();
  let row = table.locator('tbody tr').first();
  await row.locator('input#hsdtValidityDays').fill('1');
  await row.locator('input#bidSecurityAmount').pressSequentially('1000000');
  await row.locator('input#exchangeRate').pressSequentially('Không biết là cái gì');

  row = table.locator('tbody tr').nth(1);
  await row.locator('input#hsdtValidityDays').fill('2');
  await row.locator('input#bidSecurityAmount').pressSequentially('2000000');
  await row.locator('input#exchangeRate').pressSequentially('Không biết là cái gì');

  row = table.locator('tbody tr').nth(2);
  await row.locator('input#hsdtValidityDays').fill('3');
  await row.locator('input#bidSecurityAmount').pressSequentially('3000000');
  await row.locator('input#exchangeRate').pressSequentially('Không biết là cái gì');

  table = subDialog.locator('app-form-table').nth(1);
  await table.locator('tbody tr').first().locator('input#ratingSummaryNote').fill('Vứt');
  await table.locator('tbody tr').nth(1).locator('input#ratingSummaryNote').fill('Đã lót 500 củ');
  await table.locator('tbody tr').nth(2).locator('input#ratingSummaryNote').fill('Chưa thấy gì');


  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật tờ trình phê duyệt KQLCNT thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

test('propose bid evaluation', async ({page}) => {
  await login(page, '/CBMS_BID_EVALUATION');
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.locator(`input[name="keySearch"]`).fill('TA autotest 1');
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);

  await page.getByRole('row').nth(1).locator('div.p-checkbox-box').click();

  await page.getByRole('button', {name: 'Trình đánh giá'}).click();
  await page.getByRole('button', {name: 'Có'}).click();

  let resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/propose');
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Trình đánh giá thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})