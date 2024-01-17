import { Component, ChangeDetectionStrategy, Input, Inject} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { App, Movie, Person, removeAccent } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { fadeList } from '@blockframes/utils/animations/fade';
import { APP } from '@blockframes/utils/routes/utils';
import { filters } from '@blockframes/ui/list/table/filters';
import { MatDialog } from '@angular/material/dialog';
import { CellModalComponent } from '@blockframes/ui/cell-modal/cell-modal.component';
import { displayPerson } from '@blockframes/utils/pipes';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'movie-table-grid',
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.scss'],
  animations: [fadeList('.card')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieTableGridComponent {

  private dataSource = new BehaviorSubject<Movie[]>([]);

  filters = filters;

  @Input() set titles(titles: Movie[]) {
    this.dataSource.next(titles ?? []);
  }

  @Input() columns: string[] = [];

  data$: Observable<Movie[]>;

  search = new UntypedFormControl();

  @Input() mode : 'grid' | 'table' = 'table';

  constructor(
    @Inject(APP) public app: App,
    private dialog: MatDialog,
  ) {
    this.data$ = this.dataSource.asObservable().pipe(
      switchMap(data => this.$filter(data)),
    );
  }

  trackById(entity: { id: string }) {
    return entity.id;
  }

  private $filter(data: Movie[]) {
    return this.search.valueChanges.pipe(
      debounceTime(200),
      map(value => {
        const input = removeAccent(value.toLowerCase());
        return data.filter(movie => {
          const international = getDeepValue<string>(movie, 'title.international');
          if(international.toLowerCase().includes(input)) return true;

          const original = getDeepValue<string>(movie, 'title.original');
          if(original.toLowerCase().includes(input)) return true;

          if(movie.directors.some(({firstName, lastName}) => firstName.toLowerCase().includes(input) || lastName.toLowerCase().includes(input))) return true;

          return false;
        });
      }),
      startWith(data)
    );
  }

  switchView() {
    this.mode = this.mode === 'grid' ? 'table' : 'grid';
  }

  openDetails(title: string, values: Person[]) {
    this.dialog.open(CellModalComponent, {
      data: createModalData({ title, values: displayPerson(values) }),
      autoFocus: false
    });
  }
}
