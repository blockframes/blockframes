import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaService } from '@blockframes/media/+state/media.service';
import { OrganizationDocumentWithDates, OrganizationService } from '@blockframes/organization/+state';
import { OrganizationMediasForm } from '@blockframes/admin/admin-panel/forms/organization-medias.form';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';

@Component({
  selector: 'organization-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFilesComponent implements OnInit {

  public form: OrganizationMediasForm;
  public filePrivacy: Privacy = 'protected';
  @Input() org: OrganizationDocumentWithDates;

  constructor(
    private snackBar: MatSnackBar,
    private mediaService: MediaService,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = new OrganizationMediasForm();
  }

  async ngOnInit() {
    this.form = new OrganizationMediasForm(this.org.documents);
    this.form.notes.add({ ref: '' });
    this.cdr.markForCheck();
  }

  public async download(ref: string) {
    const url = await this.mediaService.generateImgIxUrl(ref);
    window.open(url);
  }

  public getPath() {
    return `orgs/${this.org.id}/documents/notes/`;
  }

  public addFile() {
    this.form.notes.add({ ref: '' });
    this.cdr.markForCheck();
  }

  public async uploadFiles() {
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.form);
    const documents = {
      notes: documentToUpdate.notes.filter(n => !!n.ref)
    };

    await this.organizationService.update(this.org.id, { documents });
    this.mediaService.uploadMedias(mediasToUpload);
    this.snackBar.open('Documents uploaded !', 'close', { duration: 5000 });
  }

}
