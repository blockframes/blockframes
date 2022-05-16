import { utils, AOA2SheetOpts }  from 'xlsx';

interface MergeOptions {
  merge: MergeCells[]
}

interface MergeCells {
  startCell: number,
  endCell: number
}

export class ExcelData {

  private arrayOfValue: unknown[][] = [];
  private mergeArray: string[] = [];
  private rowNumber = 1;

  addLine(line: unknown[], mergeCellOptions?: MergeOptions) {
    this.arrayOfValue.push(line);
    if (mergeCellOptions) {
      mergeCellOptions.merge.forEach(range => {
        const startCol = `${this.columnFromNumber(range.startCell)}${this.rowNumber}`;
        const endCol = `${this.columnFromNumber(range.endCell)}${this.rowNumber}`;
        this.mergeArray.push(`${startCol}:${endCol}`);
      })
    }
    this.rowNumber++;
  }

  addBlankLine() {
    this.arrayOfValue.push(null);
    this.rowNumber++;
  }

  createWorksheet(options?: AOA2SheetOpts) {
    const worksheet = utils.aoa_to_sheet(this.arrayOfValue, options);
    const mergeRange = this.mergeArray.map(range => utils.decode_range(range));
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push(...mergeRange);
    return worksheet;
  }

  // Valid for columns which are between A and ZZ
  private columnFromNumber(colNumber: number) {
    if (colNumber > 26) {
      const firstLetter = String.fromCharCode(Math.floor(colNumber / 26) + 64);
      const secondLetter = String.fromCharCode(colNumber % 26 + 64);
      return firstLetter + secondLetter;
    }
    return String.fromCharCode(colNumber + 64);
  }

  get getArrayOfValue() {
    return this.arrayOfValue;
  }

}