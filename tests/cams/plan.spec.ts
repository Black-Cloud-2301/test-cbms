import {Page} from "@playwright/test";
import {fillNumber, fillText, fillTextarea, selectAutocomplete, selectDate} from "../../utils/fill_cams.utils";
import {checkSuccess} from "../../utils/helper.util";

const defaultName = 'TA autotest'

export const createPlan = async (page: Page): Promise<void> => {
    await page.getByRole('button', {name: 'Thêm mới'}).click();
    const dialog = page.getByRole('dialog', {name: 'Thêm mới kế hoạch kiểm tra'});
    await fillText({locator: dialog, name: 'name', value: defaultName});
    await selectAutocomplete({
        page,
        locator: dialog,
        title: 'Đơn vị kiểm tra',
        dialogTitle: 'Tìm kiếm đơn vị',
        value: 'TCT',
        api: '/sysGroup/searchSysGroupPlan'
    });
    await selectDate({page, locator: dialog, labelText: 'Thời gian bắt đầu'});
    await selectDate({page, locator: dialog, labelText: 'Thời gian kết thúc'});
    await fillTextarea({locator: dialog, name: 'description', value: "Nội dung kiểm tra test"});
    await selectAutocomplete({
        page,
        locator: dialog,
        title: 'Thêm mới thành viên',
        dialogTitle: 'Tìm kiếm Người tạo',
        value: '',
        api: '/sysUser/searchSelect'
    });
    await selectAutocomplete({
        page,
        locator: dialog,
        title: 'Thêm mới thành viên',
        dialogTitle: 'Tìm kiếm Người tạo',
        value: '',
        api: '/sysUser/searchSelect'
    });
    await selectAutocomplete({
        page,
        locator: dialog,
        title: 'Thêm mới thành viên',
        dialogTitle: 'Tìm kiếm Người tạo',
        value: '',
        api: '/sysUser/searchSelect'
    });
    let table = dialog.getByRole('table').first();
    let tableRow = table.locator('tbody tr');
    let row = tableRow.first();
    await row.locator('div.p-radiobutton-box').click();

    await selectAutocomplete({
        page,
        locator: dialog,
        title: 'Chọn đơn vị',
        dialogTitle: 'Tìm kiếm đơn vị',
        value: '',
        api: '/sysGroup/searchSysGroupPlan'
    });
    await fillNumber({locator: dialog, name: 'rateInspect', value: '10'});
    await page.pause();
    await dialog.getByRole('button', {name: 'Ghi lại'}).click();
    await checkSuccess({page});
}