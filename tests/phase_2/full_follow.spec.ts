import {expect, Locator, Page, test} from '@playwright/test';
import {login} from '../login';
import {USERS} from '../../constants/user';
import {CONTRACTOR_NAME_SEARCH, CBMS_MODULE} from '../../constants/common';

const contractorName = CONTRACTOR_NAME_SEARCH;

test('import document by pid', async ({page}) => {
  test.setTimeout(120000);
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  // upload file mailing
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_mailing_moi_nhat.xls');
  await page.getByRole('button', {name: 'Tải lên'}).click();

  await checkSuccess(page);

  // update dialog 1
  await page.getByRole('row', {name: 'Bản cam kết HDDT'}).getByTitle('Cập nhật văn bản').click();
  await page.getByRole('button', {name: 'Tiếp'}).click();

  let subDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Cập nhật bản cam kết HDDT")')
  });
  if (await subDialog.getByRole('row').count() < 3) {
    await subDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân viên")')
    });
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();

    await subDialog.getByRole('row').nth(1).getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Người cam kết'}).click();
    await subDialog.locator('form span').nth(1).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(2).locator('a').click();
    await subDialog.getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Ủy viên'}).click();
  }
  await saveForm(page, subDialog);

  // update dialog 2
  await page.getByRole('row', {name: 'Tờ trình thành lập TCG'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình thành lập tổ chuyên gia'});
  const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');

  if (!await subDialog.locator('input#expertApproval').inputValue()) {
    await subDialog.locator('input#expertApproval').pressSequentially('23/03/2025');
    await datePickerCalendar.locator('span.p-highlight').first().click();
  }
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  const selectExpertDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm chuyên gia")')
  });

  if (await subDialog.getByRole('rowgroup').count() < 3) {
    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill(USERS.NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/expertGroup/doSearch`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(1).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Pháp lý'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill(USERS.HONG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/expertGroup/doSearch`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(2).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kỹ thuật - công nghệ'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.getByRole('textbox').fill(USERS.CAM_NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/expertGroup/doSearch`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(3).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kinh tế - tài chính'}).click();
  }

  await saveForm(page, subDialog);

  // update dialog 3
  await page.getByRole('row', {name: 'Quyết định thành lập TCG'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định tổ chuyên gia'});
  // const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  // await datePickerCalendar.locator('span.p-highlight').first().click();

  await saveForm(page, subDialog);

  // update dialog 4
  await page.getByRole('row', {name: 'Tờ trình E-HSMT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt E-HSMT'});
  // const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  // await datePickerCalendar.locator('span.p-highlight').first().click();
  await saveForm(page, subDialog);


  // update dialog 5
  await page.getByRole('row', {name: 'Báo cáo lập E-HSMT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo lập E-HSMT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  await subDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_lap_hsmt.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).click();

  await saveForm(page, subDialog);


  // update dialog 6
  await page.getByRole('row', {name: 'Báo cáo thẩm định E-HSMT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định E-HSMT'});
  // const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  // await datePickerCalendar.locator('td.p-datepicker-today').first().click();

  await saveForm(page, subDialog);
  await mainDialog.getByRole('button', {name: 'Ghi lại'}).click();
  await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/save`, 'Cập nhật bản ghi thành công');
})

test('submit to appraiser', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.locator('.p-checkbox-box').first().click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  await page.getByRole('alertdialog', {name: "Xác nhận trình thẩm định"}).getByRole('button', {name: 'Có'}).click();
  await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/submit-to-appraiser`, 'Trình thẩm định thành công');
})

test('verify', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID', USERS.PC);


  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);

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

  let resPromise = await page.waitForResponse(`**${CBMS_MODULE}/document-by-pid/confirm`);
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Xác nhận thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

const saveForm = async (page: Page, dialog: Locator) => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();

  // await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/save`, 'Cập nhật bản ghi thành công');
}

const checkSuccess = async (page: Page, url: string = `**${CBMS_MODULE}/document-by-pid/import`, successText: string = 'Import dữ liệu thành công') => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json()
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}