import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionPickerItem } from '@blockframes/ui';
import { Template, TemplateQuery } from '../../../template/+state';
import { DeliveryStore, DeliveryWizardKind } from '../../+state';

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
    private router: Router,
    private route: ActivatedRoute,
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

  public navigateToSettings() {
    const templateId = this.currentTemplate.id;
    return this.router.navigate([`../${templateId}/4-settings`], { relativeTo: this.route });
  }
}
