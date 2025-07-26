import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {CONTRACTOR_STATUS, ROUTES, SELECT_CONTRACTOR_FORM_TYPE} from '../../constants/common';
import {getGlobalVariable, setGlobalVariable} from '../../utils';
import {getAvailableContractorPurchase} from './selection_plan.spec';

test.describe('test document-by-pid ver .11', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(180000);
  test('import document by pid 3.1.11', async ({page}) => {
    test.setTimeout(120000);
    await loginAndSearch({page});

    await updateDocumentByPid(page);
  })

  test('submit to appraisal', async ({page}) => {
    await submitToAppraisalDocumentByPid({page});
  })

  test('appraisal', async ({page}) => {
    await appraisalDocumentByPid({page});
  });
})

export const saveFormPurchase = async (page: Page, dialog: Locator, url: string = '/document-by-pid/save', successText: string = 'Cập nhật bản ghi thành công') => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  const [res] = await Promise.all([
    page.waitForResponse(res =>
      res.url().includes(url) && res.status() === 200
    ),
    dialog.getByRole('button', {name: 'Ghi lại'}).click()
  ]);
  const resJson = await res.json();
  expect(resJson.type).toEqual('SUCCESS');

  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

export const loginAndSearch = async ({page, url = ROUTES.DOCUMENT_BY_PID}: { page: Page, url?: string }) => {
  await login(page, url, USERS.MANH);
  await page.locator(`input[name="keySearch"]`).fill(getAvailableContractorPurchase({status: CONTRACTOR_STATUS.APPRAISED, type: SELECT_CONTRACTOR_FORM_TYPE.DTRR}).name);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();
}

export const checkSuccess = async ({
                                     page,
                                     url = '**/document-by-pid/import',
                                     successText = 'Import dữ liệu thành công'
                                   }: {
  page: Page,
  url?: string,
  successText?: string
}) => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json()
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

export const updateDocumentByPid = async (page: Page) => {
  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  //upload file mailing
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_DTRR_MSTX.xlsx');
  await page.getByRole('button', {name: 'Tải lên'}).click();
  await checkSuccess({page});

  // update dialog 1
  let subDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Cập nhật tờ trình đề xuất mua sắm")')
  });
  /*await page.getByRole('row', {name: 'Tờ trình đề xuất mua sắm'}).getByTitle('Cập nhật văn bản').click();

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

  let table = subDialog.locator('app-form-table').nth(1);
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  if (countBidder < 3) {
    await subDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân sự")')
    });
    await page.waitForResponse(response => response.url().includes('/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.locator('form span').nth(1).click();
    await page.waitForResponse(response => response.url().includes('/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(2).locator('a').click();
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
*/
  // update dialog 2
  await mainDialog.getByRole('row', {name: 'Tờ trình phê duyệt KHLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt KHLCNT'});

  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  await subDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_lap_hsmt_mua_sam.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).click();

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // update dialog 3
  await mainDialog.getByRole('row', {name: 'Báo cáo thẩm định KHLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định KHLCNT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  if (countBidder < 3) {
    await subDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân sự")')
    });
    await page.waitForResponse(response => response.url().includes('/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    let row = tableRow.first();
    await row.getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Người cam kết'}).click();

    await subDialog.locator('form span').nth(1).click();
    await page.waitForResponse(response => response.url().includes('/sysUser/search') && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(2).locator('a').click();
    row = tableRow.nth(1);
    await row.getByRole('combobox', {name: '--Chọn--'}).click();
    await page.getByRole('option', {name: 'Ủy viên'}).click();
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // update dialog 4
  await page.getByRole('row', {name: 'Quyết định phê duyệt KHLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KHLCNT'});
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // update dialog 5
  await page.getByRole('row', {name: 'Tờ trình thành lập tổ chuyên gia'}).getByTitle('Cập nhật văn bản').click();
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
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    let row = tableRow.first();
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Pháp lý'}).click();
    await row.locator('#divisionLabor').fill("Nhận order");
    await row.locator('span#positionId').click();
    await page.getByRole('option', {name: 'Tổ trưởng'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.HONG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(1);
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kỹ thuật - công nghệ'}).click();
    await row.locator('#divisionLabor').fill("Làm bánh mỳ");
    await row.locator('span#positionId').click();
    await page.getByRole('option', {name: 'Thành viên'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes('/expertGroup/doSearch') && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(2);
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kinh tế - tài chính'}).click();
    await row.locator('#divisionLabor').fill("Thu tiền");
    await row.locator('span#positionId').click();
    await page.getByRole('option', {name: 'Thành viên'}).click();
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // update dialog 6
  await page.getByRole('row', {name: 'Hồ sơ mời thầu'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật hồ sơ mời thầu'});

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  /*// update dialog 7
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

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();*/

  await saveFormPurchase(page, mainDialog);
}

export const submitToAppraisalDocumentByPid = async ({page, url = ROUTES.DOCUMENT_BY_PID}: {
  page: Page,
  url?: string
}) => {
  await loginWithRole(page, USERS.MANH, url);
  const currentContractor = getAvailableContractorPurchase({status:CONTRACTOR_STATUS.APPRAISED, type: SELECT_CONTRACTOR_FORM_TYPE.DTRR}).name;
  await page.locator(`input[name="keySearch"]`).fill(currentContractor);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);

  await page.locator('.p-checkbox-box').first().click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  await page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định'}).getByRole('button', {name: 'Có'}).click();
  await checkSuccess({
    page, url: `**/document-by-pid/submitToAppraiser`, successText: 'Trình thẩm định thành công'
  });
}

export const appraisalDocumentByPid = async ({page, url = '/CBMS_DOCUMENT_BY_PID'}: {
  page: Page,
  url?: string
}) => {
  await login(page, url, USERS.PC);

  const currentContractorName = getAvailableContractorPurchase({status:CONTRACTOR_STATUS.APPRAISED}).name;
  await page.locator(`input[name="keySearch"]`).fill(currentContractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);
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

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  const [res] = await Promise.all([
    page.waitForResponse(res =>
      res.url().includes('/document-by-pid/confirm') && res.status() === 200
    ),
    mainDialog.getByRole('button', {name: 'Xác nhận'}).click()
  ]);
  const resJson = await res.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Xác nhận thành công');

  const listContractor = getGlobalVariable('listContractorPurchase');
  const updatedList = listContractor.map(c => {
    if (c.status === CONTRACTOR_STATUS.APPRAISED && c.name === currentContractorName) {
      return {...c, status: CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1};
    }
    return c;
  });
  setGlobalVariable('listContractorPurchase', updatedList);
}