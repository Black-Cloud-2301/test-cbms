import {expect, Locator, Page} from '@playwright/test';
import {CBMS_MODULE} from '../constants/common';


export const fillText = async ({locator, name, value}: { locator: Locator, name: string, value: string }) => {
    const currentInput = locator.locator(`input[name="${name}"]`);
    await currentInput.clear();
    await currentInput.fill(value);
}

export const fillNumber = async ({locator, name, value}: { locator: Locator, name: string, value: string }) => {
    const currentInput = locator.locator(`p-inputnumber[ng-reflect-name="${name}"]`).locator('input');
    await currentInput.clear();
    await currentInput.fill(value);
}

export const fillTextarea = async ({locator, name, value}: { locator: Locator, name: string, value: string }) => {
    const currentInput = locator.locator(`textarea[name="${name}"]`);
    await currentInput.clear();
    await currentInput.fill(value);
}

export const selectAutocomplete = async (
    {page, locator, title, dialogTitle, value, api, multiple = false}: {
        page: Page,
        locator: Locator,
        title: string,
        dialogTitle: string,
        value: string,
        api: string,
        multiple?: boolean
    }) => {
    await locator.locator('auto-complete').filter({hasText: title}).locator('span').nth(1).click();
    const dialog = page.getByRole('dialog').filter({hasText: dialogTitle});
    await dialog.locator(`input[name=keySearch]`).fill(value);
    await dialog.getByRole('button', {name: 'Tìm kiếm'}).click();
    await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}${api}`) && response.status() === 200);
    if (multiple) {
        let tableRow = dialog.locator('tbody tr');
        let rowCount = await tableRow.count();
        expect(rowCount > 0);
        const row = tableRow.first();
        await row.locator('p-tablecheckbox').click();
        await dialog.getByRole('button', {name: 'Ghi lại'}).click();
    } else {
        await dialog.getByRole('row').nth(1).locator('a').click();
    }
}

export const selectDate = async ({
                                     page,
                                     locator,
                                     labelText,
                                     value,
                                     mode = 'date',
                                     index = 0
                                 }: {
    page: Page,
    locator: Locator,
    labelText: string,
    value?: string,
    mode?: 'date' | 'year',
    index?: number
}) => {
    const datePicker = locator.locator(`date-picker-v2[ng-reflect-label="${labelText}"]`).nth(index);
    const currentInput = datePicker.locator('input[role="combobox"]');
    // console.log(await currentInput.evaluate(el => el.outerHTML));
    const datePickerCalendar = mode === 'date' ? page.locator('[role="grid"].p-datepicker-calendar') : page.locator('div.p-yearpicker');
    const timesIcon = currentInput.locator('..').locator('timesicon.p-calendar-clear-icon')
    if (await timesIcon.isVisible()) {
        await timesIcon.click();
    }
    if (value) {
        await currentInput.clear();
        await currentInput.pressSequentially(value);
        await datePickerCalendar.locator('span.p-highlight').first().click();
    } else {
        await currentInput.click();
        await page.waitForSelector('.p-datepicker[role="dialog"]', {state: 'visible'});
        await datePickerCalendar.locator('td.p-datepicker-today').first().click();
        await page.getByRole('dialog', {name: 'Choose Date'}).waitFor({state: 'detached'});
    }
}