
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FileUploaderService } from '@blockframes/media/+state';
import { StorageFile } from '@blockframes/model';
import { CollectionHoldingFile, FileLabel } from '@blockframes/media/+state/static-files';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { FormList } from '@blockframes/utils/form';
import { AllowedFileType } from '@blockframes/utils/utils';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';



@Component({
  selector: '[form] [meta] [accept] file-list-uploader',
  templateUrl: './file-list-uploader.component.html',
  styleUrls: ['./file-list-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListUploaderComponent {

  public disabled = true;
  public newFileForm = new StorageFileForm();

  @Input() form: FormList<StorageFile>;

  @Input() meta: [CollectionHoldingFile, FileLabel, string];

  @Input() accept: AllowedFileType | AllowedFileType[];

  @Input() togglePrivacy: boolean;

  constructor(
    private db: AngularFirestore,
    private uploadService: FileUploaderService,
  ) {}

  save() {
    this.uploadService.upload();
  }

  async delete(file: StorageFile, index: number) {
    const docRef = this.db.collection(file.collection).doc(file.docId);
    const docSnap = await docRef.get().toPromise();
    if (!docSnap.exists) {
      console.warn(`Document ${file.collection}/${file.docId} doesn't exists!`);
      return;
    }
    const doc = docSnap.data();
    const files: StorageFile[] = getDeepValue(doc, file.field);

    files.splice(index, 1); // remove element at index
    docRef.update({ [file.field]: files });
  }

  change() {
    this.disabled = !this.disabled;
  }
}
