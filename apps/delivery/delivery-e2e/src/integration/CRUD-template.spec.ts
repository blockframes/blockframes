/// <reference types="cypress" />
import {
  LoginViewPage,
  MATERIALS,
  MovieCreatePage,
  setupForMacbook,
  TemplateAddModal,
  TemplateCreatePage,
  TemplateEditablePage,
  TemplateListPage,
  User,
  WelcomeViewPage
} from '../support';

const TEMPLATE_NAME_1 = 'Crud Template';

const USER: User = {
  email: 'cypress@pl.com',
  surname: 'cypress',
  name: 'pl',
  password: 'blockframes'
};

beforeEach(() => {
  setupForMacbook();
});

describe('Test CRUD template', () => {
  it.skip('should login, create a template, create materials, delete materials, edit material, then delete this template', () => {
    // Connection
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieCreatePage = p2.clickSigninWithNoMovies();

    // Go to template list
    const p4: TemplateCreatePage = p3.clickContextMenuTemplatesCreate();
    const p5: TemplateAddModal = p4.clickNewTemplate();

    // create a new template
    p5.fillName(TEMPLATE_NAME_1);
    const p6: TemplateEditablePage = p5.clickNext();

    // create a new material
    p6.addMaterial();
    p6.fillMaterial(MATERIALS[0]);
    p6.assertMaterialExists(MATERIALS[0]);
    p6.saveMaterial();
    p6.assertMaterialExists(MATERIALS[0]);

    // go back to template list
    const p7: TemplateListPage = p6.clickContextMenuTemplates();
    p7.assertTemplateExists(TEMPLATE_NAME_1);

    // re-open previous template
    const p8: TemplateEditablePage = p7.editTemplate(TEMPLATE_NAME_1);

    // create another one
    p8.addMaterial();
    p8.fillMaterial(MATERIALS[1]);
    p8.assertMaterialExists(MATERIALS[1]);
    p8.saveMaterial();
    p6.assertMaterialExists(MATERIALS[1]);

    // edit the first one
    p8.editMaterial(MATERIALS[0]);
    p8.clearMaterial();
    p8.fillMaterial(MATERIALS[2]);
    p8.assertMaterialExists(MATERIALS[2]);
    p8.saveMaterial();
    p6.assertMaterialExists(MATERIALS[2]);

    // delete both
    p8.editMaterial(MATERIALS[1]);
    p8.deleteMaterial();
    p8.editMaterial(MATERIALS[2]);
    p8.deleteMaterial();
    p8.assertNoMaterialsExists();

    // go back to template list
    const p9: TemplateListPage = p6.clickContextMenuTemplates();

    // delete the template
    p9.deleteTemplate(TEMPLATE_NAME_1);

    // assert that the list is empty
    p9.assertNoTemplatesExists();
  });
});
