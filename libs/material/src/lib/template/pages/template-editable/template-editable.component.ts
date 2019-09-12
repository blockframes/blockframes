import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateQuery } from '../../+state/template.query';
import { Material } from '../../../material/+state/material.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialService } from '../../../material/+state';
import { tap, switchMap, filter } from 'rxjs/operators';
import { Template } from '../../+state';
import { MaterialFormBatch } from '../../forms/material.form';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'template-editable',
  templateUrl: './template-editable.component.html',
  styleUrls: ['./template-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateEditableComponent implements OnInit {
  public template$: Observable<Template>;
  public materials$: Observable<Material[]>;
  public activeForm$: Observable<AbstractControl>;

  public opened = false;
  public materialsFormBatch = new MaterialFormBatch();

  constructor(
    private query: TemplateQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.template$ = this.query.selectActive();
    this.materials$ = this.query.selectActive().pipe(
      // We need to filter materials because when we go into the template list, the guard does not load materials in templates
      filter(template => !!template.materials),
      tap(template => this.materialsFormBatch.upsertValue(template.materials)),
      switchMap(template => this.materialsFormBatch.selectAll())
    );
    this.activeForm$ = this.materialsFormBatch.selectActive();
  }

  public openSidenav(materialId: string) {
    this.materialsFormBatch.setActive(materialId);
    this.opened = true;
  }

  public async updateMaterials() {
    try {
      const materials = this.materialsFormBatch.getAll();
      await this.materialService.updateTemplateMaterials(materials);
      this.snackBar.open('Materials updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addMaterial() {
    const newMaterial = this.materialService.addTemplateMaterial();
    this.materialsFormBatch.add(newMaterial);
    this.openSidenav(newMaterial.id);
  }

  public async deleteMaterial(materialId: string) {
    try {
      // If material exist in materialFormBatch but not in database
      if (!this.query.hasMaterial(materialId)) {
        this.materialsFormBatch.removeControl(materialId);
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
