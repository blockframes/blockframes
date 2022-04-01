import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroupSchema, FormEntity, createForms } from 'ng-form-factory';
import { CmsTemplate, Section, TemplateParams } from '@blockframes/admin/cms';
import { templateSchema } from './template.model';
import { CmsService, CmsParams } from '../cms.service';
import { Subscription } from 'rxjs';
import { sections as homeSection } from '../home';
import { switchMap } from 'rxjs/operators';
import { createStorageFile } from '@blockframes/shared/model';

const templateSections = {
  home: (params: TemplateParams) => homeSection(params),
};

const mediaFields = {
  banner: ['background', 'image'],
  hero: ['background'],
};

@Component({
  selector: 'cms-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  types: string[] = [];
  factory?: any;
  form?: FormEntity<FormGroupSchema<CmsTemplate>>;
  schema?: FormGroupSchema<CmsTemplate>;

  constructor(private service: CmsService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  get sections() {
    return this.form?.get('sections');
  }

  ngOnInit(): void {
    this.sub = this.route.params
      .pipe(switchMap(params => this.service.doc<CmsTemplate>(params)))
      .subscribe((template: Partial<CmsTemplate> = {}) => {
        const params = this.route.snapshot.params as TemplateParams;
        const sections = templateSections[params.page](params);
        const factory = (section: Section) => sections[section._type];
        this.types = Object.keys(sections);
        this.schema = templateSchema(factory, template);

        // quick fix waiting for lib to be updated. Don't let this too long (4 march 2021). Ask Francois for that
        if (!this.form) {
          this.form = createForms(this.schema, template);
        } else {
          this.form.reset(createForms(this.schema, template).value);
        }

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
    const value = this.updateMediaMetadata(this.form.value, params);
    this.service.save(value, params);
  }

  updateMediaMetadata(value: CmsTemplate<Section>, params: CmsParams) {
    const { app, page, template } = params;
    const collection = ['cms', app, page].filter(v => !!v).join('/') as any;

    value.sections.forEach((section, i) => {
      const fields = mediaFields[section._type] ?? [];
      for (const field of fields) {
        section[field] = createStorageFile({
          collection: collection,
          docId: template,
          field: `section[${i}].${field}`,
          privacy: 'public',
          storagePath: section[field].storagePath,
        });
      }
    });

    return value;
  }
}
