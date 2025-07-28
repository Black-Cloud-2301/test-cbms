import {expect, Locator, Page, test} from '@playwright/test';
import {login, loginWithRole} from '../login';
import {IUser, USERS} from '../../constants/user';
import {CBMS_MODULE, CONTRACTOR_STATUS, ROUTES} from '../../constants/common';
import {getGlobalVariable, setGlobalVariable} from '../../utils';
import {getAvailableContractorInvest} from '../phase_2/full_follow.spec';
import {getAvailableContractorPurchase} from '../phase_4/selection_plan.spec';

const totalImport = 6;

test('bid evaluation full', async ({page}) => {
  test.setTimeout(180000);

  await evaluate({page, invest: true});
})

test('reevaluate', async ({page}) => {
  test.setTimeout(120000);

  await reEvaluate({page});
})

test('run step', async ({page}) => {
  // await saveStepFifth(page, true);
  await saveStepSix({page, isNew: true});
})

const saveForm = async (page: Page, dialog: Locator, url: string = `**${CBMS_MODULE}/bid-evaluation/save`, successText: string = 'Lưu dữ liệu thành công') => {
  await dialog.getByRole('button', {name: 'Ghi lại'}).click();

  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(url);
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText(successText);
  await alertSuccess.locator('.p-toast-icon-close').click();
  // await page.pause();
}

const loginWithRoleAndSearch = async ({page, user, isNew = false, url = ROUTES.BID_EVALUATION, invest = false}: {
  page: Page,
  user: IUser,
  isNew?: boolean,
  url?: string
  invest?: boolean
}) => {
  if (isNew) {
    await login(page, url, user)
  } else {
    await loginWithRole(page, user, url);
  }
  await search(page, invest);
}

const search = async (page: Page, invest: boolean = true) => {
  const currentContractorName = invest ? getAvailableContractorInvest({status:CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1}).name : getAvailableContractorPurchase({status:CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1}).name;
  await page.locator(`input[name="keySearch"]`).fill(currentContractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse((response) => {
    const urlMatch = response.url().includes(`${CBMS_MODULE}/contractor/doSearch`);
    const isOk = response.status() === 200;

    if (!urlMatch || !isOk) return false;

    const request = response.request();
    const postData = request.postDataJSON(); // Nếu là JSON
    // const postData = request.postData();  // Nếu raw string

    // Ví dụ: check field cụ thể trong payload
    return postData?.keySearch === currentContractorName;
  });
  await page.waitForTimeout(500);
  await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
}

const saveStepSecond = async (page: Page) => {
  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
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
}

const saveStepThird = async (page: Page, invest: boolean) => {
  await search(page, invest);
  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
  const tableRow = mainDialog.locator('tbody tr');
  await checkCountBidder(page, 1);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  const ordinalNumbersSecond = ['1', '2', '3.1', '3.2', '4', '5']
  let evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá về năng lực kinh nghiệm'});
  let countBidder = await tableRow.count();
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
}

const saveStepFourth = async ({page, isNew = false, url, invest = false}: { page: Page, isNew?: boolean, url?: string, invest?:boolean }) => {
  await loginWithRoleAndSearch({page, user: USERS.HONG, isNew, url, invest});
  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
  const tableRow = mainDialog.locator('tbody tr');
  await checkCountBidder(page, 2);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    let currentRow = tableRow.nth(i);
    let combobox = currentRow.locator('span#technicalAssessment');
    // if (await combobox.isDisabled()) {
    //   continue;
    // }
    await combobox.click();
    if (i === 0) {
      await page.getByRole('option', {name: 'Không đạt', exact: true}).click();
    } else {
      await page.getByRole('option', {name: 'Đạt', exact: true}).click();
    }
    await currentRow.locator('#technicalAssessmentComment').fill('Nhận xét của tổ chuyên gia ' + (i + 1));
  }
  await saveForm(page, mainDialog);
}

