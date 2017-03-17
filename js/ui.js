function addProperty (target, name, value) {
  target.append(
    $('<tr>')
      .append($('<td>')
              .addClass('property-name')
              .text(name))
      .append($('<td>')
              .addClass('property-value')
              .append(value))
  );
}

function eventList (dmsObject) {
  let list = $('<ul/>', {
    'class': 'event-list'
  });
  
  for (let event of dmsObject.getHistory()) {
    let historyItemPanel = $('<div/>', {
      'class': 'panel panel-default'
    });
    
    let date = $('<div/>', {
      'class': 'event-date panel-heading'
    }).text(event.date.toString());
    let description = $('<div/>', {
      'class': 'event-description panel-body'
    }).text(event.description);
    
    historyItemPanel.append(date).append(description);
    list.append(
      $('<li/>', {
        'class': 'history-list'
      }).append(historyItemPanel)
    );
  }
  return list;
}

function compileFiltersFromData (filterList) {
  let filters = [];
  for (let filterItem of filterList.find('li'))
    if (typeof $(filterItem).data('filter') != 'undefined')
      filters.push($(filterItem).data('filter'));
  return filters;
}

function dmsObjectList (prefix, infoPaneGenerator, filters, dmsForEach) {
  let list = $('<ul/>');
  let callback = new Callback()
      .setCallback(function (dmsObject) {
        let name = $('<span/>', {
          'class': prefix+'-name',
          text: dmsObject.getName(),
          click: function () {
            informationPane.toggle();
          }
        });
        let informationPane = infoPaneGenerator(dmsObject);
        informationPane.hide();
        let item = $('<li/>').append(name).append(informationPane);
        list.append(item);
      })
      .addFilters(filters);
  dmsForEach(callback);
  return list;
}

/*******************************************************************************
    Document management
*******************************************************************************/

function addDocumentFilterAsData (option, value, element) {
  switch (option) {
  case 'name':
    element.data('filter', function (doc) {
      return doc.getName().includes(value);
    });
    break
  case 'owner':
    element.data('filter', function (doc) {
      return doc.getOwners().has(value);
    });
    break;
  case 'tag':
    element.data('filter', function (doc) {
      return doc.getTags().has(value);
    });
    break;
  case 'date':
    element.data('filter', function (doc) {
      return doc.getUploadDate().toDateString().includes(value);
    });
    break;
  default:
    console.error('Unknown filter option:', criterion.val());
  }
}

//For filtering documents, on view documents page
function generateDocumentFilterItem (pane, filterList) {

  let formInline = $('<div/>', {
    class: 'form-inline'
  });

  let filterItem = $('<li/>');

  let criterion = $('<select/>', {
    class: 'form-control'
  }).append($('<option/>').text('name')).append($('<option/>').text('owner')).append($('<option/>').text('date'));
      
  let pattern = $('<input/>', { 
    type: 'text', 
    placeholder: 'Filter for...',
    class: 'form-control' });
    
  //button to add a filter
  let addFilterButton = $('<button/>', {
    type: 'button',
    class: 'btn btn-default',
    click: function () {
      addDocumentFilterAsData(criterion.val(), pattern.val(), filterItem);
      addFilterButton.detach();
      formInline.append(updateFilterButton);
      filterItem.after(generateDocumentFilterItem(pane, filterList));
      refreshDocumentList(pane, filterList);
    }
  });
  
  addFilterButton.append('<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>');

  //button to update an already added filter
  let updateFilterButton = $('<button/>', {
    type: 'button',
    class: 'btn btn-default',
    click: function () {
      addDocumentFilterAsData(criterion.val(), pattern.val(), filterItem);
      refreshDocumentList(pane, filterList);
    }
  });
  
  updateFilterButton.append('<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>');

  formInline.append(criterion).append(pattern).append(addFilterButton);
  filterItem.append(formInline);
  criterion.before('');
  criterion.after('');
  return filterItem;
}

