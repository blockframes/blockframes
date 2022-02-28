import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormStaticValue } from '@blockframes/utils/form';
import { contentType, ContentType } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] form-content-type',
  templateUrl: './content-type.component.html',
  styleUrls: ['./content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormContentTypeComponent {
  @Input() form: FormStaticValue<'contentType'>;
  contentType = contentType;
  contentTypes = Object.keys(contentType) as ContentType[];
}
