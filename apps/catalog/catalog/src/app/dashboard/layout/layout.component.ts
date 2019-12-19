import { Component, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent{
  opened: boolean;
}