function refreshDocumentList (targetPane, filterList) {
  targetPane.empty()
    .append(dmsObjectList('document',
                          documentInformationPane,
                          compileFiltersFromData(filterList),
                          DMS.forEachDocument));
}

function documentInformationPane (doc) {
  let detailsPane = $('<div/>', { 'class': 'document-details-pane' });
  let controlPane = $('<div/>', { 'class': 'document-control-pane' });
  let commentsPane = $('<div/>', { 'class': 'document-comments-pane' });
  let historyPane = $('<div/>', { 'class': 'document-history-pane' });

  let mainPane = $('<div/>', { 'class': 'document-information-pane' })
      .append(controlPane)
      .append(detailsPane);

  // The details pane **********************************************************

  let details = $('<table/>', { 'class': 'document-details' });
  addProperty(details, 'File', doc.getFile());

  let owners = $('<input/>', {
    type: 'text',
    class: 'form-control uploadDocFields',
    readonly: true
  }).val(doc.ownersToString());
  addProperty(details, 'Owners', owners);

  let description = $('<textarea/>', {
    readonly: true,
    class: 'form-control uploadDocFields'
  }).val(doc.getDescription());
  addProperty(details, 'Description', description);

  let tags = $('<input/>', {
    type: 'text',
    class: 'form-control uploadDocFields',
    readonly: true
  }).val(doc.tagsToString());
  addProperty(details, 'Tags', tags);

  addProperty(details, 'Upload date', doc.getUploadDate().toDateString());

  if (DMS.canEdit(doc)) {
    var isprivate = $('<input/>', {
      type: 'checkbox',
      disabled: true,
      checked: doc.isPrivate()
    });
    addProperty(details, 'Hide', isprivate);
  }

  detailsPane.append(details);

  // The control pane **********************************************************

  if (DMS.canEdit(doc)) {
    let editPane = $('<span/>').appendTo(controlPane);

    let updateButton = $('<button/>', {
      type: 'button',
      text: 'Update',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        $('<input/>', {
          type: 'file',
          change: function () {
            if ($(this).val() != doc.getFile()) {
              alert('The new version of the file should have the same name.');
            } else {
              doc.updateFile($(this).val());
              DMS.updateDocument(doc);
              if (historyPane.is(':visible'))
                refreshHistoryPane();
            }
          }
        }).click();
      }
    });

    updateButton.append('\u00A0<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>');
    editPane.append(updateButton);

    let editButton = $('<button/>', {
      type: 'button',
      text: 'Edit',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        owners.prop('readonly', false);
        description.prop('readonly', false);
        tags.prop('readonly', false);
        isprivate.prop('disabled', false);

        updateButton.prop('disabled', true);
        editButton.detach();
        editPane.append(cancelButton).append(saveButton);
      }
    });

    editButton.append('\u00A0<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
    editPane.append(editButton);

    let cancelButton = $('<button/>', {
      type: 'button',
      text: 'Cancel',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        owners.val(doc.ownersToString()).prop('readonly', true);
        description.val(doc.getDescription()).prop('readonly', true);
        tags.val(doc.tagsToString()).prop('readonly', true);
        isprivate.prop('checked', doc.isPrivate()).prop('disabled', true);

        updateButton.prop('disabled', false);
        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });
    
    cancelButton.append('\u00A0<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>');

    let saveButton = $('<button/>', {
      type: 'button',
      text: 'Save',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        let ownerList = parseCSV(owners.val());
        if (ownerList.length == 0) {
          alert('The document-owners group cannot become empty.');
          return;
        }

        let tagList = parseCSV(tags.val());
        if (tagList.length == 0) {
          alert('You have to specify at least one tag.');
          return;
        }

        doc.updateOwnersFromList(ownerList)
          .updateDescription(description.val())
          .updateTagsFromList(tagList)
          .makePrivate(isprivate.is(':checked'));
        DMS.updateDocument(doc);

        owners.prop('readonly', true);
        description.prop('readonly', true);
        tags.prop('readonly', true);
        isprivate.prop('disabled', true);

        if (historyPane.is(':visible'))
          refreshHistoryPane();

        updateButton.prop('disabled', false);
        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });

    saveButton.append('\u00A0<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>');

  } // DMS.canEdit(doc)

  // The comments pane *********************************************************

  let refreshCommentsPane = function () {
    commentsPane.empty();

    /*
    Order of comment div layers:
    commentsPane
      commentList
          row
            col-sm-1 (colThumb)
              thumbnail
                PIC OF THUMBNAIL
            col-sm-5 (colComment)
              panel panel-default (commentPanel)
                panel-heading (commentInfo)
                panel-body (commentText)
    */
    
    let commentList = $('<ol/>', {
      'class': 'comment-list'
    });
    for (let comment of doc.getComments()) {
      let row = $('<div/>', {
        'class': 'row',
        'style': 'margin-top: -30px'
      })
      
      let colThumb = $('<div/>', {
        'class': 'col-sm-2'
      })
      
      let thumbnail = $('<div/>', {
        'class': 'thumbnail'
      })
      
      let thumbnailPic = $('<img/>', {
        'class': 'img-responsive user-photo',
        'src': 'https://ssl.gstatic.com/accounts/ui/avatar_2x.png'
      })
      
      thumbnail.append(thumbnailPic);
      colThumb.append(thumbnail);
      row.append(colThumb);
      
      let colComment = $('<div/>', {
        'class': 'col-sm-10'
      });
      
      let commentPanel = $('<div/>', {
        'class': 'panel panel-default'
      });
      
      let commentText = $('<div/>', {
        'class': 'comment-text panel-body'
      }).text(comment.text);
      let commentInfo = $('<span/>', {
        'class': 'comment-info panel-heading',
      }).text([comment.user,
               ' - on', comment.date.toDateString()].join(' '));
      
      commentPanel.append(commentInfo).append(commentText);
      colComment.append(commentPanel);
      row.append(colComment);
      commentList.append(
        $('<li/>').append(row)
      );
    }
    commentsPane.append(commentList);

    let newComment = $('<textarea/>', {
      class: 'form-control comment-text-box',
      placeholder: 'Enter comment...',
    });
    
    let addComment = $('<button/>', {
      type: 'button',
      text: 'Comment',
      class: 'btn btn-success comment-button',
      click: function () {
        if (newComment.val() != '') {
          doc.addComment(DMS.createComment(newComment.val()));
          DMS.updateDocument(doc);
          refreshCommentsPane();
        }
      }
    });
    commentList.append(newComment).append(addComment);
  };

  let showCommentsButton = $('<button/>', {
    type: 'button',
    text: 'Comment',
    class: 'btn btn-link nav-btn-style',
    click: function () {
      if (commentsPane.is(':visible')) {
        showCommentsButton.text('Comment');
        showCommentsButton.append('\u00A0<span class="glyphicon glyphicon-comment" aria-hidden="true"></span>');
        commentsPane.detach();
      } else {
        showCommentsButton.text('Hide Thread');
        showCommentsButton.append('\u00A0<span class="glyphicon glyphicon-comment" aria-hidden="true"></span>');
        commentsPane.appendTo(mainPane);
        refreshCommentsPane();
      }
    }
  });

  showCommentsButton.append('\u00A0<span class="glyphicon glyphicon-comment" aria-hidden="true"></span>');
  controlPane.append(showCommentsButton);

  // The history pane **********************************************************

  let refreshHistoryPane = function () {
    historyPane.empty();
    let eventList = $('<ul/>', {
      'class': 'event-list'
    });
    
    
    for (let event of doc.getHistory()) {
      let historyItemPanel = $('<div/>', {
      'class': 'panel panel-default'
      });
      
      let date = $('<div/>', {
        'class': 'event-date panel-heading'
      }).text(event.date.toString());
      
      let description = $('<span/>', {
        'class': 'event-description panel-body'
      }).text(event.description);

      historyItemPanel.append(date).append(description);
      eventList.append(
        $('<li/>', {
          'class': 'history-list'
        }).append(historyItemPanel)
      );
    }
    historyPane.append(eventList);
  };

  let showHistoryButton = $('<button/>', {
    type: 'button',
    text: 'History',
    class: 'btn btn-link nav-btn-style',
    click: function () {
      if (historyPane.is(':visible')) {
        showHistoryButton.text('History');
        showHistoryButton.append('\u00A0<span class="glyphicon glyphicon-time" aria-hidden="true"></span>');
        historyPane.detach();
      } else {
        showHistoryButton.text('Hide History');
        showHistoryButton.append('\u00A0<span class="glyphicon glyphicon-time" aria-hidden="true"></span>');
        historyPane.appendTo(mainPane);
        refreshHistoryPane();
      }
    }
  });

  showHistoryButton.append('\u00A0<span class="glyphicon glyphicon-time" aria-hidden="true"></span>');
  controlPane.append(showHistoryButton);

  return mainPane;
};

