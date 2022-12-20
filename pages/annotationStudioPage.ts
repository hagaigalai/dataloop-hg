import { expect, Page } from "@playwright/test";
import TextUtils from "../utils/textUtils";

export default class AnnotationStudioPage {

    constructor(public page: Page) { }

    async selectSelectionTool() {
        await this.page.locator('[class="icon-dl-selection q-icon notranslate"]').click({ timeout: 15000 });
    }

    async selectBoxTool() {
        await this.page.locator('[class="icon-dl-box q-icon notranslate"]').click();
    }

    async clickSaveButton() {
        // click save button
        await this.page.locator('.save-btn > .q-btn').click({ timeout: 8000 });

        // wait for network idle (no traffic, 500 ms)
        await this.page.waitForLoadState('networkidle')
    }

    expectWelcomeToDataloopVisible() {
        return this.page.getByText('All Annotations (1)')
    }

    async addBoundingBoxAnnotationViaUI(
        page: Page,
        _x1_percentage: number, // from 0-1; example the following will add annotation from p1: top-left to p2: middle-middle of the image: 0,0; 0.5,0.5 
        _y1_percentage: number,
        _x2_percentage: number,
        _y2_percentage: number) {

        await this.add_bounding_box_annotation_via_mouse_clicks(page, _x1_percentage, _y1_percentage, _x2_percentage, _y2_percentage)
    }

    // get id functions //

    async get_dataset_id_from_url(url: string) {

        // sample input = "https://console.dataloop.ai/projects/77d59f37-0e32-4eb5-8ca1-63fd102c9a83/datasets/639f20d49b13c1e86ac22f0c/items/639f21939f3d180999d3ac12?view=icons&page=0&pageSize=100&current=%2F&sort=%7B%22by%22%3A%22type%22,%22order%22%3A%22ascending%22%7D&dqlFilter=%7B%22filter%22%3A%7B%22%24and%22%3A%5B%7B%22hidden%22%3Afalse%7D,%7B%22type%22%3A%22file%22%7D%5D%7D%7D"

        const firstWord: string = await '/datasets/'

        const secondWord: string = await '/items/'

        const textUtils = new TextUtils(this.page);

        return textUtils.get_text_between_words(url, firstWord, secondWord)

    }

    async get_item_id_from_url(url: string) {

        // sample input = "https://console.dataloop.ai/projects/77d59f37-0e32-4eb5-8ca1-63fd102c9a83/datasets/639f20d49b13c1e86ac22f0c/items/639f21939f3d180999d3ac12?view=icons&page=0&pageSize=100&current=%2F&sort=%7B%22by%22%3A%22type%22,%22order%22%3A%22ascending%22%7D&dqlFilter=%7B%22filter%22%3A%7B%22%24and%22%3A%5B%7B%22hidden%22%3Afalse%7D,%7B%22type%22%3A%22file%22%7D%5D%7D%7D"

        const firstWord: string = await '/items/'

        const secondWord: string = await '?view'

        const textUtils = new TextUtils(this.page);

        return textUtils.get_text_between_words(url, firstWord, secondWord)
    }

    // create annotation //
    
    async add_bounding_box_annotation_via_mouse_clicks(
        page: Page,
        _x1_percentage: number, // from 0-1; example the following will add annotation from p1: top-left to p2: middle-middle of the image: 0,0; 0.5,0.5 
        _y1_percentage: number,
        _x2_percentage: number,
        _y2_percentage: number) {

        // get image bouding box 
        const box = await page.locator('[id="imageDisplayContainer"]').boundingBox()

        // save dimentions as vars (as a workaround for a warning)
        const _x: any = await box?.x;

        const _y: any = await box?.y;

        const _width: any = await box?.width;

        const _height: any = await box?.height;

        // calc point #1,2:
        const _point1_x: any = await _x + _width * _x1_percentage;

        const _point1_y: any = await _y + _height * _y1_percentage;

        const _point2_x: any = await _x + (_width * _x2_percentage);

        const _point2_y: any = await _y + (_height * _y2_percentage);

        // click on two points
        await page.mouse.click(_point1_x, _point1_y);

        await page.mouse.click(_point2_x, _point2_y);
    }

    // annotation size functions //

