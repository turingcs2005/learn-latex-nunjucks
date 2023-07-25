
## Combining LaTeX and Nunjucks

### Making a tex file
Try running the following in `app.mts` to create a tex file with Nunjucks:

```
import { nunjucks } from './tools/converters.mjs';
import fs from 'fs'

const myData = {
    "A. Hull": 
        {Deductible: "$900", 
        "Amounts or Limits": "$750,000", 
        Rate: "0", 
        Premium: "$7,714"}, 
    "B. Protection and Indemnity": 
        {Deductible: "See Schedule", 
        "Amounts or Limits": "$300,000", 
        Rate: "0", 
        Premium: "$779"}, 
    "C. Tender": 
        {Deductible: "$400", 
        "Amounts or Limits": "$3,500", 
        Rate: "0", 
        Premium: "$100"}
}

const rendered = nunjucks.render('Example3/main.njk', {Data: myData})
const texTest = fs.createWriteStream('tex-files/myTable.tex')
texTest.write(rendered)
```

### Making a PDF
We could next run `TexToPDF`:
```
import {nunjucks, TexToPDF}
TexToPDF('myTable.tex', 'myTable.pdf')
```
Or we can use the direction function, `NjkToPDF`

[TODO]