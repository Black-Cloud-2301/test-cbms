import {test} from '@playwright/test';
import {login} from '../login';
import {fillValue} from '../../utils/fill.utils';
import {CreateData} from '../../constants/document-by-pid/create.constants';

test('create', async ({page}) => {
    await login(page, '/CBMS_EXPERT_GROUP');

    await page.getByRole('button', {name: 'Thêm mới'}).click();

    const dialog = page.getByRole('dialog');

    await fillValue(dialog, CreateData);
    await page.pause();
})