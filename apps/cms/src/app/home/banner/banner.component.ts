import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormEntity, FormFactoryModule, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { TextFormModule, matText } from '../text';
import { Link, LinkModule, linkSchema } from '../link/link.component';

interface Banner extends Section {
  title: string;
  subtitle: string;
  description: string;
  background: string;
  link: Link
}

export const bannerSchema: FormGroupSchema<Banner> = {
  form: 'group',
  load: async () => import('./banner.component').then(m => m.BannerComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    subtitle: matText({ label: 'subtitle' }),
    description: matText({ label: 'description', size: 'long' }),
    background: matText({ label: 'background' }),
    link: linkSchema
  },
}

@Component({
  selector: 'form-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {
  @Input() form?: FormEntity<typeof bannerSchema>;
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [BannerComponent],
  imports: [
    CommonModule,
    FormFactoryModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TextFormModule,
    LinkModule,
  ]
})
export class BannerModule { }
