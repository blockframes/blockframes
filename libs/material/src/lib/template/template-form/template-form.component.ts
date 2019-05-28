import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView, Template } from '../+state/template.model';
import { TemplateQuery } from '../+state/template.query';
import { TemplateService } from '../+state/template.service';
import { MaterialStore } from '../../material/+state/material.store';
import { MaterialQuery } from '../../material/+state/material.query';
import { MaterialTemplateForm, Material } from '../../material/+state/material.model';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ConfirmComponent } from '@blockframes/ui';
import { Router } from '@angular/router';

@Component({
  selector: 'template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormComponent implements OnInit {
  public template$: Observable<TemplateView>;
  public form$: Observable<MaterialTemplateForm>;
  public templateActive$ : Observable<Template>;
  public categories: string[];
  public materialId: string;

  constructor(
    private query: TemplateQuery,
    private service: TemplateService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {

    this.templateActive$ = this.query.selectActive();
    this.template$ = this.query.materialsByTemplate$;
    this.form$ = this.materialQuery.templateForm$;
  }

  public addMaterial(material: Material) {
    this.service.saveMaterial(material);
    this.materialStore.clearForm();
  }

  public updateMaterial(material: Material) {
    this.service.updateMaterial(material);
  }

  public deleteMaterial(material: Material) {
    this.service.deleteMaterial(material.id);
    this.snackBar.open(`Deleted material "${material.value}".`, 'close', { duration: 2000 });
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyTemplateForm(category);
    delete this.materialId;
  }

  public openDeleteTemplate(id: string, name: string) {
    this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete template',
        question: 'Are you sure you want to delete this template ?',
        buttonName: 'Delete',
        onConfirm: () => this.deleteTemplate(id, name)
      }
    });
  }

  private deleteTemplate(id: string, name: string) {
    this.service.deleteTemplate(id);
    this.snackBar.open(`Template "${name}" has been deleted.`, 'close', { duration: 2000 });
    this.router.navigate(['layout/templates/list']);
  }

  openUpdateForm(material) {
    this.materialId = material.id;
    this.materialStore.clearForm();
  }

  cancelUpdateForm() {
    delete this.materialId;
  }

}
