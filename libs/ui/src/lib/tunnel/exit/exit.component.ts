import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TunnelService } from '../tunnel.service';
import { Router, ActivatedRoute } from '@angular/router';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'tunnel-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitComponent implements OnInit {
  routeBeforeTunnel: string;

  @Input() exitRedirect: string;

  @Input() @boolean askForConfirmation;

  constructor(
    private service: TunnelService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.service.previousUrl || this.exitRedirect || '/c/o/';
  }

  async redirect() {
      this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
  }
}
