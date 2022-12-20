import { Page } from "@playwright/test";

export default class ProjectViewPage {

    constructor(public page: Page) { }

    expectContributorsText() {
        return this.page.getByText('Contributors').first()
    }

    async clickOnBrowseButtonAtConcertsDataset() {
        // // get 'Concerts' dataset row
        const datasetRow = await this.page.locator('[data-cy="Concerts-row"]');

        // // click on Concerts's (dataset) 'BROWSE' button 
        await datasetRow.getByRole('button', { name: 'browse' }).click();
    }
}
