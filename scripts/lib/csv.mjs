// Minimal RFC 4180 CSV parser: quoted fields, escaped quotes ("") and
// newlines inside quoted fields. Streams rows so large files stay cheap.

export function* parseCsv(text) {
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      yield row;
      row = [];
      field = "";
    } else {
      field += ch;
    }
    i++;
  }

  if (field !== "" || row.length) {
    row.push(field);
    yield row;
  }
}

// Yields one object per data row, keyed by the header row.
export function* parseCsvRecords(text) {
  let header = null;
  for (const row of parseCsv(text)) {
    if (!header) {
      header = row;
      continue;
    }
    if (row.length === 1 && row[0] === "") continue;
    const record = {};
    header.forEach((key, index) => {
      record[key] = row[index] ?? "";
    });
    yield record;
  }
}
