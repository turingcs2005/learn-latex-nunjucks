## Introduction to Nunjucks
This section is an introduction to Nunjucks and how it cooperates with LaTeX. 

### Setup and Resources

Nunjucks documentation:
https://mozilla.github.io/nunjucks/templating.html
https://mozilla.github.io/nunjucks/api.html

Nunjucks extension that I made:
https://github.com/lfletcher23/nunjucks-for-LaTeX

Download the .vsix, then add through the "more actions" part of VSCode extensions

It's also important to note that we are using a *custom modification* of the original Nunjucks syntax. This is configured in `src/tools/converters.mts`. Your Nunjucks setup should look like:

```
const env = nunjucks.configure('projects', {
    autoescape: false,
    tags: {
        variableStart: '#!',
        variableEnd: '!#',
        blockStart: '[##',
        blockEnd: '##]',
        commentStart: '%!',
        commentEnd: '!%'
    }
});

env.addFilter('texscape', function(str) {
    const fixslash = str.replace(/\\/g, "\\textbackslash");
    const fixsymbols = fixslash.replace(/(\$|%|&|#|_|\{|\})/g, "\\$1"); // replace tex special characters
    const fixspecial = fixsymbols.replace(/(\^|~)/g, "\\$1\{\}") // replace tex special characters with a different replacement syntax
    return fixspecial;
});
```

The first chunk defines the custom Nunjucks syntax we're using. This syntax was chosen to minimize conflicts with the LaTeX syntax or symbols that are frequently used in text writing. Nunjucks was created as a templating engine for HTML, but the custom configuration allows it to be used with LaTeX. I have made a simple extension to add some code highlighting, but have not rigorously tested it. *If you use a different Nunjucks extension, it will not work because it will be configured for traditional Nunjucks syntax and HTML.* 

We also add a filter called `texscape` which should automatically fix characters that LaTeX escapes. We turned `autoescape` *off* because it's intended for HTML special characters. See the next section for more details on this.

Nunjucks effectively operates on a text/string level-- it uses the instructions given to generate text. Nunjucks doesn't "know" or "understand" LaTeX or HTML.

### Getting Started

The basic constructs of Nunjucks are *blocks*, *variables*, and *filters*. 

#### Blocks

Blocks can be used for inheriting common chunks of text, similar to blocks in PUG. I haven't found inheritance particularly relevant for PDF generation, but blocks can also be used to perform various functions. Nunjucks comes with a number of existing block functions, and you can create your own (which are called *macros*). https://mozilla.github.io/nunjucks/templating.html#tags

Some blocks apply to all of the content between a starting block and an ending block. A `for` block uses the following syntax: 

```
[## for item in items ##]
< Instructions for each item >
[## endfor ##]
```
*Note that < > is used for demonstration purposes and should not appear in the code*

Other blocks can be contained in a single statement and do not need an ending block:
```
[## set <name> = <value> ##]
```

Creating your own macro is analogous to creating your own function. The syntax for creating a macro is:
```
[## macro MyMacroName(params) ##]
< content of macro >
[## endmacro ##]
```
#### Variables

When Nunjucks is used to render a template, a *context* parameter may be passed in-- these are the input variables. The input should be in the form of a JS object with key-value pairs. To access the value of a variable, use the syntax  ```#!key!#```

For example, if our `main.njk` file contains:
```
Hi there #!Name!#, hello world!
```
And we run: 
```console.log(nunjucks.render('main.njk', {Name: "Joe"}))```

Our output will be:
``` Hi there Joe, hello world! ```

Variable syntax is also needed to call functions in some circumstances, but we'll address this later.

#### Filters

Filters are a feature Nunjucks provides to apply filters to data. In some ways filters are similar to mapping functions.

Here are all of the already defined Nunjucks filters: https://mozilla.github.io/nunjucks/templating.html#builtin-filters


Filters are called using a pipe operator. If this is our main.njk file:
```
This is your name in all caps: #!Name | upper!#
The number of letters in your name is: #!Name | length!#
```
And we run:
```
console.log(nunjucks.render('main.njk', {Name: "Joe"}))
```

Our output will be:
```
This is your name in all caps: JOE
The number of letters in your name is: 3
```

## Nested objects and iterating

Nunjucks can iterate over JS objects, including ones that contain other objects.


If our main.njk file is:
```
[## for pet, attrs in Pets ##]
The name of this pet is #!pet!# and they are a #!attrs["Color"] | lower!# #!attrs["Species"] | lower!#
[## endfor ##]
```

And we run the following:
```
const myPets = {
    "Blueberry": {
        "Age": 3,
        "Species": "Cat",
        "Color": "Grey"
    },
    "Max": {
        "Age": 5,
        "Species": "dog",
        "Color": "black"
    },
    "Sandy": {
        "Age": 0.5,
        "Species": "DOG",
        "Color": "TAN"
    }
}

console.log(nunjucks.render('main.njk', {Pets: myPets}))
```

Our output will be:
```
The name of this pet is Blueberry and they are a grey cat

The name of this pet is Max and they are a black dog

The name of this pet is Sandy and they are a tan dog
```

Nunjucks also has a "dump" filter, which will print an object as text.

If we change our `main.njk` file to this:
```
Our current pets are:
[## for pet, attrs in Pets ##]
#!pet!# : #!attrs|dump!#
[## endfor ##]
```

The output will be:
```
Our current pets are:

Blueberry : {"Age":3,"Species":"Cat","Color":"Grey"}

Max : {"Age":5,"Species":"dog","Color":"black"}

Sandy : {"Age":0.5,"Species":"DOG","Color":"TAN"}
```

## Creating your own macros

Let's say we want to write a function to generate standardized descriptions of our pets:
```
[## macro DescribePet(name, PetData) ##]
[## if PetData[name]["Age"] >= 1 ##] #!name!# is a #!PetData[name]["Age"]!# year old #!PetData[name]["Species"]|lower!#
[## else ##] #!name!# is a #!12 * PetData[name]["Age"]!# month old #!PetData[name]["Species"]|lower!# [## endif ##]
[## endmacro ##]

[## for name, attrs in Pets ##] #!name!#: #!DescribePet(name, Pets)!# [## endfor ##]
```

The output of this will be:
```
Blueberry: 
Blueberry is a 3 year old cat

  Max: 
 Max is a 5 year old dog

  Sandy: 
 Sandy is a 6 month old dog
```

[TODO: spacing weirdness]

## Example
Try making changes to the input data or to `Example2/main.njk` and then running the following code in the `app.mts` file.
```
import { nunjucks } from './tools/converters.mjs';

const myPets = {
    "Blueberry": {
        "Age": 3,
        "Species": "Cat",
        "Color": "Grey",
        "Cat Friendly": true,
        "Dog Friendly": false
    },
    "Max": {
        "Age": 5,
        "Species": "dog",
        "Color": "black",
        "Cat Friendly": false,
        "Dog Friendly": false
    },
    "Sandy": {
        "Age": 0.5,
        "Species": "DOG",
        "Color": "TAN",
        "Cat Friendly": true,
        "Dog Friendly": true
    }
}

console.log(nunjucks.render('Example2/main.njk', {Pets: myPets, myName: "Your Name"}))
```