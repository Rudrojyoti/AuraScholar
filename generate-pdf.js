const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('dummy.pdf'));
doc.text('This is a test research paper. The methodology uses standard scientific methods. The conclusion is that AI is very cool.');
doc.end();
