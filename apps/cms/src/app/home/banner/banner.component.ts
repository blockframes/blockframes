import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormEntity, FormFactoryModule, FormGroupSchema } from 'ng-form-factory';
import { BannerSection } from '@blockframes/admin/cms';
import { TextFormModule, matText } from '../../forms/text';
import { LinkModule, linkSchema } from '../../forms/link';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


export const bannerSchema: FormGroupSchema<BannerSection> = {
  form: 'group',
  load: async () => import('./banner.component').then(m => m.BannerComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    subtitle: matText({ label: 'subtitle' }),
    description: matText({ label: 'description', size: 'long' }),
    background: matText({ label: 'background' }),
    image: matText({ label: 'Image' }),
    links: { form: 'array', controls: [], factory: linkSchema }
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

  get links() {
    return this.form.get('links');
  }
}


@NgModule({
  declarations: [BannerComponent],
  imports: [
    CommonModule,
    FormFactoryModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TextFormModule,
    LinkModule,
  ]
})
export class BannerModule { }
