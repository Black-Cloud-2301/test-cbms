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
import {CBMS_MODULE, CONTRACTOR_STATUS, SELECT_CONTRACTOR_FORM_TYPE, URL_BE_BASE} from '../../constants/common';
import {
  checkSearchResponse,
  validateDataTable,
  validateInputNumber,
  validateInputText
} from '../../utils/validate.utils';
import {bumpMainSerial, getGlobalVariable, screenshot, setGlobalVariable} from '../../utils';
import {IAppParam} from '../../constants/interface';
import {APP_PARAMS} from '../../constants/common/app-param.constants';
import {saveFileParam, setupAppParams} from '../../utils/params.utils';
import {validateSelectPlanTable} from '../../constants/validate-table/policy.constants';
import {getAvailableContractorInvest} from '../phase_2/full_follow.spec';
import {getAvailablePurchase} from './purchase.spec';
import {getAvailableCostSubmission} from './cost-submission.spec';

test.describe('test selection plan', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(180000);

  test('create selection_plan/ new package/ shopping full', async ({page}) => {
    test.setTimeout(180000)
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
    await searchSelectionPlan({page});
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    let count = 1;
    if (rowCount > 0) {
      const row = tableRow.first();
      const oldName = await row.locator('td').nth(4).innerText();
      const match = oldName.match(new RegExp(`${getGlobalVariable('contractorPlanName')} (\\d+)`, 'i'));
      count = match ? parseInt(match[1]) + 1 : 1;
    }
    const nameSearch = getGlobalVariable('contractorPlanName') + ` ${count}` + ' mua sắm';

    await createSelectionPlanNewPackageShopping(page, mainDialog, nameSearch);
    await appraiserSelectionPlanShopping({page, nameSearch});
    // await appraisalSelectionPlan({page, nameSearch});
  });

  /*  test('selection_plan submit to appraiser', async ({page}) => {
      await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.NHUNG);
      await search(page);

      await submitToAppraiser(page);
    })

    test('selection_plan appraiser', async ({page}) => {
      await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN', USERS.PC);
      await search(page);
      await appraisal(page);
    })*/

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
      validateInput: {locator, searchValue},
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
      validateInput: {locator, searchValue},
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
    await selectAutocompleteMulti({
      page,
      locator: selectPurchaseDialog,
      title: 'Chọn đề xuất mua sắm',
      dialogTitle: 'Tìm kiếm mã đề xuất mua sắm',
      value: getGlobalVariable('purchaseName'),
      api: 'purchase/search-purchase'
    });
    /*let tableRow = selectPurchaseDialog.locator('tbody tr');
    let rowCount = await tableRow.count();
    for (let i = 0; i < rowCount; i++) {
      const row = tableRow.nth(i);
      await fillNumber(row, 'propositionPurchasePriceUse', '1000000');
    }*/
    await selectPurchaseDialog.getByRole('button', {name: 'Ghi lại'}).click();
    locator = dialog.locator('input#totalValue');
    await validateInputNumber({locator});
    locator = dialog.locator('input#packageCount');
    await validateInputNumber({locator, maxLength: 3});
    locator = dialog.locator('input#decisionNumber');
    await validateInputText({locator, maxLength: 100});
    await selectDate(page, dialog, 'decisionApprovalDate');
    await dialog.locator('input[type="file"]').setInputFiles('assets/files/sample.pdf');
    await page.getByRole('button', {name: 'Tiếp'}).click();
    // await page.pause();
  });

  test('delete selection plan', async ({page}) => {
    test.setTimeout(180000)
    await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
    await searchSelectionPlan({page});
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    let count = 1;
    if (rowCount > 0) {
      const row = tableRow.first();
      const oldName = await row.locator('td').nth(4).innerText();
      const match = oldName.match(new RegExp(`${getGlobalVariable('contractorPlanName')} (\\d+)`, 'i'));
      count = match ? parseInt(match[1]) + 1 : 1;
    }
    const nameSearch = getGlobalVariable('contractorPlanName') + ` ${count}` + ' mua sắm';

    await createSelectionPlanNewPackageShopping(page, mainDialog, nameSearch);
    await deleteSelectionPlan(page, nameSearch);
    await checkContractorDeleted(page);
  });
})

