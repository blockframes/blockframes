import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Material, MaterialService } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery } from '../../+state';
import { map, startWith, tap, switchMap, filter } from 'rxjs/operators';
import { createMaterialFormList } from '../../forms/material.form';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'delivery-movie-editable',
  templateUrl: './delivery-movie-editable.component.html',
  styleUrls: ['./delivery-movie-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryMovieEditableComponent implements OnInit {
  public materials$: Observable<Material[]>;
  public movie$: Observable<Movie>;
  public opened = false;

  public materialsFormList = createMaterialFormList();
  public materialFormGroup$: Observable<FormGroup>;

  private selectedMaterialId$ = new BehaviorSubject<string>(null);

  constructor(
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.materials$ = this.materialQuery.selectAll().pipe(
      tap(materials => this.materialsFormList.patchValue(materials)),
      switchMap(materials => this.materialsFormList.valueChanges.pipe(startWith(materials)))
    );

    /** Return the materialFormGroup linked to the selected materialId */
    this.materialFormGroup$ = this.selectedMaterialId$.pipe(
      filter((materialId) => !!materialId),
      map((materialId) => this.materialsFormList.value.findIndex(material => material.id === materialId)),
      map(index => this.materialsFormList.at(index))
    );

    this.movie$ = this.movieQuery.selectActive();
  }

  public openSidenav(materialId: string) {
    this.selectedMaterialId$.next(materialId);
    this.opened = true;
  }

  public async update() {
    try {
      const deliveryId = this.query.getActiveId();
      this.materialService.updateMovieMaterials(this.materialsFormList.value, deliveryId);
      this.snackBar.open('Material updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
