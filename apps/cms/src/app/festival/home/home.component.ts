import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { createForms, FormArraySchema, FormGroupSchema, FormControlSchema, FACTORY } from 'ng-form-factory';

interface Page {
  title: string;
  sections: any[];
}

const textSchema: FormControlSchema = {
  form: 'control',
  load: 'text'
}



const sectionsSchema: FormArraySchema = {
  form: 'array',
  load: 'sections',
  factory: (type): FormGroupSchema => ({
    form: 'group',
    load: type,
    controls: {}
  }),
  controls: []
};

const schema: FormGroupSchema<Page> = {
  form: 'group',
  load: 'page',
  controls: {
    title: textSchema,
    sections: sectionsSchema
  }
}

@Component({
  selector: 'cms-festival-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [{
    provide: FACTORY,
    useValue: {}
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  @ViewChild('carousel') carousel: TemplateRef<any>; 

  form = createForms(schema, []);
  schema = schema;
  components = [];

  constructor() { }

  getTemplate(name: string): TemplateRef<any> {
    return this[name];
  }

  ngOnInit(): void {
  }

  get sections() {
    return this.form.get('sections');
  }

}


interface FormComponent {
  name: string;

}
