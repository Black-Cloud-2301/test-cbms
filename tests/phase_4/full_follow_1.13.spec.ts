import {expect, Locator, Page, test} from '@playwright/test';
import {login} from '../login';
import {USERS} from '../../constants/user';
import {getGlobalVariable} from '../../utils';
import {CBMS_MODULE} from '../../constants/common';


test.describe('test document-by-pid shopping ver 2', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(180000);

  test('save full', async ({page}) => {
    await createDocumentByBidShoppingPhase2({page});
  })

  test('submit to appraisal', async ({page}) => {
    await submitToAppraisalShopping({page});
  })

  test('verify bid evaluation', async ({page}) => {
    await appraisalDocumentByPidShopping({page});
  })
})
test('save form 8', async ({page}) => {
  await loginAndSearch({page});

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo đánh giá HSDT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo đánh giá HSDT'});

  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  let table = subDialog.locator('app-form-table').first();

  await table.getByRole('button', {name: 'Thêm mới'}).click();

  let createBidderTable = page.getByRole('dialog', {name: 'Khai báo nhà thầu nhận hoặc mua hồ sơ mời thầu'});

  await createBidderTable.locator('input#bidderCode').fill('nha_thau_test');
  await createBidderTable.locator('input#bidderName').fill('Nhà thầu test');
  await createBidderTable.locator('textarea#ratingSummaryNote').fill('note');
  await createBidderTable.getByRole('button', {name: 'Ghi lại'}).click();

  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#ratingSummaryNote').inputValue()) {
      await row.locator('input#ratingSummaryNote').locator('..').locator('span.pi-times').click();
    }
    await row.locator('input#ratingSummaryNote').fill('Nhà thầu có tiền' + (i + 1));
    if (await row.locator('td').nth(2).innerText() === 'Nhà thầu test') {
      await row.getByTitle('Xóa').click();
      await page.getByRole('button', {name: 'Có'}).click();
    }
  }

  table = subDialog.locator('app-form-table').nth(1);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#validityNote').fill(i + 1 + ' kế toán đi tù');
  }

  table = subDialog.locator('app-form-table').nth(2);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).locator('input#experienceNote').fill(i + 1 + ' năm kinh nghiệm');
  }

  table = subDialog.locator('app-form-table').nth(3);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
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

  table = subDialog.locator('app-form-table').nth(4);
  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.locator('#errorCorrectionValue').pressSequentially(i + 1 + '00000');
    await row.locator('#adjustmentDifferenceValue').pressSequentially(i + 5 + '0000');
    await row.locator('#exchangeRate').pressSequentially(1 + ',0' + i);
  }

  table = subDialog.locator('app-form-table').nth(6);

  await table.getByRole('button', {name: 'Thêm mới'}).click();
  createBidderTable = page.getByRole('dialog', {name: 'Khai báo nhà thầu không đáp ứng yêu cầu'});
  await createBidderTable.locator('input#bidderCode').fill('nha_thau_test');
  await createBidderTable.locator('input#bidderName').fill('Nhà thầu test');
  await createBidderTable.locator('textarea#ratingSummaryNote').fill('note');
  await createBidderTable.getByRole('button', {name: 'Ghi lại'}).click();

  tableRow = table.locator('tbody tr');
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    if (await row.locator('input#ratingSummaryNote').inputValue()) {
      await row.locator('input#ratingSummaryNote').locator('..').locator('span.pi-times').click();
    }
    await row.locator('input#ratingSummaryNote').fill('Nhà thầu không có tiền' + (i + 1));
    if (await row.locator('td').nth(2).innerText() === 'Nhà thầu test') {
      await row.getByTitle('Xóa').click();
      await page.getByRole('button', {name: 'Có'}).click();
    }
  }

  await saveForm({page, dialog: subDialog});
})

test('save form 9', async ({page}) => {
  await loginAndSearch({page});

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell', {name: 'Biên bản thương thảo hợp đồng'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật biên bản thương thảo hợp đồng'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  const selectUserDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân sự")')
  });
  if (countBidder < 4) {
    for (let i = 0; i < 4; i++) {
      const row = tableRow.nth(i);
      await subDialog.locator('form span').nth(1).click();

      await page.waitForResponse(response => response.url().includes('/sysUser/search') && response.status() === 200);
      await selectUserDialog.getByRole('row').nth(1).locator('a').click();
      await row.locator('span[role=combobox]#role').click();
      if (i === 0) {
        await page.getByRole('option', {name: 'Tổ trưởng', exact: true}).click();
      } else if (i === 1) {
        await page.getByRole('option', {name: 'Tổ phó', exact: true}).click();
      } else {
        await page.getByRole('option', {name: 'Ủy viên', exact: true}).click();
      }
    }
  }
  await saveForm({page, dialog: subDialog});
})

test('save form 10', async ({page}) => {
  await loginAndSearch({page});

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  const currentRow = mainDialog.getByRole('cell', {name: 'Tờ trình thẩm định và xin phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  const subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình thẩm định & phê duyệt KQLCNT'});

  await saveForm({page, dialog: subDialog});
})

