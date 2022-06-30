import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarAvailsForm, MapAvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { MovieService } from '@blockframes/movie/service';
import { Contract, isMandate, isSale, Movie, Term } from '@blockframes/model';
import { combineLatest, Observable, of } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { where } from 'firebase/firestore';

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
    calendarForm: new CalendarAvailsForm(),
  };

  private contracts$ = this.movie$.pipe(
    switchMap((movie: Movie) => this.contractService.valueChanges([
      where('titleId', '==', movie.id),
      where('status', '==', 'accepted')
    ]))
  );

  public mandates$ = this.contracts$.pipe(map((contracts) => contracts.filter(isMandate)));

  public sales$ = this.contracts$.pipe(map((contracts) => contracts.filter(isSale)));

  public mandateTerms$ = this.getTerms(this.mandates$);

  public salesTerms$ = this.getTerms(this.sales$);

  constructor(
    private route: ActivatedRoute,
    private termsService: TermService,
    private movieService: MovieService,
    private contractService: ContractService
  ) { }

  private getTerms(contracts$: Observable<Contract[]>) {
    return contracts$.pipe(
      switchMap((contract) => {
        const list = contract.flatMap((movie) => movie.termIds);
        if (list.length === 0) return of([]) as Observable<Term[]>;
        return this.termsService.valueChanges(list);
      })
    );
  }
}
