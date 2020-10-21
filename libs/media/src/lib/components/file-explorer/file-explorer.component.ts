import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { extractMediaFromDocumentBeforeUpdate, isMediaForm } from '@blockframes/media/+state/media.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { FileDialogComponent } from '../dialog/file/file.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { OrganizationDocumentWithDates } from '@blockframes/organization/+state/organization.firestore';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { ImageDialogComponent } from '../dialog/image/image.component';

const columns = { 
  ref: 'Type',
  name: 'Document Name',
  download: 'Download',
  edit: 'Edit',
  delete: 'Delete'
};

interface Directory {
  name: string,
  subDirectories: SubDirectory[]
}

interface SubDirectory {
  multiple: boolean,
  name: string,
  type: 'image' | 'file',
  path: string,
  docNameField: string,
  fileRefField: string,
  storagePath: string,
  selected?: boolean
}

@Component({
  selector: '[org] file-explorer',
  templateUrl: 'file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent {

  @Input() set org(org: OrganizationDocumentWithDates) {
    this.directories.push({
      name: org.denomination.full,
      subDirectories: [
        {
          name: 'Documents',
          type: 'file',
          multiple: true,
          path: 'documents.notes',
          docNameField: 'title',
          fileRefField: 'ref',
          storagePath: `orgs/${org.id}/documents/notes/`,
          selected: true
        },
        {
          name: 'Logo',
          type: 'image',
          multiple: false,
          path: '',
          docNameField: 'logo',
          fileRefField: 'logo',
          storagePath: `orgs/${org.id}/logo`
        }
      ]
    });
    this.activeDirectory = this.directories[0].subDirectories[0];
    this.orgId = org.id;

    this.org$ = this.organizationService.valueChanges(org.id);
  };

  private orgId: string;
  public org$: Observable<OrganizationDocumentWithDates>;
  public directories: Directory[] = [];
  public activeDirectory: SubDirectory;
  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private organizationService: OrganizationService
  ) {}

  public selectItem(event: MatSelectionListChange) {
    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;
  }

  public deleteFile(row: HostedMediaWithMetadata | OrganizationDocumentWithDates) {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this file?',
        question: ' ',
        buttonName: 'Yes',
        onConfirm: async () => {
          const org = await this.organizationService.getValue(this.orgId);
          const orgForm = new OrganizationForm(org);

          if (this.activeDirectory.multiple) {
            if (!determineType(row)) return; // never for now - typesafety
            const notes = org.documents.notes.filter(n => n.title !== row.title);
            await this.organizationService.update(this.orgId, { documents: { notes: notes } });
          } else {
            orgForm.logo.markForDelete();
            const { documentToUpdate } = extractMediaFromDocumentBeforeUpdate(orgForm);
            await this.organizationService.update(this.orgId, documentToUpdate );
          }
        }
      }
    });
  }

  public async openDialog(row?: HostedMediaWithMetadata | OrganizationDocumentWithDates) {
    const org = await this.organizationService.getValue(this.orgId);
    const orgForm = new OrganizationForm(org);

    let form;
    if (this.activeDirectory.path) {
      form = this.activeDirectory.path.split('.').reduce((result, key) => result?.controls?.[key], orgForm)
    } else {
      form = orgForm.controls[this.activeDirectory.fileRefField];
    }

    let hostedMediaForm: HostedMediaWithMetadataForm | HostedMediaForm;
    if (isMediaForm(form)) {
      hostedMediaForm = form;
    } else {
      if (row) {
        if (!determineType(row)) return; // never for now - typesafety
        hostedMediaForm = form.controls.find(ctrl => ctrl.value.title === row.title);
      } else {
        hostedMediaForm = form.add();
      }

    }

    let dialog: MatDialogRef<FileDialogComponent | ImageDialogComponent>;
    if (this.activeDirectory.type === 'file') {
      dialog = this.dialog.open(FileDialogComponent, { width: '60vw', data: {
        form: hostedMediaForm,
        privacy: 'protected',
        storagePath: this.activeDirectory.storagePath
      }});
    } else if (this.activeDirectory.type === 'image') {
      dialog = this.dialog.open(ImageDialogComponent, { width: '60vw', data: {
        form: hostedMediaForm,
        ratio: 'square',
        storagePath: this.activeDirectory.storagePath
      }});
    }

    dialog.afterClosed().subscribe(async result => {
      if (!!result) {
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(orgForm);
        await this.organizationService.update(this.orgId, documentToUpdate);
        this.mediaService.uploadMedias(mediasToUpload);
      }
    });
  }

  public async downloadFile(item: Partial<HostedMediaWithMetadata | OrganizationDocumentWithDates>) {
    const ref = item[this.activeDirectory.fileRefField]
    const url = await this.mediaService.generateImgIxUrl(ref);
    window.open(url);
  }
}

function determineType(object: HostedMediaWithMetadata | OrganizationDocumentWithDates): object is HostedMediaWithMetadata {
  return !!(object as HostedMediaWithMetadata).title
}