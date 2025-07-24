import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {CBMS_MODULE, CONTRACTOR_STATUS, SELECT_CONTRACTOR_FORM_TYPE} from '../../constants/common';
import {getGlobalVariable, screenshot, setGlobalVariable} from '../../utils';
import {fillTextV2, selectFile} from '../../utils/fill.utils';


test('import document by pid', async ({page}) => {
  test.setTimeout(120000);
  await importDocumentByPidDTRR(page);
})

test('submit to appraiser', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST');
  await documentByPidSubmitToAppraiser(page);
})

test('verify', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST', USERS.PC);
  await documentByPidVerify(page);
})

const saveForm = async (page: Page, dialog: Locator) => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();
  // await page.pause();
  // await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/save`, 'Cập nhật bản ghi thành công');
}

const checkSuccess = async (
  page: Page,
  url: string = `**${CBMS_MODULE}/document-by-pid/import`,
  successText: string = 'Import dữ liệu thành công'
) => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  const resPromise = page.waitForResponse(url);

  const response = await resPromise;
  const resJson = await response.json();

  if (resJson.type !== 'SUCCESS') {
    await screenshot(page, 'project-failed');
  }

  expect(resJson.type).toBe('SUCCESS');

  const toastDetail = alertSuccess.locator('.p-toast-detail');
  await expect(toastDetail).toHaveText(successText);

  const hasSuccessText = await toastDetail.textContent();
  if (hasSuccessText?.includes(successText)) {
    await screenshot(page, 'project-success');
  }

  await alertSuccess.locator('.p-toast-icon-close').click();
};

