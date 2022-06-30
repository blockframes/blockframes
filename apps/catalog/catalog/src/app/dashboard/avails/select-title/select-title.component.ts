import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { QueryConstraint, where } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { MovieService } from '@blockframes/movie/service';
import { Income, storeStatus } from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FullSale } from '@blockframes/contract/avails/avails';
import { OrganizationService } from '@blockframes/organization/service';
import { Router } from '@angular/router';

const titleQuery = (orgId: string): QueryConstraint[] => [
  where('orgIds', 'array-contains', orgId),
  where('app.catalog.access', '==', true)
];

@Component({
  selector: 'catalog-select-title',
  templateUrl: './select-title.component.html',
  styleUrls: ['./select-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsSelectTitleComponent {
  public availsForm = new AvailsForm();
  private orgId = this.orgService.org.id;
  public titleId: string;
  public storeStatus = storeStatus;

  public titles$ = this.titleService.valueChanges(titleQuery(this.orgId));

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private router: Router,
    private orgService: OrganizationService
  ) {
    this.dynTitleService.setPageTitle('My Avails');
  }
}
