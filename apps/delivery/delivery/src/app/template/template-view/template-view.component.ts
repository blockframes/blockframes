import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TemplateQuery, TemplateStore, TemplateView } from '../+state';
import { Material, MaterialService, MaterialStore, MaterialQuery, MaterialForm } from '../../material/+state';

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
    private route: ActivatedRoute,
    private store: TemplateStore,
    private query: TemplateQuery,
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

}
