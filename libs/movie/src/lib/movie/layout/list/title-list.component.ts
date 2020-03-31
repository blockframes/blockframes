import { Component, ChangeDetectionStrategy, Directive, ContentChild, OnInit, OnDestroy, TemplateRef } from "@angular/core";

import { FormControl } from "@angular/forms";
import { CatalogSearchForm } from "@blockframes/distribution-deals/form/search.form";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { MovieService, MovieQuery } from "@blockframes/movie/+state";
import { CartService } from "@blockframes/organization/cart/+state/cart.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { Movie } from '@blockframes/movie/+state/movie.model';



@Directive({selector: '[titleCard]'})
export class TitleCardDirective {
  constructor(public template: TemplateRef<any>) {}
}
@Directive({selector: '[titleListItem]'})
export class TitleListItemDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'title-list',
  templateUrl: './title-list.component.html',
  styleUrls: ['./title-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent implements OnInit, OnDestroy {

  @ContentChild(TitleCardDirective) titleCardTemplate: TitleCardDirective;
  @ContentChild(TitleListItemDirective) titleListItemTemplate: TitleListItemDirective;

  private sub: Subscription;

  public listView: boolean;
  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new CatalogSearchForm();
  public searchbarTextControl: FormControl = new FormControl('');

  public movieSearchResults$: Observable<any>;

  constructor(
    private router: Router,
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private analytics: FireAnalytics,
    private cartService: CartService,
    private snackbar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    this.movieSearchResults$ = this.movieQuery.selectAll({limitTo: 10});
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
