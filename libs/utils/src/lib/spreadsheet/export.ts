import {
  WorkBook,
  WorkSheet,
  utils,
  writeFile,
  FullProperties,
  AOA2SheetOpts
} from 'xlsx';

interface SheetOptions {
  name: string,
  sheet: WorkSheet
}

interface AddLineOptions {
  merge: CellRange[]
}

interface CellRange {
  start: string,
  end: string
}

export function addNewSheetsInWorkbook(worksheets: SheetOptions[], workbook: WorkBook) {
  worksheets.forEach(({ name, sheet }) => utils.book_append_sheet(workbook, sheet, name));
}

/**
 * Calculate the width of columns with the total length of the letters + 5 to add some extra space.
 * Add the max value to each columns.
 */
export function addWorksheetColumnsWidth(data: unknown[][], worksheet: WorkSheet, defaultSpace: number = 15) {
  const maxCols = Array(data[0].length).fill(defaultSpace);
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const currentNumber = maxCols[col];
      const newNumber = data[row][col] ? `${data[row][col]}`.length + 5 : 0;
      if (currentNumber < newNumber) maxCols[col] = newNumber;
    }
  }
  worksheet['!cols'] = maxCols.map((n: number) => ({ width: n }));
}

export function createWorkBook(properties: FullProperties) {
  const workbook = utils.book_new();
  workbook.Props = properties;
  return workbook;
}

export function exportSpreadsheet(workbook: WorkBook, filename: string = 'SheetJS.xlsx') {
  writeFile(workbook, filename);
}

export class ExcelData {
  public rowsData: unknown[][] = [];
  private mergeArray: string[] = [];
  private rowNumber = 1;

  addLine(line: unknown[], options?: AddLineOptions) {
    this.rowsData.push(line);
    if (options) {
      options.merge.forEach(range => {
        const startCol = `${range.start}${this.rowNumber}`;
        const endCol = `${range.end}${this.rowNumber}`;
        this.mergeArray.push(`${startCol}:${endCol}`);
      });
    }
    this.rowNumber++;
  }

  addBlankLine() {
    this.rowsData.push(null);
    this.rowNumber++;
  }

  createWorksheet(options?: AOA2SheetOpts) {
    const worksheet = utils.aoa_to_sheet(this.rowsData, options);
    const mergeRange = this.mergeArray.map(range => utils.decode_range(range));
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push(...mergeRange);
    return worksheet;
  }

}
