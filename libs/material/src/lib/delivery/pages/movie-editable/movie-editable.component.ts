import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Material, MaterialService } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { MovieQuery, Movie } from '@blockframes/movie';
import { tap, switchMap } from 'rxjs/operators';
import { MaterialForm } from '../../forms/material.form';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'movie-editable',
  templateUrl: './movie-editable.component.html',
  styleUrls: ['./movie-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEditableComponent implements OnInit {
  public materials$: Observable<Material[]>;
  public movie$: Observable<Movie>;
  public opened = false;

  public form = new MaterialForm();
  public activeForm$: Observable<AbstractControl>;

  constructor(
    private materialQuery: MaterialQuery,
    private movieQuery: MovieQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.materials$ = this.materialQuery.selectAll().pipe(
      tap(materials => this.form.upsertValue(materials)),
      switchMap(materials => this.form.selectAll())
    );

    this.activeForm$ = this.form.selectActive();

    this.movie$ = this.movieQuery.selectActive();
  }

  public openSidenav(materialId: string) {
    this.form.setActive(materialId);
    this.opened = true;
  }

  public async update() {
    try {
      const materials = this.form.getAll();
      const movieId = this.movieQuery.getActiveId();
      this.materialService.updateMovieMaterials(materials, movieId);
      this.snackBar.open('Material updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
