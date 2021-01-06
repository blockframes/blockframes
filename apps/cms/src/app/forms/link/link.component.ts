import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormEntity, FormGroupSchema, FormFactoryModule } from 'ng-form-factory';
import { Link } from '@blockframes/admin/cms';
import { TextFormModule, matText } from '../../forms/text';
import { SelectFormModule, matSelect } from '../../forms/select';

export const linkSchema: FormGroupSchema<Link> = {
  form: 'group',
  load: () => import('./link.component').then(m => m.LinkComponent),
  controls: {
    text: matText({ label: 'text' }),
    path: matText({ label: 'URL' }),
    type: matSelect({ label: 'Type', options: ['basic', 'flat', 'stroked'], value: 'basic' }),
    color: matSelect({ label: 'Color', options: ['', 'primary', 'accent', 'warn'] })
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


@NgModule({
  declarations: [LinkComponent],
  exports: [LinkComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule,
    SelectFormModule,
    FormFactoryModule,
  ]
})
export class LinkModule { }
