import {expect, Page} from '@playwright/test';
import * as path from 'node:path';
import {IUser, USERS} from '../../constants/user';
import {URL_BASE} from '../../constants/common';

const authFile = path.join(__dirname, '..', 'state.json');

export const login = async (page: Page, url?: string, user: IUser = USERS.NHUNG) => {
  await page.goto('');
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
    await page.waitForTimeout(2000);
    if (page.url().startsWith(URL_BASE)) {
      await page.waitForSelector('p-treenode', {state: 'visible'});
      // await page.waitForTimeout(2000);
      await page.locator('.header-avatar').click();
      const personalPage = page.locator('.darkened-content');
      const personalContent = personalPage.locator('.personal-content-page');
      const content = await personalContent.locator('span').nth(1).innerText();
      // await page.pause();
      if (!content.includes(user.code + ' - ' + user.name)) {
        await loginWithRole(page, user, '');
      } else {
        await personalPage.locator('.pi.pi-times').click();
      }
    } else {
      await page.locator('#username').fill(user.code);
      await page.locator('#password').fill(user.password);
      await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
      await page.waitForURL(`${URL_BASE}/home-page`);
      await page.context().storageState({path: authFile});
    }
    await page.waitForSelector('p-treenode', {state: 'visible'});

    // await checkUserLoad(page, user);
    if (url)
      await page.goto(url);
  }
}

export const loginWithRole = async (page: Page, user: IUser, url: string) => {
  if (!page.url().startsWith(URL_BASE)) {
    await login(page, url,user);
    return;
  }
  if (!await page.locator('.personal-content-page').isVisible()) {
    await page.locator('.header-avatar').click();
  }
  await page.getByRole('link', {name: 'Đăng xuất'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.locator('#username').fill(user.code);
  await page.locator('#password').fill(user.password);
  await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await checkUserLoad(page, user);
  await page.goto(url);
};

const checkUserLoad = async (page: Page, user: IUser) => {
  const prevUrl = page.url();

  // ⏳ Chờ xem trang có tự reload không (timeout thấp)
  try {
    await page.waitForFunction(
      prev => location.href !== prev,
      prevUrl,
      {timeout: 5000}
    );
    await page.waitForLoadState('load'); // đợi reload xong
  } catch (e) {
    // Nếu không reload trong 3s thì tiếp tục như thường
  }

  // ✅ Sau khi chắc chắn reload xong (hoặc không reload), mở popup
  await page.locator('.header-avatar').click();
  const personalPage = page.locator('.darkened-content');
  await personalPage.waitFor({state: 'visible', timeout: 5000});

  const personalContent = personalPage.locator('.personal-content-page');
  const content = personalContent.locator('span').nth(1);

  // 🔍 Xác minh nội dung user
  await expect(content).toHaveText(`${user.code} - ${user.name}`, {timeout: 10000});

  // ❌ Đóng popup
  await personalPage.locator('.pi.pi-times').click();
};