const saveStepFifth = async ({page, isNew, url, invest = false}: { page: Page, isNew?: boolean, url?: string, invest?:boolean }) => {
  await loginWithRoleAndSearch({page, user: USERS.CAM_NHUNG, isNew, url, invest});
  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
  const tableRow = mainDialog.locator('tbody tr');
  await checkCountBidder(page, 3);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  let countBidder = await tableRow.count();
  for (let i = 0; i < countBidder; i++) {
    let currentRow = tableRow.nth(i);
    if (i < countBidder - 1) {
      await currentRow.locator('#isDiscount').first().click();
    } else {
      await currentRow.locator('#endowPercent').pressSequentially('10');
    }
  }
  // await page.pause();
  await saveForm(page, mainDialog);
}

const saveStepSix = async ({page, isNew = false, reevaluate = false, url, invest = false}: {
  page: Page,
  isNew?: boolean,
  reevaluate?: boolean,
  url?: string;
  invest?: boolean,
}) => {
  await loginWithRoleAndSearch({page, user: USERS.NHUNG, isNew, url, invest});

  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
  await checkCountBidder(page, 4);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await page.waitForTimeout(200);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await page.waitForTimeout(200);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await page.waitForTimeout(200);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  await mainDialog.getByRole('button', {name: 'Chọn file'});

  if (!reevaluate) {
    await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/sample.pdf');
  }

  await mainDialog.getByRole('button', {name: 'Hoàn thành đánh giá'}).click();


  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  let resPromise = await page.waitForResponse(`**${CBMS_MODULE}/bid-evaluation/save`);
  let resJson = await resPromise.json();
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Đánh giá thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();

  const currentContractorName = invest ? getAvailableContractorInvest({status:CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1}).name : getAvailableContractorPurchase({status: CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1}).name;
  const listContractor = getGlobalVariable(invest ? 'listContractorInvest' :'listContractorPurchase');
  const updatedList = listContractor.map(c=> {
    if(c.status === CONTRACTOR_STATUS.VERIFIED_DOCUMENT_BY_PID_V1 && c.name === currentContractorName) {
      return {...c, status: CONTRACTOR_STATUS.EVALUATED}
    }
    return c;
  });
  setGlobalVariable(invest ? 'listContractorInvest' : 'listContractorPurchase', updatedList);
}

const checkCountBidder = async (page: Page, step: number) => {
  // await page.pause();
  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
  const tableRow = mainDialog.locator('tbody tr').first();
  switch (step) {
    case 0:
      await expect(tableRow.locator('td').nth(1)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(2)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(3)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(4)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - totalImport} nhà thầu`)
      break;
    case 1:
      await expect(tableRow.locator('td').nth(1)).toHaveText(`Hoàn thành ${totalImport}/${totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(2)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - 1} nhà thầu`)
      await expect(tableRow.locator('td').nth(3)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(4)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - totalImport} nhà thầu`)
      break;
    case 2:
      await expect(tableRow.locator('td').nth(1)).toHaveText(`Hoàn thành ${totalImport}/${totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(2)).toHaveText(`Hoàn thành ${totalImport - 1}/${totalImport - 1} nhà thầu`)
      await expect(tableRow.locator('td').nth(3)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - 2} nhà thầu`)
      await expect(tableRow.locator('td').nth(4)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - totalImport} nhà thầu`)
      break;
    case 3:
      await expect(tableRow.locator('td').nth(1)).toHaveText(`Hoàn thành ${totalImport}/${totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(2)).toHaveText(`Hoàn thành ${totalImport - 1}/${totalImport - 1} nhà thầu`)
      await expect(tableRow.locator('td').nth(3)).toHaveText(`Hoàn thành ${totalImport - 2}/${totalImport - 2} nhà thầu`)
      await expect(tableRow.locator('td').nth(4)).toHaveText(`Hoàn thành ${totalImport - totalImport}/${totalImport - 3} nhà thầu`)
      break;
    case 4:
      await expect(tableRow.locator('td').nth(1)).toHaveText(`Hoàn thành ${totalImport}/${totalImport} nhà thầu`)
      await expect(tableRow.locator('td').nth(2)).toHaveText(`Hoàn thành ${totalImport - 1}/${totalImport - 1} nhà thầu`)
      await expect(tableRow.locator('td').nth(3)).toHaveText(`Hoàn thành ${totalImport - 2}/${totalImport - 2} nhà thầu`)
      await expect(tableRow.locator('td').nth(4)).toHaveText(`Hoàn thành ${totalImport - 3}/${totalImport - 3} nhà thầu`)
      break;
    default:
      break;
  }
}