/*******************************************************************************
    Tag management
*******************************************************************************/

function addTagFilterAsData (option, value, element) {
  switch (option) {
  case 'name':
    element.data('filter', function (doc) {
      return doc.getName().includes(value);
    });
    break
  case 'owner':
    element.data('filter', function (doc) {
      return doc.getOwners().has(value);
    });
    break;
  case 'date':
    element.data('filter', function (doc) {
      return doc.getCreationDate().toDateString().includes(value);
    });
    break;
  default:
    console.error('Unknown filter option:', criterion.val());
  }
}

let generateTagFilterItem = function (pane, filterList) {

  let formInline = $('<div/>', {
    class: 'form-inline'
  });
  
  let filterItem = $('<li/>');
  
  let criterion = $('<select/>', {
    class: 'form-control'
  }).append($('<option/>').text('name')).append($('<option/>').text('owner')).append($('<option/>').text('date'));
      
  let pattern = $('<input/>', { 
    type: 'text', 
    placeholder: 'Filter for...',
    class: 'form-control' });
    
  let addFilterButton = $('<button/>', {
    type: 'button',
    class: 'btn btn-default',
    click: function () {
      addTagFilterAsData(criterion.val(), pattern.val(), filterItem);
      addFilterButton.detach();
      formInline.append(updateFilterButton);
      filterItem.after(generateTagFilterItem(pane, filterList));
      refreshTagList(pane, filterList);
    }
  });

  addFilterButton.append('<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>');

  let updateFilterButton = $('<button/>', {
    type: 'button',
    class: 'btn btn-default',
    click: function () {
      addTagFilterAsData(criterion.val(), pattern.val(), filterItem);
      refreshTagList(pane, filterList);
    }
  });

  updateFilterButton.append('<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>');
  
  formInline.append(criterion).append(pattern).append(addFilterButton);
  filterItem.append(formInline);
  criterion.before('');
  criterion.after('');
  return filterItem;
}

