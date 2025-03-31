import {expect, test} from '@playwright/test';
import {login} from '../login';

test('import bid evaluation', async ({page}) => {
  test.setTimeout(120000);

  await login(page, '/CBMS_BID_EVALUATION');
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.locator(`input[name="keySearch"]`).fill('TA autotest 1');
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ mời thầu'});

  // upload file mailing 2
   await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/bm_mailing_danh_gia.xlsx');
   await mainDialog.getByRole('button', {name: 'Tải lên'}).click();

   let resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/import');
   let resJson = await resPromise.json();
   const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
   expect(resJson.type).toEqual('SUCCESS');
   await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import dữ liệu thành công');
   await alertSuccess.locator('.p-toast-icon-close').click();

  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  //   first step
  await mainDialog.getByRole('row').nth(1).getByRole('button').click();

  let evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá tính hợp lệ'});

  await evaluateDialog.getByRole('cell', {
    name: '1',
    exact: true
  }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
  await page.getByRole('option', {name: 'Không đạt'}).click();
  await page.getByRole('button', {name: 'Lưu'}).click();

  const ordinalNumbersFirst = ['1', '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5', '2.1.6']
  await mainDialog.getByRole('row').nth(2).getByRole('button').click();
  for (const number of ordinalNumbersFirst) {
    await evaluateDialog.getByRole('cell', {
      name: number,
      exact: true
    }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Đạt', exact: true}).click();
    await page.waitForTimeout(100);
  }

  await page.getByRole('button', {name: 'Lưu'}).click();

  await mainDialog.getByRole('row').nth(3).getByRole('button').click();
  for (const number of ordinalNumbersFirst) {
    await evaluateDialog.getByRole('cell', {
      name: number,
      exact: true
    }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Đạt', exact: true}).click();
    await page.waitForTimeout(100);
  }

  await page.getByRole('button', {name: 'Lưu'}).click();
  await page.getByRole('button', {name: 'Ghi lại'}).click();

  resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/save');
  resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Lưu dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  // Step 3
  await page.locator('.header-avatar').click();
  await page.getByRole('link', {name: 'Đăng xuất'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.locator('#username').fill(process.env.SSO_USERNAME_TECHNOLOGY);
  await page.locator('#password').fill(process.env.PASSWORD_TECHNOLOGY);
  await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.goto('/CBMS_BID_EVALUATION');

  await page.locator(`input[name="keySearch"]`).fill('TA autotest 1');
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  await mainDialog.getByRole('row').nth(2).getByRole('button').click();

  const ordinalNumbersSecond = ['1', '2', '3.1', '3.2', '4', '5']
  evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá về năng lực kinh nghiệm'});
  for (const number of ordinalNumbersSecond) {
    await evaluateDialog.getByRole('cell', {
      name: number,
      exact: true
    }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Đạt', exact: true}).click();
    await page.waitForTimeout(100);
  }
  await page.getByRole('button', {name: 'Lưu'}).click();

  await mainDialog.getByRole('row').nth(3).getByRole('button').click();

  for (const number of ordinalNumbersSecond) {
    await evaluateDialog.getByRole('cell', {
      name: number,
      exact: true
    }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Đạt', exact: true}).click();
    await page.waitForTimeout(100);
  }
  await page.getByRole('button', {name: 'Lưu'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  // STEP 4
  let currentRow = mainDialog.getByRole('row').nth(2);
  await currentRow.getByRole('combobox', {name: '--Chọn--'}).click();
  await page.getByRole('option', {name: 'Đạt', exact: true}).click();
  await currentRow.locator('#technicalAssessmentComment').fill('Nhận xét của tổ chuyên gia 1');
  currentRow =  mainDialog.getByRole('row').nth(3);
  await currentRow.getByRole('combobox', {name: '--Chọn--'}).click();
  await page.getByRole('option', {name: 'Đạt', exact: true}).click();
  await currentRow.locator('#technicalAssessmentComment').fill('Nhận xét của tổ chuyên gia 2');

  await page.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/save');
  resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Lưu dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  // STEP 5
  await page.locator('.header-avatar').click();
  await page.getByRole('link', {name: 'Đăng xuất'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.locator('#username').fill(process.env.SSO_USERNAME_FINANCE);
  await page.locator('#password').fill(process.env.PASSWORD_FINANCE);
  await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.goto('/CBMS_BID_EVALUATION');

  await page.locator(`input[name="keySearch"]`).fill('TA autotest 1');
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  currentRow = mainDialog.getByRole('row').nth(2);
  await currentRow.locator('p-checkbox').first().click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await page.getByRole('button', {name: 'Ghi lại'}).click();

  resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/save');
  resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Lưu dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  await page.pause();
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