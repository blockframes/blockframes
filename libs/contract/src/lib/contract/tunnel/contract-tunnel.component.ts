import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractForm } from '../form/contract.form';
import { ContractQuery, ContractService } from '../+state';
import { TunnelStep } from '@blockframes/ui/tunnel'
import { Observable } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { MovieService, Movie } from '@blockframes/movie';

const STEP_TEMPLATE: TunnelStep[] = [{
  title: 'Contract',
  icon: 'document',
  routes: [{
    path: 'details',
    label: 'Contract Details'
  }]
}, {
  title: 'Exploitation Rights',
  icon: 'world',
  routes: []
}];

/** Fill the steps depending on the movie */
function fillMovieSteps(movies: Movie[]): TunnelStep[] {
  const steps = Object.assign(STEP_TEMPLATE, {});
  const routes = movies.length
    ? movies.map(movie => ({ path: movie.id, label: movie.main.title.international }))
    : [{ path: 'no-title', label: 'No Title yet' }];
  steps[1].routes = routes;
  return steps;
}

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ContractForm]
})
export class ContractTunnelComponent implements OnInit {
  public steps$: Observable<TunnelStep[]>;

  constructor(
    @Host() private form: ContractForm,
    private snackBar: MatSnackBar,
    private service: ContractService,
    private query: ContractQuery,
    private movieService: MovieService,
  ) { }

  async ngOnInit() {
    const contract = this.query.getActive();
    this.form.patchAllValue(contract);
    const titlesForm = this.form.get('versions').last().get('titles');
    // Dynamic steps depending of the titles in the last contract version titles
    this.steps$ = titlesForm.valueChanges.pipe(
      startWith(titlesForm.value),
      map(titles => Object.keys(titles)),
      switchMap(titleIds => this.movieService.getValue(titleIds)),
      map(movies => fillMovieSteps(movies))
    );
  }

  // Should save movie
  public async save() {
    const id = this.query.getActiveId();
    await this.service.update({ id, ...this.form.value });
    this.snackBar.open('Saved', 'close', { duration: 500 });
  }
}
