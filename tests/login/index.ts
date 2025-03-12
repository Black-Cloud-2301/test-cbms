import {Page} from '@playwright/test';
import * as path from "node:path";

const authFile = path.join(__dirname, '..', 'state.json');

export const login = async (page:Page, url: string) => {
    await page.goto(url);
    if(page.url().startsWith('chrome-error://chromewebdata/')) {
        await page.getByRole('button', { name: 'Advanced' }).click();
        await page.getByRole('link', { name: 'Proceed to 10.255.58.201 (' }).click();
        await page.locator("#username").fill(process.env.SSO_USERNAME);
        await page.locator("#password").fill(process.env.PASSWORD);
        await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
        await page.waitForURL('http://localhost:8080/home-page');
        await page.context().storageState({path: authFile});
        await page.waitForTimeout(1000);
        await page.goto(url);
    }
}