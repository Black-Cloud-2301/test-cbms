import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {fillNumber, fillText, selectDate, selectFile, selectOption} from '../../utils/fill.utils';

const PURCHASE_NAME = `TA autotest đề xuất mua sắm`;

test('create purchase', async ({page}) => {
  await login(page, '/CBMS_PURCHASE_PROPOSAL', USERS.NHUNG);
  await search(page);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới đề xuất mua sắm'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  await fillText(mainDialog, 'purchaseRequestName', PURCHASE_NAME + ` ${rowCount + 1}`);
  await fillText(mainDialog, 'procurementProposalContent', 'Mua cả thế giới');
  await fillNumber(mainDialog, 'propositionPurchasePrice', '1000000');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'procurementProposalDocumentNumber', `SO_VB_DXMS_TA_AUTOTEST_${rowCount + 1}`);
  await selectDate(page, mainDialog, 'decisionDay');
  await selectOption(page, mainDialog, 'approvalLevel', '1. HĐQT');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await saveForm({page, dialog: mainDialog});
});

test('purchase submit to appraiser', async ({page}) => {
  await login(page, '/CBMS_PURCHASE_PROPOSAL', USERS.NHUNG);
  await search(page);

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0)
  const row = tableRow.first();
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Chốt'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận chốt đề xuất mua sắm'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '**/purchase/submit-to-appraiser',
    successText: 'Chốt thẩm định thành công'
  })
})

test('purchase adjustment', async ({page}) => {
  await login(page, '/CBMS_PURCHASE_PROPOSAL', USERS.NHUNG);
  await search(page);
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  const adjustmentButton = row.getByTitle('Điều chỉnh', {exact: true})
  await adjustmentButton.click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh đề xuất mua sắm'});
  await fillText(mainDialog, 'purchaseRequestName', `${PURCHASE_NAME} DC ${rowCount}`);
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh đề xuất mua sắm thành công'})
  rowCount = await tableRow.count();
  expect(rowCount > 1);

  let countStatusNew = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    const statusText = await row.locator('td').nth(4).innerText(); // cột "Trạng thái"
    if (statusText.includes('1. Mới tạo')) {
      countStatusNew++;

      // Kiểm tra có hiển thị nút điều chỉnh
      await expect(adjustmentButton).not.toBeVisible();
    } else {
      // Các trạng thái khác không được phép có nút điều chỉnh
      await expect(adjustmentButton).toHaveCount(0);
      expect(statusText.includes('2. Chuẩn bị tạo kế hoạch thầu')).toBeTruthy();
    }
  }

  // ✅ Chỉ được phép có đúng 1 dòng "Mới tạo"
  expect(countStatusNew).toBe(1);

})

const saveForm = async ({
                          page,
                          dialog,
                          buttonName = 'Ghi lại',
                          url = '**/purchase/create',
                          successText = 'Thêm mới đề xuất mua sắm thành công'
                        }: SaveFormOptions) => {
  await dialog.getByRole('button', {name: buttonName}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  const resPromise = await page.waitForResponse(url);
  const resJson = await resPromise.json();

  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
};

interface SaveFormOptions {
  page: Page;
  dialog: Locator;
  buttonName?: string;
  url?: string;
  successText?: string;
}

const search = async (page: Page) => {
  await page.locator(`input[name="keySearch"]`).fill(PURCHASE_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/purchase/doSearch') && response.status() === 200);
}