test('create selection_plan/ new package/ investment project', async ({page}) => {
  const totalValue = 10000000;
  const packageCount = 3;
  const nameSearch = await createSelectionPlanNewPackageInvest(page, totalValue, packageCount);
  await submitToAppraiserSelectionPlan({page, nameSearch});
  await appraisalSelectionPlan({page, nameSearch});
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
    const match = oldName.match(new RegExp(`${getGlobalVariable('contractorPlanName')} (\\d+)`, 'i'));
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = getGlobalVariable('contractorPlanName') + ` ${count}`;
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Mã chủ trương',
    dialogTitle: 'Tìm kiếm chủ trương',
    value: getGlobalVariable('lastPolicyName'),
    api: 'policy/doSearchLastVersion'
  });
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await mainDialog.locator('input-v2').filter({hasText: 'Gói sửa đổi *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Gói thầu sửa đổi',
    dialogTitle: 'Tìm kiếm gói thầu sửa đổi',
    value: 'TA autotest',
    api: '/contractor/doSearch'
  });
  await mainDialog.locator('input-v2').filter({hasText: 'Gói thầu hủy *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Gói thầu hủy',
    dialogTitle: 'Tìm kiếm gói thầu hủy',
    value: 'TA autotest ',
    api: '/contractor/doSearch'
  });
  await fillText(mainDialog, 'decisionNumberModify', `SO_QD_BH_SD_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDateModify');
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample.pdf',
    fileType: 'Tờ trình xin phê duyệt KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-1.pdf',
    fileType: 'Báo cáo thẩm định KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-2.pdf',
    fileType: 'Quyết định phê duyệt KHLCNT'
  });
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();

  await createContractor({page, mainDialog, totalValue, contractorSelectionPlanName: nameSearch, packageCount});

  await page.pause();
  await saveForm({page, dialog: mainDialog});
});


test('create selection_plan/ adjust/ shopping', async ({page}) => {
  test.setTimeout(180000)
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN');
  await searchSelectionPlan({page});
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  let count = 1;
  if (rowCount > 0) {
    const row = tableRow.first();
    const oldName = await row.locator('td').nth(4).innerText();
    const match = oldName.match(new RegExp(`${getGlobalVariable('contractorPlanName')} (\\d+)`, 'i'));
    count = match ? parseInt(match[1]) + 1 : 1;
  }
  const nameSearch = getGlobalVariable('contractorPlanName') + ` ${count}` + ' mua sắm';

  await createSelectionPlanAdjustmentShopping(page, mainDialog, nameSearch);
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

export const searchSelectionPlan = async ({page, nameSearch, url = '/contractor-selection-plan/doSearch'}: {
  page: Page,
  nameSearch?: string,
  url?: string
}) => {
  await page.locator(`input[name="keySearch"]`).fill(nameSearch ? nameSearch : getGlobalVariable('contractorPlanName'));
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse((response) => {
    const urlMatch = response.url().includes(`${CBMS_MODULE}${url}`);
    const isOk = response.status() === 200;

    if (!urlMatch || !isOk) return false;

    const request = response.request();
    const postData = request.postDataJSON();

    return postData?.keySearch === (nameSearch ? nameSearch : getGlobalVariable('contractorPlanName'));
  });
}

export const createSelectionPlanNewPackageShopping = async (page, mainDialog: Locator, nameSearch?: string) => {
  const totalValue = 10000000;
  const packageCount = 4;

  await selectOption(page, mainDialog, 'purpose', '2. Tạo mới gói thầu');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);

  await mainDialog.locator('input[formcontrolname="purchaseRequestCode"]').click({force: true});
  const selectPurchaseDialog = page.getByRole('dialog', {name: 'Chọn đề xuất mua sắm'});
  await selectAutocompleteMulti({
    page,
    locator: selectPurchaseDialog,
    title: 'Chọn đề xuất mua sắm',
    dialogTitle: 'Tìm kiếm mã đề xuất mua sắm',
    value: getAvailablePurchase({status: CONTRACTOR_STATUS.APPRAISED, notInCostSubmission: true}).name,
    api: 'purchase/searchPurchase',
    multiple: true
  });
  await page.getByRole('button', {name: 'Ghi lại'}).click();
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Mã tờ trình dự toán',
    dialogTitle: 'Tìm kiếm tờ trình dự toán',
    value: getAvailableCostSubmission({status: CONTRACTOR_STATUS.APPRAISED}).name,
    api: 'cost-submission/doSearch',
  });
  /*let tableRow = selectPurchaseDialog.locator('tbody tr');
  let rowCount = await tableRow.count();
  for (let i = 0; i < rowCount; i++) {
  const row = tableRow.nth(i);
  await fillNumber(row, 'propositionPurchasePriceUse', '10000000');
}*/
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST_MUA_SAM`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  // await page.pause();
  await createContractor({
    page,
    mainDialog,
    totalValue,
    contractorSelectionPlanName: nameSearch,
    packageCount,
    invest: false
  });
  await saveForm({page, dialog: mainDialog});
}