export const evaluate = async ({page, url = ROUTES.BID_EVALUATION, invest = true}: { page: Page, url?: string, invest?:boolean }) => {
  await login(page, url, USERS.MANH);
  await search(page, invest);

  const mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});

  // upload file mailing 2
  await mainDialog.locator('input[type="file"]').setInputFiles('assets/files/bm_mailing_danh_gia.xlsx');
  await mainDialog.getByRole('button', {name: 'Tải lên'}).click();

  let resPromise = await page.waitForResponse(`**${CBMS_MODULE}/bid-evaluation/import`);
  let resJson = await resPromise.json();
  const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
  expect(resJson.type).toEqual('SUCCESS');
  await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Import dữ liệu thành công');
  await alertSuccess.locator('.p-toast-icon-close').click();
  await page.waitForTimeout(500);
  await saveForm(page, mainDialog);

  await loginWithRoleAndSearch({page, user: USERS.NHUNG, url, invest});
  await checkCountBidder(page, 0);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  //   second step
  await saveStepSecond(page);

  // Step 3
  await saveStepThird(page, invest);

  // STEP 4
  await saveStepFourth({page, url, invest});

  // await page.pause();
  // STEP 5
  await saveStepFifth({page, url, invest});
  // STEP 6
  await saveStepSix({page, url, invest});
}

