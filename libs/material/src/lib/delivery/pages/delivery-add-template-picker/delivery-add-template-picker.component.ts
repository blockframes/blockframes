import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionPickerItem } from '@blockframes/ui';
import { Template, TemplateQuery } from '../../../template/+state';
import { MovieQuery } from '@blockframes/movie';

/**
 * Page for the flow: "create a delivery"
 * third step, choose a template.
 */
@Component({
  selector: 'delivery-add-template-picker',
  templateUrl: './delivery-add-template-picker.component.html',
  styleUrls: ['./delivery-add-template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAddTemplatePickerComponent implements OnInit {
  private loading$: Observable<boolean>;
  private items$: Observable<ActionPickerItem<Template>[]>;
  private currentTemplate: Template;

  constructor(
    private templateQuery: TemplateQuery,
    private router: Router,
    private movieQuery: MovieQuery
  ) {}

  ngOnInit(): void {
    this.loading$ = this.templateQuery.selectLoading();
    this.items$ = this.templateQuery.selectAll().pipe(
      map(templates =>
        templates.map((template: Template) => ({
          title: template.name,
          payload: template
        }))
      )
    );
  }

  picked(template: Template) {
    this.currentTemplate = template;
  }

  onTemplatePicked() {
    const templateId = this.currentTemplate.id;
    const movieId = this.movieQuery.getActiveId();
    return this.router.navigate([`/layout/o/delivery/add/${movieId}/${templateId}/4-settings`]);
  }
}
