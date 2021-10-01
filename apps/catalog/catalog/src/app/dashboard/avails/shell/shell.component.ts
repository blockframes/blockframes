import { ChangeDetectionStrategy, Component, } from "@angular/core";
import { ActivatedRoute, } from "@angular/router";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { BucketForm } from "@blockframes/contract/bucket/form";
import { ContractService, Mandate, Sale } from "@blockframes/contract/contract/+state";
import { TermService } from "@blockframes/contract/term/+state";
import { Movie, MovieService } from "@blockframes/movie/+state";
import { OrganizationService } from "@blockframes/organization/+state";
import { combineLatest, Observable, of } from "rxjs";
import { map, pluck, shareReplay, switchMap, } from "rxjs/operators";

@Component({
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsShellComponent {
  public movieId$ = this.route.params.pipe(
    pluck('titleId')
  )

  public movie$ = this.movieId$.pipe(
    switchMap(id => this.movieService.valueChanges(id)),
    shareReplay({ bufferSize: 1, refCount: true }),
  ) as Observable<Movie>;

  public bucketForm = new BucketForm();

  public avails = {
    mapForm: new AvailsForm({ territories: [] }, ['duration']),
    calendarForm: new AvailsForm({ territories: [] }, ['territories'])
  };

  public movieOrg$ = this.movie$.pipe(
    switchMap((movie: Movie) => this.orgService.valueChanges(movie.orgIds))
  );

  public contracts$ = this.movie$.pipe(
    switchMap((movie: Movie) => this.contractService.valueChanges(
      ref => ref.where('titleId', '==', movie.id)
    )),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public mandates$ = this.contracts$.pipe(
    map(contracts => contracts.filter(contract => contract.type === 'mandate'))
  ) as Observable<Mandate[]>;

  public sales$ = this.contracts$.pipe(
    map(contracts => contracts.filter(contract => contract.type === 'sale'))
  ) as Observable<Sale[]>;

  public mandateTerms$ = this.mandates$.pipe(
    switchMap((mandates: Mandate[]) => {
      const list = mandates.flatMap(movie => movie.termIds);
      if (list.length === 0) return of([]);
      return this.termsService.valueChanges(
        ref => ref.where('id', 'in', list))
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public salesTerms$ = this.sales$.pipe(
    switchMap((sales: Sale[]) => {
      const list = sales.flatMap(movie => movie.termIds);
      if (list.length === 0) return of([]);
      return this.termsService.valueChanges(
        ref => ref.where('id', 'in', list)
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public terms$ = combineLatest(this.mandateTerms$, this.salesTerms$).pipe(
    map(terms => terms.flat())
  )


  constructor(
    private route: ActivatedRoute,
    private termsService: TermService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) { }

}
