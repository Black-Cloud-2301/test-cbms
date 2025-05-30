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
import {CBMS_MODULE, URL_BE_BASE} from '../../constants/common';
import {
  checkSearchResponse,
  validateDataTable,
  validateInputNumber,
  validateInputText
} from '../../utils/validate.utils';
import {getGlobalVariable, screenshot, setGlobalVariable} from '../../utils';
import {IAppParam} from '../../constants/interface';
import {APP_PARAMS} from '../../constants/common/app-param.constants';
import {saveFileParam, setupAppParams} from '../../utils/params.utils';
import {validateSelectPlanTable} from '../../constants/validate-table/policy.constants';

const SELECTION_PLAN_NAME = `TA autotest kế hoạch lựa chọn nhà thầu`;

test.describe('test selection plan', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(180000);

  test('create selection_plan/ new package/ shopping full', async ({page}) => {
    test.setTimeout(180000)
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
    await search(page);
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    let count = 1;
    if (rowCount > 0) {
      const row = tableRow.first();
      const oldName = await row.locator('td').nth(4).innerText();
      const match = oldName.match(new RegExp(`Mua sắm ${SELECTION_PLAN_NAME} (\\d+)`, 'i'));
      count = match ? parseInt(match[1]) + 1 : 1;
    }
    const nameSearch = 'Mua sắm ' + SELECTION_PLAN_NAME + ` ${count}`;

    await createSelectionPlanNewPackageShopping(page, mainDialog, nameSearch);
    await submitToAppraiser(page, nameSearch);
    await appraisal(page, nameSearch);
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

  test('selection_plan search form', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
    let searchValue: string | number | number[] = 'autotest';
    let locator = page.locator('input#keySearch');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      searchObject: {keySearch: searchValue},
      validateInput: {locator, searchValue},
      conditions: [{fields: ['contractorSelectionPlanCode', 'contractorSelectionPlanName'], value: searchValue}]
    });
    await locator.clear();

    locator = page.locator('input#keySearchProject');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      searchObject: {keySearchProject: searchValue},
      validateInput: {locator, searchValue},
      conditions: [{fields: ['projectCode', 'projectName'], value: searchValue}]
    });
    await locator.clear();

    locator = page.locator('div#statusList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {statusList: null},
      conditions: [{fields: ['status']}]
    });
    await locator.locator('timesicon').locator('svg').click();

    locator = page.locator('div#inputSource');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      type: 'SELECT',
      validateInput: {locator},
      searchObject: {inputSource: null},
      conditions: [{fields: ['inputSource']}]
    });

    locator = page.locator('div#searchPage');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      type: 'AUTOCOMPLETE_MULTI',
      validateInput: {
        locator,
        searchValue: 'Giang Thị Nhung',
        title: 'Người tạo',
        dialogTitle: 'Tìm kiếm người tạo',
        apiUrl: 'sysUser/search'
      },
      searchObject: {createdBy: 950095745},
      conditions: [{fields: ['createdBy'], value: 950095745, match: 'EXACT'}]
    });
    await locator.locator('input[name="createdBy"]').clear();

    // locator = page.locator('div#searchPage');
    // await checkSearchResponse({
    //   page,
    //   url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
    //   type: 'AUTOCOMPLETE_MULTI',
    //   validateInput: {
    //     locator,
    //     searchValue: 'Trung tâm Cẩm Mỹ - Xuân Lộc',
    //     title: 'Đơn vị tạo',
    //     dialogTitle: 'Tìm kiếm đơn vị tạo',
    //     apiUrl: 'sysGroup/search'
    //   },
    //   searchObject: {sysGroupId: 9008106},
    //   conditions: [{fields: ['sysGroupId'], value: 9008106, match: 'EXACT'}]
    // });
    // await locator.locator('input[name="sysGroupId"]').clear();


    locator = page.locator('div#searchPage');
    const now = new Date();
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      searchObject: {createdAtFrom: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });

    locator = page.locator('div#searchPage');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      searchObject: {createdAtTo: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });

    locator = page.locator('input#totalValueFrom');
    searchValue = 10000000;
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      searchObject: {totalValueFrom: searchValue},
      type: 'CURRENCY',
      validateInput: {locator, searchValue, maxLength: 13},
      conditions: [{fields: ['totalValue'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });
    await locator.clear();

    locator = page.locator('input#totalValueTo');
    searchValue = 100000000;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/contractor-selection-plan/doSearch',
      searchObject: {totalValueTo: searchValue},
      type: 'CURRENCY',
      validateInput: {locator, searchValue, maxLength: 13},
      conditions: [{fields: ['totalValue'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
    await locator.clear();
  })

  test('table pageable - ID từ response không trùng', async ({page}) => {
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');

    const pageable = page.locator('span.p-paginator-pages');
    const pageButtons = pageable.locator('button');
    const seenIds = new Set<string>();

    const pageCount = await pageButtons.count();

    for (let i = 0; i < pageCount; i++) {
      const [res] = await Promise.all([
        page.waitForResponse(res =>
          res.url().includes('/contractor-selection-plan/doSearch') && res.status() === 200
        ),
        pageButtons.nth(i).click()
      ]);

      const responseData = await res.json();
      const items = responseData.data?.content ?? responseData.data.content ?? responseData.data ?? [];

      for (const item of items) {
        const id = String(item.id); // đảm bảo là string để Set hoạt động ổn định
        const isDuplicate = seenIds.has(id);

        // ✅ Expect: không được trùng
        if (isDuplicate) {
          console.log(`🔴 Trùng ID '${id}' tại trang ${i + 1}`);
          await screenshot(page, 'purchase')
          expect(isDuplicate).toBeFalsy();
        }

        seenIds.add(id);
      }
    }

    await page.getByRole('combobox', {name: 'Rows per page'}).click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', {name: '100'}).click();
    const res = await page.waitForResponse(res =>
      res.url().includes('/contractor-selection-plan/doSearch') && res.status() === 200
    )
    const responseData = await res.json();
    expect(responseData.type).toEqual('SUCCESS');
    const totalElements = await responseData.data?.totalElements;
    expect(totalElements).toEqual(responseData.data?.totalElements);

    let tableRow = page.locator('tbody tr');
    let countBidder = await tableRow.count();

    if (totalElements > 100) {
      expect(countBidder).toEqual(100);
    } else {
      expect(countBidder).toEqual(totalElements);
    }
  });

  test('table visible', async ({page}) => {
    const dataByParType: Record<string, IAppParam[]> = APP_PARAMS;
    await setupAppParams(page, dataByParType);
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validateSelectPlanTable, dataByParType);
  });

  test('validate form', async ({page}) => {
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const dialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
    await selectOption(page, dialog, 'purpose', '2. Tạo mới gói thầu');
    await selectOption(page, dialog, 'inputSource', '2. Mua sắm thường xuyên');
    let locator = dialog.locator('input#contractorSelectionPlanName');
    await validateInputText({locator});
    await dialog.locator('input[formcontrolname="purchaseRequestCode"]').click({force: true});
    const selectPurchaseDialog = page.getByRole('dialog', {name: 'Chọn đề xuất mua sắm'});
    await selectAutocompleteMulti(page, selectPurchaseDialog, 'Chọn đề xuất mua sắm', 'Tìm kiếm mã đề xuất mua sắm', getGlobalVariable('purchaseName'), 'purchase/search-purchase');
    let tableRow = selectPurchaseDialog.locator('tbody tr');
    let rowCount = await tableRow.count();
    for (let i = 0; i < rowCount; i++) {
      const row = tableRow.nth(i);
      await fillNumber(row, 'propositionPurchasePriceUse', '1000000');
    }
    await page.getByRole('button', {name: 'Ghi lại'}).click();
    locator = dialog.locator('input#totalValue');
    await validateInputNumber({locator});
    locator = dialog.locator('input#packageCount');
    await validateInputNumber({locator});
    locator = dialog.locator('input#decisionNumber');
    await validateInputText({locator, maxLength: 100});
    await selectDate(page, dialog, 'decisionApprovalDate');
    await dialog.locator('input[type="file"]').setInputFiles('assets/files/sample.pdf');
    await page.getByRole('button', {name: 'Tiếp'}).click();
    // await page.pause();
  });
})

