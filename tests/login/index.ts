import {Page} from '@playwright/test';
import * as path from 'node:path';

const authFile = path.join(__dirname, '..', 'state.json');

export const login = async (page: Page, url: string, username: string = process.env.SSO_USERNAME, password: string = process.env.PASSWORD) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(1000);
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
    await page.waitForTimeout(2000);
    if (!page.url().startsWith('http://localhost:8080/')) {
      await page.locator('#username').fill(username);
      await page.locator('#password').fill(password);
      await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
      await page.waitForURL('http://localhost:8080/home-page');
      await page.context().storageState({path: authFile});
    }
    await page.waitForTimeout(1000);
    await page.goto(url);
    await page.waitForSelector('p-treenode', {state: 'visible'});
  }
}

export const loginWithRole = async (page: Page, username: string, password: string, url: string) => {
  await page.locator('.header-avatar').click();
  await page.getByRole('link', {name: 'Đăng xuất'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', {name: 'ĐĂNG NHẬP'}).click();
  if (page.url().startsWith('chrome-error://chromewebdata/')) {
    await page.getByRole('button', {name: 'Advanced'}).click();
    await page.getByRole('link', {name: 'Proceed to 10.255.58.201 ('}).click();
  }
  await page.waitForSelector('p-treenode', {state: 'visible'});
  await page.goto(url);
};