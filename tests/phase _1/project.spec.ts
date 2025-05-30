import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {fillText, selectAutocompleteMulti, selectDate, selectFile, selectOption} from '../../utils/fill.utils';
import {checkSearchResponse, validateDataTable} from '../../utils/validate.utils';
import {URL_BE_BASE} from '../../constants/common';
import {IAppParam} from '../../constants/interface';
import {APP_PARAMS} from '../../constants/common/app-param.constants';
import {saveFileParam, setupAppParams} from '../../utils/params.utils';
import {validateProjectTable} from '../../constants/validate-table/policy.constants';
import {getGlobalVariable, screenshot, setGlobalVariable} from '../../utils';

const PROJECT_NAME = `TA autotest dự án`;

test.describe('test project', () => {
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
      const oldName = await row.locator('td').nth(4).innerText();
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

  test('project search form', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/BIDDING_PROJECT');
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

    locator = page.locator('div#searchPage');
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

    locator = page.locator('div#searchPage');
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

    locator = page.locator('div#searchPage');
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

    locator = page.locator('div#searchPage');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/project/search',
      searchObject: {createdAtTo: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
  })

  test('table pageable - ID từ response không trùng', async ({page}) => {
    await login(page, '/BIDDING_PROJECT');

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

  test('table visible', async ({page}) => {
    const dataByParType: Record<string, IAppParam[]> = APP_PARAMS;
    await setupAppParams(page, dataByParType);
    await login(page, '/BIDDING_PROJECT');
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validateProjectTable, dataByParType);
  });
})

test('create project', async ({page}) => {
  await login(page, '/BIDDING_PROJECT');
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
  const nameSearch = getGlobalVariable('projectName') + ` ${count}`;
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
  await selectAutocompleteMulti(page, mainDialog, 'Chủ trương', 'Tìm kiếm chủ trương', getGlobalVariable('lastPolicyName'), 'policy/doSearchDistinct');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'projectDecisionNumber', `QD_PD_DA_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'projectDate');
  await selectOption(page, mainDialog, 'projectApprovedBy', '1. HĐQT');
  await selectFile({
    locator: mainDialog,
    value: 'assets/files/sample-2.pdf',
    fileType: '07',
  });
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
    await row.getByTitle('Xem chi tiết', {exact: true}).click();
    await page.getByRole('button', {name: 'Thẩm định'}).click();
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
        const statusText = await row.locator('td').nth(5).innerText(); // cột "Trạng thái"
        if (i === 0)
          await expect(row.getByTitle('Điều chỉnh dự án')).toHaveCount(1);
        else
          await expect(row.getByTitle('Điều chỉnh dự án')).toHaveCount(0);
        expect(statusText.includes('3. Đã thẩm định')).toBeTruthy();
      }
    }
    if (nameSearch) {
      setGlobalVariable('lastProjectName', nameSearch);
    }
  }
}

const adjustment = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.NHUNG, '/BIDDING_PROJECT')
    await search(page, nameSearch);
  }

  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.getByTitle('Điều chỉnh dự án', {exact: true}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh thông tin dự án'});
  await fillText(mainDialog, 'projectName', `${nameSearch} DC ${rowCount}`);
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'projectDecisionNumber', `QD_DC_DA_TA_AUTOTEST_${rowCount + 1}_DC`);
  await selectDate(page, mainDialog, 'projectDate');
  await selectOption(page, mainDialog, 'projectApprovedBy', '1. HĐQT');
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh dự án thành công'})
  rowCount = await tableRow.count();
  expect(rowCount > 1);

  let countStatusNew = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    const statusText = await row.locator('td').nth(5).innerText(); // cột "Trạng thái"
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
