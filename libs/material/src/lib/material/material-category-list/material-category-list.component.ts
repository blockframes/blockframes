import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Template } from '../../template/+state';

@Component({
  selector: 'material-category-list',
  templateUrl: './material-category-list.component.html',
  styleUrls: ['./material-category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialCategoryListComponent {
  @Input() template: Template;
}
