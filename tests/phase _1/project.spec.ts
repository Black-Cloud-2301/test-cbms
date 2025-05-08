import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {fillText, selectAutocompleteMulti, selectDate, selectFile, selectOption} from '../../utils/fill.utils';

const PROJECT_NAME = `TA autotest dự án`;
const POLICY_NAME = `TA autotest chủ trương`;

test('create project full flow', async ({page}) => {
  test.setTimeout(180000);
  await login(page, '/BIDDING_PROJECT', USERS.NHUNG);
  await search(page);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới dự án'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(3).innerText();
    const match = oldName.match(/dự án (\d+)/i);
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = PROJECT_NAME + ` ${count}`;
  await createProject(page, mainDialog, nameSearch);
  await submitToAppraisal(page, nameSearch);
  await appraisal(page, nameSearch);
  await adjustment(page, nameSearch);
  await submitToAppraisal(page, nameSearch + ` DC 1`);
  await appraisal(page, nameSearch + ` DC 1`);
});

test('create project', async ({page}) => {
  await login(page, '/BIDDING_PROJECT', USERS.NHUNG);
  await search(page);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới dự án'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();

  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(3).innerText();
    const match = oldName.match(/dự án (\d+)/i);
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = POLICY_NAME + ` ${count}`;
  await createProject(page, mainDialog, nameSearch);
});

test('project submit to appraiser', async ({page}) => {
  await login(page, '/BIDDING_PROJECT', USERS.NHUNG);
  await search(page);
  await submitToAppraisal(page);
})

test('project appraiser', async ({page}) => {
  await login(page, '/BIDDING_PROJECT', USERS.PC);
  await search(page);
  await appraisal(page);
})

test('project adjustment', async ({page}) => {
  await login(page, '/BIDDING_PROJECT', USERS.NHUNG);
  await search(page);

  await adjustment(page);
})

const saveForm = async ({
                          page,
                          dialog,
                          buttonName = 'Ghi lại',
                          url = '**/project/save',
                          successText = 'Thêm mới dự án thành công'
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
  await page.locator(`input[name="keySearch"]`).fill(name ? name : PROJECT_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/project/search') && response.status() === 200);
}

const createProject = async (page: Page, mainDialog: Locator, nameSearch?: string) => {
  if (nameSearch) {
    await search(page, nameSearch);
  }
  await fillText(mainDialog, 'projectName', nameSearch);
  await selectAutocompleteMulti(page, mainDialog, 'Chủ trương', 'Tìm kiếm chủ trương', POLICY_NAME, 'policy/doSearchDistinct');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await page.pause();
  await fillText(mainDialog, 'projectDecisionNumber', `QD_PD_DA_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'projectDate');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await selectOption(page, mainDialog, 'projectApprovedBy', '1. HĐQT');
  await saveForm({page, dialog: mainDialog});
}

const submitToAppraisal = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await search(page, nameSearch);
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định dự án'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '**/project/submit-to-appraiser',
    successText: 'Trình thẩm định thành công'
  })
}

const appraisal = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.PC, '/BIDDING_PROJECT')
    await search(page, nameSearch);
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  if (rowCount > 0) {
    const row = tableRow.first();
    await row.getByTitle('Thẩm định dự án', {exact: true}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định dự án'});
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '**/project/appraisal',
      successText: 'Thẩm định thành công'
    })

    if (rowCount > 1) {
      await loginWithRole(page, USERS.NHUNG, '/BIDDING_PROJECT')
      await search(page);
      for (let i = 0; i < rowCount; i++) {
        const row = tableRow.nth(i);
        const statusText = await row.locator('td').nth(4).innerText(); // cột "Trạng thái"
        if (i === 0)
          await expect(row.getByTitle('Điều chỉnh dự án')).toHaveCount(1);
        else
          await expect(row.getByTitle('Điều chỉnh dự án')).toHaveCount(0);
        expect(statusText.includes('3. Đã thẩm định')).toBeTruthy();
      }
    }
  }
}

const adjustment = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.PC, '/BIDDING_PROJECT')
    await search(page, nameSearch);
  }

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.getByTitle('Điều chỉnh dự án', {exact: true}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh thông tin dự án'});
  await fillText(mainDialog, 'projectName', `${PROJECT_NAME} DC ${rowCount}`);
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'projectDecisionNumber', `QD_DC_DA_TA_AUTOTEST_${rowCount + 1}_DC`);
  await selectDate(page, mainDialog, 'projectDate');
  await selectOption(page, mainDialog, 'projectApprovedBy', '1. HĐQT');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh dự án thành công'})
  rowCount = await tableRow.count();
  expect(rowCount > 1);

  let countStatusNew = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    const statusText = await row.locator('td').nth(4).innerText(); // cột "Trạng thái"
    if (statusText.includes('1. Mới tạo')) {
      countStatusNew++;

      // Kiểm tra có hiển thị nút điều chỉnh
      await expect(row.getByTitle('Điều chỉnh dự án')).not.toBeVisible();
    } else {
      // Các trạng thái khác không được phép có nút điều chỉnh
      await expect(row.getByTitle('Điều chỉnh dự án')).toHaveCount(0);
      expect(statusText.includes('3. Đã thẩm định')).toBeTruthy();
    }
  }

  // ✅ Chỉ được phép có đúng 1 dòng "Mới tạo"
  expect(countStatusNew).toBe(1);
}