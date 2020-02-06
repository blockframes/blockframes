import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService, Movie } from '@blockframes/movie';
import { TunnelStep } from '@blockframes/ui/tunnel'
import { ContractForm } from '../forms/contract.form';
import { ContractQuery, ContractService, ContractType } from '../+state';
import { Observable, of } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';

/** Fill the steps depending on the movie */
function fillMovieSteps(movies: Movie[] = []): TunnelStep[] {
  if (!movies.length) {
    return []
  }
  return [{
    title: 'Exploitation Rights',
    icon: 'world',
    routes: movies.map(movie => ({
      path: movie.id, label: movie.main.title.international
    }))
  }]
}

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  providers: [ContractForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTunnelComponent implements OnInit {
  public steps$: Observable<TunnelStep[]> = of([]);
  public type: ContractType;

  constructor(
    @Host() private form: ContractForm,
    private snackBar: MatSnackBar,
    private service: ContractService,
    private query: ContractQuery,
    private movieService: MovieService,
  ) { }

  async ngOnInit() {
    const contract = this.query.getActive();
    this.type = contract.type;
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
