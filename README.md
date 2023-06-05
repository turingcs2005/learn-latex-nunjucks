# Introduction 
This is an example project to introduce the LaTeX and Nunjucks stack 

# Getting Started
TODO: Guide users through getting your code up and running on their own system
- Clone the repo
- Install node modules
- To compile TS to JS, use *npm run build*
- To run the application, use *npm run start*
- If the LaTeX/Nunjucks has been changed but the TS has not changed, it's not necessary to run *build* again to regenerate a PDF

## Notes
- You must have the compiler and packages installed on your system (for the solutions-dv-vm, this should already be done)
- I highly recommend **not** using latex-workshop. It makes a number of assumptions which can be helpful initially, but can also cause errors and will *not* necessarily return the same output as the coded web application
- This does not use nodemon and I don't recommend using it because this can cause unintended overwriting of PDFs and generation of corrupted PDFs