import { Intercom } from 'ng-intercom';
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'catalog-right-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightListComponent {
  filter = new FormControl();
  filter$: Observable<string> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));
  contracts = []

  constructor(
    @Optional() private intercom: Intercom,
    private query: ContractQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
  ) {
    this.query.getCount()
      ? this.dynTitle.setPageTitle('All offers and deals')
      : this.dynTitle.setPageTitle('Offers and Deals')
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(filter)
  }

  resetFilter() {
    this.filter.reset();
    this.dynTitle.useDefault();
  }

  goToTitle(contract) {
    this.router.navigate([contract.id], { relativeTo: this.route });
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
