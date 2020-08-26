import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TunnelService } from '../tunnel.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TunnelConfirmComponent } from '../layout/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
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
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.service.previousUrl || this.exitRedirect || '/c/o/';
  }

  async redirect() {
    if (!!this.askForConfirmation) {
      const dialogRef = this.dialog.open(TunnelConfirmComponent, {
        width: '80%',
        data: {
          title: 'You are going to leave the Movie Form.',
          subtitle: 'Pay attention, if you leave now your changes will not be saved.',
          accept: 'Close without saving',
          cancel: 'Cancel'
        }
      });
      const navigate = await dialogRef.afterClosed().toPromise();
      if (!!navigate) {
        this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
      }
    } else {
      this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
    }
  }

}
