## Introduction to Nunjucks
This section is an introduction to Nunjucks and how it cooperates with LaTeX. 

### Setup and Resources

Nunjucks documentation:
https://mozilla.github.io/nunjucks/templating.html
https://mozilla.github.io/nunjucks/api.html

Nunjucks extension that I made:
https://github.com/lfletcher23/nunjucks-for-LaTeX

Download the .vsix, then add through the "more actions" part of VSCode extensions

It's also important to note that we are using a *custom modification* of the original Nunjucks syntax. This is configured in src/tools/converters.mts

```
const env = nunjucks.configure('projects', {
    autoescape: true,
    tags: {
        variableStart: '#!',
        variableEnd: '!#',
        blockStart: '[##',
        blockEnd: '##]',
        commentStart: '%!',
        commentEnd: '!%'
    }
});
```
This syntax was chosen to minimize conflicts with the LaTeX syntax or symbols that are frequently used in text writing. Nunjucks was created as a templating engine for HTML, but the custom configuration allows it to be used with LaTeX. I have made a simple extension to add some code highlighting, but have not rigorously tested it. *If you use a different Nunjucks extension, it will not work because it will be configured for traditional Nunjucks syntax and HTML.* 

Nunjucks effectively operates on a text/string level-- it uses the instructions given to generate text. Nunjucks doesn't "know" or "understand" LaTeX or HTML.

A note on autoescape: TODO, basically intended for HTML, caution with 

### Getting Started

The basic constructs of Nunjucks are *blocks*, *variables*, and *filters*. 

#### Blocks

Blocks can be used for inheriting common chunks of test like blocks in PUG/JADE, but I haven't found this particularly relevant for PDF generation. However, blocks can also be used to perform various functions. Nunjucks comes with a number of existing block functions, and you can create your own (which are called *macros*). https://mozilla.github.io/nunjucks/templating.html#tags

Some blocks apply to all of the content between a starting block and an ending block. A *for* block uses the following syntax: (note that < > is used for demonstration purposes and should not appear in the code)
```
[## for *item* in *items* ##]
< Instructions for each item >
[## endfor ##]
```

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

For example, if our main.njk file contains:
```
Hi there #!Name!#, hello world!
```
And we run 
```console.log(nunjucks.render('main.njk', {Name: "Joe"}))```

Our output will be:
``` Hi there Joe, hello world! ```

Variable syntax is also needed to call functions in some circumstances, but we'll address this later.

#### Filters

Filters are a feature Nunjucks provides to apply filters to data. In some ways filters are similar to mapping functions.

Here are all of the already defined Nunjucks filters: https://mozilla.github.io/nunjucks/templating.html#builtin-filters

You can also define your own, but I haven't had a need to do this yet for PDF generation. 

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

Nunjucks can iterate over JS objects, including ones that contain other objects. Consider the following JS input:
```
const MyPets = {
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

console.log(nunjucks.render('main.njk', {Name: "Joe", Pets: MyPets}))
```

If our main.njk file is:
```
[## for pet, attrs in Pets ##]
The name of this pet is #!pet!# and they are a #!attrs["Color"] | lower!# #!attrs["Species"] | lower!#
[## endfor ##]
```

Our output will be:
```
The name of this pet is Blueberry and they are a grey cat

The name of this pet is Max and they are a black dog

The name of this pet is Sandy and they are a tan dog
```

Nunjucks also has a "dump" filter, which will print an object as text:
```
Our current pets are:
[## for pet, attrs in Pets ##]
#!pet!# : #!attrs|dump!#
[## endfor ##]
```

The output of this will be:
```
Our current pets are:

Blueberry : {&quot;Age&quot;:3,&quot;Species&quot;:&quot;Cat&quot;,&quot;Color&quot;:&quot;Grey&quot;}

Max : {&quot;Age&quot;:5,&quot;Species&quot;:&quot;dog&quot;,&quot;Color&quot;:&quot;black&quot;}

Sandy : {&quot;Age&quot;:0.5,&quot;Species&quot;:&quot;DOG&quot;,&quot;Color&quot;:&quot;TAN&quot;}
```

Whoops, what's going on?

Nunjucks is autoescaping the ```"``` and sanitizing it. To avoid this, we can designate the input as ```safe```

If we change main.njk to:
```
[## for pet, attrs in Pets ##]
#!pet!# : #!attrs|dump|safe!#
[## endfor ##]
```

Our output is:
```
Our current pets are:

Blueberry : {"Age":3,"Species":"Cat","Color":"Grey"}

Max : {"Age":5,"Species":"dog","Color":"black"}

Sandy : {"Age":0.5,"Species":"DOG","Color":"TAN"}
```

Due to some weirdness with the escaping and HTML vs LaTeX, I'm looking into changing the configuration to handle this appropriately by default, and shift the code to having autoescape *off*