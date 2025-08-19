import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {
  fillEditor,
  fillNumber,
  fillTextV2,
  selectDate,
  selectDateV2,
  selectFile, selectMultiple,
  selectOptionV2
} from '../../utils/fill.utils';
import {checkSearchResponse, validateDataTable} from '../../utils/validate.utils';
import {URL_BE_BASE} from '../../constants/common';
import {saveFileParam, setupAppParams} from '../../utils/params.utils';
import {APP_PARAMS} from '../../constants/common/app-param.constants';
import {validatePolicyTable} from '../../constants/validate-table/policy.constants';
import {IAppParam, SaveFormOptions} from '../../constants/interface';
import {getGlobalVariable, setGlobalVariable} from '../../utils';

test.describe('test policy', () => {
  test('create policy full flow', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/BIDDING_POLICY_NEW');
    await searchPolicy({page});
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới chủ trương'});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    let count = 1;
    if (rowCount > 0) {
      const row = tableRow.first();
      const oldName = await row.locator('td').nth(4).innerText();
      const match = oldName.match(/chủ trương (\d+)/i);
      count = match ? parseInt(match[1]) + 1 : 1;
    }
    const nameSearch = getGlobalVariable('policyName') + ` ${count}`
    await createPolicy(page, mainDialog, nameSearch);
    await submitToAppraisalPolicy({page, nameSearch});
    await appraisalPolicy({page, nameSearch});
    await adjustmentPolicy({page, nameSearch});
    await submitToAppraisalPolicy({page, nameSearch: nameSearch + ` DC 1`});
    await appraisalPolicy({page, nameSearch: nameSearch + ` DC 1`});
  });

  test('search form', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/BIDDING_POLICY_NEW');
    let searchValue: string | number | number[] = 'autotest';
    let locator = page.locator('input#keySearch');

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {keySearch: searchValue},
      validateInput: {locator, searchValue},
      conditions: [{fields: ['policyCode', 'policyName'], value: searchValue}]
    });
    await locator.clear();

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

    locator = page.locator('div#statusList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {statusList: null},
      conditions: [{fields: ['status']}]
    });
    await locator.locator('timesicon').locator('svg').click();

    locator = page.locator('div#projectGroupIdList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {projectGroupIdList: null},
      conditions: [{fields: ['projectGroupId']}]
    });
    await locator.locator('timesicon').locator('svg').click();

    locator = page.locator('div#projectTypeIdList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {projectTypeIdList: null},
      conditions: [{fields: ['projectTypeId']}]
    });

    locator = page.locator('div#investmentFieldIdList');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      type: 'MULTI_SELECT',
      validateInput: {locator},
      searchObject: {investmentFieldIdList: null},
      conditions: [{fields: ['investmentFieldId']}]
    });
    await locator.locator('timesicon').locator('svg').click();
    await page.locator('div#projectTypeIdList').locator('timesicon').locator('svg').click();

    locator = page.locator('div#searchPage');
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

    locator = page.locator('div#searchPage');
    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
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
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {createdAtFrom: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });

    locator = page.locator('div#searchPage');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
      page,
      url: URL_BE_BASE + '/policy/doSearch',
      searchObject: {createdAtTo: searchValue},
      type: 'DATE',
      validateInput: {locator, searchValue},
      conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
  })

  test('table pageable - ID từ response không trùng', async ({page}) => {
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
          await page.pause();
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
    await login(page, '/BIDDING_POLICY_NEW');
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validatePolicyTable, dataByParType);
  });
})

test('create policy', async ({page}) => {
    await login(page, '/BIDDING_POLICY_NEW', USERS.NHUNG);
    await searchPolicy({page});
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
    const nameSearch = getGlobalVariable('policyName') + ` ${count}`
    await createPolicy(page, mainDialog, nameSearch)
  }
);

test('policy submit to appraiser', async ({page}) => {
  await login(page, '/BIDDING_POLICY_NEW', USERS.NHUNG);
  await searchPolicy({page});
  await submitToAppraisalPolicy({page});
})

test('policy appraiser', async ({page}) => {
  await login(page, '/BIDDING_POLICY_NEW', USERS.PC);
  await searchPolicy({page});
  await appraisalPolicy({page});
})

