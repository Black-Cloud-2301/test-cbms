import {Locator, Page} from '@playwright/test';
import {ICreate} from '../constants/interface';

export const fillValue = async (locator: Locator, data: ICreate[], page: Page) => {
    for (const item of data) {
        if (item.type === 'text') {
            await locator.locator(`input[name="${item.field}"]`).fill(item.value);
        } else if (item.type === 'select') {
            const select = locator.locator(`div#${item.field}`);
            await select.click();
            await select.getByRole('searchbox').fill(item.value);
            await select.locator('p-overlay').getByRole('listbox').locator('p-dropdownitem').first().click();
        } else if (item.type === 'autocomplete') {
            const autocomplete = locator.locator(`input[name="${item.field}"]`);
            await autocomplete.fill('Giang Thị Nhung');
            await autocomplete.locator('xpath=following-sibling::p-overlay').getByRole('option').first().click();
        } else if (item.type === 'multiselect') {
            const select = locator.locator(`div#${item.field}`);
            const listOptions = item.value.split(',');
            await select.click();
            for (const op of listOptions) {
                await page.waitForTimeout(200);
                await select.getByRole('searchbox').first().fill(op);
                await page.waitForTimeout(200);
                await select.locator('p-overlay').getByRole('option').first().click();
                await page.waitForTimeout(200);
            }
        } else if (item.type === 'date') {
            await locator.locator(`input[name="${item.field}"]`).pressSequentially(item.value);
            await page.pause();
        }
    }
}