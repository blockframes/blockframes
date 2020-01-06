import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class StartTunnelComponent{
  public cardContents = [
    {
      title: 'Title Information',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
    {
      title: 'Licensed Rights',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
    {
      title: 'Upload Media',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
    {
      title: 'Legal Information',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
  ]
}
