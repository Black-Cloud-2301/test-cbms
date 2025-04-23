import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {IUser, USERS} from '../../constants/user';

const contractorName = 'TA autotest 5';

test('import bid evaluation', async ({page}) => {
  test.setTimeout(120000);

  await login(page, '/CBMS_BID_EVALUATION', USERS.MANH);
  await search(page);

  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ mời thầu'});
  // await page.pause();

  // upload file mailing 2
  await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/bm_mailing_danh_gia.xlsx');
  await mainDialog.getByRole('button', {name: 'Tải lên'}).click();

  let resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/import');
  let resJson = await resPromise.json();
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();


  await saveForm(page, mainDialog);

  await loginWithRoleAndSearch(page,USERS.NHUNG);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  //   second step

  let evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá tính hợp lệ'});
  const tableRow = mainDialog.locator('tbody tr');
  const ordinalNumbersFirst = ['1', '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5', '2.1.6']
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    await tableRow.nth(i).getByRole('button').click();
    for (let j = 0; j < ordinalNumbersFirst.length; j++) {
      const number = ordinalNumbersFirst[j];
      await evaluateDialog.getByRole('cell', {
        name: number,
        exact: true
      }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
      if (i === 0 && j === 0) {
        await page.getByRole('option', {name: 'Không đạt', exact: true}).click();
      } else {
        await page.getByRole('option', {name: 'Đạt', exact: true}).click();
      }
      await page.waitForTimeout(100);
    }
    await page.getByRole('button', {name: 'Lưu'}).click();
  }

  await saveForm(page, mainDialog);

  // Step 3
  await search(page);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  const ordinalNumbersSecond = ['1', '2', '3.1', '3.2', '4', '5']
  evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá về năng lực kinh nghiệm'});
  countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    const button = tableRow.nth(i).getByRole('button');
    if (await button.isDisabled()) {
      continue;
    }
    await button.click();
    for (let j = 0; j < ordinalNumbersSecond.length; j++) {
      const number = ordinalNumbersSecond[j];
      await evaluateDialog.getByRole('cell', {
        name: number,
        exact: true,
      }).locator('..').getByRole('combobox', {name: '--Chọn--'}).click();
      if (i === 0 && j === 0) {
        await page.getByRole('option', {name: 'Không đạt', exact: true}).click();
      } else {
        await page.getByRole('option', {name: 'Đạt', exact: true}).click();
      }
      await page.waitForTimeout(100);
    }
    await page.getByRole('button', {name: 'Lưu'}).click();
  }

  await saveForm(page, mainDialog);


  // STEP 4
  await loginWithRoleAndSearch(page,USERS.HONG);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  for (let i = 0; i < countBidder; i++) {
    let currentRow = tableRow.nth(i);
    let combobox = currentRow.locator('span#technicalAssessment');
    if (await combobox.isDisabled()) {
      continue;
    }
    await combobox.click();
    await page.getByRole('option', {name: 'Đạt', exact: true}).click();
    await currentRow.locator('#technicalAssessmentComment').fill('Nhận xét của tổ chuyên gia ' + (i + 1));
  }
  await saveForm(page, mainDialog);

  // STEP 5
  await loginWithRoleAndSearch(page,USERS.TUOI);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await page.pause();
  await saveForm(page, mainDialog);


  // STEP 6
  await loginWithRoleAndSearch(page,USERS.NHUNG);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  await mainDialog.getByRole('button', {name: 'Chọn file'});

  await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/sample.pdf');
  await mainDialog.getByRole('button', {name: 'Chốt'}).click();

  resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/save');
  resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Chốt thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

test('reevaluate', async ({page}) => {
  test.setTimeout(120000);

  await login(page, '/CBMS_BID_EVALUATION', USERS.NHUNG);
  await search(page);
  await page.getByRole('button', {name: 'Đánh giá lại'}).click();
  await page.getByRole('button', {name: 'Có'}).click();
  let resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/reevaluate/**');
  let resJson = await resPromise.json();
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Gửi yêu cầu đánh giá lại thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ mời thầu'});

  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  //   second step

  await saveForm(page, mainDialog);


  // Step 3
  await search(page);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  await saveForm(page, mainDialog);


  // STEP 4
  await loginWithRoleAndSearch(page,USERS.HONG);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  await page.getByRole('button', {name: 'Ghi lại'}).click();
  resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/save');
  resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Lưu dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();


  // STEP 5
  await loginWithRoleAndSearch(page,USERS.TUOI);

  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  await saveForm(page, mainDialog);


  // STEP 6
  await loginWithRoleAndSearch(page,USERS.NHUNG);

  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await page.pause();
  await mainDialog.getByRole('button', {name: 'Chốt'}).click();


  resPromise = await page.waitForResponse('**/cbms-service/bid-evaluation/save');
  resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Chốt thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
})

const saveForm = async (page: Page, dialog: Locator, url: string = '**/cbms-service/bid-evaluation/save', successText: string = 'Lưu dữ liệu thành công') => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
  // await page.pause();
}

const loginWithRoleAndSearch = async (page: Page, user: IUser) => {
  await loginWithRole(page, user, '/CBMS_BID_EVALUATION');
  await search(page);
}

const search = async (page: Page) => {
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/cbms-service/contractor/doSearch') && response.status() === 200);
  await page.waitForTimeout(500);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
}