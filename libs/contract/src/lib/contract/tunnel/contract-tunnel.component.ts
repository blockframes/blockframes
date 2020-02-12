import { Component, ChangeDetectionStrategy, Host, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService, Movie, MovieQuery } from '@blockframes/movie';
import { TunnelStep, TunnelConfirmComponent } from '@blockframes/ui/tunnel'
import { ContractForm } from '../form/contract.form';
import { ContractQuery, ContractService, ContractType } from '../+state';
import { Observable, from, of, Subscription } from 'rxjs';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ContractVersionService } from '@blockframes/contract/version/+state';

const steps = [{
  title: 'Step 1',
  icon: 'document',
  routes: [{
    path: 'details',
    label: 'contract Details'
  }]
}, {
  title: 'Summary',
  icon: 'send',
  routes: [{
    path: 'summary',
    label: 'Summary'
  }]
}]

/** Fill the steps depending on the movie */
function fillMovieSteps(movies: Movie[] = []): TunnelStep[] {
  if (!movies.length) {
    return steps
  }
  return [{
    ...steps[0]
  }, {
    title: 'Exploitation Rights',
    icon: 'world',
    routes: movies.map(movie => ({
      path: movie.id, label: movie.main.title.international
    }))
  }, {
    ...steps[1]
  }]
}

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  providers: [ContractForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTunnelComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  public steps$: Observable<TunnelStep[]>;
  public type: ContractType;

  constructor(
    @Host() private form: ContractForm,
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private service: ContractService,
    private versionService: ContractVersionService,
    private query: ContractQuery,
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    const contract = this.query.getActive();
    this.type = contract.type;
    this.form.patchAllValue(contract);

    // Listen on title ids
    const titlesForm = this.form.get('versions').last().get('titles');
    this.sub = titlesForm.valueChanges.pipe(
      startWith(titlesForm.value),
      map(titles => Object.keys(titles)),
      switchMap(titleIds => this.movieService.syncManyDocs(titleIds)),
    ).subscribe();
  
    this.steps$ = this.movieQuery.selectAll().pipe(
      map(movies => fillMovieSteps(movies))
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public save() {
    const write = this.db.firestore.batch();
    const id = this.query.getActiveId();
    const contract = this.form.value;

    // Upate Version
    const lastIndex = contract.versions.length - 1;
    const version = { ...contract.versions[lastIndex] };
    this.versionService.update({ id: `${lastIndex}`, ...version }, { write })

    // Update Contract
    contract.titleIds = Object.keys(version.titles);
    delete contract.versions;
    this.service.update({ id, ...contract }, { write });

    // Return an observable<boolean> for the confirmExit
    return from(write.commit()).pipe(
      tap(_ => this.form.markAsPristine()),
      switchMap(_ => this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed()),
      map(_ => true) 
    )
  }

  confirmExit() {
    if (this.form.pristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => shouldSave ? this.save() : of(false))
    );
  }
}
