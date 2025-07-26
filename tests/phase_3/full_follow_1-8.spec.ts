import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {CBMS_MODULE, CONTRACTOR_STATUS} from '../../constants/common';
import {getAvailableContractorInvest} from '../phase_2/full_follow.spec';
import {getGlobalVariable, setGlobalVariable} from '../../utils';
import {fillTextV2, selectFile} from '../../utils/fill.utils';


test.describe('test document-by-pid ver 2', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(180000);

  test('save full', async ({page}) => {

    await importDocumentByPidPhase2DTRR(page);
  })

  test('propose bid evaluation', async ({page}) => {
    await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST');
    await submitToAppraiser(page);
  })

  test('verify bid evaluation', async ({page}) => {
    await verifyDocumentByPid2(page);
  })
})

test('save form 7', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell', {name: 'Tờ trình phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt KQLCNT'});

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#validityNote').fill(i + 1 + ' kế toán đi tù');
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#experienceNote').fill(i + 1 + ' năm kinh nghiệm');
  }

  table = subDialog.locator('app-form-table').nth(2);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('span[role=combobox]#sample').click();
    if (i === 0) {
      await page.getByRole('option', {name: 'Không đáp ứng'}).click();
      await row.locator('#technologyNote').fill('Hàng dễ vỡ khi vận chuyển');
    } else {
      await page.getByRole('option', {name: 'Đáp ứng', exact: true}).click();
      await row.locator('#technologyNote').fill('Hàng to ' + (i + 1) + ' cm');
    }
    await page.waitForTimeout(100);
  }

  table = subDialog.locator('app-form-table').nth(3);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('#errorCorrectionValue').pressSequentially(i + 1 + '00000');
    await row.locator('#adjustmentDifferenceValue').pressSequentially(i + 5 + '0000');
    await row.locator('#exchangeRate').pressSequentially(1 + ',0' + i);
  }

  await saveForm({page, dialog: subDialog});
})

test('save form 8 2', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo thẩm định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định KQLCNT'});

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#hsdtValidityDays').inputValue()) {
      await row.locator('input#hsdtValidityDays').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#hsdtValidityDays').pressSequentially((i + 1).toString());
    await page.waitForTimeout(100);
    if (await row.locator('input#bidSecurityAmount').inputValue()) {
      await row.locator('input#bidSecurityAmount').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#bidSecurityAmount').pressSequentially(i + 1 + '000000');
    await page.waitForTimeout(100);
    /*if (await row.locator('input#exchangeRate').inputValue()) {
      await row.locator('input#exchangeRate').locator('..').locator('span.pi-times').click();
    }*/
    await row.locator('input#bidSecurityValidityDays').fill('Không biết là cái gì');
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (i === 0)
      await row.locator('input#ratingSummaryNote').fill('Vứt');
    else
      await row.locator('input#ratingSummaryNote').fill(`Đã lót ${i + 1}00000 ngàn`);
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  await saveForm({page, dialog: subDialog});
})

test('save form 9 2', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  const currentRow = mainDialog.getByRole('cell', {name: 'Quyết định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  const subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KHLCNT'});

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();

  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#price').inputValue()) {
      await row.locator('input#price').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#price').pressSequentially(i + 1 + '0000');
    if (await row.locator('input#vat').inputValue()) {
      await row.locator('input#vat').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#vat').pressSequentially(i + 5 + '');
    await page.waitForTimeout(100);
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  await saveForm({page, dialog: subDialog});
})

test('save form 10 2', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  const currentRow = mainDialog.getByRole('cell', {name: 'Thông báo KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  const subDialog = page.getByRole('dialog', {name: 'Cập nhật thông báo KQLCNT'});

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#ratingSummaryNote').inputValue()) {
      await row.locator('input#ratingSummaryNote').locator('..').locator('span.pi-times').click();
    }
    await row.locator('input#ratingSummaryNote').fill('Nhà thầu thiếu tiền ' + (i + 1));
  }
  await saveForm({page, dialog: subDialog});
})

const saveForm = async ({
                          page,
                          dialog,
                          url = `**${CBMS_MODULE}/document-by-pid/save`,
                          successText = 'Cập nhật bản ghi thành công'
                        }: {
  page: Page,
  dialog: Locator,
  url?: string,
  successText?: string
}) => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

const loginAndSearch = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST');
  await page.locator(`input[name="keySearch"]`).fill(getAvailableContractorInvest({status:CONTRACTOR_STATUS.EVALUATED}).name);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
}

const checkSuccess = async (page: Page, url: string = `**${CBMS_MODULE}/document-by-pid/import`, successText: string = 'Import dữ liệu thành công') => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json()
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

