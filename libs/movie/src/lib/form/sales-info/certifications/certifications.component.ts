import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[form] movie-form-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificationsComponent {
  @Input() form: FormControl;
}
