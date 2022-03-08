import { ChangeDetectionStrategy, Component, } from "@angular/core";
import { ActivatedRoute, } from "@angular/router";
import { CalendarAvailsForm, MapAvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { Contract, ContractService, isMandate, isSale } from "@blockframes/contract/contract/+state";
import { Term, TermService } from "@blockframes/contract/term/+state";
import { Movie, MovieService } from "@blockframes/movie/+state/movie.service";
import { combineLatest, Observable, of } from "rxjs";
import { map, pluck, shareReplay, switchMap, } from "rxjs/operators";

@Component({
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsShellComponent {
  public movie$ = this.route.params.pipe(
    pluck('titleId'),
    switchMap((id: string) => this.movieService.valueChanges(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public avails = {
    mapForm: new MapAvailsForm(),
    calendarForm: new CalendarAvailsForm()
  };

  private contracts$ = this.movie$.pipe(
    switchMap((movie: Movie) => this.contractService.valueChanges(
      ref => ref.where('titleId', '==', movie.id).where('status', '==', 'accepted')
    ))
  );

  public mandates$ = this.contracts$.pipe(
    map(contracts => contracts.filter(isMandate))
  );

  public sales$ = this.contracts$.pipe(
    map(contracts => contracts.filter(isSale))
  );

  public mandateTerms$ = this.getTerms(this.mandates$);

  public salesTerms$ = this.getTerms(this.sales$);

  public terms$ = combineLatest([this.mandateTerms$, this.salesTerms$]).pipe(
    map(terms => terms.flat())
  );

  constructor(
    private route: ActivatedRoute,
    private termsService: TermService,
    private movieService: MovieService,
    private contractService: ContractService,
  ) { }

  private getTerms(contracts$: Observable<Contract[]>) {
    return contracts$.pipe(
      switchMap(contract => {
        const list = contract.flatMap(movie => movie.termIds);
        if (list.length === 0) return (of([]) as Observable<Term<Date>[]>);
        return this.termsService.valueChanges(list);
      }),
    )
  }
}