export const createSelectionPlanAdjustmentShopping = async (page, mainDialog: Locator, nameSearch?: string) => {
  const totalValue = 10000000;
  const packageCount = 3;

  await selectOption(page, mainDialog, 'purpose', '1. Điều chỉnh gói thầu');
  await selectOption(page, mainDialog, 'inputSource', '2. Mua sắm thường xuyên');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);

  await mainDialog.locator('input[formcontrolname="purchaseRequestCode"]').click({force: true});
  const selectPurchaseDialog = page.getByRole('dialog', {name: 'Chọn đề xuất mua sắm'});
  await selectAutocompleteMulti({
    page,
    locator: selectPurchaseDialog,
    title: 'Chọn đề xuất mua sắm',
    dialogTitle: 'Tìm kiếm mã đề xuất mua sắm',
    value: getGlobalVariable('lastPurchaseName'),
    api: 'purchase/searchPurchase',
    multiple: true
  });
  let tableRow = selectPurchaseDialog.locator('tbody tr');
  let rowCount = await tableRow.count();
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    await fillNumber(row, 'propositionPurchasePriceUse', '10000000');
  }
  await page.getByRole('button', {name: 'Ghi lại'}).click();
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST_MUA_SAM`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await mainDialog.locator('input-v2').filter({hasText: 'Gói sửa đổi *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Gói thầu sửa đổi',
    dialogTitle: 'Tìm kiếm gói thầu sửa đổi',
    value: 'TA autotest',
    api: '/contractor/doSearch'
  });
  await mainDialog.locator('input-v2').filter({hasText: 'Gói thầu hủy *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Gói thầu hủy',
    dialogTitle: 'Tìm kiếm gói thầu hủy',
    value: 'TA autotest ',
    api: '/contractor/doSearch'
  });
  await fillText(mainDialog, 'decisionNumberModify', `SO_QD_BH_SD_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDateModify');
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample.pdf',
    fileType: 'Tờ trình xin phê duyệt KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-1.pdf',
    fileType: 'Báo cáo thẩm định KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-2.pdf',
    fileType: 'Quyết định phê duyệt KHLCNT'
  });
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await page.pause();
  await createContractor({page, mainDialog, totalValue, contractorSelectionPlanName: nameSearch, packageCount});
  await saveForm({page, dialog: mainDialog});
}

export const submitToAppraiserSelectionPlan = async ({page, nameSearch}: {
  page: Page, nameSearch?: string
}) => {
  if (nameSearch) {
    await searchSelectionPlan({page, nameSearch});
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
    url: '/contractor-selection-plan/submitToAppraiser',
    successText: 'Trình thẩm định thành công'
  })
}

export const appraiserSelectionPlanShopping = async ({page, nameSearch}: {
  page: Page, nameSearch?: string
}) => {
  if (nameSearch) {
    await searchSelectionPlan({page, nameSearch});
  }

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0)
  const row = tableRow.first();
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Phê duyệt'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận phê duyệt KHLCNT'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '/contractor-selection-plan/appraisalPurchases',
    successText: 'Phê duyệt thành công'
  })

  const listContractor = getGlobalVariable('listContractorPurchase');
  const updatedList = listContractor.map(c => {
    if (c.status === CONTRACTOR_STATUS.NEW && c.contractorSelectionPlanName === nameSearch) {
      return {...c, status: CONTRACTOR_STATUS.APPRAISED};
    }
    return c;
  });
  setGlobalVariable('listContractorPurchase', updatedList);
}

