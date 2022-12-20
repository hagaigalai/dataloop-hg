import { expect, Page } from "@playwright/test";

export default class DatasetViewPage {

    constructor(public page: Page) { }

    async doubleClickOnFirstImage() {

        // get dataset's image table 
        const datasetImagesTable = await this.page.locator('[class="q-table"]');

        // double click on first image 
        await datasetImagesTable.locator('[class="img-slot"]').first().dblclick();
    }


}
