import { SpectatorService, createServiceFactory } from "@ngneat/spectator/jest";
import { AngularFireModule } from "@angular/fire";
import { initializeTestApp } from "@firebase/testing";
import { AngularFireFunctionsModule } from "@angular/fire/functions";
import { AngularFirestoreModule, AngularFirestore } from "@angular/fire/firestore";
import { DeliveryService } from "./delivery.service";
import { DeliveryStore } from "./delivery.store";
import { DeliveryQuery } from "./delivery.query";
import { MovieQuery } from "@blockframes/movie/movie/+state/movie.query";
import { TemplateQuery } from "../../template/+state/template.query";
import { MaterialQuery } from "../../material/+state/material.query";
import { OrganizationQuery } from "@blockframes/organization/+state/organization.query";
import { DeliveryMaterialService } from "../../material/+state/delivery-material.service";
import { TemplateMaterialService } from "../../material/+state/template-material.service";
import { PermissionsService } from "@blockframes/organization/permissions/+state/permissions.service";
import { StakeholderService } from "../stakeholder/+state/stakeholder.service";
import { WalletService } from "@blockframes/ethers/wallet/+state/wallet.service";
import { MovieMaterialService } from "../../material/+state/movie-material.service";
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuth } from "@angular/fire/auth";
import { deliveryStatuses } from "./delivery.model";

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

describe('DeliveryService unit test', () => {
  let spectator: SpectatorService<DeliveryService>;
  let service: DeliveryService;

  const createService = createServiceFactory({
      service: DeliveryService,
      imports: [
          AngularFireModule.initializeApp(initTestApp),
          AngularFireFunctionsModule,
          AngularFirestoreModule,
          RouterTestingModule.withRoutes([])
      ],
      mocks: [AngularFirestore, AngularFireAuth],
      providers: [
        DeliveryStore,
        DeliveryQuery,
        MovieQuery,
        TemplateQuery,
        MaterialQuery,
        OrganizationQuery,
        DeliveryMaterialService,
        TemplateMaterialService,
        PermissionsService,
        StakeholderService,
        WalletService,
        MovieMaterialService
      ]
  });

  beforeEach(() => {
    spectator = createService();
    service = spectator.service;
  })

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should remove a delivery', () => {
    const spy = jest.spyOn(service, 'remove').mockImplementation();
    service.deleteDelivery();
    expect(spy).toHaveBeenCalledTimes(1);
  })

  it('should update delivery status with the given index', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateDeliveryStatus(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(null, { status: deliveryStatuses[1] });
  })

  it('should update the current MGDeadline', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateCurrentMGDeadline(2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(null, { mgCurrentDeadline: 2 });
  })

  it('should update the validated array and isSigned boolean of a delivery', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.unsealDelivery();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(null, { validated: [], isSigned: false });
  })
})