test('save form 11', async ({page}) => {
  await loginAndSearch({page});

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  const currentRow = mainDialog.getByRole('cell', {name: 'Quyết định phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  const subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KQLCNT'});

  await saveForm({page, dialog:subDialog});
})

const saveForm = async ({page, dialog, url = '/document-by-pid/save', successText = 'Cập nhật bản ghi thành công', buttonName = 'Ghi lại'}:{
                          page: Page,
                          dialog: Locator,
                          url?: string,
                          successText?: string;
                          buttonName?: string;
                        }) => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  const [res] = await Promise.all([
    page.waitForResponse(res => res.url().includes(url) && res.status() === 200),
    await dialog.getByRole('button', {name: buttonName}).click()
  ])
  let resJson = await res.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

const loginAndSearch = async ({page, url}: { page: Page, url?: string }) => {
  await login(page, url);
  await page.locator(`input[name="keySearch"]`).fill(getGlobalVariable('lastContractorName'));
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
}

const checkSuccess = async (page: Page, url: string = '**/document-by-pid/import', successText: string = 'Import dữ liệu thành công') => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json()
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

export const createDocumentByBidShoppingPhase2 = async ({page, url = '/CBMS_DOCUMENT_BY_PID'}: {
  page: Page,
  url?: string
}) => {
  await loginAndSearch({page, url});
  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  // upload file mailing
  await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/bm_DTRR_DADT_phase_2.xlsx');
  await mainDialog.getByRole('button', {name: 'Tải lên'}).click();

  // VB 1
  let currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo đánh giá hồ sơ dự thầu'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  let subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo đánh giá hồ sơ dự thầu'});

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // VB 2

  currentRow = mainDialog.getByRole('cell', {name: 'Biên bản thương thảo hợp đồng'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  subDialog = page.getByRole('dialog', {name: 'Cập nhật biên bản thương thảo hợp đồng'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  const tableRow = subDialog.locator('app-form-table[title="Danh sách tham gia đàm phán hợp đồng"] table tbody tr');
  const selectUserDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân sự")')
  });

  if (await tableRow.count() < 4) {
    await subDialog.locator('form span').nth(1).click();
    await selectUserDialog.locator('input[name="keySearch"]').fill(USERS.NHUNG.name);
    await selectUserDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    let row = tableRow.nth(0);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Tổ trưởng tổ mua sắm'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectUserDialog.locator('input[name="keySearch"]').fill(USERS.HONG.name);
    await selectUserDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(1);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Tổ phó tổ mua sắm'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectUserDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectUserDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(2);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Phòng kỹ thuật - công nghệ'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectUserDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectUserDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(3);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Phòng tài chính - kế toán'}).click();

    await subDialog.locator('form span').nth(1).click();
    await selectUserDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
    await selectUserDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}/sysUser/search`) && response.status() === 200);
    await selectUserDialog.getByRole('row').nth(1).locator('a').click();
    row = tableRow.nth(4);
    await row.locator('span#role').click();
    await page.getByRole('option', {name: 'Phòng mua sắm'}).click();
  }

  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // VB 3
  currentRow = mainDialog.getByRole('cell', {name: 'Tờ trình thẩm định và phê duyệt KQLCNT'}).locator('..');
  subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình thẩm định và phê duyệt KQLCNT'});
  await currentRow.getByTitle('Cập nhật văn bản').click();
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // VB 4
  currentRow = mainDialog.getByRole('cell', {name: 'Quyết định phê duyệt KQLCNT'}).locator('..');
  subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KQLCNT'});
  await currentRow.getByTitle('Cập nhật văn bản').click();
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();

  // VB 5

  currentRow = mainDialog.getByRole('cell', {name: 'Thông báo KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  subDialog = page.getByRole('dialog', {name: 'Cập nhật thông báo KQLCNT'});
  await subDialog.getByRole('button', {name: 'Ghi lại'}).click();
  await saveForm({page, dialog: mainDialog});
}

export const submitToAppraisalShopping = async ({page, url='/CBMS_DOCUMENT_BY_PID'}:{page: Page, url?:string}) => {
  await login(page, url);
  await page.locator(`input[name="keySearch"]`).fill(getGlobalVariable('lastContractorName'));
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await expect(row.locator('td').first()).not.toHaveText('Không có dữ liệu');
  await row.locator('p-checkbox').click();

  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định'});
  await saveForm({page, dialog: confirmDialog, url, buttonName: 'Có', successText: 'Trình thẩm định thành công'});
}



export const appraisalDocumentByPidShopping = async ({page, url='/CBMS_DOCUMENT_BY_PID'}:{page: Page, url?:string}) => {
  await login(page, url, USERS.PC);
  await page.locator(`input[name="keySearch"]`).fill(getGlobalVariable('lastContractorName'));
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();

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
    await row.locator('input#note').fill('Chú thích ' + (i + 1))
  }

  await mainDialog.getByRole('button', {name: 'Xác nhận'}).click();

  let resPromise = await page.waitForResponse('**/document-by-pid/confirm');
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Xác nhận thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
}