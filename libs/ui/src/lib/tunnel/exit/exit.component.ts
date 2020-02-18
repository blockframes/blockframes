import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TunnelService } from '../tunnel.service';

@Component({
  selector: 'tunnel-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitComponent implements OnInit {
  routeBeforeTunnel: string;

  @Input() exitRedirect: string;

  constructor(private service: TunnelService) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.service.previousUrl || this.exitRedirect || 'c/o/';
  }

}
