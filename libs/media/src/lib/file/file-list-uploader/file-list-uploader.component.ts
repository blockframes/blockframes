
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileUploaderService } from '../../file-uploader.service';
import { StorageFile, CollectionHoldingFile } from '@blockframes/model';
import { FileLabel } from '../../utils';
import { StorageFileForm } from '../../form/media.form';
import { FormList } from '@blockframes/utils/form';
import { AllowedFileType } from '@blockframes/model';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { FirestoreService } from 'ngfire';

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
    private uploadService: FileUploaderService,
    private firestore: FirestoreService,
  ) { }

  save() {
    this.uploadService.upload();
  }

  async delete(file: StorageFile, index: number) {
    const docRef = doc(this.firestore.db, `${file.collection}/${file.docId}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn(`Document ${file.collection}/${file.docId} doesn't exists!`);
      return;
    }
    const document = docSnap.data();
    const files: StorageFile[] = getDeepValue(document, file.field);

    files.splice(index, 1); // remove element at index
    updateDoc(docRef, { [file.field]: files });
  }

  change() {
    this.disabled = !this.disabled;
  }
}