function refreshTagList (targetPane, filterList) {
  targetPane.empty()
    .append(dmsObjectList('tag',
                          tagInformationPane,
                          compileFiltersFromData(filterList),
                          DMS.forEachTag));
}

function tagInformationPane (tag) {
  let detailsPane = $('<div/>', { 'class': 'tag-details-pane' });
  let controlPane = $('<div/>', { 'class': 'tag-control-pane' });
  let historyPane = $('<div/>', { 'class': 'tag-history-pane' });
  
  let mainPane = $('<div/>', { 'class': 'tag-information-pane' })
      .append(controlPane)
      .append(detailsPane);

  // The details pane **********************************************************

  let details = $('<table/>', { 'class': 'tag-details' });
  addProperty(details, 'Name', tag.getName());

  let owners = $('<input/>', {
    type: 'text',
    class: 'form-control uploadDocFields',
    readonly: true
  }).val(tag.ownersToString());
  addProperty(details, 'Owners', owners);

  let description = $('<textarea/>', {
    class: 'form-control uploadDocFields',
    readonly: true
  }).val(tag.getDescription());
  addProperty(details, 'Description', description);

  addProperty(details, 'Creation date', tag.getCreationDate().toDateString());

  detailsPane.append(details);

  // The control pane **********************************************************

  if (DMS.canEdit(tag)) {
    let editPane = $('<span/>').appendTo(controlPane);

    let editButton = $('<button/>', {
      type: 'button',
      text: 'Edit',
      class: 'btn btn-link nav-btn-style',
      click: function () {
                          owners.prop('readonly', false);
                          description.prop('readonly', false);

                          editButton.detach();
                          editPane.append(cancelButton).append(saveButton);
                         }
    });
    
    editButton.append('<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
    editPane.append(editButton);
    
    let cancelButton = $('<button/>', {
      type: 'button',
      text: 'Cancel',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        owners.val(tag.ownersToString()).prop('readonly', true);
        description.val(tag.getDescription()).prop('readonly', true);

        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });
    
    cancelButton.append('\u00A0<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>');

    let saveButton = $('<button/>', {
      type: 'button',
      text: 'Save',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        let ownerList = parseCSV(owners.val());
        if (ownerList.length == 0) {
          alert('The document-owners group cannot become empty.');
          return;
        }

        tag.updateOwnersFromList(ownerList)
          .updateDescription(description.val());
        DMS.updateTag(tag);

        owners.prop('readonly', true);
        description.prop('readonly', true);

        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });
    
    saveButton.append('\u00A0<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>');

    let deleteButton = $('<button/>', {
      type: 'button',
      text: 'Delete',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        DMS.deleteTag(tag, {
          onerror: function () {
            alert('There are documents still associated with this tag.');
          },
          oncomplete: function () {
            $('#listTagsButton').click();
          }
        });
      }
    });
    
    deleteButton.append('\u00A0<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>');
    controlPane.append(deleteButton);
    
    let mapButton = $('<button/>', {
      type: 'button',
      text: 'Map tag',
      'data-toggle': 'modal',
      'data-target': '#mapTagModal',
      class: 'btn btn-link nav-btn-style',
      click: function () {
        $('#mapTagText').text('To which tag would you like to map \'' + tag.getName() + '\'?');
        
        $('#confirmMapButton').click(function() {
          var newTagName = $('#mapTagInput').val();
          
          alert(newTagName);
          if (newTagName != null)
            DMS.mapTag(tag, newTagName, {
            oncomplete: function () {
              $('#listTagsButton').click();
            }
          });
          
        });
  
      }
    });
    
    mapButton.append('\u00A0<span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span>');
    controlPane.append(mapButton);
  } // DMS.canEdit(tag)

  // The history pane **********************************************************

  let showHistoryButton = $('<button/>', {
    type: 'button',
    text: 'History',
    class: 'btn btn-link nav-btn-style',
    click: function () {
      if (historyPane.is(':visible')) {
        showHistoryButton.text('History');
        showHistoryButton.append('\u00A0<span class="glyphicon glyphicon-time" aria-hidden="true"></span>');
        historyPane.detach();
      } else {
        showHistoryButton.text('Hide history');
        showHistoryButton.append('\u00A0<span class="glyphicon glyphicon-time" aria-hidden="true"></span>');
        historyPane.empty().append(eventList(tag));
        historyPane.appendTo(mainPane);
      }
    }
  });
  
  showHistoryButton.append('\u00A0<span class="glyphicon glyphicon-time" aria-hidden="true"></span>');
  controlPane.append(showHistoryButton);

  return mainPane;
}
