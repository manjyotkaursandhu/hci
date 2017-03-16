'use strict'

var DMS = {};

/*******************************************************************************
    Auxiliary functions
*******************************************************************************/

function parseCSV(values) {
  return values
    .split(',')
    .map(function (str) {
      return str.trim();
    })
    .filter(function (str) {
      return str != '';
    });
}

function extractTagNames(description) {
  return description.match(/(\w+)/g);
}

Array.prototype.diff = function(other) {
  return this.filter(function (e) {
    return !other.includes(e);
  });
};

Set.prototype.eq = function(other) {
  if (this.size !== other.size)
    return false;
  for (let value of this)
    if (!other.has(value))
      return false;
  return true;
}

Set.prototype.map = function(x, y) {
  if (this.delete(x))
    this.add(y);
  return this;
}

function compose(f, g) {
  return function (x) {
    return g(f(x));
  }
}

/*******************************************************************************
    DMS classes
*******************************************************************************/

// Callbacks *******************************************************************

class Callback {
  constructor(fn = function (object) {}) {
    this.callback = fn;
    this.filters = [];
    this.convertion = function (object) { return object; };
    this.updatesvalues = false;
  }

  apply(object) {
    return this.callback(this.convertion(object));
  }

  setCallback(fn) {
    this.callback = fn;
    return this;
  }
  
  test(object) {
    for (let filter of this.filters)
      if (!filter(this.convertion(object)))
        return false;
    return true;
  }

  addFilter(filter) {
    this.filters.push(filter);
    return this;
  }

  addFilters(filters) {
    for (let filter of filters)
      this.addFilter(filter);
    return this;
  }

  setConversion(fn) {
    this.convertion = fn;
    return this;
  }
  
  addConversion(fn) {
    this.convertion = compose(fn, this.convertion);
    return this;
  }

  updatesValues() {
    return this.updatesvalues;
  }
  
  updateValues(flag = true) {
    this.updatesvalues = flag;
    return this;
  }
}

// Events **********************************************************************

class DMSEvent {
  constructor(description) {
    this.description = description;
    this.date = new Date();
  }
}

// Objects (documents & tags) **************************************************

class DMSObject {
  constructor(name) {
    this.name = name;
    this.owners = new Set();
    this.description = '';
    this.date = new Date();
    this.history = [];
  }

  getName() {
    return this.name;
  }

  getOwners() {
    return this.owners;
  }
  
  ownersToList() {
    let ol = [];
    for (let owner of this.owners)
      ol.push(owner.toString());
    return ol;
  }
  
  ownersToString() {      
    return this.ownersToList().join(', ');
  }

  setOwnersFromList(owners) {
    this.owners = new Set(owners);
    return this;
  }
  updateOwnersFromList(owners) {
    let newOwners = new Set(owners);
    if (!this.owners.eq(newOwners)) {
      this.owners = newOwners;
      this.addEvent('Owner(s) updated.');
    }
    return this;
  }

  getDescription() {
    return this.description;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }
  updateDescription(description) {
    if (this.description != description) {
      this.description = description;
      this.addEvent('Description updated.');
    }
    return this;
  }
  
  getHistory() {
    return this.history;
  }

  addEvent(description) {
    this.history.unshift(new DMSEvent(description));
    return this;
  }
}

class Document extends DMSObject {
  constructor(name, file) {
    super(name);
    this.file = file;
    this.tags = new Set();
    this.comments = [];
    this.isprivate = false;
  }

  static isFromDatabase(object) {
    return 'id' in object;
  }

  static fromObject(object) {
    let doc = new Document();
    for (let value in doc)
      doc[value] = object[value];
    if (Document.isFromDatabase(object))
      doc['id'] = object['id'];
    return doc;
  }

  getFile() {
    return this.file;
  }

  setFile(file) {
    this.file = file;
    return this;
  }
  updateFile(file) {
    return this.setFile(file)
      .addEvent('New version of the file.');
  }
  
  getTags() {
    return this.tags;
  }
  
  tagsToList() {
    let tl = [];
    for (let tag of this.tags)
      tl.push(tag.toString());
    return tl;
  }
  
  tagsToString() {      
    return this.tagsToList().join(', ');
  }

  setTagsFromList(tags) {
    this.tags = new Set(tags);
    return this;
  }
  updateTagsFromList(tags) {
    let newTags = new Set(tags);
    if (!this.tags.eq(newTags)) {
      this.tags = newTags;
      this.addEvent('Tags(s) updated.');
    }
    return this;
  }

  getComments() {
    return this.comments;
  }

  addComment(comment) {
    this.comments.push(comment);
    return this;
  }

  isPrivate() {
    return this.isprivate;
  }

  makePrivate(priv = true) {
    this.isprivate = priv;
    if (this.private)
      this.addEvent('\u00A0\u00A0\u00A0 Made private.');
    else
      this.addEvent('\u00A0\u00A0\u00A0 Made public.');
    return this;
  }
  
