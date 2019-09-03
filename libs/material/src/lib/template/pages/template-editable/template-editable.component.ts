import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { TemplateQuery } from '../../+state/template.query';
import { Material } from '../../../material/+state/material.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialService, MaterialQuery } from '../../../material/+state';
import { createMaterialFormList, createMaterialFormGroup } from '../../forms/material.form';
import { tap, switchMap, startWith, filter, map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Template } from '../../+state';

@Component({
  selector: 'template-editable',
  templateUrl: './template-editable.component.html',
  styleUrls: ['./template-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateEditableComponent implements OnInit {
  public template$: Observable<Template>;
  public materials$: Observable<Material[]>;

  public opened = false;

  public materialsFormList = createMaterialFormList();
  public materialFormGroup$: Observable<FormGroup>;

  private selectedMaterialId$ = new BehaviorSubject<string>(null);

  constructor(
    private query: TemplateQuery,
    private materialQuery: MaterialQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.template$ = this.query.selectActive();
    this.materials$ = this.query.selectActive().pipe(
      // We need to filter materials because when we go into the template list, the guard does not load materials in templates
      filter(template => !!template.materials),
      tap(template => this.materialsFormList.patchValue(template.materials)),
      switchMap(template => this.materialsFormList.valueChanges.pipe(startWith(template.materials)))
    );

    /** Return the materialFormGroup linked to the selected materialId */
    this.materialFormGroup$ = this.selectedMaterialId$.pipe(
      filter(materialId => !!materialId),
      map(materialId =>
        this.materialsFormList.value.findIndex(material => material.id === materialId)
      ),
      map(index => this.materialsFormList.at(index))
    );
  }

  public openSidenav(materialId: string) {
    this.selectedMaterialId$.next(materialId);
    this.opened = true;
  }

  public async updateMaterials() {
    try {
      await this.materialService.updateTemplateMaterials(this.materialsFormList.value);
      this.snackBar.open('Materials updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addMaterial() {
    const newMaterial = this.materialService.addTemplateMaterial();
    this.materialsFormList.push(createMaterialFormGroup(newMaterial));
    this.openSidenav(newMaterial.id);
  }

  public async deleteMaterial(materialId: string) {
    try {
      // If material exist in formList but not in database
      if (!this.materialQuery.hasEntity(materialId)) {
        const index = this.materialsFormList.value.findIndex(material => material.id === materialId);
        this.materialsFormList.removeAt(index);
        this.opened = false;
        return;
      }
      await this.materialService.deleteTemplateMaterial(materialId);
      this.snackBar.open('Material deleted', 'close', { duration: 2000 });
      this.opened = false;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