test('policy adjustment', async ({page}) => {
  await login(page, '/BIDDING_POLICY_NEW', USERS.NHUNG);
  await searchPolicy({page});

  await adjustmentPolicy({page});
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


export const searchPolicy = async ({page, nameSearch}: {
  page: Page, nameSearch?: string
}) => {
  await page.locator(`input[name="keySearch"]`).fill(nameSearch ? nameSearch : getGlobalVariable('policyName'));
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

export const createPolicy = async (page: Page, mainDialog: Locator, nameSearch: string) => {
  await fillTextV2(mainDialog, 'policyName', nameSearch);
  await selectOptionV2(page, mainDialog, 'Nhóm dự án', 'Nhóm A');
  await selectOptionV2(page, mainDialog, 'Loại dự án', 'Đầu tư xây dựng');
  await selectOptionV2(page, mainDialog, 'Thời gian triển khai từ', 'I');
  await selectDate(page, mainDialog, 'yearFrom', '2025');
  await selectOptionV2(page, mainDialog, 'Đến', 'I');
  // await selectDateV2(page, mainDialog, 'Năm', '2026', 'year', 1);
  await selectDate(page, mainDialog, 'yearTo', '2026');
  // await fillNumber(mainDialog, 'implementationDate', '1');
  await selectOptionV2(page, mainDialog, 'Thời gian theo', 'Năm');
  await fillNumber(mainDialog, 'investmentScale', '100');
  await selectOptionV2(page, mainDialog, 'Đơn vị tính', 'm2');
  await selectOptionV2(page, mainDialog, 'Lĩnh vực đầu tư', 'BTS');
  await fillTextV2(mainDialog, 'projectFunding', 'Vốn huy động từ thiện');
  await fillNumber(mainDialog, 'totalInvestment', '100000000');
  await fillTextV2(mainDialog, 'projectLocation', 'Hồ Tây');
  await fillTextV2(mainDialog, 'note', 'Của Tú Ank đừng đụng zô');
  await selectMultiple({
    page,
    locator: mainDialog,
    labelText: 'Mục đích sử dụng',
    value: ['Giải pháp và dịch vụ kỹ thuật', 'Vận hành khai thác', 'Xây dựng dân dụng']
  })
  await fillEditor(mainDialog, 'investmentTarget', 'Đầu tư cho vui');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillTextV2(mainDialog, 'decisionNumber', `QD_CT_TA_AUTOTEST`);
  await selectDateV2(page, mainDialog, 'Ngày chủ trương');
  await selectOptionV2(page, mainDialog, 'Cấp quyết định phê duyệt chủ trương', '1. HĐQT');
  await selectFile({page, locator: mainDialog, value: 'assets/files/sample.pdf', fileType: 'Báo cáo đề xuất chủ trương đầu tư dự án'});
  await selectFile({page, locator: mainDialog, value: 'assets/files/sample-1.pdf', fileType: 'Quyết định về việc phê duyệt'});
  await saveForm({page, dialog: mainDialog});
}

export const submitToAppraisalPolicy = async ({page, nameSearch}: {
  page: Page, nameSearch?: string
}) => {
  if (nameSearch) {
    await searchPolicy({page, nameSearch});
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await expect(row.locator('td').first()).not.toHaveText('Không có dữ liệu');
  await row.locator('p-checkbox').click();
  await page.getByRole('button', {name: 'Trình thẩm định'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận trình thẩm định chủ trương'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '**/policy/submitToAppraiser',
    successText: 'Trình thẩm định thành công'
  })
}

export const appraisalPolicy = async ({page, nameSearch}: {
  page: Page, nameSearch?: string
}) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.PC, '/BIDDING_POLICY_NEW')
    await searchPolicy({page, nameSearch});
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();

  if (rowCount > 0) {
    const row = tableRow.first();
    await row.getByTitle('Xem chi tiết', {exact: true}).click();
    await page.getByRole('button', {name: 'Thẩm định'}).click();
    const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định chủ trương'});
    await saveForm({
      page,
      dialog: confirmDialog,
      buttonName: 'Có',
      url: '**/policy/appraisal',
      successText: 'Thẩm định thành công'
    })
    if (nameSearch) {
      setGlobalVariable('lastPolicyName', nameSearch);
    }
    // await checkAdjustment(page, tableRow);
  } else {
    console.log('Không tìm thấy bản ghi');
  }
}

export const adjustmentPolicy = async ({page, nameSearch}: {
  page: Page, nameSearch?: string
}) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.NHUNG, '/BIDDING_POLICY_NEW')
    await searchPolicy({page, nameSearch});
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  await row.getByTitle('Điều chỉnh chủ trương', {exact: true}).click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh thông tin chủ trương'});
  const oldName = await row.locator('td').nth(4).innerText();
  const match = oldName.match(/chủ trương DC (\d+)/i);
  let count = match ? parseInt(match[1]) + 1 : 1;
  await fillTextV2(mainDialog, 'policyName', count > 0? `${oldName.replace(/\d+$/, count.toString())}` : oldName + ' DC ' + count);
  await fillTextV2(mainDialog, 'note', 'Của Tú Ank đừng đụng dô điều chỉnh');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillTextV2(mainDialog, 'decisionNumber', `QD_TA_AUTOTEST_${rowCount + 1}_DC`);
  await selectDateV2(page, mainDialog, 'policyDate');
  await selectOptionV2(page, mainDialog, 'approvedBy', '1. HĐQT');
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh chủ trương thành công'});
  rowCount = await tableRow.count();
  expect(rowCount > 1);

  let countStatusNew = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = tableRow.nth(i);
    const statusText = await row.locator('td').nth(5).innerText(); // cột "Trạng thái"
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