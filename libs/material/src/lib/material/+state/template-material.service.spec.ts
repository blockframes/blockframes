import { SpectatorService, createServiceFactory } from "@ngneat/spectator/jest";
import { TemplateMaterialService } from "./template-material.service";
import { AngularFireModule } from "@angular/fire";
import { initializeTestApp } from "@firebase/testing";
import { AngularFireFunctionsModule } from "@angular/fire/functions";
import { AngularFirestoreModule, AngularFirestore } from "@angular/fire/firestore";
import { CollectionService } from "akita-ng-fire";
import { TemplateQuery } from "../../template/+state/template.query";
import { MaterialQuery } from "./material.query";
import { MaterialStore } from "./material.store";
import { Material, MaterialTemplate } from "./material.model";

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

const materialMock = {
  id: 'id',
  category: 'category1',
  value: 'value1',
  description: 'description1',
  price: 60,
  currency: null,
  isOrdered: false,
  isPaid: false,
  deliveryIds: ['deliveryId'],
  storage: 'store'
} as Material;

const materialTemplateMock = {
  id: 'id',
  category: 'category1',
  value: 'value1',
  description: 'description1',
  price: 60,
  currency: null
} as MaterialTemplate;

describe('TemplateMaterialService unit test', () => {
  let spectator: SpectatorService<TemplateMaterialService>;
  let templateMaterialService: TemplateMaterialService;

  const createService = createServiceFactory({
      service: TemplateMaterialService,
      imports: [
          AngularFireModule.initializeApp(initTestApp),
          AngularFireFunctionsModule,
          AngularFirestoreModule
      ],
      mocks: [AngularFirestore],
      providers: [
        TemplateQuery,
        MaterialQuery,
        MaterialStore
      ]
  });

  beforeEach(() => {
    spectator = createService();
    templateMaterialService = spectator.get(TemplateMaterialService);
  })

  it('should be created', () => {
    expect(templateMaterialService).toBeTruthy();
  });

  it('should remove a material from a template', () => {
      const spy = jest.spyOn(CollectionService.prototype, 'remove').mockImplementation();
      templateMaterialService.deleteTemplateMaterial('id');
      expect(spy).toHaveBeenCalledTimes(1);
  })

  it('create material template', () => {
    const material = templateMaterialService.addTemplateMaterial();
    // Check if the material is created like we expect and with the same id.
    const materialTemplate = {
      id: material.id,
      category: '',
      value: '',
      description: '',
      price: null,
      currency: null
    };
    expect(material).toEqual(materialTemplate);
  })

  it('should take a Material and return a MaterialTemplate', () => {
    const materialTemplate = templateMaterialService.formatToFirestore(materialMock);
    expect(materialTemplate).toEqual(materialTemplateMock);
  })
})
