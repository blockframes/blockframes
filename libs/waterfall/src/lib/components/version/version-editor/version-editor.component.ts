import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Version, WaterfallRightholder } from '@blockframes/model';
import { VersionForm } from '../../../form/version.form';

interface VersionData {
  mode: 'edit' | 'create' | 'init';
  version: Version;
  isDefaultVersion: boolean;
  rightholders: WaterfallRightholder[];
  onConfirm?: (version: Version, rightholderIds: string[]) => void
}

@Component({
  selector: 'waterfall-version-editor',
  templateUrl: './version-editor.component.html',
  styleUrls: ['./version-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionEditorComponent implements OnInit {

  public form: VersionForm;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: VersionData,
    public dialogRef: MatDialogRef<VersionEditorComponent>
  ) { }

  ngOnInit() {
    const rightholderIds = this.data.rightholders.filter(r => r.lockedVersionId === this.data.version.id).map(r => r.id);
    this.form = new VersionForm(this.data.version, rightholderIds);
  }

  public confirm() {
    if (!this.form.valid) return;

    const version: Version = this.form.value;
    const rightholderIds: string[] = this.form.value.rightholderIds;
    delete (version as any).rightholderIds;

    this.data.onConfirm(version, rightholderIds);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
