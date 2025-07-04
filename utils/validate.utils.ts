import {expect, Locator, Page} from '@playwright/test';
import {selectAutocompleteMulti, selectDate, selectDateV2} from './fill.utils';
import {getDateFormatRegex, parseDateFromString} from './date.utils';
import {IValidateTableColumn} from '../constants/validate-table/validate-table.constants';
import {IAppParam} from '../constants/interface';
import {screenshot} from './index';

interface IValidateInput {
  locator: Locator;
  maxLength?: number;
  searchValue?: string | number;
  title?: string;
  dialogTitle?: string;
  apiUrl?: string;
  name?: string;
  index?: number;
  allowClear?: boolean;
}

interface ISearchCheckOptions {
  page: Page;
  url: string;
  searchObject?: Record<string, string | number | number[]>;
  type?: 'TEXT' | 'CURRENCY' | 'SELECT' | 'MULTI_SELECT' | 'AUTOCOMPLETE_MULTI' | 'DATE';
  validateInput?: IValidateInput;
  conditions: ISearchFieldGroup[];
}

interface ISearchFieldGroup {
  fields: string[];
  value?: string | number | number[];
  match?: 'EXACT' | 'CONTAINS' | 'MORE_THAN_EQUAL' | 'LESS_THAN_EQUAL';
  canNull?: boolean;
}

export const validateInputText = async ({locator, searchValue, maxLength = 200}: IValidateInput) => {
  // Tập ký tự test: chữ cái, số, đặc biệt
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/`~';

  // Lặp từng ký tự và nhập vào input
  for (let i = 0; i <= maxLength; i++) {
    const char = characters[i % characters.length]; // Lặp lại nếu hết ký tự
    await locator.press(char);
  }

  const value = await locator.inputValue(); // Lấy giá trị thực tế trong input

  expect(value.length).toBe(maxLength); // Nếu hệ thống cắt đúng tại maxLength

  if (searchValue) {
    await locator.clear();
    await locator.fill(typeof searchValue === 'number' ? searchValue.toString() : searchValue);
  }
};

export const validateInputTextV2 = async ({locator, searchValue, name, index = 0, maxLength = 200}: IValidateInput) => {
  const currentLocator = locator.locator(`input[name="${name}"]`).nth(index);
  // Tập ký tự test: chữ cái, số, đặc biệt
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/`~';

  // Lặp từng ký tự và nhập vào input
  for (let i = 0; i <= maxLength; i++) {
    const char = characters[i % characters.length]; // Lặp lại nếu hết ký tự
    await currentLocator.press(char);
  }

  const value = await currentLocator.inputValue(); // Lấy giá trị thực tế trong input

  expect(value.length).toBe(maxLength); // Nếu hệ thống cắt đúng tại maxLength

  if (searchValue) {
    await currentLocator.clear();
    await currentLocator.fill(typeof searchValue === 'number' ? searchValue.toString() : searchValue);
  }
};

const clearInputText = async ({locator, name, index = 0, allowClear}: IValidateInput) => {
  if(allowClear) {
    const currentLocator = locator.locator(`input[name="${name}"]`).nth(index);
    await currentLocator.clear();
  }
}

