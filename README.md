#Polymer Static Analyzer

This tool analyzes the dependencies of a Polymer project by inspecting its *polymer.json* file.

##Example

Analyzing the Polymer shop project.

```
git clone https://github.com/Polymer/shop.git
git clone https://github.com/PixelcodeUK/polymer-static-analyze.git
cd shop
bower install
node ../polymer-static-analyze/bin/polymer-analyze polymer.json
```

###Example output

Fragment[0]: src/shop-list.html

```JSON
{ dependencies:
   [ { file: 'bower_components/polymer/polymer.html',
       refCount: 7,
       size: 123518,
       depth: [ 0, 1, 2, [length]: 3 ] },
     { file: 'bower_components/app-route/app-route.html',
       refCount: 1,
       size: 10998,
       depth: [ 0, [length]: 1 ] },
     { file: 'bower_components/iron-flex-layout/iron-flex-layout.html',
       refCount: 4,
       size: 9212,
       depth: [ 0, 1, [length]: 2 ] },
     { file: 'src/shop-category-data.html',
       refCount: 1,
       size: 6080,
       depth: [ 0, [length]: 1 ] },
     { file: 'src/shop-common-styles.html',
       refCount: 1,
       size: 1273,
       depth: [ 0, [length]: 1 ] },
     { file: 'src/shop-image.html',
       refCount: 1,
       size: 2417,
       depth: [ 0, [length]: 1 ] },
     { file: 'src/shop-list-item.html',
       refCount: 1,
       size: 1752,
       depth: [ 0, [length]: 1 ] },
     { file: 'bower_components/polymer/polymer-mini.html',
       refCount: 7,
       size: 54163,
       depth: [ 1, 2, 3, [length]: 3 ] },
     { file: 'bower_components/polymer/polymer-micro.html',
       refCount: 7,
       size: 16934,
       depth: [ 2, 3, 4, [length]: 3 ] },
     [length]: 9 ],
  file: 'src/shop-list.html' }
```
The output shows the file name, the number of times it is referenced, the file size in bytes, and the different depths it is referenced in (in the dependency trees).


This output shows that the Polymer element is referenced 7 times (for this element/route), at 3 different depths -- and is therefore a good candidate for HTTP 2.0 server push.

##TODO
* Make NPM module
* Add cache so the same file is not re-analyzed
* Make more efficient
