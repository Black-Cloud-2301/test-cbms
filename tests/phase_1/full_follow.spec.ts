import {expect, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';

const contractorName = 'TA autotest 1';

test('import document by pid', async ({page}) => {
  test.setTimeout(120000);
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  // upload file mailing
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_mailing_moi_nhat.xls');
  await page.getByRole('button', {name: 'Tải lên'}).click();

  let resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/import');
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  // update dialog 1
  await page.getByRole('row', {name: 'Bản cam kết HDDT'}).getByTitle('Cập nhật văn bản').click();
  await page.getByRole('button', {name: 'Tiếp'}).click();

  const firstDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Cập nhật bản cam kết HDDT")')
  });
  if (await firstDialog.getByRole('row').count() < 3) {
    await firstDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân viên")')
    });
    await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();

    await firstDialog.getByRole('row').nth(1).getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Người cam kết'}).click();
    await firstDialog.locator('form span').nth(1).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(2).locator('a').click();
    await firstDialog.getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Ủy viên'}).click();
  }

  await firstDialog.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật bản ghi thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  // update dialog 2
  await page.getByRole('row', {name: 'Tờ trình thành lập TCG'}).getByTitle('Cập nhật văn bản').click();
  const secondDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình thành lập tổ chuyên gia'});
  const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');

  if (!await secondDialog.locator('input#proposalDate').inputValue()) {
    await secondDialog.locator('input#proposalDate').pressSequentially('23/03/2025');
    await datePickerCalendar.locator('span.p-highlight').first().click();
  }
  await secondDialog.getByRole('button', {name: 'Tiếp'}).click();
  const selectExpertDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm chuyên gia")')
  });

  if (await secondDialog.getByRole('rowgroup').count() < 3) {
    await secondDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill('Giang Thị Nhung');
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await secondDialog.getByRole('rowgroup').locator('tr').nth(1).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Pháp lý'}).click();

    await secondDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill('Bùi Thị Hồng');
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await secondDialog.getByRole('rowgroup').locator('tr').nth(2).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kỹ thuật - công nghệ'}).click();

    await secondDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill('Tô Thị Thúy Tươi');
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/cbms-service/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await secondDialog.getByRole('rowgroup').locator('tr').nth(3).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kinh tế - tài chính'}).click();
  }

  await secondDialog.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật bản ghi thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  // update dialog 3
  await page.getByRole('row', {name: 'Quyết định thành lập TCG'}).getByTitle('Cập nhật văn bản').click();
  const thirdDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định tổ chuyên gia'});
  // const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  // await datePickerCalendar.locator('span.p-highlight').first().click();

  await thirdDialog.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật bản ghi thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  // update dialog 4
  await page.getByRole('row', {name: 'Tờ trình E-HSMT'}).getByTitle('Cập nhật văn bản').click();
  const fourthDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt E-HSMT'});
  // const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  // await datePickerCalendar.locator('span.p-highlight').first().click();
  await fourthDialog.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật bản ghi thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();


  // update dialog 5
  await page.getByRole('row', {name: 'Báo cáo lập E-HSMT'}).getByTitle('Cập nhật văn bản').click();
  const fifthDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo lập E-HSMT'});
  await fifthDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fifthDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_lap_hsmt.xlsx');
  await fifthDialog.getByRole('button', {name: 'Tải lên'}).click();

  await fifthDialog.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật bản ghi thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();


  // update dialog 6
  await page.getByRole('row', {name: 'Báo cáo thẩm định E-HSMT'}).getByTitle('Cập nhật văn bản').click();
  const sixthDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định E-HSMT'});
  // const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  // await datePickerCalendar.locator('td.p-datepicker-today').first().click();

  await sixthDialog.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/save');
  resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Cập nhật bản ghi thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

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