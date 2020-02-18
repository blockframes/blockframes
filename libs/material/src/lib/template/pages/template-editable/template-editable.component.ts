import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Template } from '../../+state/template.model';
import { TemplateQuery } from '../../+state/template.query';
import { createMaterialTemplate, MaterialTemplate } from '../../../material/+state/material.model';
import { MaterialQuery } from '../../../material/+state/material.query';
import { MaterialControl, MaterialForm } from '../../forms/material.form';
import { TemplateMaterialService } from '../../../material/+state/template-material.service';

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
    private templateMaterialService: TemplateMaterialService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.template$ = this.query.selectActive();
    this.materials$ = this.materialQuery.selectAll().pipe(
      // We need to filter materials because when we go into the template list, the guard does not load materials in templates
      filter(materials => !!materials),
      map(materials => materials.map(material => createMaterialTemplate(material))),
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
      await this.templateMaterialService.updateTemplateMaterials(materials);
      this.snackBar.open('Materials updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addMaterial() {
    const newMaterial = this.templateMaterialService.addTemplateMaterial();
    this.form.add(newMaterial);
    this.openSidenav(newMaterial.id);
  }

  public deleteMaterial(materialId: string) {
    try {
      // If material exist in materialFormBatch but not in database
      if (!this.materialQuery.hasEntity(materialId)) {
        this.form.removeControl(materialId);
        this.opened = false;
        return;
      }
      this.templateMaterialService.deleteTemplateMaterial(materialId);
      this.snackBar.open('Material deleted', 'close', { duration: 2000 });
      this.opened = false;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
