import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {
  fillNumber,
  fillText,
  selectAutocompleteMulti,
  selectDate,
  selectFile,
  selectOption
} from '../../utils/fill.utils';

const NO = 1;
const SELECTION_PLAN_NAME = `TA autotest kế hoạch lựa chọn nhà thầu ${NO}`;
const POLICY_NAME = `TA autotest chủ trương 1 DC 1`;

test('create selection_plan/ new package/ investment project', async ({page}) => {
  const totalValue = 10000000;
  const packageCount = 3;
  const unit = 1_000_000;

  const baseValue = Math.floor(totalValue / packageCount / unit) * unit;
  let usedValue = 0;

  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  await selectOption(page, mainDialog, 'purpose', '2. Tạo mới gói thầu');
  await selectOption(page, mainDialog, 'inputSource', '1. Dự án đầu tư');
  await fillText(mainDialog, 'contractorSelectionPlanName', SELECTION_PLAN_NAME);
  await selectAutocompleteMulti(page, mainDialog, 'Mã chủ trương', 'Tìm kiếm chủ trương', POLICY_NAME, 'policy/doSearchLastVersion');
  await fillNumber(mainDialog, 'totalValue', ''+totalValue);
  await fillNumber(mainDialog, 'packageCount', ''+packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST_${NO}`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await selectFile(mainDialog, 'assets/files/sample.pdf');

  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  let tableRow = mainDialog.locator('tbody tr');
  let rowCount = await tableRow.count();
  const packageDialog = page.getByRole('dialog', {name: 'Thêm mới gói thầu'});
  expect(rowCount > 2);
  for (let i = 0; i < rowCount; i++) {
    let value = baseValue;
    const row = tableRow.nth(i);
    await row.getByTitle('Thêm', {exact: true}).click();
    await selectFile(packageDialog, 'assets/files/bieu_mau_tao_goi_thau.xlsx', '.xls, .xlsx')
    await packageDialog.getByRole('button', {name: 'Tải lên'}).click();
    const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
    await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import thành công');
    await alertSuccess.locator('.p-toast-icon-close').click();
    await fillText(mainDialog, 'contractorName', ` gói thầu ${i + 1}`);
    await fillNumber(mainDialog, 'projectApprovalValue', '2000000');
    await fillText(mainDialog, 'decisionNumber', `SO_QD_PD_DT_GT_${i + 1}`);
    await selectDate(page, mainDialog, 'decisionApprovalDate');
    await selectFile(mainDialog, 'assets/files/sample.pdf', '.pdf,.doc,.docx');
    if (i === packageCount - 1) {
      value = totalValue - usedValue;
      await fillNumber(mainDialog, 'contractorPrice', value.toString());
    }
    usedValue += value;
    await page.waitForTimeout(500);
    await packageDialog.getByRole('button', {name: 'Ghi lại'}).click();
  }

  await saveForm({page, dialog: mainDialog});
});

test('selection_plan submit to appraiser', async ({page}) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await search(page);

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0)
  const row = tableRow.first();
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Chốt'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận chốt kế hoạch lựa chọn nhà thầu'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '**/selection_plan/submit-to-appraiser',
    successText: 'Chốt thẩm định thành công'
  })
})

test('selection_plan adjustment', async ({page}) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await search(page);
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  const adjustmentButton = row.getByTitle('Điều chỉnh', {exact: true})
  await adjustmentButton.click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh kế hoạch lựa chọn nhà thầu'});
  await fillText(mainDialog, 'purchaseRequestName', `${SELECTION_PLAN_NAME} DC ${rowCount}`);
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh kế hoạch lựa chọn nhà thầu thành công'})
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
                          url = '**/selection_plan/create',
                          successText = 'Thêm mới kế hoạch lựa chọn nhà thầu thành công'
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
  await page.locator(`input[name="keySearch"]`).fill(SELECTION_PLAN_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor-selection-plan/doSearch') && response.status() === 200);
}