  getUploadDate() {
    return this.date;
  }
}

class Tag extends DMSObject {
  constructor(name) {
    super(name);
  }

  static fromObject(object) {
    let tag = new Tag();
    for (let value in tag)
      tag[value] = object[value]
    return tag;
  }

  updateName(name) {
    if (this.name != name) {
      this.addEvent('\'' + this.name + '\' mapped to \'' + name + '\'.');
      this.name = name;
    }
    return this;
  }

  getCreationDate() {
    return this.date;
  }
}

class Comment {
  constructor (user, text) {
    this.user = user;
    this.text = text;
    this.date = new Date();
  }
}

/*******************************************************************************
    The basic DMS functionality
*******************************************************************************/

$(document).ready(function() {
  
  // The DMS database **********************************************************

  if (!indexedDB)
    throw 'No stable version of IndexedDB';

  DMS.DB_NAME = 'DMS';
  DMS.DB_VERSION = 1;

  // DMS object stores 
  DMS.Documents = 'Documents'
  DMS.Tags = 'Tags'
  
  DMS.openDatabase = function () {
    console.log('Opening DMS database ...');
    let request = indexedDB.open(DMS.DB_NAME, DMS.DB_VERSION);
    request.onsuccess = function (event) {
      DMS.db = this.result;
      console.log('DMS.openDatabase complete.');
    };
    request.onerror = function (event) {
      console.error('DMS.openDatabase:', event.target.errorCode);
    };
    request.onupgradeneeded = function (event) {
      console.log('DMS.openDatabase: onupgradeneeded ...');
      DMS.initializeDatabase(event.currentTarget.result);
    };
  };

  DMS.initializeDatabase = function (database) {
    database.createObjectStore(
      DMS.Documents,
      { keyPath: 'id', autoIncrement: true}
    );
    database.createObjectStore(
      DMS.Tags,
      { keyPath: 'name' }
    );
  };

  DMS.clearStores = function () {
    DMS.getObjectStore(DMS.Documents, 'readwrite').clear();
    DMS.getObjectStore(DMS.Tags, 'readwrite').clear();
    console.log('DMS.clearStores complete.');
  }

  DMS.closeDatabase = function () {
    DMS.db.close();
    delete DMS.db;
    console.log('DMS.closeDatabase complete.');
  };

  DMS.getObjectStore = function (storeName, mode) {
    let transaction = DMS.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  };

  DMS.addObject = function (storeName, object) {
    let store = DMS.getObjectStore(storeName, 'readwrite');
    let request = store.add(object);
    request.onsuccess = function (event) {
      console.log('DMS.addObject[' + storeName + ', ' + object + '] complete.');
    };
    request.onerror = function (event) {
      console.error('DMS.addObject[' + storeName + ', ' + object + ']: ', event.target.errorCode);
    };
    return store.transaction;
  };

  DMS.updateObject = function (storeName, object) {
    let store = DMS.getObjectStore(storeName, 'readwrite');
    let request = store.put(object);
    request.onsuccess = function (event) {
      console.log('DMS.updateObject[' + storeName + ', ' + object + '] complete.');
    };
    request.onerror = function (event) {
      console.error('DMS.updateObject[' + storeName + ', ' + object + ']: ', event.target.errorCode);
    };
    return store.transaction;
  };

  DMS.removeObject = function (storeName, object)  {
    let store = DMS.getObjectStore(storeName, 'readwrite');
    let request = store.delete(object.getName());
    request.onsuccess = function (event) {
      console.log('DMS.removeObject[' + storeName + ', ' + object + '] complete.');
    };
    request.onerror = function (event) {
      console.error('DMS.removeObject[' + storeName + ', ' + object + ']: ', event.target.errorCode);
    };
    return store.transaction;
  };

  DMS.forEachObject = function (storeName, callback) {
    if (callback.updatesValues())
      var store = DMS.getObjectStore(storeName, 'readwrite');
    else
      var store = DMS.getObjectStore(storeName, 'readonly');
    let request = store.openCursor();
    request.onsuccess = function (event) {
      let cursor = event.target.result;
      if (cursor) {
        if (callback.test(cursor.value)) {
          let newValue = callback.apply(cursor.value);
          if (callback.updatesValues())
            cursor.update(newValue);
        }
        cursor.continue();
      } else {
        console.log('DMS.forEachObject[' + storeName + ', ...] complete.');
      }
    };
    request.onerror = function (event) {
      console.error('DMS.forEachObject[' + storeName + ', ...]:', event.target.errorCode);
    };
    return store.transaction;
  };
  
  // User management ***********************************************************

  DMS.loggedIn = function () {
    return (typeof DMS.userName != 'undefined');
  };
  
  DMS.logIn = function (user, request) {
    if (!DMS.loggedIn()) {
      DMS.openDatabase();
      DMS.userName = user;
      request.onsuccess();
      console.log('DMS.logIn[' + user + '] complete.');
    } else {
      request.onerror();
      console.error('DMS.logIn[' + user + ']:',
                    DMS.userName + ' already logged in.');
    }
  }

  DMS.logOut = function () {
    let userName = DMS.userName
    delete DMS.userName;
    DMS.closeDatabase();
    console.log('DMS.logOut[' + userName + '] complete.');
  }

  DMS.getUserName = function () {
    return DMS.userName;
  }

  DMS.canEdit = function (object) {
    return object.owners.has(DMS.userName);
  }
  
  // Document management *******************************************************
  
  DMS.uploadDocument = function (name, file, owners, description, tags,
                                 priv = true, request = {}) {
    let oldTags = []
    let callback = new Callback()
        .setCallback(function (tag) {
          oldTags.push(tag.getName());
        })
        .addFilter(function (tag) {
          return tags.includes(tag.getName());
        });
    DMS.forEachTag(callback)
      .oncomplete = function () {
        let newTags = tags.diff(oldTags);
        for (let tag of newTags) {
          DMS.createTag(tag, [], '');
        }
      };
    let doc = new Document(name, file)
        .setOwnersFromList([DMS.userName, ...owners])
        .setDescription(description)
        .setTagsFromList(tags)
        .makePrivate(priv)
        .addEvent('\u00A0\u00A0\u00A0 Original document uploaded.');
    let transaction = DMS.addObject(DMS.Documents, doc);
    if ('oncomplete' in request)
      transaction.oncomplete = request.oncomplete;
    return doc;
  };
  
  DMS.updateDocument = function (doc, request = {}) {
    if (Document.isFromDatabase(doc)) {
      let transaction = DMS.updateObject(DMS.Documents, doc);
      if ('oncomplete' in request)
        transaction.oncomplete = request.oncomplete;
      return transaction;
    } else {
      console.error('DMS.updateDocument[' + doc.getName() + ']: ' +
                    'Document not in database.');
    }
  };

  DMS.forEachDocument = function (callback, request = {}) {
    let transaction = DMS.forEachObject(
      DMS.Documents,
      callback
        .setConversion(Document.fromObject)
        .addFilter(function (doc) {
          return !doc.isPrivate() || doc.getOwners().has(DMS.userName);
        })
    );
    if ('oncomplete' in request)
      transaction.oncomplete = request.oncomplete;
    return transaction;
  };

  // Tag management ************************************************************
  
  DMS.createTag = function (name, owners, description, request = {}) {
    let tag = new Tag(name)
        .setOwnersFromList([DMS.userName, ...owners.slice(0)])
        .setDescription(description)
        .addEvent('\u00A0 Tag created.');
    let transaction = DMS.addObject(DMS.Tags, tag);
    if ('oncomplete' in request)
      transaction.oncomplete = request.oncomplete;
    return tag;
  };
  
  DMS.updateTag = function (tag, request = {}) {
    let transaction = DMS.updateObject(DMS.Tags, tag);
    if ('oncomplete' in request)
      transaction.oncomplete = request.oncomplete;
    return transaction;
  };

  DMS.deleteTag = function (tag, request = {}) {
    let associatedDocuments = 0;
    let callback = new Callback()
        .setCallback(function (doc) {
          associatedDocuments++;
        })
        .addFilter(function (doc) {
          return doc.getTags().has(tag.getName());
        });
    DMS.forEachDocument(callback)
      .oncomplete = function () {
        if (associatedDocuments == 0) {
          let transaction = DMS.removeObject(DMS.Tags, tag);
          if ('oncomplete' in request)
            transaction.oncomplete = request.oncomplete;
        } else if ('onerror' in request)
          request.onerror();
      };
  };

  DMS.forEachTag = function (callback, request = {}) {
    let transaction = DMS.forEachObject(
      DMS.Tags,
      callback.setConversion(Tag.fromObject)
    );
    if ('oncomplete' in request)
      transaction.oncomplete = request.oncomplete;
    return transaction;    
  };

  DMS.mapTag = function (tag, newTagName, request = {}) {
    let callback = new Callback()
        .setCallback(function (doc) {
          doc.getTags().map(tag.getName(), newTagName);
          return doc;
        })
        .addFilter(function (doc) {
          return doc.getTags().has(tag.getName());
        })
        .updateValues();
    DMS.forEachDocument(callback)
      .oncomplete = function () {
        DMS.deleteTag(tag, {
          onerror: function () {
            console.error('DMS.mapTag[' + tag + ', ' + newTagName + ']:',
                          'Unable to remove source tag.');
          },
          oncomplete: function (event) {
            tag.updateName(newTagName);
            let transaction = DMS.updateTag(tag);
            if ('oncomplete' in request)
              transaction.oncomplete = request.oncomplete;
          }
        });
      };
  }

  // Comments ******************************************************************
  
  DMS.createComment = function (text) {
    return new Comment(DMS.userName, text);
  }
});
