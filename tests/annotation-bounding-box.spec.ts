import { test, expect, request, Page } from '@playwright/test';
import LoginPage from "../pages/welcomeLoginPage"
import ProjectsPage from '../pages/ProjectsPage';
import ProjectViewPage from '../pages/projectViewPage';
import DatasetViewPage from '../pages/datasetViewPage';
import AnnotationStudioPage from '../pages/annotationStudioPage';
import AnnotationAPIs from '../apis/annotaionsApis';

const username = "<ADD USERNAME HERE>";
const password = "<ADD PASSWORD HERE>"

test('create bounding box', async ({ page }) => {

  // new annotation position in %
  const point1_x = 0.25
  const point1_y = 0.25
  const point2_x = 0.75
  const point2_y = 0.75

  // create page objects
  const loginPage = new LoginPage(page);
  const projectsPage = new ProjectsPage(page);  
  const projectViewPage = new ProjectViewPage(page);
  const datasetViewPage = new DatasetViewPage(page);
  const studioPage = new AnnotationStudioPage(page);
  const annotationAPIs = new AnnotationAPIs(page);

  await test.step("Open dataloop.ai website", async () => {

    // open website url (pulls baseURL from playwright.config.ts file: https://console.dataloop.ai)
    await page.goto('/');

    // check site opens  
    expect(loginPage.expectWelcomeToDataloopVisible()).toBeVisible();
  })

  await test.step("Log-in", async () => {

    // click 'sign up / login' button   
    await loginPage.clickOnSignupLoginButton();

    // login: fill values and click login button
    await loginPage.enterValuesClickLogin(username, password)

    // check 'My projects' title visible
    expect(projectsPage.expectMyProjectsTitleVisible()).toBeVisible({timeout: 20000});
  })

  await test.step("Open project: Dataloop - Home Assignment", async () => {

    // open project: 'Dataloop - Home Assignment'
    await projectsPage.openHomeAssignmentProject();

    // check 'Contributors' text is visible   //.first()
    expect(projectViewPage.expectContributorsText()).toBeVisible({timeout: 10000});
  })

  await test.step("Open dataset: Concerts", async () => {
    
    // click on Concerts's (dataset) 'BROWSE' button 
    await projectViewPage.clickOnBrowseButtonAtConcertsDataset();

    // check datasets page open
    expect(page).toHaveURL(/.*datasets/);
  })

  await test.step("Open first dataset image", async () => {

    // double click on first image
    await datasetViewPage.doubleClickOnFirstImage();

    // check 'image annotation studio application'opens 
    await expect(page).toHaveURL(/.*view=/);

  })
  
  await test.step("Delete annotations via REST APIs and refresh UI", async () => {

    // delete annotations
    await annotationAPIs.delete_all_annotaions_from_item(page);

    // reload webpage
    await page.reload();

    // get existing annotations
    var annotations_ids = await annotationAPIs.get_annotaions_ids(page);

    // validate annotations removed  
    expect(annotations_ids.length).toEqual(0);

  })

  await test.step("Add a new bounding box annotation", async () => {

    // select the 'selection' tool
    await studioPage.selectSelectionTool();

    // select the 'box' tool 
    await studioPage.selectBoxTool();

    // add a bounding box annotation via the UI (mouse clicks) 
    await studioPage.addBoundingBoxAnnotationViaUI(page, point1_x, point1_y, point2_x, point2_y);

    // click save button
    await studioPage.clickSaveButton();  
  })

  await test.step("verify annotation's size", async () => {

    // check UI text indicates that 1 annotation exists
    expect(studioPage.expectWelcomeToDataloopVisible()).toBeVisible();

    // verify annotation size (width, height)
    const _first_annotation = 0
    
    await studioPage.verify_annotation_size(
      page,
      _first_annotation,
      point1_x, point1_y, 
      point2_x, point2_y
    );
  })

});

