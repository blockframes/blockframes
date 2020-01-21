import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
@Component({
  selector: '[form] movie-form-promotional-links',
  templateUrl: './promotional-links.component.html',
  styleUrls: ['./promotional-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalLinksComponent {
  @Input() form: MoviePromotionalElementForm;
}
