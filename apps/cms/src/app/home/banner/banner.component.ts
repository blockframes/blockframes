import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormEntity, FormFactoryModule, FormGroupSchema } from 'ng-form-factory';
import { BannerSection } from '@blockframes/model';
import { TextFormModule, matText } from '../../forms/text';
import { LinkModule, linkSchema } from '../../forms/link';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';


export const bannerSchema: FormGroupSchema<BannerSection> = {
  form: 'group',
  load: async () => import('./banner.component').then(m => m.BannerComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    subtitle: matText({ label: 'subtitle' }),
    description: matText({ label: 'description', size: 'long' }),
    background: {
      form: 'group',
      controls: {
        storagePath: matText({ label: 'backround' }),
        privacy: { form: 'control' },
        collection: { form: 'control' },
        field: { form: 'control' },
        docId: { form: 'control' }
      }
    },
    image: {
      form: 'group',
      controls: {
        storagePath: matText({ label: 'Image' }),
        privacy: { form: 'control' },
        collection: { form: 'control' },
        field: { form: 'control' },
        docId: { form: 'control' }
      }
    },
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
