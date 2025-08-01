import {expect, test} from '@playwright/test';
import {login} from '../login';
import {bumpMainSerial, getGlobalVariable, screenshot, setGlobalVariable} from '../../utils';
import {selectDate, selectOption} from '../../utils/fill.utils';
import {IAppParam} from '../../constants/interface';
import {
  checkSearchResponse,
  checkSearchResponseV2,
  validateDataTable,
  validateInputNumber,
  validateInputText
} from '../../utils/validate.utils';
import {ROUTES, SELECT_CONTRACTOR_FORM_TYPE, URL_BE_BASE} from '../../constants/common';
import {APP_PARAMS} from '../../constants/common/app-param.constants';
import {saveFileParam, setupAppParams} from '../../utils/params.utils';
import {validatePolicyTable, validateProjectTable} from '../../constants/validate-table/policy.constants';
import {appraisalPolicy, createPolicy, searchPolicy, submitToAppraisalPolicy} from '../phase _1/policy.spec';
import {appraisalProject, createProject, searchProject, submitToAppraisalProject} from '../phase _1/project.spec';
import {adjustmentPurchase, createPurchase, searchPurchase, submitToAppraisalPurchase} from '../phase_4/purchase.spec';
import {
  appraisalSelectionPlan,
  appraiserSelectionPlanShopping, createSelectionPlanAdjustmentInvest,
  createSelectionPlanNewPackageInvest,
  createSelectionPlanNewPackageShopping,
  searchSelectionPlan,
  submitToAppraiserSelectionPlan
} from '../phase_4/selection_plan.spec';
import {
  appraisalDocumentByPid,
  loginAndSearch,
  submitToAppraisalDocumentByPid,
  updateDocumentByPid
} from '../phase_4/full_follow_1.11.spec';
import {evaluate} from '../phase_3/full_follow_1-7.spec';
import {
  appraisalDocumentByPidShopping,
  createDocumentByBidShoppingPhase2, createDocumentByPidShoppingCDT,
  submitToAppraisalShopping
} from '../phase_4/full_follow_1.13.spec';
import {
  documentByPidSubmitToAppraiser,
  documentByPidVerify,
  importDocumentByPidCDT,
  importDocumentByPidDTRR
} from '../phase_2/full_follow.spec';
import {importDocumentByPidPhase2DTRR, submitToAppraiser, verifyDocumentByPid2} from '../phase_3/full_follow_1-8.spec';
import {
  checkTablePageable,
  checkTableVisible,
  createCostSubmission,
  submitToAppraisalCostSubmission
} from '../phase_4/cost-submission.spec';
import { USERS } from '../../constants/user';

test.describe('test all invest', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(900000);

  test('create policy full flow', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/BIDDING_POLICY_NEW');
    await searchPolicy({page});
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới chủ trương'});
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
    await createPolicy(page, mainDialog, nameSearch);
    await submitToAppraisalPolicy({page, nameSearch});
    await appraisalPolicy({page, nameSearch});
    // await adjustmentPolicy({page, nameSearch});
    // await submitToAppraisalPolicy({page, nameSearch: nameSearch + ` DC 1`});
    // await appraisalPolicy({page, nameSearch: nameSearch + ` DC 1`});
    // await adjustmentPolicy({page, nameSearch: nameSearch + ` DC 1`});
  });

  test('create project full flow', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/BIDDING_PROJECT_NEW');
    await searchProject({page});
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới dự án'});
    let tableRow = page.locator('tbody tr');
    let nameSearch: string;
    const row = tableRow.first();
    const content = await row.locator('td').first().innerText();

    if (content.includes('Không có dữ liệu')) {
      nameSearch = getGlobalVariable('projectName') + ` 1`
    } else {
      const oldName = await row.locator('td').nth(4).innerText();
      nameSearch = bumpMainSerial(oldName);
    }

    await page.getByRole('button', {name: 'Thêm mới'}).click();
    await createProject(page, mainDialog, nameSearch);
    await submitToAppraisalProject({page, nameSearch});
    await appraisalProject({page, nameSearch});
    // await adjustmentProject({page, nameSearch});
    // await submitToAppraisalProject({page, nameSearch: nameSearch + ` DC 1`});
    // await appraisalProject({page, nameSearch: nameSearch + ` DC 1`});
  });

  test('create selection_plan/ new package/ investment project', async ({page}) => {
    const totalValue = 10000000;
    const packageCount = 2;
    const nameSearch = await createSelectionPlanNewPackageInvest(page, totalValue, packageCount);
    await submitToAppraiserSelectionPlan({page, nameSearch});
    await appraisalSelectionPlan({page, nameSearch});
  });

  /*test('create selection_plan/ adjustment / investment project', async ({page}) => {
    const totalValue = 10000000;
    const packageCount = 1;
    const nameSearch = await createSelectionPlanAdjustmentInvest(page, totalValue, packageCount);
    await submitToAppraiserSelectionPlan({page, nameSearch});
    await appraisalSelectionPlan({page, nameSearch});
  });*/

  test('import document by pid', async ({page}) => {
    await importDocumentByPidDTRR(page);
    await documentByPidSubmitToAppraiser({page});
    await documentByPidVerify({page});
  });

  test('bid evaluate', async ({page}) => {
    await evaluate({page});
  })

  test('import document by pid invest phase 2', async ({page}) => {
    await importDocumentByPidPhase2DTRR(page);
    await page.pause();
    await submitToAppraiser(page);
    await verifyDocumentByPid2(page);
  })

  test('import document by pid CDT', async ({page}) => {
    await importDocumentByPidCDT(page);
    await documentByPidSubmitToAppraiser({page, selectContractorForm: SELECT_CONTRACTOR_FORM_TYPE.CDT});
    await documentByPidVerify({page, selectContractorForm: SELECT_CONTRACTOR_FORM_TYPE.CDT});
  });

});

