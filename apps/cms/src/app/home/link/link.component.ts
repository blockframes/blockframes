import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormEntity, FormGroupSchema, FormFactoryModule } from 'ng-form-factory';
import { matText } from '../text';

export interface Link {
  text: string;
  href: string;
}

export const linkSchema: FormGroupSchema<Link> = {
  form: 'group',
  load: () => import('./link.component').then(m => m.LinkComponent),
  controls: {
    text: matText({ label: 'text' }),
    href: matText({ label: 'URL' }),
  }
}

@Component({
  selector: 'form-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkComponent {
  @Input() form?: FormEntity<typeof linkSchema>;
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextFormModule } from '../text';


@NgModule({
  declarations: [LinkComponent],
  exports: [LinkComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule,
    FormFactoryModule,
  ]
})
export class LinkModule { }
