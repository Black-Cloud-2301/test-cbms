import {expect, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {CBMS_MODULE, CONTRACTOR_STATUS, ROUTES, URL_BE_BASE} from '../../constants/common';
import {buildNextName, bumpMainSerial, getGlobalVariable, setGlobalVariable} from '../../utils';
import {fillNumber, fillText, fillTextV2, selectAutocompleteMulti} from '../../utils/fill.utils';
import {USERS} from '../../constants/user';
import {IAppParam, SaveFormOptions} from '../../constants/interface';
import {checkSearchResponse, validateDataTable} from '../../utils/validate.utils';
import {testPageable} from '../../component';
import {APP_PARAMS} from '../../constants/common/app-param.constants';
import {saveFileParam, setupAppParams} from '../../utils/params.utils';
import {validateProjectTable} from '../../constants/validate-table/policy.constants';
import {getAvailablePurchase} from './purchase.spec';

const COST_SUBMISSION_NAME = `TA autotest tờ trình dự toán`;

test('create cost submission', async ({page}) => {
    await createCostSubmission({page});
    await submitToAppraisalCostSubmission({page});
    await adjustmentCostSubmission({page});
    await submitToAppraisalCostSubmission({page});

    await checkTableVisible({page});
})

test('search cost submission', async ({page}) => {
    test.setTimeout(180000);
    await checkSearchCostSubmission({page});
})

export const searchCostSubmission = async ({page, nameSearch}: {
    page: Page, nameSearch?: string
}) => {
    await page.locator(`input[name="keySearch"]`).fill(nameSearch ? nameSearch : COST_SUBMISSION_NAME);
    await page.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse((response) => {
        const urlMatch = response.url().includes(`${CBMS_MODULE}/cost-submission/doSearch`);
        const isOk = response.status() === 200;

        if (!urlMatch || !isOk) return false;

        const request = response.request();
        const postData = request.postDataJSON();

        return postData?.keySearch === (nameSearch ? nameSearch : COST_SUBMISSION_NAME);
    });
}

export const checkTablePageable = async ({page}: { page: Page }) => {
    await login(page, ROUTES.COST_SUBMISSION);
    await testPageable({page, url: '/cost-submission/doSearch', module: 'cost-submission'});
}

export const checkTableVisible = async ({page}: { page: Page }) => {
    const dataByParType: Record<string, IAppParam[]> = APP_PARAMS;
    await setupAppParams(page, dataByParType);
    await login(page, ROUTES.COST_SUBMISSION);
    await saveFileParam(page, dataByParType);

    await validateDataTable(page, validateProjectTable, dataByParType);
}

export const createCostSubmission = async ({page, isTCT = true}: {
    page: Page,
    isTCT?: boolean
}) => {
    await login(page, ROUTES.COST_SUBMISSION, isTCT ? USERS.NHUNG : USERS.CAM_NHUNG);
    await searchCostSubmission({page});
    const mainDialog = page.getByRole('dialog', {name: 'Tạo mới tờ trình dự toán'});

    let nameSearch = bumpMainSerial(getGlobalVariable('currentCostSubmissionName'));
    setGlobalVariable('currentCostSubmissionName', nameSearch);
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    await fillText(mainDialog, 'costSubmissionName', nameSearch);
    await fillText(mainDialog, 'costSubmissionNumber', 'SO_TTDT_001');
    await mainDialog.locator('input[formcontrolname="purchaseRequestCode"]').click({force: true});
    const selectPurchaseDialog = page.getByRole('dialog', {name: 'Chọn đề xuất mua sắm'});
    const purchaseName = getAvailablePurchase({status: CONTRACTOR_STATUS.APPRAISED, notInCostSubmission: true}).name;
    await selectAutocompleteMulti({
        page,
        locator: selectPurchaseDialog,
        title: 'Chọn đề xuất mua sắm',
        dialogTitle: 'Tìm kiếm mã đề xuất mua sắm',
        value: purchaseName,
        api: 'purchase/searchPurchase',
        multiple: true
    });
    await selectPurchaseDialog.getByRole('button', {name: 'Ghi lại'}).click();
    await fillText(mainDialog, 'costSubmissionContent', 'Mua nguyên liệu bán bánh mỳ');
    const costSubmissionPrice = 69850000;
    await fillNumber(mainDialog, 'costSubmissionPrice', costSubmissionPrice.toString());
    await fillTextV2(mainDialog, 'quotationReference', "TKBG-01")
    await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
    // await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/bieu_mau_lap_hsmt_mua_sam.xlsx');
    // await page.getByRole('button', {name: 'Tải lên'}).click();

    const selectEmployeeDialog = page.getByRole('dialog').filter({
        has: page.locator('span.p-dialog-title:text("Tìm kiếm thông tin nhân sự")')
    });
    // console.log('dialog', await selectEmployeeDialog.evaluate(el =>el.innerHTML));
    await mainDialog.locator('input[name="employeeId"]').locator('xpath=../../../..').locator('span').first().click();
    await selectEmployeeDialog.locator('input[name="keySearch"]').fill(USERS.NHUNG.name);
    await selectEmployeeDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`/sysUser/search`) && response.status() === 200);
    await selectEmployeeDialog.getByRole('row').nth(1).locator('a').click();
    let table = mainDialog.locator('app-form-table').nth(1);
    let tableRow = table.locator('tbody tr');

    if (isTCT) {
        let row = tableRow.first();
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phó TGĐ chuyên trách'}).click();

        await mainDialog.locator('input[name="employeeId"]').locator('xpath=../../../..').locator('span').first().click();
        await selectEmployeeDialog.locator('input[name="keySearch"]').fill(USERS.HONG.name);
        await selectEmployeeDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
        await page.waitForResponse(response => response.url().includes(`/sysUser/search`) && response.status() === 200);
        await selectEmployeeDialog.getByRole('row').nth(1).locator('a').click();
        row = tableRow.nth(1);
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phòng kỹ thuật - công nghệ'}).click();

        await mainDialog.locator('input[name="employeeId"]').locator('xpath=../../../..').locator('span').first().click();
        await selectEmployeeDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
        await selectEmployeeDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
        await page.waitForResponse(response => response.url().includes(`/sysUser/search`) && response.status() === 200);
        await selectEmployeeDialog.getByRole('row').nth(1).locator('a').click();
        row = tableRow.nth(2);
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phòng tài chính - kế toán'}).click();

        await mainDialog.locator('input[name="employeeId"]').locator('xpath=../../../..').locator('span').first().click();
        await selectEmployeeDialog.locator('input[name="keySearch"]').fill(USERS.TUOI.name);
        await selectEmployeeDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
        await page.waitForResponse(response => response.url().includes(`/sysUser/search`) && response.status() === 200);
        await selectEmployeeDialog.getByRole('row').nth(1).locator('a').click();
        row = tableRow.nth(3);
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phòng mua sắm'}).click();
    } else {
        let row = tableRow.first();
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phó giám đốc kỹ thuật'}).click();

        await mainDialog.locator('input[name="employeeId"]').locator('xpath=../../../..').locator('span').first().click();
        await selectEmployeeDialog.locator('input[name="keySearch"]').fill(USERS.HONG.name);
        await selectEmployeeDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
        await page.waitForResponse(response => response.url().includes(`/sysUser/search`) && response.status() === 200);
        await selectEmployeeDialog.getByRole('row').nth(1).locator('a').click();
        row = tableRow.nth(1);
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phòng tài chính'}).click();

        await mainDialog.locator('input[name="employeeId"]').locator('xpath=../../../..').locator('span').first().click();
        await selectEmployeeDialog.locator('input[name="keySearch"]').fill(USERS.CAM_NHUNG.name);
        await selectEmployeeDialog.getByRole('button', {name: 'Tìm kiếm'}).click();
        await page.waitForResponse(response => response.url().includes(`/sysUser/search`) && response.status() === 200);
        await selectEmployeeDialog.getByRole('row').nth(1).locator('a').click();
        row = tableRow.nth(2);
        await row.getByRole('combobox', {name: '--Chọn--'}).click();
        await page.getByRole('option', {name: 'Phòng kế hoạch tổng hợp'}).click();
    }


    await saveForm({page, dialog: mainDialog});
    const listCostSubmission = getGlobalVariable('listCostSubmission');
    setGlobalVariable('listCostSubmission', [{
        name: nameSearch,
        status: CONTRACTOR_STATUS.NEW,
        totalValue: costSubmissionPrice,
        isTCT
    }, ...listCostSubmission])
    const listPurchase = getGlobalVariable('listPurchase');
    const updatedPurchaseList = listPurchase.map(p => {
        if (p.status === CONTRACTOR_STATUS.APPRAISED && p.name === purchaseName) {
            return {...p, costSubmissionName: nameSearch}
        }
        return p;
    })
    setGlobalVariable('listPurchase', updatedPurchaseList);
}

