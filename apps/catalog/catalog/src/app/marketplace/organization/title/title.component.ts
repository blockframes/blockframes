import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie } from '@blockframes/model';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { orderBy, where } from 'firebase/firestore';

@Component({
  selector: 'catalog-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      switchMap((org) => {
        return this.service.valueChanges([
          where('orgIds', 'array-contains', org.id),
          where('app.catalog.status', '==', 'accepted'),
          where('app.catalog.access', '==', true),
          orderBy('_meta.createdAt', 'desc')
        ]);
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }
}