    async verify_annotation_size(page: Page,
        _annotation_index_number: number, // 0 = first annotation
        _expected_x1_percentage: number, // from 0-1; example, the '0,0; 0.5,0.5' annotation starts from the top-left image side to the middle-middle of the image 
        _expected_y1_percentage: number,
        _expected_x2_percentage: number,
        _expected_y2_percentage: number) {

        // get actual annotation width, height
        const _actual_width_height = await this.get_actual_annotation_size(page, _annotation_index_number);

        const _actual_annotation_width: number = await _actual_width_height[0];

        const _actual_annotation_height: number = await _actual_width_height[1];

        // get actual image size
        const _image_width_height = await this.get_image_width_height(page)

        const _image_width: number = await _image_width_height[0];

        const _image_height: number = await _image_width_height[1];

        // calc expected annotation width, height (from image size)
        const _expected_width_height = await this.get_expected_annotation_size(
            page,
            _image_width,
            _image_height,
            _expected_x1_percentage,
            _expected_y1_percentage,
            _expected_x2_percentage,
            _expected_y2_percentage
        );

        const _expected_annotation_width: number = await _expected_width_height[0];

        const _expected_annotation_height: number = await _expected_width_height[1];

        // validate actual === expected annotation size (with a 2 pixles diff range as a buffer)
        const _width_diff: number = await Math.abs(_expected_annotation_width - _actual_annotation_width);

        const _height_diff: number = await Math.abs(_expected_annotation_height - _actual_annotation_height);

        await expect(_width_diff).toBeLessThanOrEqual(2);

        await expect(_height_diff).toBeLessThanOrEqual(2);

    }

    async get_actual_annotation_size(page: Page, _annotation_index: number) {  // returns [width, height]

        // get dataset id from url 
        let datasetID: any = await this.get_dataset_id_from_url(page.url());

        // get item id (image id) from url
        let itemID: any = await this.get_item_id_from_url(page.url());

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

        // get actual annotation size
        const _i: number = _annotation_index;

        const _actual_annotation_width: number = await (res[_i].coordinates[1].x) - (res[_i].coordinates[0].x)

        const _actual_annotation_height: number = await (res[_i].coordinates[1].y) - (res[_i].coordinates[0].y)

        // print sizes
        console.log(await "actual_annotation_width: " + _actual_annotation_width.toString());

        console.log(await "actual_annotation_height: " + _actual_annotation_height.toString());

        return [_actual_annotation_width, _actual_annotation_height] as const;
    }

    async get_image_width_height(page: Page) {  // returns [width, height]

        // get dataset id from url 
        let datasetID: any = await this.get_dataset_id_from_url(page.url());

        // get item id (image id) from url
        let itemID: any = await this.get_item_id_from_url(page.url());

        // get item's annotations (REST API)
        const _response = await page.request.get("https://gate.dataloop.ai/api/v1/datasets/" + datasetID + "/items/" + itemID);

        // validate response status  
        await expect(_response.status()).toBe(200);

        // validae response  
        await expect(_response.ok()).toBeTruthy();

        // get response content 
        const res = await _response.json();

        // get image size   
        const _image_width: number = await (res.metadata.system.width);

        const _image_height: number = await (res.metadata.system.height);

        // print result
        console.log(await "_image_width: " + _image_width.toString());

        console.log(await "_image_height: " + _image_height.toString());

        return [_image_width, _image_height] as const;
    }

    async get_expected_annotation_size(
        page: Page,
        _image_width: number,
        _image_height: number,
        _expected_x1_percentage: number,
        _expected_y1_percentage: number, // from 0-1; example, the '0,0; 0.5,0.5' annotation starts from the top-left image side to the middle-middle of the image
        _expected_x2_percentage: number,
        _expected_y2_percentage: number
    ) {

        var _expected_annotation_width = 0;

        var _expected_annotation_height = 0

        // calc width
        if (_expected_x1_percentage >= _expected_x2_percentage) {

            _expected_annotation_width = _image_width * (_expected_x1_percentage - _expected_x2_percentage);

        } else {

            _expected_annotation_width = _image_width * (_expected_x2_percentage - _expected_x1_percentage);
        }

        // calc height
        if (_expected_y1_percentage >= _expected_y2_percentage) {

            _expected_annotation_height = _image_height * (_expected_y1_percentage - _expected_y2_percentage);

        } else {

            _expected_annotation_height = _image_height * (_expected_y2_percentage - _expected_y1_percentage);
        }

        // print results 
        console.log(await "_expected_annotation_width: " + _expected_annotation_width.toString());

        console.log(await "_expected_annotation_height: " + _expected_annotation_height.toString());

        return [_expected_annotation_width, _expected_annotation_height] as const;
    }


}