export const submitToAppraisalCostSubmission = async ({page}: { page: Page }) => {
    const nameSearch = getGlobalVariable('currentCostSubmissionName');
    await searchCostSubmission({page, nameSearch});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    expect(rowCount > 0)
    const row = tableRow.first();
    await row.locator('p-checkbox').click();
    await page.getByRole('button', {name: 'Phê duyệt'}).click();
    const confirmDialog = page.getByRole('dialog').filter({
        has: page.locator('span:text("Xác nhận phê duyệt")')
    });
    await saveForm({
        page,
        dialog: confirmDialog,
        buttonName: 'Có',
        url: '**/cost-submission/submitToAppraiser',
        successText: 'Phê duyệt thành công'
    })

    const listCostSubmission = getGlobalVariable('listCostSubmission');
    const updatedCostSubmission = listCostSubmission.map(c => {
        if (c.status === CONTRACTOR_STATUS.NEW && c.name === nameSearch) {
            return {...c, status: CONTRACTOR_STATUS.APPRAISED}
        }
        return c;
    })
    setGlobalVariable('listCostSubmission', updatedCostSubmission);
}

/*export const appraisalCostSubmission = async ({page}: {
  page: Page
}) => {
  await loginWithRole(page, USERS.PC, ROUTES.COST_SUBMISSION)
  const nameSearch = getGlobalVariable('currentCostSubmissionName');
  await searchCostSubmission({page, nameSearch});
  let tableRow = page.locator('tbody tr');
  let rowCount = await tableRow.count();

  expect(rowCount > 0);
  const row = tableRow.first();
  await row.getByTitle('Xem chi tiết', {exact: true}).click();
  await page.getByRole('button', {name: 'Thẩm định'}).click();
  const confirmDialog = page.getByRole('alertdialog', {name: 'Xác nhận thẩm định tờ trình dự toán'});
  await saveForm({
    page,
    dialog: confirmDialog,
    buttonName: 'Có',
    url: '**!/cost-submission/appraisal',
    successText: 'Thẩm định thành công'
  })
  if (nameSearch) {
    setGlobalVariable('lastCostSubmissionName', nameSearch);
  }
}*/

