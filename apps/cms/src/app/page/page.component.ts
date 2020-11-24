import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroupSchema, FormEntity, createForms } from 'ng-form-factory';
import { Page, Section, pageSchema } from './page.model';
import { Subscription } from 'rxjs';
import { sections as homeSection } from '../home';

const pageSections = {
  homepage: homeSection,
}

@Component({
  selector: 'cms-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent implements OnInit {
  private sub?: Subscription;

  types: string[] = [];
  value: Partial<Page> = {};
  factory?: any;
  form?: FormEntity<FormGroupSchema<Page>>;
  schema?: FormGroupSchema<Page>;

  constructor(
    private route: ActivatedRoute
  ) { }

  get sections() {
    return this.form?.get('sections');
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      const sections = pageSections[params.page];
      this.types = Object.keys(sections[params.page]);
      this.factory = (section: Section) => sections[section._type];
      this.schema = pageSchema(this.factory, this.value);
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

}
