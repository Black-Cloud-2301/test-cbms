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
import {CBMS_MODULE} from '../../constants/common';

const SELECTION_PLAN_NAME = `TA autotest kế hoạch lựa chọn nhà thầu`;
const POLICY_NAME = `TA autotest chủ trương 1 DC 1`;
const PURCHASE_NAME = `TA autotest đề xuất mua sắm 2`;

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
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST`);
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

test('create selection_plan/ new package/ shopping full', async ({page}) => {
  test.setTimeout(180000)
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await search(page);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(3).innerText();
    const match = oldName.match(new RegExp(`Mua sắm ${SELECTION_PLAN_NAME} (\\d+)`, 'i'));
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = 'Mua sắm ' + SELECTION_PLAN_NAME + ` ${count}`;

  await createSelectionPlanNewPackageShopping(page, mainDialog, nameSearch);
  await submitToAppraiser(page, nameSearch);
  await appraisal(page, nameSearch);
});

test('create selection_plan/ new package/ shopping', async ({page}) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(3).innerText();
    const match = oldName.match(new RegExp(`Mua sắm ${SELECTION_PLAN_NAME} (\\d+)`, 'i'));
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = PURCHASE_NAME + ` ${count}`;

  await createSelectionPlanNewPackageShopping(page, mainDialog, nameSearch);
  await submitToAppraiser(page, nameSearch);
});

test('selection_plan submit to appraiser', async ({page}) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await search(page);

  await submitToAppraiser(page);
})

test('selection_plan appraiser', async ({page}) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.PC);
  await search(page);
  await appraisal(page);
})

const saveForm = async ({
                          page,
                          dialog,
                          buttonName = 'Ghi lại',
                          url = '/contractor-selection-plan/create',
                          successText = 'Thêm mới kế hoạch lựa chọn nhà thầu thành công'
                        }: SaveFormOptions) => {
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  // 👇 Đảm bảo click và response được theo dõi đồng thời
  const [res] = await Promise.all([
    page.waitForResponse(res =>
      res.url().includes(url) && res.status() === 200
    ),
    dialog.getByRole('button', { name: buttonName }).click()
  ]);

  const resJson = await res.json();
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
  await page.locator(`input[name="keySearch"]`).fill(name ? name : SELECTION_PLAN_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse((response) => {
    const urlMatch = response.url().includes(`${CBMS_MODULE}/contractor-selection-plan/doSearch`);
    const isOk = response.status() === 200;

    if (!urlMatch || !isOk) return false;

    const request = response.request();
    const postData = request.postDataJSON();

    return postData?.keySearch === (name ? name : SELECTION_PLAN_NAME);
  });
}

const createSelectionPlanNewPackageShopping = async (page, mainDialog: Locator, nameSearch?: string) => {
  const totalValue = 1000000;
  const packageCount = 3;
  const unit = 100_000;

  const baseValue = Math.floor(totalValue / packageCount / unit) * unit;
  let usedValue = 0;

  await selectOption(page, mainDialog, 'purpose', '2. Tạo mới gói thầu');
  await selectOption(page, mainDialog, 'inputSource', '2. Mua sắm thường xuyên');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);

  await mainDialog.locator('input[formcontrolname="purchaseRequestCode"]').click({force: true});
  const selectPurchaseDialog = page.getByRole('dialog', {name: 'Chọn đề xuất mua sắm'});
  await selectAutocompleteMulti(page, selectPurchaseDialog, 'Chọn đề xuất mua sắm', 'Tìm kiếm mã đề xuất mua sắm', PURCHASE_NAME, 'purchase/search-purchase');
  let tableRow = selectPurchaseDialog.locator('tbody tr');
  let rowCount = await tableRow.count();
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    await fillNumber(row, 'propositionPurchasePriceUse', '1000000');
  }
  await page.getByRole('button', {name: 'Ghi lại'}).click();
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST_MUA_SAM`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await selectFile(mainDialog, 'assets/files/sample.pdf');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  tableRow = mainDialog.locator('tbody tr');
  rowCount = await tableRow.count();
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
    await fillText(mainDialog, 'decisionNumber', `SO_QD_PD_DT_GT_${i + 1}`);
    await fillText(mainDialog, 'capitalDetails', `Nguồn vốn trên trời rơi xuống`);
    await selectDate(page, mainDialog, 'decisionApprovalDate');
    await selectFile(mainDialog, 'assets/files/sample.pdf', '.pdf,.doc,.docx');
    if (i === packageCount - 1) {
      value = totalValue - usedValue;
      await fillNumber(mainDialog, 'contractorPrice', value.toString());
      await fillNumber(mainDialog, 'projectApprovalValue', value.toString());
    } else {
      await fillNumber(mainDialog, 'contractorPrice', baseValue.toString());
      await fillNumber(mainDialog, 'projectApprovalValue', value.toString());
    }
    usedValue += value;
    await page.waitForTimeout(500);
    await packageDialog.getByRole('button', {name: 'Ghi lại'}).click();
  }
  await saveForm({page, dialog: mainDialog});
}

const submitToAppraiser = async (page, nameSearch?: string) => {
  if (nameSearch) {
    await search(page, nameSearch);
  }

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0)
  const row = tableRow.first();
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định KHLCNT'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '/contractor-selection-plan/submit-to-appraiser',
    successText: 'Trình thẩm định thành công'
  })
}

const appraisal = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.PC, '/CBMS_CONTRACTOR_SELECTION_PLAN')
    await search(page, nameSearch);
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  if (rowCount > 0) {
    const row = tableRow.first();
    await row.getByTitle('Thẩm định KHLCNT', {exact: true}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định KHLCNT'});
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '/contractor-selection-plan/appraisal',
      successText: 'Thẩm định thành công'
    })
  }
}