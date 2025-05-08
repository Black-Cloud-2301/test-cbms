import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {fillNumber, fillText, selectDate, selectFile, selectOption} from '../../utils/fill.utils';

const POLICY_NAME = `TA autotest chủ trương`;

test('create policy full flow', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.NHUNG);
  await search(page);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới chủ trương'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(3).innerText();
    const match = oldName.match(/chủ trương (\d+)/i);
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = POLICY_NAME + ` ${count}`
  await createPolicy(page, mainDialog, nameSearch);
  await submitToAppraisal(page, nameSearch);
  await appraisal(page, nameSearch);
  await adjustment(page, nameSearch);
  await submitToAppraisal(page, nameSearch + ` DC 1`);
  await appraisal(page, nameSearch + ` DC 1`);
});

test('create policy', async ({page}) => {
    await login(page, '/BIDDING_POLICY', USERS.NHUNG);
    await search(page);
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới chủ trương'});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    let count = 1;
    if (rowCount > 0) {
      const row = tableRow.first();
      const oldName = await row.locator('td').nth(3).innerText();
      const match = oldName.match(/chủ trương (\d+)/i);
      count = match ? parseInt(match[1]) + 1 : 1;
    }
    const nameSearch = POLICY_NAME + ` ${count}`
    await createPolicy(page, mainDialog, nameSearch)
  }
);

test('policy submit to appraiser', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.NHUNG);
  await search(page);
  await submitToAppraisal(page);
})

test('policy appraiser', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.PC);
  await search(page);
  await appraisal(page);
})

test('policy adjustment', async ({page}) => {
  await login(page, '/BIDDING_POLICY', USERS.NHUNG);
  await search(page);

  await adjustment(page);
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

const search = async (page: Page, name?: string) => {
  await page.locator(`input[name="keySearch"]`).fill(name ? name : POLICY_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/policy/doSearch') && response.status() === 200);
}

const checkAdjustment = async (page: Page, tableRow: Locator) => {
  const rowCount = await tableRow.count();
  const groupMap: Record<string, { index: number; value: number }[]> = {};

// 1. Nhóm theo part0
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    const codeText = await row.locator('td').nth(2).innerText();
    console.log('codeText', codeText)
    const [part0, part1Str] = codeText.split('-');
    const part1 = Number(part1Str);

    if (!groupMap[part0]) groupMap[part0] = [];
    groupMap[part0].push({index: i, value: part1});
  }
  console.log('groupMap', groupMap)
// 2. Kiểm tra từng nhóm
  for (const key in groupMap) {
    const group = groupMap[key];
    const maxEntry = group.reduce((max, curr) => (curr.value > max.value ? curr : max), group[0]);

    for (const {index, value} of group) {
      const row = tableRow.nth(index);

      if (index === maxEntry.index) {
        await expect(row.getByTitle('Điều chỉnh chủ trương')).toHaveCount(1);
      } else {
        await expect(row.getByTitle('Điều chỉnh chủ trương')).toHaveCount(0);
      }

      const statusText = await row.locator('td').nth(4).innerText(); // Cột Trạng thái
      expect(statusText.includes('3. Đã thẩm định')).toBeTruthy();
    }
  }
}

const createPolicy = async (page: Page, mainDialog: Locator, nameSearch: string) => {
  await fillText(mainDialog, 'policyName', nameSearch);
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
  await fillText(mainDialog, 'decisionNumber', `QD_CT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'policyDate');
  await selectOption(page, mainDialog, 'approvedBy', '1. HĐQT');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await saveForm({page, dialog: mainDialog});
}

const submitToAppraisal = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await search(page, nameSearch);
  }
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
}

const appraisal = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.PC, '/BIDDING_POLICY')
    await search(page, nameSearch);
  }
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

    // await checkAdjustment(page, tableRow);
  } else {
    console.log('Không tìm thấy bản ghi');
  }
}

const adjustment = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.NHUNG, '/BIDDING_POLICY')
    await search(page, nameSearch);
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.getByTitle('Điều chỉnh chủ trương', {exact: true}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh thông tin chủ trương'});
  const oldName = await row.locator('td').nth(3).innerText();
  const match = oldName.match(/chủ trương (\d+)/i);
  let count = match ? parseInt(match[1]) + 1 : 1;
  await fillText(mainDialog, 'policyName', nameSearch ? nameSearch + ` DC 1` : `${oldName} DC ${count}`);
  await fillText(mainDialog, 'note', 'Của Tú Ank đừng đụng dô điều chỉnh');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'decisionNumber', `QD_TA_AUTOTEST_${rowCount + 1}_DC`);
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
}