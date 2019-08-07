import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionPickerItem } from '@blockframes/ui';
import { Template, TemplateQuery } from '../../../template/+state';
import { MovieQuery } from '@blockframes/movie';

/** Turn an array of templates into a list of ActionPickerItem */
const createActions = (templates: Template[]): ActionPickerItem<Template>[] =>
  templates.map(template => ({
    title: template.name,
    payload: template
  }));

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
  public isLoading$: Observable<boolean>;
  public items$: Observable<ActionPickerItem<Template>[]>;
  public currentTemplate: Template;

  constructor(
    private templateQuery: TemplateQuery,
    private router: Router,
    private movieQuery: MovieQuery
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.templateQuery.selectLoading();
    this.items$ = this.templateQuery.selectAll().pipe(map(createActions));
  }

  public selectTemplate(template: Template) {
    this.currentTemplate = template;
  }

  public onContinue() {
    const templateId = this.currentTemplate.id;
    const movieId = this.movieQuery.getActiveId();
    return this.router.navigate([`/layout/o/delivery/add/${movieId}/${templateId}/4-settings`]);
  }
}
