import {test} from '@playwright/test';
import {login} from '../login';

test('create', async ({page}) => {
    await login(page, '/CBMS_POLICY');

    await page.getByRole('button', {name:'Thêm mới'}).click();

    await page.locator("input[name='policyName']").fill("Tên chủ trương");

    await page.locator('#pn_id_41').getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.pause();
    await page.getByRole('option', { name: 'Nhóm A' }).click();
    await page.locator('#pn_id_43').getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.getByLabel('Đầu tư xây dựng').getByText('Đầu tư xây dựng').click();
    await page.locator('#pn_id_45').getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.getByRole('option', { name: 'I', exact: true }).click();
    await page.locator('input[name="yearFrom"]').fill('12');
    await page.locator('#pn_id_47').getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.getByRole('option', { name: 'II', exact: true }).first().click();
    await page.locator('input[name="yearTo"]').fill('12');
    await page.locator('input-v2').filter({ hasText: 'Quy mô đầu tư *' }).getByRole('spinbutton').fill('1000000');
    await page.locator('#pn_id_51').getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.getByRole('option', { name: 'm2' }).click();
    await page.locator('#pn_id_53').getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.getByLabel('Nâng cấp nguồn').getByText('Nâng cấp nguồn').click();
    await page.locator('input[name="projectFunding"]').fill('Nguồn vốn dự án');
    await page.locator('input[name="investmentTarget"]').fill('Mục tiêu đầu tư');
    await page.locator('input-v2').filter({ hasText: 'Tổng mức đầu tư(vnd) *' }).getByRole('spinbutton').fill('1000000000');
    await page.locator('input[name="projectLocation"]').fill('HN');
    await page.locator('input[name="implementationDate"]').fill('12');
    await page.getByRole('combobox', { name: '-- Chọn --' }).first().click();
    await page.getByText('Năm').click();
    await page.locator('input[name="note"]').fill('note');
    await page.getByRole('button', { name: 'Tiếp' }).click();
    await page.locator('input[name="decisionNumber"]').fill('QD_SO_1');
    await page.getByRole('dialog', { name: 'Tạo mới chủ trương' }).getByPlaceholder('dd/mm/yyyy').click();
    await page.getByText('12', { exact: true }).click();
    await page.getByRole('combobox', { name: '-- Chọn --' }).click();
    await page.getByRole('option', { name: 'HĐQT' }).click();
    await page.locator('span').filter({ hasText: 'Chọn file' }).first().setInputFiles('../assets/files/sample.pdf');
    await page.getByRole('button', { name: 'Ghi lại' }).click();

    await page.pause();
})