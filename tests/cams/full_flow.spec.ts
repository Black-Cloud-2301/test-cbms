import {test} from "@playwright/test";
import {login} from "../cscm/login";
import {USERS} from "../../constants/user";
import {createPlan} from "./plan.spec";

const testPlanURL = '/ASSET_MANAGEMENT_EMPLOYEE'

test.describe('test plan', () => {
    test.describe.configure({mode: 'serial'});
    test.setTimeout(900000);

    test('create plan', async ({page}) => {
        test.setTimeout(900000);
        await login(page, testPlanURL, USERS.HONG);
        await createPlan(page);
    });

})