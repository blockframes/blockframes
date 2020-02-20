import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-no-title',
  templateUrl: './no-title.component.html',
  styleUrls: ['./no-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoTitleComponent {
}
