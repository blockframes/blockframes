import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { LinkModule, Link, linkSchema } from '../link/link.component';
import { TextFormModule, matText } from '../../forms/text';

interface Hero extends Section {
  title: string;
  subtitle: string;
  background: string;
  link: Link;
}

export const heroSchema: FormGroupSchema<Hero> = {
  form: 'group',
  load: async () => import('./hero.component').then(m => m.HeroComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    subtitle: matText({ label: 'subtitle' }),
    background: matText({ label: 'background' }),
    link: linkSchema
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
}



@NgModule({
  declarations: [HeroComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule,
    LinkModule,
  ]
})
export class HeroModule { }
