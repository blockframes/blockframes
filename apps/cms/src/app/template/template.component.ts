import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroupSchema, FormEntity, createForms } from 'ng-form-factory';
import { CmsTemplate, Section, TemplateParams, templateSchema } from './template.model';
import { CmsService, CmsParams } from '../cms.service'
import { Subscription } from 'rxjs';
import { sections as homeSection } from '../home';
import { switchMap } from 'rxjs/operators';

const templateSections = {
  home: (params: TemplateParams) => homeSection(params),
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
  factory?: any;
  form?: FormEntity<FormGroupSchema<CmsTemplate>>;
  schema?: FormGroupSchema<CmsTemplate>;

  constructor(
    private service: CmsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  get sections() {
    return this.form?.get('sections');
  }

  ngOnInit(): void {
    this.sub = this.route.params.pipe(
      switchMap(params => this.service.doc<CmsTemplate>(params))
    ).subscribe((template: Partial<CmsTemplate> = {}) => {
      const params = this.route.snapshot.params as TemplateParams;
      const sections = templateSections[params.page](params);
      const factory = (section: Section) => sections[section._type];
      this.types = Object.keys(sections);
      this.schema = templateSchema(factory, template);
      this.form = createForms(this.schema, template);
      this.cdr.markForCheck();
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

  remove(index: number) {
    this.form?.get('sections').removeAt(index);
  }

  save() {
    const params = this.route.snapshot.params as CmsParams;
    this.service.save(this.form.value, params);
  }
}
