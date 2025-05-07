import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {fillNumber, fillText, selectDate, selectFile, selectOption} from '../../utils/fill.utils';

const NO = 1;
const POLICY_NAME = `TA autotest chủ trương ${NO}`;

test('create policy', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.NHUNG);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới chủ trương'});
  await fillText(mainDialog, 'policyName', POLICY_NAME);
  await selectOption(page, mainDialog, 'projectGroupId', 'Nhóm A');
  await selectOption(page, mainDialog, 'projectTypeId', 'Đầu tư xây dựng');
  await selectOption(page, mainDialog, 'quarterFrom', 'I');
  await fillNumber(mainDialog, 'yearFrom', '2025');
  await selectOption(page, mainDialog, 'quarterTo', 'I');
  await fillNumber(mainDialog, 'yearTo', '2026');
  await fillNumber(mainDialog, 'implementationDate', '1');
  await selectOption(page, mainDialog, 'dateTypeId', 'Năm');
  await fillNumber(mainDialog, 'investmentScale', '100');
  await selectOption(page, mainDialog, 'unitTypeId', 'm2');
  await selectOption(page, mainDialog, 'investmentFieldId', 'BTS');
  await fillNumber(mainDialog, 'projectFunding', '1000000000');
  await fillText(mainDialog, 'investmentTarget', 'Đầu tư cho vui');
  await fillNumber(mainDialog, 'totalInvestment', '100000000');
  await fillText(mainDialog, 'projectLocation', 'Hồ Tây');
  await fillText(mainDialog, 'note', 'Của Tú Ank đừng đụng zô');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'decisionNumber', `QD_CT_TA_AUTOTEST_${NO}`);
  await selectDate(page, mainDialog, 'policyDate');
  await selectOption(page, mainDialog, 'approvedBy', '1. HĐQT');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await saveForm({page, dialog: mainDialog});
});

test('policy submit to appraiser', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.NHUNG);
  await search(page);

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0)
    const row = tableRow.first();
    await row.locator('p-checkbox').click();
    await page.getByRole('button', {name: 'Trình thẩm định'}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định chủ trương'});
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '**/policy/submit-to-appraiser',
      successText: 'Trình thẩm định thành công'
    })
})

test('policy appraiser', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.PC);
  await search(page);
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  if (rowCount > 0) {
    const row = tableRow.first();
    await row.getByTitle('Thẩm định chủ trương', {exact: true}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định chủ trương'});
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '**/policy/appraisal',
      successText: 'Thành công'
    })

    if (rowCount > 1) {
      await loginWithRole(page, USERS.NHUNG, '/BIDDING_POLICY')
      await search(page);
      for (let i = 0; i < rowCount; i++) {
        const row = tableRow.nth(i);
        const statusText = await row.locator('td').nth(4).innerText(); // cột "Trạng thái"
        if (i === 0)
          await expect(row.getByTitle('Điều chỉnh chủ trương')).toHaveCount(1);
        else
          await expect(row.getByTitle('Điều chỉnh chủ trương')).toHaveCount(0);
        expect(statusText.includes('3. Đã thẩm định')).toBeTruthy();
      }
    }
  } else {
    console.log('Không tìm thấy bản ghi');
  }
})

test('policy adjustment', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.NHUNG);
  await search(page);
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.getByTitle('Điều chỉnh chủ trương', {exact: true}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh thông tin chủ trương'});
  await fillText(mainDialog, 'policyName', `TA autotest chủ trương ${NO} DC ${rowCount}`);
  await fillText(mainDialog, 'note', 'Của Tú Ank đừng đụng dô điều chỉnh');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'decisionNumber', `QD_TA_AUTOTEST_${NO}_DC`);
  await selectDate(page, mainDialog, 'policyDate');
  await selectOption(page, mainDialog, 'approvedBy', '1. HĐQT');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh chủ trương thành công'})
  rowCount = await tableRow.count();
  expect(rowCount > 1);

  let countStatusNew = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    const statusText = await row.locator('td').nth(4).innerText(); // cột "Trạng thái"
    if (statusText.includes('1. Mới tạo')) {
      countStatusNew++;

      // Kiểm tra có hiển thị nút điều chỉnh
      await expect(row.getByTitle('Điều chỉnh chủ trương')).not.toBeVisible();
    } else {
      // Các trạng thái khác không được phép có nút điều chỉnh
      await expect(row.getByTitle('Điều chỉnh chủ trương')).toHaveCount(0);
      expect(statusText.includes('3. Đã thẩm định')).toBeTruthy();
    }
  }

  // ✅ Chỉ được phép có đúng 1 dòng "Mới tạo"
  expect(countStatusNew).toBe(1);

})

const saveForm = async ({
                          page,
                          dialog,
                          buttonName = 'Ghi lại',
                          url = '**/policy/create',
                          successText = 'Thêm mới chủ trương thành công'
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
  await page.locator(`input[name="keySearch"]`).fill(POLICY_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/policy/doSearch') && response.status() === 200);
}