export const importDocumentByPidPhase2DTRR = async (page: Page) => {
  await loginAndSearch(page);

  // save form 7
  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  await page.locator('input[type="file"]').setInputFiles('assets/files/bm_DTRR_DADT_phase_2.xlsx');
  await page.getByRole('button', {name: 'Tải lên'}).click();
  await checkSuccess(page);

  let currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo đánh giá E-HSDT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  let subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo đánh giá E-HSDT'});
  await fillTextV2(subDialog, 'technicalNonComplianceExplanation', 'Thì là không đáp ứng kỹ thuật')
  await selectFile({page, locator: subDialog, value: 'assets/files/sample-img.png'});


  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // save form 8
  currentRow = mainDialog.getByRole('cell', {name: 'Kết quả đối chiếu tài liệu'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật kết quả đối chiếu tài liệu'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  await subDialog.locator('form span').nth(1).click();
  const selectUserDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm danh sách nhân sự")')
  });
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
  await selectUserDialog.getByRole('row').nth(1).locator('a').click();
  await subDialog.locator('form span').nth(1).click();

  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
  await selectUserDialog.getByRole('row').nth(1).locator('a').click();

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // save form 9
  currentRow = mainDialog.getByRole('cell', {name: 'Tờ trình phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt KQLCNT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#validityNote').fill(i + 1 + ' kế toán đi tù');
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#experienceNote').fill(i + 1 + ' năm kinh nghiệm');
  }

  table = subDialog.locator('app-form-table').nth(2);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('span[role=combobox]#sample').click();
    if (i === 0) {
      await page.getByRole('option', {name: 'Không đáp ứng'}).click();
      await row.locator('#technologyNote').fill('Hàng dễ vỡ khi vận chuyển');
    } else {
      await page.getByRole('option', {name: 'Đáp ứng', exact: true}).click();
      await row.locator('#technologyNote').fill('Hàng to ' + (i + 1) + ' cm');
    }
    await page.waitForTimeout(100);
  }

  table = subDialog.locator('app-form-table').nth(3);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('#errorCorrectionValue').pressSequentially(i + 1 + '00000');
    await row.locator('#adjustmentDifferenceValue').pressSequentially(i + 5 + '0000');
    await row.locator('#exchangeRate').pressSequentially(1 + ',0' + i);
  }
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // save form 10
  currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo thẩm định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định KQLCNT'});
  await selectFile({page, locator: subDialog, value: 'assets/files/sample-img.png'});
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

