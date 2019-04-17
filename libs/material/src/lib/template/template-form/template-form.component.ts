import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView, Template } from '../+state/template.model';
import { TemplateQuery } from '../+state/template.query';
import { TemplateService } from '../+state/template.service';
import { MaterialStore } from '../../material/+state/material.store';
import { MaterialQuery } from '../../material/+state/material.query';
import { MaterialForm, Material } from '../../material/+state/material.model';
import { takeWhile } from 'rxjs/operators';
import { MaterialService } from '../../material/+state';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormComponent implements OnInit, OnDestroy {
  public template$: Observable<TemplateView>;
  public form$: Observable<MaterialForm>;
  public templateActive$ : Observable<Template>;
  private isAlive = true;

  constructor(
    private query: TemplateQuery,
    private service: TemplateService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit() {
    this.service.subscribeOnAllOrgsTemplates$().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.materialService.subscribeOnAllOrgsMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();

    this.templateActive$ = this.query.selectActive();
    this.template$ = this.query.materialsByTemplate$;
    this.form$ = this.materialQuery.form$;
  }

  public addMaterial(material: Material) {
    this.service.saveMaterial(material);
    this.materialStore.clearForm();
  }

  public deleteMaterial(material: Material) {
    this.service.deleteMaterial(material.id);
    this.snackBar.open('Deleted material "' + material.value + '".', 'close', { duration: 2000 });
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyForm(category);
  }

  public deleteTemplate(id: string, name: string) {
    this.service.deleteTemplate(id);
    this.snackBar.open( 'Template "' + name + '" has been deleted.', 'close', { duration: 2000 });
    this.router.navigate(['layout/template/list']);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
