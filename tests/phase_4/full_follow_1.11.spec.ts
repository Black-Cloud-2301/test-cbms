import {expect, Locator, Page, test} from '@playwright/test';
import {login} from '../login';
import {USERS} from '../../constants/user';

const contractorName = 'TA autotest 7';

test('import document by pid 3.1.11', async ({page}) => {
  test.setTimeout(120000);
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  //upload file mailing
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_mailing_mua_sam.xls');
  await page.getByRole('button', {name: 'Tải lên'}).click();
  await checkSuccess(page);

  // update dialog 1
  await page.getByRole('row', {name: 'Tờ trình đề xuất mua sắm'}).getByTitle('Cập nhật văn bản').click();
  let subDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Cập nhật tờ trình đề xuất mua sắm")')
  });

  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  await subDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_lap_hsmt_mua_sam.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).click();

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('td').nth(1).innerText() === 'Test xóa') {
      await row.getByTitle('Xóa').click();
      await page.getByRole('button', {name: 'Có'}).click();
    }
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  if (countBidder < 3) {
    await subDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân viên")')
    });
    await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.locator('form span').nth(1).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(2).locator('a').click();
  }

  await saveForm(page, subDialog);

  // update dialog 2
  await mainDialog.getByRole('row', {name: 'Tờ trình xin phê duyệt KHLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt KHLCNT'});

  await saveForm(page, subDialog);

  // update dialog 3
  await mainDialog.getByRole('row', {name: 'Báo cáo thẩm định KHLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định KHLCNT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  table = subDialog.locator('app-form-table').first();
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  if (countBidder < 3) {
    await subDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân viên")')
    });
    await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    let row = tableRow.first();
    await row.getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Người cam kết'}).click();

    await subDialog.locator('form span').nth(1).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(2).locator('a').click();
    row = tableRow.nth(1);
    await row.getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Ủy viên'}).click();
  }

  await saveForm(page, subDialog);

  // update dialog 4
  await page.getByRole('row', {name: 'Quyết định phê duyệt KHLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KHLCNT'});
  await saveForm(page, subDialog);

  // update dialog 5
  await page.getByRole('row', {name: 'Tờ trình & Quyết định thành lập tổ chuyên gia'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình thành lập tổ chuyên gia'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  const selectExpertDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm chuyên gia")')
  });

  table = subDialog.locator('app-form-table').first();
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  if (countBidder < 3) {
    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill('Giang Thị Nhung');
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    let row = tableRow.first();
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Pháp lý'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill('Bùi Thị Hồng');
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(1);
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kỹ thuật - công nghệ'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill('Tô Thị Thúy Tươi');
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(2);
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kinh tế - tài chính'}).click();
  }

  await saveForm(page, subDialog);

  // update dialog 6
  await page.getByRole('row', {name: 'Tờ trình xin phê duyệt HSMT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt HSMT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  await saveForm(page, subDialog);

  // update dialog 7
  await page.getByRole('row', {name: 'Hồ sơ mời thầu'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật HSMT'});
  if (await subDialog.locator('input#effectiveDateHSDT').inputValue()) {
      await subDialog.locator('input#effectiveDateHSDT').locator('..').locator('span.pi-times').click();
    }
  await subDialog.locator('input#effectiveDateHSDT').fill('1 ngày');

  if (await subDialog.locator('input#bidSecurityValue').inputValue()) {
    await subDialog.locator('input#bidSecurityValue').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
  }
  await subDialog.locator('input#bidSecurityValue').pressSequentially(1 + '000000');

  if (await subDialog.locator('input#bidSecurityValidity').inputValue()) {
    await subDialog.locator('input#bidSecurityValidity').locator('..').locator('span.pi-times').click();
  }
  await subDialog.locator('input#bidSecurityValidity').fill('1 ngày');

  await saveForm(page, subDialog);

  await mainDialog.getByRole('button', {name: 'Đề xuất'}).click();
})


test('verify', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID', USERS.PC);


  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);

  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();

  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  let tableRow = mainDialog.locator('tbody tr');
  let countBidder = await tableRow.count();
  while (countBidder <= 1) {
    countBidder = await tableRow.count();
    await page.waitForTimeout(100);
  }
  for (let i = 1; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.getByRole('combobox', {name: '--Chọn--'}).click();
    // if(i===1) {
    //   await page.getByRole('option', {name: 'Hủy', exact: true}).click();
    // } else {
    await page.getByRole('option', {name: 'Xác nhận', exact: true}).click();
    // }
    await page.waitForTimeout(100);
    await row.locator('input#note').fill('Chú thích ' + (i + 1))
  }

  await mainDialog.getByRole('button', {name: 'Xác nhận'}).click();

  let resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/confirm');
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Xác nhận thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

const saveForm = async (page: Page, dialog: Locator, url: string = '**/cbms-service/document-by-pid/save', successText: string = 'Cập nhật bản ghi thành công') => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();

  await checkSuccess(page, '**/cbms-service/document-by-pid/save', 'Cập nhật bản ghi thành công');
}

const loginAndSearch = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();
}

const checkSuccess = async (page:Page, url: string = '**/cbms-service/document-by-pid/import', successText: string = 'Import dữ liệu thành công') => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json()
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}