test.describe('test all shopping', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(900000);

/*  test('create purchase', async ({page}) => {
    await login(page, ROUTES.PURCHASE_PROPOSAL);
    await searchPurchase({page});
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới đề xuất mua sắm'});
    let tableRow = page.locator('tbody tr');
    const row = tableRow.first();
    const content = await row.locator('td').first().innerText();
    let nameSearch: string;
    if (content.includes('Không có dữ liệu')) {
      nameSearch = getGlobalVariable('purchaseName') + ` 1`
    } else {
      const oldName = await row.locator('td').nth(4).innerText();
      nameSearch = bumpMainSerial(oldName);
    }
    setGlobalVariable('lastPurchaseName', nameSearch);
    await createPurchase(page, mainDialog, nameSearch);
  });

  test('purchase appraiser', async ({page}) => {
    await login(page, ROUTES.PURCHASE_PROPOSAL);
    const nameSearch = getGlobalVariable('listPurchase').find(f => f.status === 'NEW')?.name;
    await submitToAppraisalPurchase({page, nameSearch});
  })*/

  /*test('purchase adjustment', async ({page}) => {
    await login(page, ROUTES.PURCHASE_PROPOSAL);
    const nameSearch = getGlobalVariable('lastPurchaseName');
    if (!nameSearch) {
      await searchPurchase({page});
    }
    // await page.pause();
    await adjustmentPurchase({page, nameSearch});
  })*/

/*  test('create cost submission', async ({page}) => {
    await createCostSubmission({page});
    await submitToAppraisalCostSubmission({page});
    // await adjustmentCostSubmission({page});
    // await submitToAppraisalCostSubmission({page});
  })*/

  test('create selection_plan/ new package/ shopping full', async ({page}) => {
    test.setTimeout(180000)
    await login(page, ROUTES.KHLCNT_PURCHASE);
    await searchSelectionPlan({page});
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới kế hoạch lựa chọn nhà thầu'});
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

    await createSelectionPlanNewPackageShopping(page, mainDialog, nameSearch);
    await appraiserSelectionPlanShopping({page, nameSearch});
  });

  test('create document by pid 3.1.11', async ({page}) => {
    test.setTimeout(120000);
    await loginAndSearch({page, url: ROUTES.DOCUMENT_BY_PID_PURCHASE});

    await updateDocumentByPid(page);
    await submitToAppraisalDocumentByPid({page, url: ROUTES.DOCUMENT_BY_PID_PURCHASE});
  });

  test('appraisal document by pid', async ({page}) => {
    await appraisalDocumentByPid({page, url: ROUTES.DOCUMENT_BY_PID_PURCHASE});
  });

  test('evaluate', async ({page}) => {
    test.setTimeout(180000);
    await evaluate({page, url: ROUTES.BID_EVALUATION_PURCHASE, invest: false});
  });

  test('import document by pid shopping phase 2', async ({page}) => {
    await createDocumentByBidShoppingPhase2({page, url: ROUTES.DOCUMENT_BY_PID_PURCHASE});
  })

  test('submit to appraisal document by pid shopping', async ({page}) => {
    await submitToAppraisalShopping({page});
  })

  test('appraisal document by pid shopping', async ({page}) => {
    await appraisalDocumentByPidShopping({page, url: ROUTES.DOCUMENT_BY_PID_PURCHASE});
  })

  test('import document by pid shopping CDT', async ({page}) => {
    await createDocumentByPidShoppingCDT({page});
    await documentByPidSubmitToAppraiser({page, invest: false, selectContractorForm: SELECT_CONTRACTOR_FORM_TYPE.CDT});
    await documentByPidVerify({page, invest: false, selectContractorForm: SELECT_CONTRACTOR_FORM_TYPE.CDT});
  });

  test('import document by pid shopping HDTT', async ({page}) => {
    await createDocumentByPidShoppingCDT({page, isCDT: false});
    await documentByPidSubmitToAppraiser({page, invest: false, selectContractorForm: SELECT_CONTRACTOR_FORM_TYPE.HDTT});
    await documentByPidVerify({page, invest: false, selectContractorForm: SELECT_CONTRACTOR_FORM_TYPE.HDTT});
  });

})