test('create selection_plan/ new package/ investment project', async ({page}) => {
  const totalValue = 10000000;
  const packageCount = 3;

  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
  await search(page);

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(4).innerText();
    const match = oldName.match(new RegExp(`${SELECTION_PLAN_NAME} (\\d+)`, 'i'));
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = SELECTION_PLAN_NAME + ` ${count}`;

  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  await selectOption(page, mainDialog, 'purpose', '2. Tạo mới gói thầu');
  await selectOption(page, mainDialog, 'inputSource', '1. Dự án đầu tư');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);
  await selectAutocompleteMulti(page, mainDialog, 'Mã chủ trương', 'Tìm kiếm chủ trương', getGlobalVariable('lastPolicyName'), 'policy/doSearchLastVersion');
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await selectFile({locator: mainDialog, value: 'assets/files/sample.pdf', fileType: '01'});
  await selectFile({locator: mainDialog, value: 'assets/files/sample-1.pdf', fileType: '02'});
  await selectFile({locator: mainDialog, value: 'assets/files/sample-2.pdf', fileType: '03'});

  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await createContractor(page, mainDialog, totalValue, packageCount);
  await saveForm({page, dialog: mainDialog});

  await submitToAppraiser(page, nameSearch);
  await appraisal(page, nameSearch);
});