export const reEvaluate = async ({page, url = ROUTES.BID_EVALUATION}: { page: Page, url?: string }) => {
  await login(page, url, USERS.NHUNG);
  await search(page);
  const reEvaluateButton = page.getByRole('button', {name: 'Đánh giá lại'});

  let mainDialog = page.getByRole('dialog', {name: 'Thông tin hồ sơ dự thầu'});
  await page.waitForTimeout(1000);
  if (await reEvaluateButton.isVisible()) {
    await reEvaluateButton.click();
    await page.getByRole('button', {name: 'Có'}).click();
    let resPromise = await page.waitForResponse(`**${CBMS_MODULE}/bid-evaluation/reevaluate/**`);
    let resJson = await resPromise.json();
    const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
    expect(resJson.type).toEqual('SUCCESS');
    await expect(alertSuccess.locator('.p-toast-detail')).toHaveText('Gửi yêu cầu đánh giá lại thành công');
    await alertSuccess.locator('.p-toast-icon-close').click();
    await page.getByTitle('Khai báo checklist hồ sơ dự thầu').first().click();
  }

  //   second step
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  const saveBtn = mainDialog.getByRole('button', {name: 'Ghi lại'});
  let tableRow = mainDialog.locator('tbody tr');
  let evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá tính hợp lệ'});
  let countBidder = await tableRow.count();
  if (await saveBtn.isVisible()) {
    const ordinalNumbersFirst = ['1', '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5', '2.1.6']
    for (let i = 0; i < countBidder; i++) {
      await tableRow.nth(i).getByRole('button').click();
      for (let j = 0; j < ordinalNumbersFirst.length; j++) {
        const number = ordinalNumbersFirst[j];
        const cell = evaluateDialog.getByRole('cell', {name: number, exact: true}).locator('..');
        const combo = cell.getByRole('combobox');
        const currentValue = await combo.innerText(); // hoặc innerText() nếu là <span>

        if (i === 0 && currentValue === 'Không đạt') {
          await combo.click();
          await page.getByRole('option', {name: 'Đạt', exact: true}).click();
        } else if (i === 1 && currentValue === 'Đạt') {
          await combo.click();
          await page.getByRole('option', {name: 'Không đạt', exact: true}).click();
        }

        await page.waitForTimeout(100);
      }

      await page.getByRole('button', {name: 'Lưu'}).click();
    }
    await saveForm(page, mainDialog);
  } else {
    await mainDialog.getByRole('button', {name: 'Đóng'}).click();
  }

  // Step 3
  await search(page);
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();

  const ordinalNumbersSecond = ['1', '2', '3.1', '3.2', '4', '5']
  evaluateDialog = page.getByRole('dialog', {name: 'Đánh giá về năng lực kinh nghiệm'});
  countBidder = await tableRow.count();
  if (await saveBtn.isVisible()) {
    for (let i = 0; i < countBidder; i++) {
      await tableRow.nth(i).getByRole('button').click();
      for (let j = 0; j < ordinalNumbersSecond.length; j++) {
        const number = ordinalNumbersSecond[j];
        const cell = evaluateDialog.getByRole('cell', {name: number, exact: true}).locator('..');
        const combo = cell.getByRole('combobox');
        const currentValue = await combo.innerText(); // hoặc innerText() nếu là <span>
        if (currentValue === '--Chọn--') {
          await combo.click();
          await page.getByRole('option', {name: 'Đạt', exact: true}).click();
        } else {
          if (i === 1 && currentValue === 'Đạt') {
            await combo.click();
            await page.getByRole('option', {name: 'Không đạt', exact: true}).click();
          }
        }
        await page.waitForTimeout(100);
      }
      await page.getByRole('button', {name: 'Lưu'}).click();
    }
    await saveForm(page, mainDialog);
  } else {
    await mainDialog.getByRole('button', {name: 'Đóng'}).click();
  }

  // STEP 4
  await loginWithRoleAndSearch({page, user: USERS.HONG});
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  if (await saveBtn.isVisible()) {
    countBidder = await tableRow.count();
    for (let i = 0; i < countBidder; i++) {
      let currentRow = tableRow.nth(i);
      let combobox = currentRow.locator('span#technicalAssessment');
      const comboboxValue = await combobox.innerText(); // hoặc innerText() nếu là <span>
      if (comboboxValue === '--Chọn--') {
        await combobox.click();
        await page.getByRole('option', {name: 'Đạt', exact: true}).click();
      } else {
        if (i === 1 && comboboxValue === 'Đạt') {
          await combobox.click();
          await page.getByRole('option', {name: 'Không đạt', exact: true}).click();
        }
      }
      await currentRow.locator('#technicalAssessmentComment').clear();
      await currentRow.locator('#technicalAssessmentComment').fill('Nhận xét của tổ chuyên gia ' + (i + 1));
    }
    await saveForm(page, mainDialog);
  } else {
    await mainDialog.getByRole('button', {name: 'Đóng'}).click();
  }

  // STEP 5
  await loginWithRoleAndSearch({page, user: USERS.CAM_NHUNG});
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  await mainDialog.getByRole('button', {name: 'Tiếp theo'}).click();
  if (await saveBtn.isVisible()) {
    countBidder = await tableRow.count();
    for (let i = 0; i < countBidder; i++) {
      let currentRow = tableRow.nth(i);
      if (i < countBidder - 1) {
        await currentRow.locator('#isDiscount').first().click();
      } else {
        await currentRow.locator('#endowPercent').clear();
        await currentRow.locator('#endowPercent').pressSequentially('10');
      }
    }
    await saveForm(page, mainDialog);
  } else {
    await mainDialog.getByRole('button', {name: 'Đóng'}).click();
  }

  // STEP 6
  await saveStepSix({page, isNew: false, reevaluate: true});
}