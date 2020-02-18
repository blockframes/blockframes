import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionPickerItem } from '@blockframes/ui';
import { DeliveryStore, DeliveryWizardKind } from '../../+state';
import { Template } from '../../../template/+state/template.model';
import { TemplateStore } from '../../../template/+state/template.store';
import { TemplateQuery } from '../../../template/+state/template.query';

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
  @HostBinding('attr.page-id') pageId = 'template-picker';

  public isLoading$: Observable<boolean>;
  public items$: Observable<ActionPickerItem<Template>[]>;
  public currentTemplate: Template | undefined;

  constructor(
    private templateQuery: TemplateQuery,
    private templateStore: TemplateStore,
    private store: DeliveryStore
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.templateQuery.selectLoading();
    this.items$ = this.templateQuery.selectAll().pipe(map(createActions));
  }

  public selectTemplate(template: Template) {
    this.store.updateWizard({kind: DeliveryWizardKind.useTemplate});
    this.currentTemplate = template;
  }

  public get continueURL(): string {
    if (!this.currentTemplate) {
      return '#';
    }

    this.templateStore.setActive(this.currentTemplate.id);
    return `../4-settings`;
  }
}
