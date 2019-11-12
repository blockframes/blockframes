import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateQuery } from '../../+state/template.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialService, MaterialTemplate, MaterialQuery, transformMaterialTemplate } from '../../../material/+state';
import { tap, switchMap, filter, map } from 'rxjs/operators';
import { Template } from '../../+state';
import { MaterialForm, MaterialControl } from '../../forms/material.form';
import { FormEntity } from '@blockframes/utils';

@Component({
  selector: 'template-editable',
  templateUrl: './template-editable.component.html',
  styleUrls: ['./template-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateEditableComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'template-editable';
  public template$: Observable<Template>;
  public materials$: Observable<MaterialTemplate[]>;
  public activeForm$: Observable<FormEntity<MaterialControl>>;

  public opened = false;
  public form = new MaterialForm();

  constructor(
    private query: TemplateQuery,
    private materialQuery: MaterialQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.template$ = this.query.selectActive();
    this.materials$ = this.materialQuery.selectAll().pipe(
      // We need to filter materials because when we go into the template list, the guard does not load materials in templates
      filter(materials => !!materials),
      map(materials => materials.map(material => transformMaterialTemplate(material))),
      tap((materials) => this.form.upsertValue(materials)),
      switchMap(materials => this.form.selectAll())
    );
    this.activeForm$ = this.form.selectActiveForm();
  }

  public openSidenav(materialId: string) {
    this.form.setActive(materialId);
    this.opened = true;
  }

  public async updateMaterials() {
    try {
      const materials = this.form.getAll();
      await this.materialService.updateTemplateMaterials(materials);
      this.snackBar.open('Materials updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addMaterial() {
    const newMaterial = this.materialService.addTemplateMaterial();
    this.form.add(newMaterial);
    this.openSidenav(newMaterial.id);
  }

  public async deleteMaterial(materialId: string) {
    try {
      // If material exist in materialFormBatch but not in database
      if (!this.query.hasMaterial(materialId)) {
        this.form.removeControl(materialId);
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
