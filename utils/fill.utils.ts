import {Locator, Page} from '@playwright/test';
import {ICreate} from '../constants/interface';
import {CBMS_MODULE} from '../constants/common';

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
      const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
      await datePickerCalendar.locator('span.p-highlight').first().click();
    }
  }
}

export const fillText = async (locator: Locator, id: string, value: string) => {
  const currentInput = locator.locator(`#${id}`);
  await currentInput.clear();
  await currentInput.fill(value);
}

export const fillNumber = async (locator: Locator, id: string, value: string) => {
  const currentInput = locator.locator(`#${id}`);
  await currentInput.clear();
  await currentInput.pressSequentially(value);
}

export const selectOption = async (page: Page, locator: Locator, id: string, value: string) => {
  const currentInput = locator.locator(`div#${id}`);
  await currentInput.click();
  await page.waitForSelector('[role="listbox"]', {state: 'visible'});
  await currentInput.getByRole('searchbox').fill(value);
  const option = page.getByRole('option', {name: value, exact: true});
  await option.click();
  await page.waitForSelector('[role="listbox"]', {state: 'detached'});
}

export const selectDate = async (page: Page, locator: Locator, id: string, value?: string) => {
  const currentInput = locator.locator(`input[name="${id}"]`);
  const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  if (value) {
    await currentInput.pressSequentially(value);
    await datePickerCalendar.locator('span.p-highlight').first().click();
  } else {
    await currentInput.click();
    await datePickerCalendar.locator('td.p-datepicker-today').first().click();
    await page.getByRole('dialog', { name: 'Choose Date' }).waitFor({ state: 'detached' });
  }
}

export const selectFile = async (locator: Locator, value: string, accept?:string) => {
  if(accept) {
    await locator.locator(`input[type="file"][accept*='${accept}']`).setInputFiles(value);
  } else
  await locator.locator('input[type="file"]').setInputFiles(value);
}

export const selectAutocompleteMulti = async (
  page: Page,
  locator: Locator,
  title: string,
  dialogTitle: string,
  value: string,
  api: string) => {
  await locator.locator('auto-complete-multi').filter({hasText: title}).locator('span').nth(1).click();
  const dialog = page.getByRole('dialog').filter({ hasText: dialogTitle });
  await dialog.locator(`input[name=keySearch]`).fill(value);
  await dialog.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}${api}`) && response.status() === 200);
  await dialog.getByRole('row').nth(1).locator('a').click();
}