export const appraisalSelectionPlan = async ({page, nameSearch, type = 'INVEST'}: {
  page: Page, nameSearch?: string, type?: 'INVEST' | 'PURCHASE'
}) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.PC, `/CBMS_CONTRACTOR_SELECTION_PLAN_${type}`)
    await searchSelectionPlan({page, nameSearch: nameSearch});
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  if (rowCount > 0) {
    const row = tableRow.first();
    await row.getByTitle('Xem chi tiết', {exact: true}).click();
    await page.getByRole('button', {name: 'Thẩm định'}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định KHLCNT'});
    // await page.pause();
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '/contractor-selection-plan/appraisal',
      successText: 'Thẩm định thành công'
    })
    setGlobalVariable('lastSelectionPlanName', nameSearch);
    const listContractor = getGlobalVariable('listContractorInvest');
    const updatedList = listContractor.map(c => {
      if (c.status === 'NEW' && c.contractorSelectionPlanName === nameSearch) {
        return {...c, status: CONTRACTOR_STATUS.APPRAISED};
      }
      return c;
    });
    setGlobalVariable('listContractorInvest', updatedList);
  }
}

const createContractor = async ({
                                  page,
                                  mainDialog,
                                  totalValue,
                                  packageCount,
                                  contractorSelectionPlanName,
                                  invest = true
                                }: {
  page: Page,
  mainDialog: Locator,
  totalValue: number,
  packageCount: number,
  contractorSelectionPlanName: string;
  invest?: boolean;
}) => {
  const unit = 1000_000;
  const baseValue = Math.floor(totalValue / packageCount / unit) * unit;
  let usedValue = 0;

  let tableRow = mainDialog.getByRole('table').first().locator('tbody tr');
  let rowCount = await tableRow.count();
  const packageDialog = page.getByRole('dialog', {name: 'Thêm mới gói thầu'});

  expect(rowCount > 0);
  for (let i = 0; i < rowCount; i++) {
    let value = baseValue;
    const row = tableRow.nth(i);
    await row.getByTitle('Chỉnh sửa', {exact: true}).click();
    await selectFile({
      page,
      locator: packageDialog,
      value: invest ? 'assets/files/bieu_mau_tao_goi_thau_invest.xlsx' : 'assets/files/bieu_mau_tao_goi_thau_mua_sam.xlsx',
      accept: '.xls, .xlsx'
    })
    await packageDialog.getByRole('button', {name: 'Tải lên'}).click();
    const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
    await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import thành công');
    await alertSuccess.locator('.p-toast-icon-close').click();
    const match = getGlobalVariable('lastContractorName').match(new RegExp(`TA autotest (\\d+)`, 'i'));
    const count = match ? parseInt(match[1]) + 1 : 1;
    const contractorName = `TA autotest ${count}`;
    await fillText(packageDialog, 'contractorName', contractorName);
    // await fillText(mainDialog, 'capitalDetails', `Nguồn vốn trên trời rơi xuống`);
    // await fillText(mainDialog, 'decisionNumber', `SO_QD_PD_DT_GT_${i + 1}`);
    // await selectDate(page, mainDialog, 'decisionApprovalDate');
    // await selectFile(mainDialog, 'assets/files/sample.pdf', '.pdf,.doc,.docx');
    let contractorValue = baseValue;
    if (i === packageCount - 1) {
      value = totalValue - usedValue;
      contractorValue = value;
      await fillNumber(packageDialog, 'contractorPrice', value.toString());
      // await fillNumber(mainDialog, 'projectApprovalValue', value.toString());
    } else {
      await fillNumber(packageDialog, 'contractorPrice', baseValue.toString());
      // await fillNumber(mainDialog, 'projectApprovalValue', value.toString());
    }
    usedValue += value;
    await page.waitForTimeout(500);
    let selectContractorFormValue = 'Đấu thầu rộng rãi';
    let selectContractorForm = 'DTRR';
    if (i % 4 === 1) {
      selectContractorFormValue = 'Chỉ định thầu';
      selectContractorForm = 'CDT';
    } else if (i % 4 === 2) {
      selectContractorFormValue = 'Hợp đồng trực tiếp';
      selectContractorForm = 'HDTT';
    } else if (i % 4 === 3) {
      selectContractorFormValue = 'Không hình thành gói thầu';
      selectContractorForm = 'KHTGT';
    }

    await selectOption(page, packageDialog, 'selectContractorForm', selectContractorFormValue);
    await packageDialog.getByRole('button', {name: 'Ghi lại'}).click();
    const listContractor = getGlobalVariable(invest ? 'listContractorInvest' : 'listContractorPurchase');
    setGlobalVariable(invest ? 'listContractorInvest' : 'listContractorPurchase', [...listContractor, {
      name: contractorName,
      totalValue: contractorValue,
      status: CONTRACTOR_STATUS.NEW,
      contractorSelectionPlanName: contractorSelectionPlanName,
      selectContractorForm
    }]);
    setGlobalVariable('lastContractorName', contractorName);
  }
}

