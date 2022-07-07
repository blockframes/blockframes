import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NegotiationForm } from '@blockframes/contract/negotiation';
import { NavigationService } from '@blockframes/ui/navigation.service';

import { pluck } from 'rxjs';

@Component({
  selector: 'catalog-manage-avails',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogManageAvailsComponent {
  public form = new NegotiationForm({ terms: [] });
  public termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions',
  };

  public titleId$ = this.route.params.pipe(
    pluck('titleId')
  );

  constructor(
    private route: ActivatedRoute,
    private navService: NavigationService,
  ) { }

  goBack() {
    this.navService.goBack(1);
  }
}
