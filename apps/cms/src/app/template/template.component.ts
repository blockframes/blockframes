import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroupSchema, FormEntity, createForms } from 'ng-form-factory';
import { CmsTemplate, Section, templateSchema } from './template.model';
import { CmsService, CmsParams } from '../cms.service'
import { Subscription } from 'rxjs';
import { sections as homeSection } from '../home';

const templateSections = {
  home: homeSection,
}

@Component({
  selector: 'cms-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  types: string[] = [];
  value: Partial<CmsTemplate> = {};
  factory?: any;
  form?: FormEntity<FormGroupSchema<CmsTemplate>>;
  schema?: FormGroupSchema<CmsTemplate>;

  constructor(
    private service: CmsService,
    private route: ActivatedRoute
  ) { }

  get sections() {
    return this.form?.get('sections');
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      const sections = templateSections[params.page];
      this.types = Object.keys(sections);
      this.factory = (section: Section) => sections[section._type];
      this.schema = templateSchema(this.factory, this.value);
      this.form = createForms(this.schema, this.value);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getSectionSchema(index: number) {
    return this.schema?.controls.sections?.controls[index];
  }

  move(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.form?.get('sections').move(event.previousIndex, event.currentIndex);
    } else {
      const { previousContainer, previousIndex, currentIndex } = event;
      this.add(previousContainer.data[previousIndex], currentIndex);
    }
  }

  add(_type: string, index?: number) {
    this.form?.get('sections').add({ _type }, index);
  }

  save() {
    const params = this.route.snapshot.params as CmsParams;
    this.service.save(this.form.value, params);
  }
}