const deleteSelectionPlan = async (page: Page, name?: string) => {
  if (name) {
    await searchSelectionPlan({page, nameSearch: name});

    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    expect(rowCount > 0)
    const row = tableRow.first();
    await row.getByTitle('Xóa').click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận xóa KHLCNT'});
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '/contractor-selection-plan/delete',
      successText: 'Xóa kế hoạch lựa chọn nhà thầu thành công'
    })
  }
}

const checkContractorDeleted = async (page: Page) => {
  await page.goto('CBMS_DOCUMENT_BY_PID');
  await searchSelectionPlan({page, nameSearch: getGlobalVariable('lastContractorName'), url: '/contractor/doSearch'});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount).toBe(1);
  const row = tableRow.first();
  await expect(row.locator('td')).toHaveText('Không có dữ liệu');
}

export const createSelectionPlanNewPackageInvest = async (page: Page, totalValue: number, packageCount: number) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN_INVEST', USERS.NHUNG);
  await searchSelectionPlan({page});

  let tableRow = page.locator('tbody tr');
  let nameSearch: string;

  const row = tableRow.first();
  const content = await row.locator('td').first().innerText();
  if (content.includes('Không có dữ liệu')) {
    nameSearch = getGlobalVariable('contractorPlanName') + ` 1`
  } else {
    const oldName = await row.locator('td').nth(4).innerText();
    nameSearch = bumpMainSerial(oldName);
  }
  await page.getByRole('button', {name: 'Thêm mới'}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
  await selectOption(page, mainDialog, 'purpose', '2. Tạo mới gói thầu');
  // await selectOption(page, mainDialog, 'inputSource', '1. Dự án đầu tư');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Mã chủ trương',
    dialogTitle: 'Tìm kiếm chủ trương',
    value: getGlobalVariable('lastPolicyName'),
    api: 'policy/doSearchLastVersion'
  });
  await page.waitForTimeout(1000);
  await fillNumber(mainDialog, 'totalValue', '' + totalValue);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample.pdf',
    fileType: 'Tờ trình xin phê duyệt KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-1.pdf',
    fileType: 'Báo cáo thẩm định KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-2.pdf',
    fileType: 'Quyết định phê duyệt KHLCNT'
  });

  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  // await page.pause();
  await createContractor({page, mainDialog, totalValue, contractorSelectionPlanName: nameSearch, packageCount});
  await saveForm({page, dialog: mainDialog});
  return nameSearch;
}

