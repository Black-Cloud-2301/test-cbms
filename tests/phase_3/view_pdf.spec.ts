import {expect, Page, test} from '@playwright/test';
import {login} from '../login';
import pdfParse from 'pdf-parse';
import {CONTRACTOR_NAME_SEARCH} from '../../constants/common';

const contractorName = CONTRACTOR_NAME_SEARCH;

test('view pdf bid evaluation', async ({ page }) => {
  test.setTimeout(120000);

  await loginAndSearch(page);

  const mainDialog = page.getByRole('dialog', { name: 'Xem chi tiết' });
  let table = mainDialog.locator('.p-treetable-tbody');
  let tableRow = table.locator('tr');
  let countBidder = await tableRow.count();

  // Đợi cho đến khi có nhiều hơn 1 bidder
  while (countBidder <= 1) {
    await page.waitForTimeout(100);
    countBidder = await tableRow.count();
  }

  for (let i = 1; i < countBidder; i++) {
    const row = tableRow.nth(i);
    await row.getByTitle('Xem văn bản').click();

    const resPromise = page.waitForResponse(resp =>
      resp.url().includes('/contractor/view-file') && resp.status() === 200
    );
    const res = await resPromise;
    const resJson = await res.json();

    expect(resJson.type).toEqual('SUCCESS');
    expect(resJson.data?.filePath).not.toBe(null);

    const base64String = resJson.data.base64String;
    const buffer = Buffer.from(base64String, 'base64');
    const pdfData = await pdfParse(buffer);
    await assertPdfMatches(normalizePdfText(pdfData.text), [
      { label: 'Chúng tôi tên là:', expected: 'Chu Tiến Dũng, Vũ Thế Huy' },
      { label: 'Công tác tại:', expected: 'Tổng Công ty CP Công trình Viettel' },
      { label: 'gói thầu số', expected: '856-DTRR-VCC-TTCNTT-TC-2025' },
      { label: 'NGƯỜI CAM KẾT', expected: 'Chu Tiến Dũng' },
      { label: 'Ủy viên', expected: 'Vũ Thế Huy' },
    ]);
  }

});

const loginAndSearch = async (page: Page) => {
  await login(page, '/CBMS_DOCUMENT_BY_PID_INVEST');
  await page.locator(`input[name="keySearch"]`).fill(contractorName);
  await page.getByRole('button', {name: 'Tìm kiếm'}).click();
  await page.waitForResponse(response => response.url().includes('/contractor/doSearch') && response.status() === 200);
  await page.getByTitle('Xem chi tiết').first().click();
}

const assertPdfMatches = async (textToCheck: string, expectations: { label: string, expected: string }[]) => {
  for (const { label, expected } of expectations) {
    const index = textToCheck.indexOf(label);
    if (index === -1) {
      throw new Error(`Không tìm thấy label: "${label}" trong PDF`);
    }

    const nextSegment = textToCheck.substring(index, index + 300); // kiểm tra trong đoạn gần label
    if (!nextSegment.includes(expected)) {
      throw new Error(`Không tìm thấy giá trị mong đợi "${expected}" sau label "${label}". Đoạn kiểm tra:\n${nextSegment}`);
    }
  }
}

const normalizePdfText = (text: string) => {
  return text.replace(/-\s*\n\s*/g, '-')       // gộp dấu gạch ngang bị ngắt dòng
    .replace(/\n/g, ' ')              // thay \n bằng khoảng trắng
    .replace(/\s+/g, ' ')             // gộp nhiều khoảng trắng
    .trim();                          // bỏ trắng đầu cuối
}
