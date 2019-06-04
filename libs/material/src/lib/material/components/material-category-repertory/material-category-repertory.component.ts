import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Template } from '../../../template/+state';

@Component({
  selector: 'material-category-repertory',
  templateUrl: './material-category-repertory.component.html',
  styleUrls: ['./material-category-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialCategoryRepertoryComponent {
  @Input() template: Template;
}