export const createSelectionPlanAdjustmentInvest = async (page: Page, totalValue: number, packageCount: number) => {
  await login(page, '/CBMS_CONTRACTOR_SELECTION_PLAN_INVEST', USERS.NHUNG);
  await searchSelectionPlan({page});
  const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});

  let tableRow = page.locator('tbody tr');
  let nameSearch: string;

  const row = tableRow.first();
  const content = await row.locator('td').first().innerText();
  if (content.includes('Không có dữ liệu')) {
    nameSearch = getGlobalVariable('policyName') + ` 1`
  } else {
    const oldName = await row.locator('td').nth(4).innerText();
    nameSearch = bumpMainSerial(oldName);
  }

  await page.getByRole('button', {name: 'Thêm mới'}).click();

  await selectOption(page, mainDialog, 'purpose', '1. Điều chỉnh gói thầu');
  await fillText(mainDialog, 'contractorSelectionPlanName', nameSearch);

  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Mã chủ trương',
    dialogTitle: 'Tìm kiếm chủ trương',
    value: getGlobalVariable('lastPolicyName'),
    api: 'policy/doSearchLastVersion'
  });
  await page.waitForTimeout(1000);
  await fillNumber(mainDialog, 'packageCount', '' + packageCount);
  await fillText(mainDialog, 'decisionNumber', `SO_QD_BH_KHLCNT_TA_AUTOTEST_MUA_SAM`);
  await selectDate(page, mainDialog, 'decisionApprovalDate');
  await mainDialog.locator('input-v2').filter({hasText: 'Gói sửa đổi *'}).locator('p-checkbox div').nth(2).click();
  const editContractor = getAvailableContractorInvest({status: CONTRACTOR_STATUS.APPRAISED});
  await fillNumber(mainDialog, 'totalValue', '' + (totalValue + editContractor.totalValue));
  const deleteContractor = getAvailableContractorInvest({status: CONTRACTOR_STATUS.APPRAISED, index: 1});
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Gói thầu sửa đổi',
    dialogTitle: 'Tìm kiếm gói thầu sửa đổi',
    value: editContractor.name,
    api: '/contractor/doSearch'
  });
  await mainDialog.locator('input-v2').filter({hasText: 'Gói thầu hủy *'}).locator('p-checkbox div').nth(2).click();
  await selectAutocompleteMulti({
    page,
    locator: mainDialog,
    title: 'Gói thầu hủy',
    dialogTitle: 'Tìm kiếm gói thầu hủy',
    value: deleteContractor.name,
    api: '/contractor/doSearch'
  });
  await fillText(mainDialog, 'decisionNumberModify', `SO_QD_BH_SD_KHLCNT_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionApprovalDateModify');
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample.pdf',
    fileType: 'Tờ trình xin phê duyệt KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-1.pdf',
    fileType: 'Báo cáo thẩm định KHLCNT'
  });
  await selectFile({
    page,
    locator: mainDialog,
    value: 'assets/files/sample-2.pdf',
    fileType: 'Quyết định phê duyệt KHLCNT'
  });
await page.pause()

  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  // await page.pause();
  await createContractor({page, mainDialog, totalValue, contractorSelectionPlanName: nameSearch, packageCount});
  const newContractorName = await updateContractor(page, mainDialog);
  await mainDialog.locator('input[name="reason"]').fill('Thích');
  await saveForm({page, dialog: mainDialog});

  const listContractor = getGlobalVariable('listContractorInvest');
  const updatedList = listContractor.flatMap(c => {
    const isAppraised = c.status === CONTRACTOR_STATUS.APPRAISED;

    // 🚩 Trường hợp EDIT: đổi status + sinh thêm bản ghi mới
    if (isAppraised && c.name === editContractor.name) {
      return [
        {...c, status: CONTRACTOR_STATUS.ADJUSTMENT}, // bản ghi cũ (đã chỉnh)
        {...c, name: newContractorName}               // bản ghi mới
      ];
    }

    // 🚩 Trường hợp DELETE: chỉ đổi status, KHÔNG thêm bản ghi
    if (isAppraised && c.name === deleteContractor.name) {
      return {...c, status: CONTRACTOR_STATUS.ADJUSTMENT};
    }

    // Các contractor khác giữ nguyên
    return c;
  });

  setGlobalVariable('listContractorInvest', updatedList);
  return nameSearch;
}

const updateContractor = async (page: Page, mainDialog: Locator) => {
  let tableRow = mainDialog.getByRole('table').nth(1).locator('tbody tr');
  let rowCount = await tableRow.count();
  const packageDialog = page.getByRole('dialog', {name: 'Điều chỉnh gói thầu'});
  let newContractorName = '';
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    await row.getByTitle('Điều chỉnh', {exact: true}).click();
    const currentName = await packageDialog.locator('#contractorName').inputValue();
    newContractorName = currentName + ' điều chỉnh';
    await fillText(packageDialog, 'contractorName', newContractorName)
    await fillText(packageDialog, 'reason', 'Thích')
    await packageDialog.getByRole('button', {name: 'Ghi lại'}).click();
    await packageDialog.waitFor({state: 'detached'});
  }

  return newContractorName;
}

export const getAvailableContractorPurchase = ({status, type, index = 0}: { status: CONTRACTOR_STATUS,type?: SELECT_CONTRACTOR_FORM_TYPE, index?: number }) => {
  return getGlobalVariable('listContractorPurchase').filter(c => c.status === status && (type ? c.selectContractorForm === type : true))[index];
}