test('create selection_plan/ adjust/ investment project', async ({page}) => {
  test.setTimeout(180000);
  const totalValue = 10000000;
  const packageCount = 3;

  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  await selectOption(page, mainDialog, 'purpose', '1. Điều chỉnh gói thầu');
  await selectOption(page, mainDialog, 'inputSource', '1. Dự án đầu tư');
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(4).innerText();
    const match = oldName.match(new RegExp(`${SELECTION_PLAN_NAME} (\\d+)`, 'i'));
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = SELECTION_PLAN_NAME + ` ${count}`;
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);
  await selectAutocompleteMulti(page, mainDialog, 'Mã chủ trương', 'Tìm kiếm chủ trương', getGlobalVariable('lastPolicyName'), 'policy/doSearchLastVersion');
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await mainDialog.locator('input-v2').filter({hasText: 'Gói sửa đổi *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti(page, mainDialog, 'Gói thầu sửa đổi', 'Tìm kiếm gói thầu sửa đổi', 'TA autotest 11', '/contractor/doSearch');
  await mainDialog.locator('input-v2').filter({hasText: 'Gói thầu hủy *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti(page, mainDialog, 'Gói thầu hủy', 'Tìm kiếm gói thầu hủy', 'TA autotest 12', '/contractor/doSearch');
  await fillText(mainDialog, 'decisionNumberModify', `SO_QD_BH_SD_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDateModify');
  await selectFile({locator: mainDialog, value: 'assets/files/sample.pdf', fileType: '01'});
  await selectFile({locator: mainDialog, value: 'assets/files/sample-1.pdf', fileType: '02'});
  await selectFile({locator: mainDialog, value: 'assets/files/sample-2.pdf', fileType: '03'});
  await page.pause();
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();

  await createContractor(page, mainDialog, totalValue, packageCount);

  await saveForm({page, dialog: mainDialog});
});

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
    dialog.getByRole('button', {name: buttonName}).click()
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

  await selectOption(page, mainDialog, 'purpose', '2. Tạo mới gói thầu');
  await selectOption(page, mainDialog, 'inputSource', '2. Mua sắm thường xuyên');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);

  await mainDialog.locator('input[formcontrolname="purchaseRequestCode"]').click({force: true});
  const selectPurchaseDialog = page.getByRole('dialog', {name: 'Chọn đề xuất mua sắm'});
  await selectAutocompleteMulti(page, selectPurchaseDialog, 'Chọn đề xuất mua sắm', 'Tìm kiếm mã đề xuất mua sắm', getGlobalVariable('lastPurchaseName'), 'purchase/search-purchase');
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
  await selectFile({locator: mainDialog, value: 'assets/files/sample.pdf', fileType: '01'});
  await selectFile({locator: mainDialog, value: 'assets/files/sample-1.pdf', fileType: '02'});
  await selectFile({locator: mainDialog, value: 'assets/files/sample-2.pdf', fileType: '03'});
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await page.pause();
  await createContractor(page, mainDialog, totalValue, packageCount);
  await page.pause();
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
    await row.getByTitle('Xem chi tiết', {exact: true}).click();
    await page.getByRole('button', {name: 'Thẩm định'}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định KHLCNT'});
    await page.pause();
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '/contractor-selection-plan/appraisal',
      successText: 'Thẩm định thành công'
    })
    setGlobalVariable('lastSelectionPlanName', nameSearch);
  }
}

const createContractor = async (page: Page, mainDialog: Locator, totalValue: number, packageCount: number) => {
  const unit = 1000_000;
  const baseValue = Math.floor(totalValue / packageCount / unit) * unit;
  let usedValue = 0;

  let tableRow = mainDialog.locator('tbody tr');
  let rowCount = await tableRow.count();
  const packageDialog = page.getByRole('dialog', {name: 'Thêm mới gói thầu'});
  expect(rowCount > 2);
  for (let i = 0; i < rowCount; i++) {
    let value = baseValue;
    const row = tableRow.nth(i);
    await row.getByTitle('Chỉnh sửa', {exact: true}).click();
    await selectFile({locator: packageDialog, value: 'assets/files/bieu_mau_tao_goi_thau.xlsx', accept: '.xls, .xlsx'})
    await packageDialog.getByRole('button', {name: 'Tải lên'}).click();
    const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
    await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import thành công');
    await alertSuccess.locator('.p-toast-icon-close').click();
    const match = getGlobalVariable('lastContractorName').match(new RegExp(`TA autotest (\\d+)`, 'i'));
    const count = match ? parseInt(match[1]) + 1 : 1;
    const contractorName = `TA autotest ${count}`;
    await fillText(mainDialog, 'contractorName', contractorName);
    // await fillText(mainDialog, 'capitalDetails', `Nguồn vốn trên trời rơi xuống`);
    // await fillText(mainDialog, 'decisionNumber', `SO_QD_PD_DT_GT_${i + 1}`);
    // await selectDate(page, mainDialog, 'decisionApprovalDate');
    // await selectFile(mainDialog, 'assets/files/sample.pdf', '.pdf,.doc,.docx');
    if (i === packageCount - 1) {
      value = totalValue - usedValue;
      await fillNumber(mainDialog, 'contractorPrice', value.toString());
      // await fillNumber(mainDialog, 'projectApprovalValue', value.toString());
    } else {
      await fillNumber(mainDialog, 'contractorPrice', baseValue.toString());
      // await fillNumber(mainDialog, 'projectApprovalValue', value.toString());
    }
    usedValue += value;
    await page.waitForTimeout(500);
    await packageDialog.getByRole('button', {name: 'Ghi lại'}).click();
    setGlobalVariable('lastContractorName', contractorName);
  }
}