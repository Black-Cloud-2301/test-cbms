import {Page} from '@playwright/test';
import * as path from 'node:path';
import {IUser, USERS} from '../../constants/user';

const authFile = path.join(__dirname, '..', 'state.json');

export const login = async (page: Page, url: string, user: IUser = USERS.NHUNG) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(1000);
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
    await page.waitForTimeout(2000);
    if (page.url().startsWith('http://localhost:8080/')) {
      await page.waitForSelector('p-treenode', {state: 'visible'});
      await page.locator('.header-avatar').click();
      const personalPage = page.locator('.darkened-content');
      const personalContent = personalPage.locator('.personal-content-page');
      const content = await personalContent.locator('span').nth(1).innerText();
      if (!content.includes(user.code + ' - ' + user.name)) {
        await loginWithRole(page, user, 'http://localhost:8080/');
      } else {
        await personalPage.locator('.pi.pi-times').click();
      }
    } else {
      await page.locator('#username').fill(user.code);
      await page.locator('#password').fill(user.password);
      await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
      await page.waitForURL('http://localhost:8080/home-page');
      await page.context().storageState({path: authFile});
    }
    await page.waitForSelector('p-treenode', {state: 'visible'});
    await page.goto(url);
    await page.waitForSelector('p-treenode', {state: 'visible'});
  }
}

export const loginWithRole = async (page: Page, user: IUser, url: string) => {
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
  await page.goto(url);
};