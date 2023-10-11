import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CallableFunctions } from 'ngfire';

@Component({
  selector: 'crm-toolbar-top',
  templateUrl: './toolbar-top.component.html',
  styleUrls: ['./toolbar-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarTopComponent {
  public updateInProgress = false;

  constructor(
    private functions: CallableFunctions,
    private snackbar: MatSnackBar,
  ) { }

  async updateAirtable() {
    if(this.updateInProgress) return;
    this.snackbar.open('Updating Airtable. This will take some time...', 'close');
    this.updateInProgress = true;
    const response = await this.functions.call<unknown, string>('updateAirtable', {}, { timeout: 540 * 1000 });

    this.snackbar.open(`Update ended with response: "${response}`, 'close', { duration: 5000 });
    this.updateInProgress = false;
  }
}
