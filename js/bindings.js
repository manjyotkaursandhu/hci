$(document).ready(function() {

  // User management ***********************************************************

  let loggedIn = $('#loggedIn');
  let loggedOut = $('#loggedOut');

  $('#userNameRegister').popover();
  $('#passwordRegister').popover();
  
  //when on log in screen and clicking forgot password
  $('#forgotpassword').click(function() {
    $('body').css('background-color', '#5A51C4');
    $('#passwordPane').toggleClass('hidden');
    $('#logInPane').toggleClass('hidden');
  });
  
  //when forgotten password and click cancel button
  $('#quitPassword').click(function () {
    $('body').css('background-color', '#70db70');
    $('#passwordPane').toggleClass('hidden');
    $('#logInPane').toggleClass('hidden');
  });
  
 //when on forgot password page and click send button
  $('#sendButton').click(function () {
    $('body').css('background-color', '#FF5733');
    $('#passwordPane').toggleClass('hidden');
    $('#sentPane').toggleClass('hidden');
  });
  
//when on sent screen and click return to log in
  $('#returnToLogin').click(function() {
    $('body').css('background-color', '#70db70');
    $('#sentPane').toggleClass('hidden');
    $('#logInPane').toggleClass('hidden');
  });

  //when on log in screen and clicking register button
  $('#signUpLink').click(function() {
    $('body').css('background-color', '#5A51C4');
    $('#registerPane').toggleClass('hidden');
    $('#logInPane').toggleClass('hidden');
  });

  //when on register page and click register button
  $('#registerButton').click(function() {
    $('body').css('background-color', '#FF5733');
    $('#registerDonePane').toggleClass('hidden');
    $('#registerPane').toggleClass('hidden');
  });

  //when registering and click cancel button
  $('#quitRegister').click(function() {
    $('body').css('background-color', '#70db70');
    $('#registerPane').toggleClass('hidden');
    $('#logInPane').toggleClass('hidden');
  });

  //when on register successful screen and click return to log in
  $('#returnToLogInLink').click(function() {
    $('body').css('background-color', '#70db70');
    $('#registerDonePane').toggleClass('hidden');
    $('#logInPane').toggleClass('hidden');
  });


  $('#logInButton').click(function() {
    $('body').css('background-color', 'white');
    DMS.logIn($('#userName').val(), {
      onsuccess: function() {
        loggedOut.detach();
        $(document.body).append(loggedIn.show());

        $('#loggedInAs')
          .append('Logged in as ')
          .append($('<span/>', {
            'class': 'user-name'
          }).text(DMS.getUserName()));
        $('#documentsMain').children().empty().hide();
        $('#tagsMain').children().empty().hide();
      },
      onerror: function() {
        alert("Unable to log in.");
      }
    });
  });

  $('#logOutButton').click(function() {
    $('body').css('background-color', '#70db70');
    DMS.logOut();
    $('#loggedInAs').empty();

    loggedIn.detach();
    $(document.body).append(loggedOut.show());
  });

  // Admin *********************************************************************
    //Home button to clear the UI when clicked
    $('#homeButton').click(function(){
        $('#documentsMain').children().empty();
        $('#tagsMain').children().empty();
  
    });  
  $('#resetButton').click(function () {
    DMS.clearStores();
    $('#documentsMain').children().empty();
    $('#tagsMain').children().empty();
  });

  $('#addDefaultObjectsButton').click(function() {
    // From National Geographic: Photo of the Day - Best of January

    DMS.uploadDocument(
      'Carved-in-Stone.jpeg', 'Carved-in-Stone.jpeg', ['NatGeo'],
      'Glacial river water conjures an evanescent mist at the Norwegian rock ' +
      'formation known as Marmorslottet (the Marble Castle). Located in Mo i ' +
      'Rana, the Marble Castle is limestone that has been carved into ' +
      'sinuous-looking curves by the rushing river fed by the Svartisen ' +
      'glacier, Norway’s second largest.', ['river', 'water', 'Norwegian', 'Marmorslottet', 'Marble Castle',
        'Mo i Rana', 'limestone', 'Svartisen', 'glacier', 'Norway'
      ],
      false);


    DMS.uploadDocument(
      'We-Have-Liftoff.jpeg', 'We-Have-Liftoff.jpeg', ['NatGeo'],
      'Along the Zambezi River in northern Namibia, a giant flock of southern ' +
      'carmine bee-eaters (Merops nubicoides) scatters into the ' +
      'air. According to Your Shot photographer Jason Boswell, these birds ' +
      'were taking off as a group of bird ringers attempted to ring a few ' +
      'hundred of them to gather more information on where they go when they' +
      'leave these breeding grounds. Today is National Bird Day in the United ' +
      'States; the holiday coincides with the Christmas Bird Count, a ' +
      'citizen-led project to take stock of the health of the country’s ' +
      'birds.', ['Zambezi River', 'Namibia', 'bee', 'Jason Boswell', 'birds'],
      false);

    DMS.uploadDocument(
      'Hanging-Around.jpeg', 'Hanging-Around.jpeg', ['NatGeo'],
      'Photographer Mike Melnotte was out for a walk with his family near ' +
      'Fort Fisher in North Carolina. Near a grove of oak trees, he came ' +
      'across some friends relaxing and was struck by the way they sat in ' +
      'silence and simply watched the sunset.', ['Mike Melnotte', 'Fort Fisher', 'North Carolina', 'oak', 'trees',
        'friends', 'sunset'
      ],
      false);

    DMS.uploadDocument(
      'You-Can-Run.jpeg', 'You-Can-Run.jpeg', ['NatGeo'],
      'On the shore of Kurile Lake, a remnant of the volcano that was once ' +
      'active on this site in Kamchatka, Russia, competition for a meal can ' +
      'be fierce—and this brown bear isn’t letting his smaller rival get ' +
      'close to steal any salmon away. This photograph wasn’t easy to come ' +
      'across for Your Shot photographer Giuseppe D’amico—it required ' +
      '“stalking of the small beaches on the shores of the lake. This picture ' +
      'is the result of these ambushes and was taken in the early morning, ' +
      'from a distance of about 30 meters.” Despite the battle for a fish ' +
      'here, Kurile Lake is one of the world’s largest spawning sites for ' +
      'sockeye salmon.', ['Kurile Laku', 'volcano', 'Kamchatka', 'Russia', 'brown bear',
        'Giuseppe D’amico', 'battle', 'fish', 'Kurile Lake', 'salmon'
      ],
      false);

    DMS.uploadDocument(
      'Wipeout.jpeg', 'Wipeout.jpeg', ['NatGeo'],
      'A riderless surfboard soars above a massive wave on Peahi, a surf' +
      'break on Maui’s north shore. This image was captured during the Pe’ahi' +
      'Challenge, a big-wave surfing event. Peahi, also known as Jaws, “is a' +
      'spectacle in the truest sense of the word, with waves up to 80 [feet' +
      'tall] on the biggest days,” photographer Lyle Krannichfeld says. “This' +
      'particular frame stood out to me because of the splash of color from' +
      'the board and the questions it raises for the viewer.”', ['surfboard', 'wave', 'Peahi', 'Maui', 'Pe’ahi Challenge', 'Lyle Krannichfeld'],
      false);

    $('#listDocumentsButton').click();
    $('#listTagsButton').click();
  });

  // Document management *******************************************************

  $('#uploadDocumentButton').show(function() {
    let uploadDocumentPane = $('#uploadDocumentPane');
    uploadDocumentPane.empty().show().siblings().hide();
    
    let uploadContents = $('<div>', {
      id: 'uploadContents',
      class: 'upload-container'
    });

    let details = $('<table/>', {
      'class': 'document-details'
    });

    let file = $('<input/>', {
      type: 'file',
      class: 'filestyle uploadDocFields'
    });
    addProperty(details, 'File', file);

    let additionalOwners = $('<input/>', {
      type: 'text',
      class: 'input-group form-control uploadDocFields'
    });
    addProperty(details, 'Additional owners', additionalOwners);

    let description = $('<textarea/>', {
      class: 'input-group form-control uploadDocFields'
    });
    addProperty(details, 'Description', description);

    let tags = $('<input/>', {
      type: 'text',
      class: 'input-group form-control uploadDocFields'
    });
    
    let generateTags = $('<button/>', {
      type: 'button',
      class: 'btn btn-default',
      text: 'Generate tags',
      click: function() {
        tags.val(extractTagNames(description.val()).join(', '));
      }
    });
    
    addProperty(details, 'Tags',
      $('<span/>').append(tags).append(generateTags));

    let isprivate = $('<input/>', {
      type: 'checkbox',
      checked: true
    });
    addProperty(details, 'Hide', isprivate);


    let uploadButton = $('<button/>', {
      type: 'button',
      class: 'btn btn-default upload-buttons',
      text: 'Upload',
      click: function() {
        if (file.val() == '') {
          alert('Please select a file.');
          return;
        }
        let fileName = file.val().replace(/^.*[\\\/]/, '');
        let ownerList = parseCSV(additionalOwners.val());
        let tagList = parseCSV(tags.val());
        if (tagList.length == 0) {
          alert('You have to specify at least one tag.');
          return;
        }
        DMS.uploadDocument(
          fileName,
          fileName, // At the moment, we are not storing the actual
          // file, but just their name.
          ownerList,
          description.val(),
          tagList,
          isprivate.is(':checked'), {
            oncomplete: function() {
            }
          });
      }
        
    });

    uploadContents.append(details);
    uploadDocumentPane.append(uploadContents).append(uploadButton);
    
  });

  $('#listDocumentsButton').click(function() {
    
    let listDocumentsPane = $('#listDocumentsPane');
    listDocumentsPane.empty().show();
      
    let documentsFilterPane = $('#documentsFilterPane')
    documentsFilterPane.empty().show(); 
    let tagsFilterPane = $('#tagsFilterPane')
    tagsFilterPane.hide();
    /**
    let documentListPane = $('#documentFilterPane', {
      'class': 'document-list-pane'
    }).appendTo(listDocumentsPane);
    **/

    let filterList = $('<ol/>', {
      'class': 'document-filter-list'
    }).appendTo(documentsFilterPane);
    
    let documentListPane = $('<div/>', {
      'class': 'document-list-pane'
    }).appendTo(listDocumentsPane);

    $('#tagsMain').children().empty();
    filterList.append(generateDocumentFilterItem(documentListPane, filterList));
    refreshDocumentList(documentListPane, filterList);
      
  });


////////////////////////////////////////////////////////////////////////////////////////////////////

/*
  // Search management **********************************************
  $('#searchButton').click(function() {
    
    let listDocumentsPane = $('#listDocumentsPane');
    listDocumentsPane.empty().show().siblings().hide();

    let filterList = $('<ol/>', {
      'class': 'document-filter-list'
    }).appendTo(listDocumentsPane);

    let documentListPane = $('<div/>', {
      'class': 'document-list-pane'
    }).appendTo(listDocumentsPane);

    filterList.append(generateDocumentFilterItem(documentListPane, filterList));
    refreshDocumentList(documentListPane, filterList);
    $('#tagsMain').children().empty();
  });
*/

/*
  $('#searchButton').click(function() {

    let listTagsPane = $('#listTagsPane');
    listTagsPane.empty().show().siblings().hide();

    let filterList = $('<ol/>', {
      'class': 'tag-filter-list'
    }).appendTo(listTagsPane);

    let tagListPane = $('<div/>', {
      'class': 'tag-list-pane'
    }).appendTo(listTagsPane);

    $('#documentsMain').children().empty();
    filterList.append(generateTagFilterItem(tagListPane, filterList));
    refreshTagList(tagListPane, filterList);
  });
*/
  
////////////////////////////////////////////////////////////////////////////////////////////////////

  // Tag management ************************************************************

  $('#newTagButton').show(function() {
    let createTagPane = $('#createTagPane');
    createTagPane.empty().show().siblings().hide();

    let createTagContents = $('<div>', {
      id: 'createTagContents',
      class: 'upload-container'
    });
    
    let details = $('<table/>', {
      'class': 'tag-details'
    });

    let name = $('<input/>', {
      type: 'text',
      class: 'input-group form-control uploadDocFields'
    });
    
    addProperty(details, 'Name', name);

    let additionalOwners = $('<input/>', {
      type: 'text',
      class: 'input-group form-control uploadDocFields'
    });
    addProperty(details, 'Additional owners', additionalOwners);

    let description = $('<textarea/>', {
      class: 'input-group form-control uploadDocFields'
    });
    
    addProperty(details, 'Description', description);
    
    let createTagButton = $('<button/>', {
      type: 'button',
      class: 'btn btn-default upload-buttons',
      text: 'Create tag',
      click: function() {
        let ownerList = parseCSV(additionalOwners.val());
        DMS.createTag(name.val(), ownerList, description.val(), {
          oncomplete: function() {
            createTagPane.hide();
            $('#listTagsButton').click();
          }
        });
      }
        
    });

    createTagContents.append(details);
    createTagPane.append(createTagContents).append(createTagButton);
  });

  $('#listTagsButton').click(function() {
    let listTagsPane = $('#listTagsPane');
    listTagsPane.empty().show();
    
    let tagsFilterPane = $('#tagsFilterPane')
    tagsFilterPane.empty().show();
    
    /**
    let tagsFilterTitle = $('<div/>', {
      'class': 'tag-filter-title',
      'text': 'Filter'
    }).appendTo(tagsFilterPane);**/
    
    let filterList = $('<ol/>', {
      'class': 'tag-filter-list'
    }).appendTo(tagsFilterPane);
    
    let tagListPane = $('<div/>', {
      'class': 'tag-list-pane'
    }).appendTo(listTagsPane);
  
    $('#documentsMain').children().empty();
    filterList.append(generateTagFilterItem(tagListPane, filterList));
    refreshTagList(tagListPane, filterList);
  });

});
