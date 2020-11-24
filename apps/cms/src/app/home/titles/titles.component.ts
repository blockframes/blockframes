import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../page/page.model';

interface TitleQuery {}

interface Titles extends Section {
  title: string;
  query: TitleQuery;
  mode: 'poster' | 'banner' | 'slider';
}

export const titlesSchema: FormGroupSchema<Titles> = {
  form: 'group',
  load: async () => import('./titles.component').then(m => m.TitlesComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    query: { form: 'group', controls: {} },
    mode: { form: 'control' },
  },
}

@Component({
  selector: 'builder-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesComponent {
  @Input() form?: FormEntity<typeof titlesSchema>;
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TextFormModule, matText } from '../text';


@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    MatFormFieldModule,
    TextFormModule,
    MatSelectModule,
  ]
})
export class TitlesModule { }
