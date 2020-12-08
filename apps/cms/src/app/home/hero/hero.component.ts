import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { LinkModule, Link, linkSchema } from '../link/link.component';
import { TextFormModule, matText } from '../../forms/text';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Hero extends Section {
  title: string;
  description: string;
  background: string;
  links: Link[];
}

export const heroSchema: FormGroupSchema<Hero> = {
  form: 'group',
  load: async () => import('./hero.component').then(m => m.HeroComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'Title' }),
    description: matText({ label: 'Description', size: 'long' }),
    background: matText({ label: 'Background Image' }),
    links: {form: 'array', controls: [], factory: linkSchema }
  },
}

@Component({
  selector: 'form-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {
  @Input() form?: FormEntity<typeof heroSchema>;
  get links() {
    return this.form.get('links');
  }
}



@NgModule({
  declarations: [HeroComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    TextFormModule,
    LinkModule,
  ]
})
export class HeroModule { }
