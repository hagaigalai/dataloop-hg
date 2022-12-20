import { Page } from "@playwright/test";

export default class ProjectsPage {

    constructor(public page: Page) { }

    expectMyProjectsTitleVisible(){
        return this.page.locator('text= My Projects ')    
    }

    async openHomeAssignmentProject() {
        await this.page.locator('[id="projectTitleClickable_77d59f37-0e32-4eb5-8ca1-63fd102c9a83"]').click();
    } 
}