// save form 11
  currentRow = mainDialog.getByRole('cell', {name: 'Quyết định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KQLCNT'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();
  await subDialog.locator('input[type="file"]').first().setInputFiles('assets/files/bm_danh_muc_nha_thau_trung_thau.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).first().click();
  await subDialog.locator('input[type="file"]').nth(1).setInputFiles('assets/files/bm_thong_tin_nha_thau_khong_trung_thau.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).nth(1).click();
  await subDialog.locator('input[type="file"]').nth(2).setInputFiles('assets/files/bm_thong_tin_hang_hoa_trung_thau.xlsx');
  await subDialog.getByRole('button', {name: 'Tải lên'}).nth(2).click();
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // save form 13
  currentRow = mainDialog.getByRole('cell', {name: 'Thông báo KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật thông báo KQLCNT'});
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // save form 14
  currentRow = mainDialog.getByRole('cell', {name: 'Biên bản hoàn thiện hợp đồng'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật biên bản hoàn thiện hợp đồng'});
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
await page.pause();
  await saveForm({page, dialog: mainDialog});
}

export const importDocumentByPid2 = async (page: Page) => {
  await loginAndSearch(page);

  // save form 7
  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  let currentRow = mainDialog.getByRole('cell', {name: 'Tờ trình phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  let subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình phê duyệt KQLCNT'});

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#validityNote').fill(i + 1 + ' kế toán đi tù');
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#experienceNote').fill(i + 1 + ' năm kinh nghiệm');
  }

  table = subDialog.locator('app-form-table').nth(2);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('span[role=combobox]#sample').click();
    if (i === 0) {
      await page.getByRole('option', {name: 'Không đáp ứng'}).click();
      await row.locator('#technologyNote').fill('Hàng dễ vỡ khi vận chuyển');
    } else {
      await page.getByRole('option', {name: 'Đáp ứng', exact: true}).click();
      await row.locator('#technologyNote').fill('Hàng to ' + (i + 1) + ' cm');
    }
    await page.waitForTimeout(100);
  }

  table = subDialog.locator('app-form-table').nth(3);
  tableRow = table.locator('tbody tr');
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('#errorCorrectionValue').pressSequentially(i + 1 + '00000');
    await row.locator('#adjustmentDifferenceValue').pressSequentially(i + 5 + '0000');
    await row.locator('#exchangeRate').pressSequentially(1 + ',0' + i);
  }
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  // save form 8

  currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo thẩm định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo thẩm định KQLCNT'});

  table = subDialog.locator('app-form-table').first();
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();

  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#hsdtValidityDays').inputValue()) {
      await row.locator('input#hsdtValidityDays').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#hsdtValidityDays').pressSequentially((i + 1).toString());
    await page.waitForTimeout(100);
    if (await row.locator('input#bidSecurityAmount').inputValue()) {
      await row.locator('input#bidSecurityAmount').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#bidSecurityAmount').pressSequentially(i + 1 + '000000');
    await page.waitForTimeout(100);
    /*if (await row.locator('input#exchangeRate').inputValue()) {
      await row.locator('input#exchangeRate').locator('..').locator('span.pi-times').click();
    }*/
    await row.locator('input#bidSecurityValidityDays').fill('Không biết là cái gì');
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (i === 0)
      await row.locator('input#ratingSummaryNote').fill('Vứt');
    else
      await row.locator('input#ratingSummaryNote').fill(`Đã lót ${i + 1}00000 ngàn`);
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  // await page.pause();
  // save form 9

  currentRow = mainDialog.getByRole('cell', {name: 'Quyết định KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KHLCNT'});

  table = subDialog.locator('app-form-table').first();
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();

  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#price').inputValue()) {
      await row.locator('input#price').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#price').pressSequentially(i + 1 + '0000');
    if (await row.locator('input#vat').inputValue()) {
      await row.locator('input#vat').locator('..').locator('timesicon.p-inputnumber-clear-icon').click();
    }
    await row.locator('input#vat').pressSequentially(i + 5 + '');
    await page.waitForTimeout(100);
  }
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  // save form 10

  currentRow = mainDialog.getByRole('cell', {name: 'Thông báo KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật thông báo KQLCNT'});

  table = subDialog.locator('app-form-table').first();
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#ratingSummaryNote').inputValue()) {
      await row.locator('input#ratingSummaryNote').locator('..').locator('span.pi-times').click();
    }
    await row.locator('input#ratingSummaryNote').fill('Nhà thầu thiếu tiền ' + (i + 1));
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  // save form 10

  await saveForm({page, dialog: mainDialog});
}

export const submitToAppraiser = async (page:Page) => {
  await page.locator(`input[name="keySearch"]`).fill(getAvailableContractorInvest({status: CONTRACTOR_STATUS.EVALUATED}).name);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  await page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định'}).getByRole('button', {name: 'Có'}).click();
  await checkSuccess(page, `**${CBMS_MODULE}/document-by-pid/submitToAppraiser`, 'Trình thẩm định thành công');
}

export const verifyDocumentByPid2 = async (page:Page) => {
  const currentContractorName = getAvailableContractorInvest({status:CONTRACTOR_STATUS.EVALUATED}).name;
  await loginWithRole(page, USERS.PC, '/CBMS_DOCUMENT_BY_PID_INVEST');
  await page.locator(`input[name="keySearch"]`).fill(currentContractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/contractor/doSearch`) && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
  // await page.pause();
  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  /*let tableRow = mainDialog.locator('tbody tr');
  console.log(await tableRow.evaluate(r=>r.outerHTML))
  let countBidder = await tableRow.count();
  console.log('countBidder',countBidder)
  for (let i = 1; i < countBidder; i++) {
    const row = tableRow.nth(i);
    console.log(await row.evaluate(r=>r.outerHTML))
    await row.getByRole('combobox', {name: '--Chọn--'}).click();
    if(i===1) {
      await page.getByRole('option', {name: 'Hủy', exact: true}).click();
    } else {
      await page.getByRole('option', {name: 'Xác nhận', exact: true}).click();
    }
    await page.waitForTimeout(100);
  }*/

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
    await row.locator('input#note').fill('Chú thích ' + (i + 1));
  }

  await mainDialog.getByRole('button', {name: 'Xác nhận'}).click();

  let resPromise = await page.waitForResponse(`**${CBMS_MODULE}/document-by-pid/confirm`);
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Xác nhận thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  const listContractor = getGlobalVariable('listContractorInvest');
  const updatedList = listContractor.map(c=> {
    if(c.status === CONTRACTOR_STATUS.EVALUATED && c.name === currentContractorName) {
      return {...c, status: CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V2}
    }
    return c;
  });
  setGlobalVariable('listContractorInvest', updatedList);
}