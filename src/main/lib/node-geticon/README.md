# extract-file-icon

Get associated file icon for Node.js.

# Installation

To install this package, just run

```bash
$ npm install node-geticon
```

# Quick start

The following example shows how to get the currently focused window's title and hide it.

CommonJs
```javascript
const geticon = require("node-geticon");

geticon.init() //only run once
const buffer = geticon.getThumbnail("I:\\node-geticon-example\\你好.pptx", "image/png") // Returns PNG buffer of 256x256 file icon at given path. 
```

ESM
```javascript
import geticon from 'node-geticon'

geticon.init() //only run once
const buffer = geticon.getThumbnail("I:\\node-geticon-example\\你好.pptx", "image/png") // Returns PNG buffer of 256x256 file icon at given path. 
```
