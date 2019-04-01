import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView } from '../+state/template.model';
import { TemplateQuery } from '../+state/template.query';
import { TemplateService } from '../+state/template.service';
import { MaterialService } from '../../material/+state/material.service';
import { MaterialStore } from '../../material/+state/material.store';
import { MaterialQuery } from '../../material/+state/material.query';
import { MaterialForm, Material } from '../../material/+state/material.model';

@Component({
  selector: 'template-view',
  templateUrl: './template-view.component.html',
  styleUrls: ['./template-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateViewComponent implements OnInit {
  public template$: Observable<TemplateView>;
  public form$ : Observable<MaterialForm>;

  constructor(
    private query: TemplateQuery,
    private service: TemplateService,
    private materialService: MaterialService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
  ) {}

  ngOnInit() {
    this.template$ = this.query.materialsByTemplate$;

    this.form$ = this.materialQuery.select(state => state.form)
  }

  public addMaterial(material: Material) {
    this.materialService.addMaterial(material);
    this.materialStore.updateRoot({form: null})
  }

  public deleteMaterial(material: Material) {
    this.materialService.deleteMaterial(material.id);
  }

  public addForm(category: string) {
    this.materialStore.updateRoot({form: {value: "", description: "", category}})
  }

  public saveTemplate() {
    this.service.saveTemplate();
  }

}
