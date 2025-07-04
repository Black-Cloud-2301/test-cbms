import {expect, Locator, Page} from '@playwright/test';
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
export const fillTextV2 = async (locator: Locator, name: string, value: string) => {
  const currentInput = locator.locator(`input[name="${name}"]`);
  await currentInput.clear();
  await currentInput.fill(value);
}
export const fillEditor = async (locator: Locator, id: string, value: string) => {
  const currentInput = locator.locator(`#${id} div.ql-editor`);
  await currentInput.clear();
  await currentInput.fill(value);
}

export const fillNumber = async (locator: Locator, id: string, value: string) => {
  const currentInput = locator.locator(`#${id}`);
  await currentInput.clear();
  await currentInput.pressSequentially(value);
}
export const fillNumberV2 = async (locator: Locator, name: string, value: string) => {
  const currentInput = locator.locator('input-v2').filter({hasText: name}).locator('input');
  await currentInput.clear();
  await currentInput.pressSequentially(value);
}

export const selectOption = async (page: Page, locator: Locator, id: string, value: string) => {
  const currentInput = locator.locator(`div#${id}`);
  await currentInput.click();
  await page.waitForSelector('[role="listbox"]', {state: 'visible'});
  await page.locator('.p-dropdown-panel').getByRole('searchbox').fill(value);
  const option = page.getByRole('option', {name: value, exact: true});
  await option.click();
  await page.waitForSelector('[role="listbox"]', {state: 'detached'});
}

export const selectOptionV2 = async (page: Page, locator: Locator, labelText: string, value: string, index: number = 0) => {
  const combo = locator
    .locator(`select-filter`).filter({hasText: labelText}).locator('span[role="combobox"]').nth(index);

  await expect(combo).toBeVisible();       // chắc chắn tìm được

  // 2️⃣ Mở dropdown
  await combo.click();
  await page.waitForSelector('[role="listbox"]', {state: 'visible'});

  // 3️⃣ (tùy) gõ vào searchbox
  const searchBox = page.locator('.p-dropdown-panel').getByRole('searchbox');
  if (await searchBox.count()) {
    await searchBox.fill(value);
  }

  // 4️⃣ Chọn option
  await page.getByRole('option', { name: value, exact: true }).click();
  await page.waitForSelector('[role="listbox"]', { state: 'detached' });
}

export const selectDate = async (page: Page, locator: Locator, id: string, value?: string) => {
  const currentInput = locator.locator(`input[name="${id}"]`);
  const datePickerCalendar = page.locator('[role="grid"].p-datepicker-calendar');
  const timesIcon = currentInput.locator('..').locator('timesicon.p-calendar-clear-icon')
  if (await timesIcon.isVisible()) {
    await timesIcon.click();
  }
  if (value) {
    await currentInput.clear();
    await currentInput.pressSequentially(value);
    // await datePickerCalendar.locator('span.p-highlight').first().click();
  } else {
    await currentInput.click();
    await datePickerCalendar.locator('td.p-datepicker-today').first().click();
    await page.getByRole('dialog', {name: 'Choose Date'}).waitFor({state: 'detached'});
  }
}

export const selectDateV2 = async (page: Page, locator: Locator, labelText: string, value?: string, mode:"date"|"year" = "date", index: number = 0) => {
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
    await datePickerCalendar.locator('td.p-datepicker-today').first().click();
    await page.getByRole('dialog', {name: 'Choose Date'}).waitFor({state: 'detached'});
  }
}

export const selectFile = async ({
                                   locator, value, accept, fileType
                                 }: { locator: Locator; value: string; accept?: string; fileType?: string }) => {
  if (accept) {
    await locator.locator(`input[type="file"][accept*='${accept}']`).first().setInputFiles(value);
  } else
    await locator.locator('input[type="file"]').first().setInputFiles(value);

  if (fileType) {
    const fileName = value.split('/').pop();
    await locator.getByRole('row').filter({hasText: fileName}).first().getByRole('cell').filter({hasText: /^$/}).first().click();
    await locator.locator('select').selectOption(fileType);
  }
}

export const selectAutocompleteMulti = async (
  {page, locator, title, dialogTitle, value, api, multiple = false}:{
    page: Page,
    locator: Locator,
    title: string,
    dialogTitle: string,
    value: string,
    api: string,
    multiple?: boolean
  }) => {
  await locator.locator('auto-complete-multi').filter({hasText: title}).locator('span').nth(1).click();
  const dialog = page.getByRole('dialog').filter({hasText: dialogTitle});
  await dialog.locator(`input[name=keySearch]`).fill(value);
  await dialog.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes(`${CBMS_MODULE}${api}`) && response.status() === 200);
  if(multiple) {
    let tableRow = dialog.locator('tbody tr');
    let rowCount = await tableRow.count();
    expect(rowCount > 0);
    const row = tableRow.first();
    await row.locator('p-tablecheckbox').click();
    await dialog.getByRole('button',{name:'Ghi lại'}).click();
  } else {
    await dialog.getByRole('row').nth(1).locator('a').click();
  }
}