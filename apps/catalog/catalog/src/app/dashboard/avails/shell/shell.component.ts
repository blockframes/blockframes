import { ChangeDetectionStrategy, Component, } from "@angular/core";
import { ActivatedRoute, } from "@angular/router";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { BucketForm } from "@blockframes/contract/bucket/form";
import { Contract, ContractService, isMandate, isSale } from "@blockframes/contract/contract/+state";
import { Term, TermService } from "@blockframes/contract/term/+state";
import { Movie, MovieService } from "@blockframes/movie/+state";
import { OrganizationService } from "@blockframes/organization/+state";
import { combineLatest, Observable, of } from "rxjs";
import { map, pluck, switchMap, } from "rxjs/operators";

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
    switchMap((id: string) => this.movieService.valueChanges(id)),
  );

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
  );

  public mandates$ = this.contracts$.pipe(
    map(contracts => contracts.filter(isMandate))
  );

  public sales$ = this.contracts$.pipe(
    map(contracts => contracts.filter(isSale))
  );

  public mandateTerms$ = this.getTerms$(this.mandates$);

  public salesTerms$ = this.getTerms$(this.sales$);

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

  private getTerms$(contracts$: Observable<Contract[]>) {
    return contracts$.pipe(
      switchMap((contract) => {
        const list = contract.flatMap(movie => movie.termIds);
        if (list.length === 0) return (of([]) as Observable<Term<Date>[]>);
        return this.termsService.valueChanges(list);
      }),
    )
  }




}