export const adjustmentCostSubmission = async ({page}: { page: Page }) => {
    await loginWithRole(page, USERS.NHUNG, ROUTES.COST_SUBMISSION);
    const nameSearch = getAvailableCostSubmission({status: CONTRACTOR_STATUS.APPRAISED}).name;
    await searchCostSubmission({page, nameSearch});
    let tableRow = page.locator('tbody tr');
    let rowCount = await tableRow.count();
    expect(rowCount > 0);
    const row = tableRow.first();
    const newName = buildNextName(nameSearch);
    await row.getByTitle('Điều chỉnh', {exact: true}).click();
    setGlobalVariable('currentCostSubmissionName', newName);
    const mainDialog = page.getByRole('dialog', {name: 'Điều chỉnh tờ trình dự toán'});
    await fillText(mainDialog, 'costSubmissionName', newName);
    await mainDialog.getByRole('button', {name: 'Tiếp'}).click();
    await saveForm({page, dialog: mainDialog, successText: 'Điều chỉnh bản ghi thành công'});
    const listCostSubmission = getGlobalVariable('listCostSubmission');
    const updatedListCostSubmission = listCostSubmission.flatMap(c => {
        const isAppraised = c.status === CONTRACTOR_STATUS.APPRAISED;

        if (isAppraised && c.name === c.name) {
            return [
                {...c, status: CONTRACTOR_STATUS.ADJUSTMENT},
                {...c, name: newName}
            ];
        }

        return c;
    });
    setGlobalVariable('listCostSubmission', updatedListCostSubmission);
}

export const checkSearchCostSubmission = async ({page}: { page: Page }) => {
    await login(page, ROUTES.COST_SUBMISSION);
    let searchValue: string | number | number[] = 'autotest';
    let locator = page.locator('input#keySearch');
    await checkSearchResponse({
        page,
        url: URL_BE_BASE + '/cost-submission/doSearch',
        searchObject: {keySearch: searchValue},
        validateInput: {locator, searchValue},
        conditions: [{fields: ['costSubmissionCode', 'costSubmissionName'], value: searchValue}]
    });
    await locator.clear();

    locator = page.locator('div#listStatusCheck');
    await checkSearchResponse({
        page,
        url: URL_BE_BASE + '/cost-submission/doSearch',
        type: 'MULTI_SELECT',
        validateInput: {locator},
        searchObject: {listStatusCheck: null},
        conditions: [{fields: ['status']}]
    });

    locator = page.locator('form#collapseFilter');
    await checkSearchResponse({
        page,
        url: URL_BE_BASE + '/cost-submission/doSearch',
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
        url: URL_BE_BASE + '/cost-submission/doSearch',
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
        url: URL_BE_BASE + '/cost-submission/doSearch',
        searchObject: {fromCreateAt: searchValue},
        type: 'DATE',
        validateInput: {locator, searchValue},
        conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
    });

    locator = page.locator('form#collapseFilter');
    searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    await checkSearchResponse({
        page,
        url: URL_BE_BASE + '/cost-submission/doSearch',
        searchObject: {toCreateAt: searchValue},
        type: 'DATE',
        validateInput: {locator, searchValue},
        conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
    });
}

const saveForm = async ({
                            page,
                            dialog,
                            buttonName = 'Ghi lại',
                            url = '**/cost-submission/create',
                            successText = 'Thêm mới bản ghi thành công'
                        }: SaveFormOptions) => {
    await dialog.getByRole('button', {name: buttonName}).click();

    const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
    const resPromise = await page.waitForResponse(url);
    const resJson = await resPromise.json();

    expect(resJson.type).toEqual('SUCCESS');
    await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
    await alertSuccess.locator('.p-toast-icon-close').click();
};

export const getAvailableCostSubmission = ({status, index = 0, isTCT = true}: { status: CONTRACTOR_STATUS, index?: number, isTCT?: boolean }) => {
    return getGlobalVariable('listCostSubmission').filter(c => c.status === status && c.isTCT === isTCT)[index];
}