import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from '@blockframes/ui/navigation.service';

import { pluck } from 'rxjs';

@Component({
  selector: 'catalog-manage-avails',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogManageAvailsComponent {
  public titleId$ = this.route.params.pipe(pluck('titleId'));

  constructor(
    private route: ActivatedRoute,
    private navService: NavigationService,
  ) { }

  goBack() {
    this.navService.goBack(1);
  }
}
