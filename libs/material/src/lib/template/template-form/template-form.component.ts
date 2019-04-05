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

@Component({
  selector: 'template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormComponent implements OnInit, OnDestroy {
  public template$: Observable<TemplateView>;
  public form$: Observable<MaterialForm>;
  private isAlive = true;

  constructor(
    private query: TemplateQuery,
    private service: TemplateService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private router: Router
  ) {}

  ngOnInit() {
    //this.materialService.subscribeOnOrganizationMaterials$().subscribe();
    this.template$ = this.query.materialsByTemplate$;
    this.form$ = this.materialQuery.form$;

    this.router.events
      .pipe(
        takeWhile(() => this.isAlive),
        filter(e => e instanceof Scroll && !!e.anchor)
      )
      .subscribe(e => {
        if (e instanceof Scroll )
        document.getElementById(e.anchor).scrollIntoView();
      });
  }

  public addMaterial(material: Material) {
    this.service.saveMaterial(material);
    this.materialStore.clearForm();
  }

  public deleteMaterial(material: Material) {
    this.service.deleteMaterial(material.id);
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyForm(category);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
