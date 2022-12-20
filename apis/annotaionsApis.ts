import { expect, request, Page } from "@playwright/test";
import AnnotationStudioPage from "../pages/annotationStudioPage";



export default class AnnotationAPIs {
 
    constructor(public page: Page) { }

    async delete_all_annotaions_from_item(page: Page) {

        // get dataset id from url
        const studioPage = new AnnotationStudioPage(page);

        let datasetID: any = await studioPage.get_dataset_id_from_url(page.url());

        // get item id (image id) from url
        let itemID: any = await studioPage.get_item_id_from_url(page.url());

        // get all annotation ids from item 
        let annotations_ids = await this.get_annotaions_ids(page);

        for (var index in annotations_ids) {

            const _deleteResponse = await page.request.delete("https://gate.dataloop.ai/api/v1/datasets/" + datasetID + "/items/" + itemID + "/annotations/" + annotations_ids[index]);

            await expect(_deleteResponse.ok()).toBeTruthy();
        }
    }

    async get_annotaions_ids(page: Page) {

        // get dataset id from url
        const studioPage = new AnnotationStudioPage(page);

        let datasetID: any = await studioPage.get_dataset_id_from_url(page.url());

        // get item id (image id) from url
        let itemID: any = await studioPage.get_item_id_from_url(page.url());

        // create empty array 
        var annotations_ids = new Array();

        // get item's annotations (REST API) 
        const _response = await page.request.get("https://gate.dataloop.ai/api/v1/datasets/" + datasetID + "/items/" + itemID + "/annotations");

        // validate response status  
        await expect(_response.status()).toBe(200);

        // validae response  
        await expect(_response.ok()).toBeTruthy();

        // get response content 
        const res = await _response.json();

        // add annotation ids to array 
        for (let i = 0; i < res.length; i++) {
            annotations_ids.push(await res[i].id);
        }

        return annotations_ids
    }

}