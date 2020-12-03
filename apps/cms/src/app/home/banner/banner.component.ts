import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormEntity, FormFactoryModule, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { TextFormModule, matText } from '../../forms/text';
import { Link, LinkModule, linkSchema } from '../link/link.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
interface Banner extends Section {
  title: string;
  subtitle: string;
  description: string;
  background: string;
  links: Link[]
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