test.describe('test visible', () => {
  test('policy search form', async ({page}) => {
    test.setTimeout(120000);
    await login(page, '/BIDDING_POLICY_NEW');
    let searchValue: string | number | number[] = 'autotest';
    let locator = page.locator(`form#collapseFilter`);

    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {keySearch: searchValue},
      validateInput: {locator, searchValue, name: 'keySearch', allowClear: true},
      conditions: [{fields: ['policyCode', 'policyName'], value: searchValue}]
    });

    locator = page.locator('input#totalInvestmentFrom');
    searchValue = 10000000;
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {totalInvestmentFrom: searchValue},
      type: 'CURRENCY',
      validateInput: {locator, searchValue, maxLength: 16},
      conditions: [{fields: ['totalInvestment'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });
    await locator.clear();

    locator = page.locator('input#totalInvestmentTo');
    searchValue = 100000000;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {totalInvestmentTo: searchValue},
      type: 'CURRENCY',
      validateInput: {locator, searchValue, maxLength: 16},
      conditions: [{fields: ['totalInvestment'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
    await locator.clear();
    locator = page.locator('form#collapseFilter');
    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator, name: 'Trạng thái', allowClear: true},
      searchObject: {statusList: null},
      conditions: [{fields: ['status']}]
    });

    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator, name: 'Nhóm dự án', allowClear: true},
      searchObject: {projectGroupIdList: null},
      conditions: [{fields: ['projectGroupId']}]
    });

    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator, name: 'Loại dự án'},
      searchObject: {projectTypeIdList: null},
      conditions: [{fields: ['projectTypeId']}]
    });

    await page.waitForTimeout(1000);
    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator, name: 'Lĩnh vực đầu tư', allowClear: true},
      searchObject: {investmentFieldIdList: null},
      conditions: [{fields: ['investmentFieldId']}]
    });
    await locator.locator('multi-select').filter({hasText: 'Loại dự án'}).locator('p-multiselect').locator('timesicon').locator('svg').click();

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
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

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'AUTOCOMPLETE_MULTI',
      validateInput: {
        locator,
        searchValue: 'Phòng Phân tích nghiệp vụ',
        title: 'Đơn vị tạo',
        dialogTitle: 'Tìm kiếm đơn vị tạo',
        apiUrl: 'sysGroup/search'
      },
      searchObject: {sysGroupId: 9010081},
      conditions: [{fields: ['sysGroupId'], value: 9010081, match: 'EXACT'}]
    });
    await locator.locator('input[name="sysGroupId"]').clear();

    locator = page.locator('form#collapseFilter');
    const now = new Date();
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {createdAtFrom: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue, name: 'Ngày tạo từ ngày'},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });

    locator = page.locator('form#collapseFilter');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    await page.waitForTimeout(1000);
    await checkSearchResponseV2({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {createdAtTo: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue, name: 'Đến ngày'},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
  })

  test('policy table pageable', async ({page}) => {
    await login(page, '/BIDDING_POLICY_NEW');

    const pageable = page.locator('span.p-paginator-pages');
    const pageButtons = pageable.locator('button');
    const seenIds = new Set<string>();

    const pageCount = await pageButtons.count();

    for (let i = 0; i < pageCount; i++) {
      const [res] = await Promise.all([
        page.waitForResponse(res =>
          res.url().includes('/policy/doSearch') && res.status() === 200
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
          // await page.pause();
          expect(isDuplicate).toBeFalsy();
        }

        seenIds.add(id);
      }
    }

    await page.getByRole('combobox', {name: 'Rows per page'}).click();
    const [res] = await Promise.all([
      page.waitForResponse(res =>
        res.url().includes('/policy/doSearch') && res.status() === 200
      ),
      await page.getByRole('option', {name: '100'}).click()
    ]);
    const responseData = await res.json();
    expect(responseData.type).toEqual('SUCCESS');
    const totalElements = await responseData.data?.totalElements;
    expect(totalElements).toEqual(responseData.data?.totalElements);

    let tableRow = page.locator('tbody tr');
    await page.waitForTimeout(2000);
    let countBidder = await tableRow.count();
    if (totalElements > 100) {
      expect(countBidder).toEqual(100);
    } else {
      expect(countBidder).toEqual(totalElements);
    }
  });

  test('policy table visible', async ({page}) => {
    const dataByParType: Record<string, IAppParam[]> = APP_PARAMS;
    await setupAppParams(page, dataByParType);
    await login(page, '/BIDDING_POLICY_NEW');
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validatePolicyTable, dataByParType);
  });

  test('project table pageable', async ({page}) => {
    await login(page, '/BIDDING_PROJECT_NEW');

    const pageable = page.locator('span.p-paginator-pages');
    const pageButtons = pageable.locator('button');
    const seenIds = new Set<string>();

    const pageCount = await pageButtons.count();

    for (let i = 0; i < pageCount; i++) {
      const [res] = await Promise.all([
        page.waitForResponse(res =>
          res.url().includes('/project/search') && res.status() === 200
        ),
        pageButtons.nth(i).click()
      ]);

      const responseData = await res.json();
      const items = responseData.data?.content ?? responseData.data.content ?? responseData.data ?? [];

      for (const item of items) {
        const id = String(item.projectId); // đảm bảo là string để Set hoạt động ổn định
        const isDuplicate = seenIds.has(id);

        // ✅ Expect: không được trùng
        if (isDuplicate) {
          console.log(`🔴 Trùng ID '${id}' tại trang ${i + 1}`);
          await screenshot(page, 'project')
          expect(isDuplicate).toBeFalsy();
        }

        seenIds.add(id);
      }
    }

    await page.getByRole('combobox', {name: 'Rows per page'}).click();
    await page.getByRole('option', {name: '100'}).click();
    const res = await page.waitForResponse(res =>
      res.url().includes('/project/search') && res.status() === 200
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

  test('project table visible', async ({page}) => {
    const dataByParType: Record<string, IAppParam[]> = APP_PARAMS;
    await setupAppParams(page, dataByParType);
    await login(page, '/BIDDING_PROJECT_NEW');
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validateProjectTable, dataByParType);
  });

  test('project search form', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/BIDDING_PROJECT_NEW');
    let searchValue: string | number | number[] = 'autotest';
    let locator = page.locator('input#keySearch');

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      searchObject: {keySearch: searchValue},
      validateInput: {locator, searchValue},
      conditions: [{fields: ['projectCode', 'projectName'], value: searchValue}]
    });
    await locator.clear();

    locator = page.locator('input#policyTotalInvestmentFrom');
    searchValue = 10000000;
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      searchObject: {policyTotalInvestmentFrom: searchValue},
      type: 'CURRENCY',
      validateInput: {locator, searchValue, maxLength: 16},
      conditions: [{fields: ['policyTotalInvestment'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });
    await locator.clear();

    locator = page.locator('input#policyTotalInvestmentTo');
    searchValue = 100000000;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      searchObject: {policyTotalInvestmentTo: searchValue},
      type: 'CURRENCY',
      validateInput: {locator, searchValue, maxLength: 16},
      conditions: [{fields: ['policyTotalInvestment'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
    await locator.clear();

    locator = page.locator('div#statusList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {statusList: null},
      conditions: [{fields: ['status']}]
    });
    await locator.locator('timesicon').locator('svg').click();

    locator = page.locator('div#projectGroupIdList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {projectGroupIdList: null},
      conditions: [{fields: ['policyProjectGroupId']}]
    });
    await locator.locator('timesicon').locator('svg').click();

    locator = page.locator('div#projectTypeIdList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {projectTypeIdList: null},
      conditions: [{fields: ['policyProjectTypeId']}]
    });

    locator = page.locator('div#investmentFieldIdList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {investmentFieldIdList: null},
      conditions: [{fields: ['policyInvestmentFieldId']}]
    });
    await locator.locator('timesicon').locator('svg').click();
    await page.locator('div#projectTypeIdList').locator('timesicon').locator('svg').click();

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
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

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      type: 'AUTOCOMPLETE_MULTI',
      validateInput: {
        locator,
        searchValue: 'Trung tâm Cẩm Mỹ - Xuân Lộc',
        title: 'Đơn vị tạo',
        dialogTitle: 'Tìm kiếm đơn vị tạo',
        apiUrl: 'sysGroup/search'
      },
      searchObject: {sysGroupId: 9008106},
      conditions: [{fields: ['sysGroupId'], value: 9008106, match: 'EXACT'}]
    });
    await locator.locator('input[name="sysGroupId"]').clear();

    locator = page.locator('form#collapseFilter');
    const now = new Date();
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      searchObject: {createdAtFrom: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });

    locator = page.locator('form#collapseFilter');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    await page.waitForTimeout(1000);
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      searchObject: {createdAtTo: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
  })

  test('purchase search form', async ({page}) => {
    test.setTimeout(180000);
    await login(page, ROUTES.PURCHASE_PROPOSAL);
    let searchValue: string | number | number[] = 'autotest';
    let locator = page.locator('input#keySearch');

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/purchase/doSearch',
      searchObject: {keySearch: searchValue},
      validateInput: {locator, searchValue},
      conditions: [{fields: ['purchaseRequestCode', 'purchaseRequestName'], value: searchValue}]
    });
    await locator.clear();

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/purchase/doSearch',
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

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/purchase/doSearch',
      type: 'AUTOCOMPLETE_MULTI',
      validateInput: {
        locator,
        searchValue: 'Trung tâm Cẩm Mỹ - Xuân Lộc',
        title: 'Đơn vị tạo',
        dialogTitle: 'Tìm kiếm đơn vị tạo',
        apiUrl: 'sysGroup/search'
      },
      searchObject: {sysGroupId: 9008106},
      conditions: [{fields: ['sysGroupId'], value: 9008106, match: 'EXACT'}]
    });
    await locator.locator('input[name="sysGroupId"]').clear();


    locator = page.locator('form#collapseFilter');
    const now = new Date();
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/purchase/doSearch',
      searchObject: {fromCreateAt: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });

    locator = page.locator('form#collapseFilter');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/purchase/doSearch',
      searchObject: {toCreateAt: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });

    locator = page.locator('div#listStatusCheck');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/purchase/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {listStatusCheck: null},
      conditions: [{fields: ['status']}]
    });
  })

  test('purchase validate form', async ({page}) => {
    await login(page, ROUTES.PURCHASE_PROPOSAL);
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const dialog = page.getByRole('dialog', {name: 'Tạo mới đề xuất mua sắm'});
    let locator = dialog.locator('input#purchaseRequestName');
    await validateInputText({locator});
    locator = dialog.locator('input#procurementProposalContent');
    await validateInputText({locator});
    locator = dialog.locator('input#propositionPurchasePrice');
    await validateInputNumber({locator, maxLength: 16});
    await dialog.getByRole('button', {name: 'Tiếp'}).click();
    locator = dialog.locator('input#procurementProposalDocumentNumber');
    await validateInputText({locator, maxLength: 100});
    await selectDate(page, dialog, 'decisionDay');
    await selectOption(page, dialog, 'approvalLevel', 'Ban TGĐ TCT');
    await dialog.locator('input[type="file"]').setInputFiles('assets/files/sample.pdf');
    // await saveForm({page, dialog});
  })

  test('cost submission table visible', async ({page}) => {
    await checkTablePageable({page});
    await checkTableVisible({page});
  })
})