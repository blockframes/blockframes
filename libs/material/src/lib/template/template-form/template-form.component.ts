import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView } from '../+state/template.model';
import { TemplateQuery } from '../+state/template.query';
import { TemplateService } from '../+state/template.service';
import { MaterialStore } from '../../material/+state/material.store';
import { MaterialQuery } from '../../material/+state/material.query';
import { MaterialForm, Material } from '../../material/+state/material.model';
import { Router, Scroll } from '@angular/router';
import { filter, takeWhile } from 'rxjs/operators';
import { MaterialService } from '../../material/+state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormComponent implements OnInit, OnDestroy {
  public template$: Observable<TemplateView>;
  public form$: Observable<MaterialForm>;
  public templateName$ : Observable<string>;
  private isAlive = true;

  constructor(
    private query: TemplateQuery,
    private service: TemplateService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.service.subscribeOnAllOrgsTemplates$().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.materialService.subscribeOnAllOrgsMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();

    this.templateName$ = this.query.templateName$;
    this.template$ = this.query.materialsByTemplate$;
    this.form$ = this.materialQuery.form$;

    this.router.events
      .pipe(
        takeWhile(() => this.isAlive),
        filter(e => e instanceof Scroll && !!e.anchor)
      )
      .subscribe((e: Scroll) => document.getElementById(e.anchor).scrollIntoView());
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

  ngOnDestroy() {
    this.isAlive = false;
  }
}
