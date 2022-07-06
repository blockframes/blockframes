import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { capitalize } from '@blockframes/utils/helpers';
import { ContractStatus, Mandate } from '@blockframes/model';

@Component({
  selector: 'mandates-list',
  templateUrl: './mandates.component.html',
  styleUrls: ['./mandates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MandateListComponent {

  private title = 'All Mandates';
  @Output() private rowClick = new EventEmitter();

  private _mandates = new BehaviorSubject<Mandate[]>([]);

  filterForm = new FormControl();
  filter$: Observable<ContractStatus | ''> = this.filterForm.valueChanges.pipe(startWith(this.filterForm.value || ''));

  public mandateCount$ = this._mandates.pipe(
    filter(data => !!data),
    map(m => ({
      all: m.length,
      accepted: m.filter(m => m.status === 'accepted').length,
      declined: m.filter(m => m.status === 'declined').length,
      pending: m.filter(m => m.status === 'pending').length,
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private router: Router,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute
  ) { }

  @Input() set mandates(mandates: Mandate[]) {
    this._mandates.next(mandates);
  }

  get mandates() {
    return this._mandates.value;
  }

  applyFilter(filter?: ContractStatus) {
    this.filterForm.setValue(filter);
    const titleFilter = filter === 'pending' ? 'new' : filter;
    const pageTitle = `${this.title} (${titleFilter ? capitalize(titleFilter) : 'All'})`;
    this.dynTitle.setPageTitle(pageTitle);
  }

  resetFilter() {
    this.filterForm.reset('');
    this.dynTitle.setPageTitle(`${this.title} (All)`);
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterByStatus(sale: Mandate, index: number, status: ContractStatus): boolean {
    if (!status) return true;
    return sale.status === status;
  }

  goToMandate({ id }: Mandate) {
    this.rowClick.emit(id);
  }
}
