import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Template } from '../+state/template.model';

@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent {

  @Input() template: Template;
  @Input() name: string;
  @Output() save = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

}