export const importDocumentByPidDTRR = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST');
  await page.locator(`input[name="keySearch"]`).fill(getAvailableContractorInvest({status:CONTRACTOR_STATUS.APPRAISED, type:SELECT_CONTRACTOR_FORM_TYPE.DTRR}).name);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  // upload file mailing
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_DTRR_DADT.xlsx');
  await page.getByRole('button', {name: 'Tải lên'}).click();

  await checkSuccess(page);

  // update dialog 1
  await page.getByRole('row', {name: 'Bản cam kết HDDT'}).getByTitle('Cập nhật văn bản').click();
  let subDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Cập nhật bản cam kết HDDT")')
  });

  await fillTextV2(subDialog, 'commitHddtNo', 'SO_BAN_CAM_KET_TA_AUTOTEST_01')
  await page.getByRole('button', {name: 'Tiếp'}).click();


  if (await subDialog.getByRole('row').count() < 3) {
    await subDialog.locator('form span').nth(1).click();
    const selectUserDialog = page.getByRole('dialog').filter({
      has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân sự")')
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
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  const selectExpertDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm chuyên gia")')
  });

  if (await subDialog.getByRole('rowgroup').count() < 3) {
    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/expertGroup/doSearch`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    let row = subDialog.getByRole('rowgroup').locator('tr').nth(1);
    await row.locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Pháp lý'}).click();
    await row.locator('#divisionLabor').fill('Nhận order');
    await row.locator('span#positionId').click();
    await page.getByRole('option', {name: 'Tổ trưởng'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.HONG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/expertGroup/doSearch`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(2).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kỹ thuật - công nghệ'}).click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(2).locator('#divisionLabor').fill('Làm bánh mỳ');
    await subDialog.getByRole('rowgroup').locator('tr').nth(2).locator('span#positionId').click();
    await page.getByRole('option', {name: 'Thành viên'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/expertGroup/doSearch`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(3).locator('span#approvalDecisionPlanSelection').click();
    await page.getByRole('option', {name: 'Kinh tế - tài chính'}).click();
    await subDialog.getByRole('rowgroup').locator('tr').nth(3).locator('#divisionLabor').fill('Thu tiền');
    await subDialog.getByRole('rowgroup').locator('tr').nth(3).locator('span#positionId').click();
    await page.getByRole('option', {name: 'Thành viên'}).click();
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
}

export const importDocumentByPidCDT = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST');
  await page.locator(`input[name="keySearch"]`).fill(getAvailableContractorInvest({
    status:CONTRACTOR_STATUS.APPRAISED,
    type:SELECT_CONTRACTOR_FORM_TYPE.CDT
  }).name);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.getByTitle('Khai báo checklist văn bản pháp lý').first().click();

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  // upload file mailing
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_CDT_DADT.xlsx');
  await page.getByRole('button', {name: 'Tải lên'}).click();

  await checkSuccess(page);

  // update dialog 1
  await page.getByRole('row', {name: 'Thư mời tham gia đề xuất'}).getByTitle('Cập nhật văn bản').click();
  let subDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Cập nhật thư mời tham gia đề xuất")')
  });

  await selectFile({page, locator: subDialog, value: 'assets/files/sample-img.png'});
  await page.getByRole('button', {name: 'Tiếp'}).click();
  await subDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_hang_hoa.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).click();

  await saveForm(page, subDialog);

  // update dialog 2
  await page.getByRole('row', {name: 'Biên bản thương thảo hợp đồng'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật biên bản thương thảo hợp đồng'});
  await fillTextV2(subDialog, 'paymentTime', 'Mai');
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  const selectExpertDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm danh sách nhân sự")')
  });
  const tableRow = subDialog.locator('app-form-table[title="Danh sách tham gia đàm phán hợp đồng"] table tbody tr');

  if (await tableRow.count() < 4) {
    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    let row = tableRow.nth(0);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Tổ trưởng tổ mua sắm'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.HONG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(1);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Tổ phó tổ mua sắm'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(2);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Phòng kỹ thuật - công nghệ'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(3);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Phòng tài chính - kế toán'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectExpertDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectExpertDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectExpertDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(4);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Phòng mua sắm'}).click();
  }

  await saveForm(page, subDialog);

  // update dialog 3
  await page.getByRole('row', {name: 'Tờ trình phê duyệt kết quả thương thảo'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt kết quả thương thảo'});
  await fillTextV2(subDialog, 'paymentTerms', 'Giàu có');
  await fillTextV2(subDialog, 'performanceGuarantee', 'Bảo lãnh luôn');
  await fillTextV2(subDialog, 'warrantyGuarantee', 'Thì bảo lãnh');

  await saveForm(page, subDialog);

  // update dialog 4
  await page.getByRole('row', {name: 'Quyết định phê duyệt KQLCNT'}).getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KQLCNT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  await subDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_danh_muc_hang_hoa.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).click();
  await saveForm(page, subDialog);
  await page.pause();

  await mainDialog.getByRole('button', {name: 'Ghi lại'}).click();
  await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/save`, 'Cập nhật bản ghi thành công');
}

export const documentByPidSubmitToAppraiser = async ({page, selectContractorForm = SELECT_CONTRACTOR_FORM_TYPE.DTRR}: {
  page: Page,
  selectContractorForm?: SELECT_CONTRACTOR_FORM_TYPE
}) => {
  await page.locator(`input[name="keySearch"]`).fill(getAvailableContractorInvest({status:CONTRACTOR_STATUS.APPRAISED, type:selectContractorForm}).name);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.locator('.p-checkbox-box').first().click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  await page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định'}).getByRole('button', {name: 'Có'}).click();
  await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/submitToAppraiser`, 'Trình thẩm định thành công');
}

export const documentByPidVerify = async ({page, selectContractorForm = SELECT_CONTRACTOR_FORM_TYPE.DTRR}: {
  page: Page,
  selectContractorForm?: SELECT_CONTRACTOR_FORM_TYPE
}) => {
  await loginWithRole(page, USERS.PC, '/CBMS_DOCUMENT_BY_PID_INVEST');
  const currentContractorName = getAvailableContractorInvest({status:CONTRACTOR_STATUS.APPRAISED, type:selectContractorForm}).name;
  await page.locator(`input[name="keySearch"]`).fill(currentContractorName);
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

  const listContractor = getGlobalVariable('listContractorInvest');
  const updatedList = listContractor.map(c => {
    if (c.status === CONTRACTOR_STATUS.APPRAISED && c.name === currentContractorName) {
      return {...c, status: CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1}
    }
    return c;
  })
  setGlobalVariable('listContractorInvest', updatedList);
}

export const getAvailableContractorInvest = ({status,type, index = 0}:{
                                               status: CONTRACTOR_STATUS,
                                               type?: SELECT_CONTRACTOR_FORM_TYPE,
  index?: number
}) => {
  return getGlobalVariable('listContractorInvest').filter(c => c.status === status && (type ? c.selectContractorForm === type : true))[index];
}