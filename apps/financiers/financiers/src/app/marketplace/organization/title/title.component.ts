import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'financiers-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      switchMap(org => {
        return this.service.valueChanges(ref => ref
          .where('orgIds', 'array-contains', org.id)
          .where('storeConfig.status', '==', 'accepted')
          .where('storeConfig.appAccess.financiers', '==', true)
          .orderBy('_meta.createdAt', 'desc')
          )
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

}
