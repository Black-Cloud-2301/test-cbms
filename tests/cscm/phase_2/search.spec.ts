import {expect, test} from '@playwright/test';
import {login} from '../login';
import {IContractorPage} from '../../../constants/interface';
import {fillValue} from '../../../utils/fill.utils';
import {SearchData} from '../../../constants/document-by-pid/create.constants';

test('has title', async ({page}) => {
    await login(page, '/CBMS_DOCUMENT_BY_PID');

    const input = page.locator('input[name="keySearch"]');
    await input.fill('ta test');
    await page.getByRole('button', {name: 'Tìm kiếm'}).click();
    let resPromise = await page.waitForResponse('**/cbms-service/contractor/doSearch');

    let resJson = await resPromise.json();

    if (resJson.data.content.length > 0) {
        expect(resJson.data.content.every((item: IContractorPage) => item.contractorCode.toLowerCase().includes('ta test') || item.contractorName.toLowerCase().includes('ta test'))).toBe(true);
    }

    await input.locator('xpath=following-sibling::span').click();

/*    await page.locator('input[name="keySearchContractorSelectionPlan"]').fill('002');
    await page.getByRole('button', {name: 'Tìm kiếm'}).click();
    resPromise = await page.waitForResponse('**!/cbms-service/contractor/doSearch');
    resJson = await resPromise.json();
    await page.pause();

    if (resJson.data.content.length > 0) {
        expect(resJson.data.content.every((item: IContractorPage) => item.contractorSelectionPlanCode.toLowerCase().includes('ta test'))).toBe(true);
    }*/

    const autocomplete =  page.locator('input[name="createdBy"]')
    await autocomplete.fill('Giang Thị Nhung');
    await autocomplete.locator('xpath=following-sibling::p-overlay').getByRole("option").first().click();

    await page.getByRole('button', {name: 'Tìm kiếm'}).click();
    resPromise = await page.waitForResponse('**/cbms-service/contractor/doSearch');
    resJson = await resPromise.json();

    if (resJson.data.content.length > 0) {
        expect(resJson.data.content.every((item: IContractorPage) => item.createdByName.includes('Giang Thị Nhung'))).toBe(true);
    }

    await autocomplete.locator('xpath=following-sibling::timesicon').locator('svg').click();

    const multiSelect = page.locator('input#contractorPrices');


    await page.pause();
});

test('search', async ({page}) => {
    await login(page, '/CBMS_DOCUMENT_BY_PID');

    const searchBox = page.locator('div.searchArea');
    await fillValue(searchBox, SearchData, page);
    await page.pause();
})