import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent{
  opened: boolean;
}