export const validateInputNumber = async ({locator, searchValue, maxLength = 16}: IValidateInput) => {
  // Tập ký tự test: chữ cái, số, đặc biệt
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/`~';

  // Lặp từng ký tự và nhập vào input
  for (let i = 0; i <= 200; i++) {
    const char = characters[i % characters.length]; // Lặp lại nếu hết ký tự
    await locator.press(char);
  }

  const value = await locator.inputValue(); // Lấy giá trị thực tế trong input
  expect(value.replace(/\./g, '').length).toBe(maxLength); // Nếu hệ thống cắt đúng tại maxLength
  if (searchValue) {
    await locator.clear();
    await locator.fill(typeof searchValue === 'number' ? searchValue.toString() : searchValue);
  }
};

export const checkSearchResponse = async ({
                                            page,
                                            url,
                                            searchObject,
                                            type,
                                            validateInput,
                                            conditions,
                                          }: ISearchCheckOptions) => {

  switch (type) {
    case 'CURRENCY':
      await validateInputNumber(validateInput);
      await checkResponse({page, url, searchObject, conditions});
      break;
    case 'SELECT': {
      await validateInput.locator.click();
      await page.waitForSelector('[role="listbox"]', {state: 'visible'});
      const list = page.getByRole('option');
      const count = await list.count();
      for (let i = 0; i < count; i++) {
        const row = list.nth(i);
        if (i === 0) {
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        } else {
          await validateInput.locator.click();
          await page.waitForTimeout(1000);
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        }
      }
    }
      break;
    case 'MULTI_SELECT':
      await validateInput.locator.click();
      await page.waitForSelector('[role="listbox"]', {state: 'visible'});
      const list = page.getByRole('option');
      const count = await list.count();
      for (let i = 0; i < count; i++) {
        const row = list.nth(i);
        if (i === 0) {
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        } else if (i === 1) {
          await validateInput.locator.click();
          await page.waitForTimeout(1000);
          await list.nth(i - 1).click();
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        } else if (i === 2) {
          await validateInput.locator.click();
          await page.waitForTimeout(1000);
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        }
      }
      break;
    case 'AUTOCOMPLETE_MULTI':
      await selectAutocompleteMulti({
        page,
        locator: validateInput.locator,
        title: validateInput.title,
        dialogTitle: validateInput.dialogTitle,
        value: validateInput.searchValue as string,
        api: validateInput.apiUrl
      })
      await validateAutocompleteMulti(validateInput)
      await checkResponse({page, url, searchObject, conditions});
      break;
    case 'DATE':
      await selectDate(page, validateInput.locator, Object.keys(searchObject)[0], validateInput.searchValue as string)
      await checkResponseDate({page, url, searchObject, conditions});
      break;
    default:
      await validateInputText(validateInput);
      await checkResponse({page, url, searchObject, conditions});
      break;
  }
};export const checkSearchResponseV2 = async ({
                                            page,
                                            url,
                                            searchObject,
                                            type,
                                            validateInput,
                                            conditions,
                                          }: ISearchCheckOptions) => {

  switch (type) {
    case 'CURRENCY':
      await validateInputNumber(validateInput);
      await checkResponse({page, url, searchObject, conditions});
      break;
    case 'SELECT': {
      await validateInput.locator.click();
      await page.waitForSelector('[role="listbox"]', {state: 'visible'});
      const list = page.getByRole('option');
      const count = await list.count();
      for (let i = 0; i < count; i++) {
        const row = list.nth(i);
        if (i === 0) {
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        } else {
          await validateInput.locator.click();
          await page.waitForTimeout(1000);
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        }
      }
    }
      break;
    case 'MULTI_SELECT':
      const locator = validateInput.locator.locator("multi-select").filter({hasText: validateInput.name}).locator('p-multiselect').nth(validateInput.index || 0);
      await locator.click();
      await page.waitForSelector('[role="listbox"]', {state: 'visible'});
      const list = page.getByRole('option');
      const count = await list.count();
      for (let i = 0; i < count; i++) {
        const row = list.nth(i);
        if (i === 0) {
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        } else if (i === 1) {
          await locator.click();
          await page.waitForTimeout(1000);
          await list.nth(i - 1).click();
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        } else if (i === 2) {
          await locator.click();
          await page.waitForTimeout(1000);
          await row.click();
          await checkResponseMultiSelect({page, url, searchObject, conditions});
        }
      }
      if(validateInput.allowClear) {
        await locator.locator('timesicon').locator('svg').click();
      }
      break;
    case 'AUTOCOMPLETE_MULTI':
      await selectAutocompleteMulti({
        page,
        locator: validateInput.locator,
        title: validateInput.title,
        dialogTitle: validateInput.dialogTitle,
        value: validateInput.searchValue as string,
        api: validateInput.apiUrl
      })
      await validateAutocompleteMulti(validateInput)
      await checkResponse({page, url, searchObject, conditions});
      break;
    case 'DATE':
      await selectDateV2(page, validateInput.locator, validateInput.name, validateInput.searchValue as string)
      await checkResponseDate({page, url, searchObject, conditions});
      break;
    default:
      await validateInputTextV2(validateInput);
      await checkResponse({page, url, searchObject, conditions});
      await clearInputText(validateInput);
      break;
  }
};

const checkResponse = async ({page, url, searchObject, conditions}: ISearchCheckOptions) => {
  const [res] = await Promise.all([
    page.waitForResponse(async res => {
      if (!res.url().includes(url) || res.status() !== 200) return false;

      const body = res.request().postDataJSON();
      if (!body) return false;
      return Object.entries(searchObject).every(([key, value]) => {
        const actual = body[key];

        if (Array.isArray(value)) {
          // ✅ value là mảng → ít nhất 1 phần tử khớp
          return value.includes(actual);
        } else {
          // ✅ value là giá trị đơn
          return actual === value;
        }
      });
    }),
    page.getByRole('button', {name: 'Tìm kiếm'}).click()
  ]);

  const responseData = await res.json();
  expect(responseData.type).toEqual('SUCCESS');

  const raw = responseData.data?.content ?? responseData.data.content ?? responseData.data ?? [];
  const items = Array.isArray(raw) ? raw : [raw];

  for (const item of items) {
    for (const {fields, value, canNull, match = 'CONTAINS'} of conditions) {
      const numericValue = Number(value);

      if (match === 'MORE_THAN_EQUAL' || match === 'LESS_THAN_EQUAL') {
        const hasMatch = fields.some(field => {
          if (canNull && !item[field]) return true;
          const actualValue = Number(item[field]);
          if (isNaN(actualValue)) return false;

          return match === 'MORE_THAN_EQUAL'
            ? actualValue >= numericValue
            : actualValue <= numericValue;
        });

        expect(hasMatch).toBeTruthy();

      } else {
        const expected = String(value).toLowerCase();
        // console.log('expected', expected)
        const hasMatch = fields.some(field => {
          const actual = String(item[field] ?? '').toLowerCase();
          // console.log('field', field)
          // console.log('actual', actual)

          return match === 'EXACT'
            ? actual === expected
            : actual.includes(expected);
        });
        if (!hasMatch) {
          await screenshot(page, 'policy');
          await page.pause();
        }

        expect(hasMatch).toBeTruthy();
      }
    }
  }
}

const checkResponseDate = async ({page, url, searchObject, conditions}: ISearchCheckOptions) => {
  const [res] = await Promise.all([
    page.waitForResponse(async res => {
      if (!res.url().includes(url) || res.status() !== 200) return false;

      const body = res.request().postDataJSON();
      if (!body) return false;
      return Object.entries(searchObject).every(([key, value]) => {
        const actual = body[key];

        if (Array.isArray(value)) {
          // ✅ value là mảng → ít nhất 1 phần tử khớp
          return value.includes(actual);
        } else {
          // ✅ value là giá trị đơn
          return actual === value;
        }
      });

    }),
    page.getByRole('button', {name: 'Tìm kiếm'}).click()
  ]);

  const responseData = await res.json();
  expect(responseData.type).toEqual('SUCCESS');

  const raw = responseData.data?.content ?? responseData.data.content ?? responseData.data ?? [];
  const items = Array.isArray(raw) ? raw : [raw];

  for (const item of items) {
    for (const {fields, value, canNull, match = 'CONTAINS'} of conditions) {

      if (match === 'MORE_THAN_EQUAL' || match === 'LESS_THAN_EQUAL') {
        const hasMatch = fields.some(field => {
          if (canNull && !item[field]) return true;

          const actualRaw = item[field];
          const expectedRaw = value;

          const actualDate = parseDateFromString(actualRaw);
          const expectedDate = parseDateFromString(expectedRaw as string);
          return match === 'MORE_THAN_EQUAL'
            ? actualDate >= expectedDate
            : actualDate <= expectedDate;
        });

        expect(hasMatch).toBeTruthy();
      }
    }
  }
}

const checkResponseMultiSelect = async ({page, url, searchObject, conditions}: ISearchCheckOptions) => {
  const [res] = await Promise.all([
    page.waitForResponse(async res => {
      if (!res.url().includes(url) || res.status() !== 200) return false;

      const body = res.request().postDataJSON();
      if (!body) return false;
      return Object.entries(searchObject).every(([key, value]) => {
        const actual = body[key];

        if (value === null) {
          // ✅ Nếu value là null → chỉ cần có key trong body
          return actual !== undefined;
        }

        if (Array.isArray(value)) {
          // ✅ value là mảng → ít nhất một phần tử khớp
          return value.includes(actual);
        }

        // ✅ So sánh đơn giản
        return actual === value;
      });
    }),
    page.getByRole('button', {name: 'Tìm kiếm'}).click()
  ]);

  const requestData = res.request().postDataJSON();
  const responseData = await res.json();
  expect(responseData.type).toEqual('SUCCESS');

  const raw = responseData.data?.content ?? responseData.data.content ?? responseData.data ?? [];
  const items = Array.isArray(raw) ? raw : [raw];

  for (const item of items) {
    for (const {fields, canNull} of conditions) {
      const expected = requestData[Object.keys(searchObject)[0]].toString().toLowerCase();
      const hasMatch = fields.some(field => {
        const actual = String(item[field] ?? '').toLowerCase();
        return canNull && !actual ? true : expected.includes(actual);
      });
      expect(hasMatch).toBeTruthy();
    }
  }
  await page.waitForSelector('[role="listbox"]', {state: 'detached'});
}

export const validateAutocompleteMulti = async ({locator, searchValue, title}: IValidateInput) => {
  const value = await locator
    .locator('auto-complete-multi')
    .filter({hasText: title})
    .locator('input[type="text"]')
    .first()
    .inputValue();

  expect(value).toEqual(searchValue);
};

export const validateDataTable = async (page: Page, columns: IValidateTableColumn[], params: Record<string, IAppParam[]>) => {
  let tableRow = page.locator('tbody tr');
  let countBidder = await tableRow.count();

  for (let i = 0; i < countBidder; i++) {
    const row = tableRow.nth(i);
    let colIndex = 0;
    for (const item of columns) {
      const cell = row.locator('td').nth(colIndex);
      const text = await cell.innerText();
      if (item.require) {
        expect(text.trim().length).toBeGreaterThan(0);
      }
      switch (item.type) {
        case 'text':
          if (item.optionValue) {
            const optionValues = Array.isArray(item.optionValue) ? item.optionValue : params[item.optionValue]?.map(a => a.label);
            expect(optionValues).toContain(text);
          }
          break;
        case 'number':
          expect(!isNaN(Number(text))).toBeTruthy();
          break;
        case 'currency':
          expect(text).toMatch(/^\d{1,3}(.\d{3})*(\.\d+)?$/); // ví dụ: 1,000,000.00
          break;
        case 'link':
          const requiredClasses = ['cursor-pointer', 'text-blue-400', 'underline'];
          const classAttr = await cell.getAttribute('class');
          const actual = classAttr?.split(/\s+/) ?? [];
          for (const cls of requiredClasses) {
            expect(actual).toContain(cls);
          }
          break;
        case 'date':
          const dateText = await cell.innerText();
          const format = item.format ?? 'DD/MM/YYYY';
          const regex = getDateFormatRegex(format);

          expect(dateText.trim()).toMatch(regex);
          break;
        /*case 'action':
          const buttons = cell.locator('button');
          await expect(buttons).toHaveCount(0); // có ít nhất 1 nút thao tác
          break;*/
        default:
          break;
      }
      colIndex++;
    }
  }
}