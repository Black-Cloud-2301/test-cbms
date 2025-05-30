import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {USERS} from '../../constants/user';
import {fillNumber, fillText, selectDate, selectFile, selectOption} from '../../utils/fill.utils';
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
import {validateProjectTable, validatePurchaseTable} from '../../constants/validate-table/policy.constants';

const PURCHASE_NAME = `TA autotest đề xuất mua sắm`;

test.describe('test purchase', () => {
  test.describe.configure({mode: 'serial'});
  test.setTimeout(180000);

  test('create purchase', async ({page}) => {
    await login(page, '/CBMS_PURCHASE_PROPOSAL');
    await search(page);
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới đề xuất mua sắm'});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    let count = 1;
    if (rowCount > 0) {
      const row = tableRow.first();
      const oldName = await row.locator('td').nth(4).innerText();
      const match = oldName.match(/đề xuất mua sắm (\d+)/i);
      count = match ? parseInt(match[1]) + 1 : 1;
    }
    let nameSearch = PURCHASE_NAME + ` ${count}`;
    setGlobalVariable('lastPurchaseName', nameSearch);
    await createPurchase(page, mainDialog, nameSearch);
  });

  test('purchase submit to appraiser', async ({page}) => {
    await login(page, '/CBMS_PURCHASE_PROPOSAL');
    const nameSearch = getGlobalVariable('currentPurchaseName');
    if (!nameSearch) {
      await search(page);
    }
    await submitToAppraisal(page, nameSearch);
  })

  test('purchase adjustment', async ({page}) => {
    await login(page, '/CBMS_PURCHASE_PROPOSAL');
    const nameSearch = getGlobalVariable('currentPurchaseName');
    if (!nameSearch) {
      await search(page);
    }
    await adjustment(page, nameSearch);
  })

  test('purchase search form', async ({page}) => {
    test.setTimeout(180000);
    await login(page, '/CBMS_PURCHASE_PROPOSAL');
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

    locator = page.locator('div#searchPage');
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

    locator = page.locator('div#searchPage');
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


    locator = page.locator('div#searchPage');
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

    locator = page.locator('div#searchPage');
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
    await login(page, '/CBMS_PURCHASE_PROPOSAL');
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const dialog = page.getByRole('dialog', {name: 'Tạo mới đề xuất mua sắm'});
    let locator = dialog.locator('input#purchaseRequestName');
    await validateInputText({locator});
    locator = dialog.locator('input#procurementProposalContent');
    await validateInputText({locator});
    locator = dialog.locator('input#propositionPurchasePrice');
    await validateInputNumber({locator, maxLength: 13});
    await dialog.getByRole('button', {name: 'Tiếp'}).click();
    locator = dialog.locator('input#procurementProposalDocumentNumber');
    await validateInputText({locator, maxLength: 100});
    await selectDate(page, dialog, 'decisionDay');
    await selectOption(page, dialog, 'approvalLevel', '2. TGĐ');
    await dialog.locator('input[type="file"]').setInputFiles('assets/files/sample.pdf');
    await saveForm({page, dialog});
  })

  test('table pageable - ID từ response không trùng', async ({page}) => {
    await login(page, '/CBMS_PURCHASE_PROPOSAL');

    const pageable = page.locator('span.p-paginator-pages');
    const pageButtons = pageable.locator('button');
    const seenIds = new Set<string>();

    const pageCount = await pageButtons.count();

    for (let i = 0; i < pageCount; i++) {
      const [res] = await Promise.all([
        page.waitForResponse(res =>
          res.url().includes('/purchase/doSearch') && res.status() === 200
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
      res.url().includes('/purchase/doSearch') && res.status() === 200
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
    await login(page, '/CBMS_PURCHASE_PROPOSAL');
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validatePurchaseTable, dataByParType);
  });

})


const saveForm = async ({
                          page,
                          dialog,
                          buttonName = 'Ghi lại',
                          url = '**/purchase/create',
                          successText = 'Thêm mới đề xuất mua sắm thành công'
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
  await page.locator(`input[name="keySearch"]`).fill(name ? name : PURCHASE_NAME);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse((response) => {
    const urlMatch = response.url().includes(`${CBMS_MODULE}/purchase/doSearch`);
    const isOk = response.status() === 200;

    if (!urlMatch || !isOk) return false;

    const request = response.request();
    const postData = request.postDataJSON();

    return postData?.keySearch === (name ? name : PURCHASE_NAME);
  });
}

const createPurchase = async (page: Page, mainDialog: Locator, nameSearch?: string) => {
  await fillText(mainDialog, 'purchaseRequestName', nameSearch);
  await fillText(mainDialog, 'procurementProposalContent', 'Mua cả thế giới');
  await fillNumber(mainDialog, 'propositionPurchasePrice', '100000000');
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await fillText(mainDialog, 'procurementProposalDocumentNumber', `SO_VB_DXMS_TA_AUTOTEST`);
  await selectDate(page, mainDialog, 'decisionDay');
  await selectOption(page, mainDialog, 'approvalLevel', '1. HĐQT');
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
  await page.getByRole('button', {name: 'Chốt'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận chốt đề xuất mua sắm'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '**/purchase/submit-to-appraiser',
    successText: 'Chốt thẩm định thành công'
  })
}

const adjustment = async (page: Page, nameSearch?: string) => {
  if (nameSearch) {
    await loginWithRole(page, USERS.NHUNG, '/CBMS_PURCHASE_PROPOSAL')
    await search(page, nameSearch);
  }
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();
  expect(rowCount > 0);
  const row = tableRow.first();
  const adjustmentButton = row.getByTitle('Điều chỉnh', {exact: true})
  await adjustmentButton.click();
  const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh đề xuất mua sắm'});
  await fillText(mainDialog, 'purchaseRequestName', `${nameSearch} DC ${rowCount}`);
  await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
  await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh đề xuất mua sắm thành công'})
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
      await screenshot(page, 'purchase')
      await expect(adjustmentButton).toHaveCount(0);
      // expect(statusText.includes('2. Chuẩn bị tạo kế hoạch thầu')).toBeTruthy();
    }
  }

  // ✅ Chỉ được phép có đúng 1 dòng "Mới tạo"
  expect(countStatusNew).toBe(1);

}