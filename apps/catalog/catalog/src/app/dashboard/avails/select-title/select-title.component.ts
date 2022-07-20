import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { QueryConstraint, where } from 'firebase/firestore';
import { MovieService } from '@blockframes/movie/service';
import { storeStatus } from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';

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
  public titleId: string;
  public storeStatus = storeStatus;

  public titles$ = this.titleService.valueChanges(titleQuery(this.orgService.org.id));

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private orgService: OrganizationService
  ) {
    this.dynTitleService.setPageTitle('My Avails');
  }
}
