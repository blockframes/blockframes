import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Material } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { MovieQuery, Movie } from '@blockframes/movie';
import { tap, switchMap } from 'rxjs/operators';
import { MaterialForm, MaterialControl } from '../../forms/material.form';
import { FormEntity } from '@blockframes/utils';
import { MovieMaterialService } from '../../../material/+state/movie-material.service';

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
  public activeForm$: Observable<FormEntity<MaterialControl>>;

  constructor(
    private materialQuery: MaterialQuery,
    private movieQuery: MovieQuery,
    private movieMaterialService: MovieMaterialService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.materials$ = this.materialQuery.selectAll().pipe(
      tap(materials => this.form.upsertValue(materials)),
      switchMap(materials => this.form.selectAll())
    );

    this.activeForm$ = this.form.selectActiveForm();

    this.movie$ = this.movieQuery.selectActive();
  }

  public openSidenav(materialId: string) {
    this.form.setActive(materialId);
    this.opened = true;
  }

  public async update() {
    try {
      const materials = this.form.getAll();
      this.movieMaterialService.updateMovieMaterials(materials);
      this.snackBar.open('Material updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
