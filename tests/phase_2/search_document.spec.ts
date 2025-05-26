import {test} from '@playwright/test';
import {login} from '../login';
import {checkSearchResponse} from '../../utils/validate.utils';
import {URL_BE_BASE} from '../../constants/common';

test('document search form', async ({page}) => {
  test.setTimeout(180000);
  await login(page, '/CBMS_DOCUMENT_BY_PID');
  let searchValue: string | number | number[] = 'autotest';
  let locator = page.locator('input#keySearch');

  await checkSearchResponse({
    page,
    url: URL_BE_BASE + '/contractor/doSearch',
    searchObject: {keySearch: searchValue},
    validateInput: {locator, searchValue},
    conditions: [{fields: ['contractorCode', 'contractorName'], value: searchValue}]
  });
  await locator.clear();

  locator = page.locator('div#searchPage');
  await checkSearchResponse({
    page,
    url: URL_BE_BASE + '/contractor/doSearch',
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
  const now = new Date();
  searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()).toString().padStart(2, '0')}/${now.getFullYear()}`;

  await checkSearchResponse({
    page,
    url: URL_BE_BASE + '/contractor/doSearch',
    searchObject: {fromDate: searchValue},
    type: 'DATE',
    validateInput: {locator, searchValue},
    conditions: [{fields: ['createdAt'], value: searchValue, match: 'MORE_THAN_EQUAL'}]
  });

  locator = page.locator('div#searchPage');
  searchValue = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  await checkSearchResponse({
    page,
    url: URL_BE_BASE + '/contractor/doSearch',
    searchObject: {toDate: searchValue},
    type: 'DATE',
    validateInput: {locator, searchValue},
    conditions: [{fields: ['createdAt'], value: searchValue, match: 'LESS_THAN_EQUAL'}]
  });

  locator = page.locator('div#listStatus');
  await checkSearchResponse({
    page,
    url: URL_BE_BASE + '/contractor/doSearch',
    type: 'MULTI_SELECT',
    validateInput: {locator},
    searchObject: {listStatus: null},
    conditions: [{fields: ['status']}]
  });

  locator = page.locator('div#inputSources');
  await checkSearchResponse({
    page,
    url: URL_BE_BASE + '/contractor/doSearch',
    type: 'MULTI_SELECT',
    validateInput: {locator},
    searchObject: {inputSources: null},
    conditions: [{fields: ['inputSource']}]
  });
  await locator.locator('timesicon').locator('svg').click();
})
