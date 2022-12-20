import { expect, Page } from "@playwright/test";

export default class LoginPage {

    constructor(public page: Page) { }

    async clickOnSignupLoginButton() {
        await this.page.getByRole('button', { name: 'Sign Up / Login' }).click();
    }

    async enterUsername(username: string) {
        await this.page.locator(`[name='email']`)
            .fill(username);
    }

    async enterPassword(password: string) {
        await this.page.locator(`[name='password']`)
            .fill(password);
    }

    async clickOnLoginButton() {
        await this.page.locator('button[name="submit"]').click();
    }

    async enterValuesClickLogin(username: string, password: string) {

        // fill username field
        await this.enterUsername(username);

        // fill password field
        await this.enterPassword(password);

        // click 'login' button
        await this.clickOnLoginButton();
    }

    expectWelcomeToDataloopVisible() {
        return this.page.getByText('Welcome to Dataloop')
    }
}

