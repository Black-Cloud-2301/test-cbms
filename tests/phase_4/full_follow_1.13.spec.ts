import {expect, Locator, Page, test} from '@playwright/test';
import {login} from '../login';
import {USERS} from '../../constants/user';

const contractorName = 'TA autotest 8';

test('save form 8', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell', {name: 'Báo cáo đánh giá HSDT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật báo cáo đánh giá HSDT'});

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

  await saveForm(page, subDialog);
})

test('save form 9', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});

  const currentRow = mainDialog.getByRole('cell', {name: 'Biên bản thương thảo hợp đồng'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();

  const subDialog = page.getByRole('dialog', {name: 'Cập nhật biên bản thương thảo hợp đồng'});
  await subDialog.getByRole('button', {name: 'Tiếp'}).click();

  let table = subDialog.locator('app-form-table').first();
  let tableRow = table.locator('tbody tr');
  let countBidder = await tableRow.count();
  const selectUserDialog = page.getByRole('dialog').filter({
    has: page.locator('span.p-dialog-title:text("Tìm kiếm nhân viên")')
  });
  if (countBidder < 4) {
    for (let i = 0; i < 4; i++) {
      const row = tableRow.nth(i);
      await subDialog.locator('form span').nth(1).click();

      await page.waitForResponse(response => response.url().includes('/cbms-service/sysUser/search') && response.status() === 200);
      await selectUserDialog.getByRole('row').nth(1).locator('a').click();
      await row.locator('span[role=combobox]#role').click();
      if (i === 0) {
        await page.getByRole('option', {name: 'Tổ trưởng', exact: true}).click();
      } else if(i===1) {
        await page.getByRole('option', {name: 'Tổ phó', exact: true}).click();
      } else {
        await page.getByRole('option', {name: 'Ủy viên', exact: true}).click();
      }
    }
  }
  await saveForm(page, subDialog);
})

test('save form 10', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  const currentRow = mainDialog.getByRole('cell', {name: 'Tờ trình thẩm định và xin phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  const subDialog = page.getByRole('dialog', {name: 'Cập nhật tờ trình thẩm định & phê duyệt KQLCNT'});

  await saveForm(page, subDialog);
})

test('save form 11', async ({page}) => {
  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', {name: 'Cập nhật danh mục văn bản pháp lý'});
  const currentRow = mainDialog.getByRole('cell', {name: 'Quyết định phê duyệt KQLCNT'}).locator('..');
  await currentRow.getByTitle('Cập nhật văn bản').click();
  const subDialog = page.getByRole('dialog', {name: 'Cập nhật quyết định phê duyệt KQLCNT'});

  await saveForm(page, subDialog, '**/cbms-service/bid-evaluation/saveUnsuccessfulBidder', 'Cập nhật thông báo KQLCNT thành công');
})

test('propose bid evaluation', async ({page}) => {
  await loginAndSearch(page);

  await page.getByRole('button', {name: 'Đề xuất'}).click();

  let resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/propose');
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Đề xuất thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

test('verify bid evaluation', async ({page}) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID', USERS.PC);
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
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

  let resPromise = await page.waitForResponse('**/cbms-service/document-by-pid/confirm');
  let resJson = await resPromise.json();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Xác nhận thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

const saveForm = async (page: Page, dialog: Locator, url: string = '**/cbms-service/bid-evaluation/saveEvaluateHsdt', successText: string = 'Cập nhật tờ trình phê duyệt KQLCNT thành công') => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
}

const loginAndSearch = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
}