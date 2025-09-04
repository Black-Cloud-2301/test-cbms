import {expect, Page, Request} from "@playwright/test";
import {CBMS_MODULE} from "../constants/common";
import {screenshot} from "./index";

export const search = async ({page, url, expected, button = 'Tìm kiếm'}: {
    page: Page,
    url: string,
    button?: string,
    expected?: Record<string, any>
}) => {
    await page.locator('input[name="keySearch"]').fill(expected.keySearch);

    const [req, res] = await Promise.all([
        page.waitForRequest((r) => r.url().includes(url)),
        page.waitForResponse((r) => r.url().includes(url) && r.ok()),
        page.getByRole('button', {name: button}).click(),
    ]);

    // 2) Parse request -> object
    const payload = getRequestPayload(req);

    // 3) So sánh subset giữa expected và payload
    expectPayloadIncludes(payload, expected);

    // 4) Assert response như cũ
    const resJson = await res.json();
    expect(resJson.data).toBeDefined();
}

export const checkSuccess = async (
    {page, url = `**${CBMS_MODULE}/vtnet-plan/save`, successText = 'Thành công'}: {
        page: Page,
        url: string,
        successText: string
    }
) => {
    const alertSuccess = page.locator('[role="alert"].p-toast-message-success');
    const resPromise = page.waitForResponse(url);

    const response = await resPromise;
    const resJson = await response.json();

    if (resJson.type !== 'SUCCESS') {
        await screenshot(page, 'project-failed');
    }

    expect(resJson.type).toBe('SUCCESS');

    const toastDetail = alertSuccess.locator('.p-toast-detail');
    await expect(toastDetail).toHaveText(successText);

    const hasSuccessText = await toastDetail.textContent();
    if (hasSuccessText?.includes(successText)) {
        await screenshot(page, 'project-success');
    }

    await alertSuccess.locator('.p-toast-icon-close').click();
};

const getRequestPayload = (req: Request) => {
    // GET: đọc query
    if (req.method() === 'GET') {
        const u = new URL(req.url());
        return Object.fromEntries(u.searchParams.entries()); // all strings
    }

    // POST/PUT/PATCH: đọc body theo content-type
    const ct = req.headers()['content-type'] || '';
    if (ct.includes('application/json')) {
        try {
            return req.postDataJSON() ?? {};
        } catch {
            return {};
        }
    }
    // form-urlencoded hoặc raw text
    const raw = req.postData() || '';
    try {
        return Object.fromEntries(new URLSearchParams(raw));
    } catch {
        return {_raw: raw};
    }
}

const expectPayloadIncludes = (actual: Record<string, any>, expected: Record<string, any>) => {
    for (const [k, v] of Object.entries(expected)) {
        // Ép về string để tránh lệch kiểu (GET -> string, JSON -> number/boolean)
        expect(String(actual?.[k])).toBe(String(v));
    }
}
