import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-end-tunnel',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EndTunnelComponent {
  constructor(private title: Title) {
    this.title.setTitle('Successfully submitted - Archipel Content')
  }
 }
