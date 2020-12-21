import { Component, OnInit, ChangeDetectionStrategy, Input, Inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ShellConfig, FORMS_CONFIG } from '@blockframes/movie/form/shell/shell.component';
import { Subscription } from 'rxjs';
import { TunnelConfirmComponent } from '../layout/confirm/confirm.component';

export interface TunnelDialogText {
  title: string,
  subtitle: string
}

@Component({
  selector: '[exitRedirect] tunnel-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitComponent implements OnInit, OnDestroy {
  routeBeforeTunnel: string;

  @Input() exitRedirect: string;

  @Input() dialogText: TunnelDialogText;

  private sub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.exitRedirect || '/c/o/';
  }

  redirect() {
    const isPristine = Object.values(this.configs).every(config => config.form.pristine);
    if (isPristine) {
      this.navigate();
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: this.dialogText
    });
    this.sub = dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'undefined') {
        return;
      }
      result ? this.save() : this.navigate()
    });
  }

  private async save() {
    for (const name in this.configs) {
      await this.configs[name].onSave(false);
    }
    this.navigate();
  }

  private navigate() {
    this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
