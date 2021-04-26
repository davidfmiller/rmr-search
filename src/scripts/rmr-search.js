// https://gist.github.com/cmod/5410eae147e4318164258742dd053993

(function() {

  'use strict';

  const
  RMR = require('rmr-util'),
  Fuse = require(__dirname + '/../../node_modules/fuse.js/dist/fuse.basic.common.js');

  const init = function(options) {

    let fuse = null; // search engine
    let searchVisible = true;
    let parent = document.querySelector('.rmr-search');
    let list = parent.querySelector('ul');
    let first = null; // first child of search list
    let last = null; // last child of search list
    let input = parent.querySelector('input'); // input box for search
    let resultsAvailable = false; // Did we get any search results?

    const max = RMR.Object.has(options, 'max') ? parseInt(options.max, 10) : 5;
    const url = options.url;
    const format = options.hasOwnProperty('format') ? options.format : (obj) => { return obj; };
    const fuseOptions = options.fuse;

    parent.querySelector(':scope > svg').addEventListener('click', (e) => {
      input.focus();
    });

    document.addEventListener('mouseup', (e) => {
      const
      target = e.target,
      isChild = RMR.Node.ancestor(target, parent, true);

      if (! isChild) {
        executeSearch(null);
      }
    });
  
    document.addEventListener('keydown', (e) => {

  //     CMD-/ to show / hide Search
  //     if (event.metaKey && event.which === 191) {
  //         Load json search index if first time invoking search
  //         Means we don't load json unless searches are going to happen; keep user payload small unless needed
  //         if(firstRun) {
  //           loadSearch(); // loads our json data and builds fuse.js search index
  //           firstRun = false; // let's never do this again
  //         }
  // 
  //         Toggle visibility of search box
  //         if (!searchVisible) {
  //           parent.style.visibility = "visible"; // show search box
  //           input.focus(); // put focus in input box so you can just start typing
  //           searchVisible = true; // search visible
  //         }
  //         else {
  //           parent.style.visibility = "hidden"; // hide search box
  //           document.activeElement.blur(); // remove focus from search box 
  //           searchVisible = false; // search not visible
  //         }
  //     }

      // Allow ESC (27) to close search box
//       if (event.keyCode == 27) {
//         if (searchVisible) {
//           parent.style.visibility = "hidden";
//           document.activeElement.blur();
//           searchVisible = false;
//         }
//       }

      if (e.keyCode == 40) { // down
        if (searchVisible && resultsAvailable) {
          e.preventDefault(); // stop window from scrolling
          if (document.activeElement === input) {
            first.focus();
          }
          else if (document.activeElement === last ) {
          
          }
          else { // otherwise select the next search result
            const li = RMR.Node.ancestor(document.activeElement, 'li');
            li.nextSibling.querySelector('a').focus();
          } 
        }
      }

      if (e.keyCode == 38) { // up
        if (searchVisible && resultsAvailable) {
          e.preventDefault(); // stop window from scrolling
          if (document.activeElement === input) {
            
          }
          else if (document.activeElement === first) {
            input.focus();
          } // If we're at the first item, go to input box
          else {
            const li = RMR.Node.ancestor(document.activeElement, 'li');
            li.previousSibling.querySelector('a').focus();
          } // Otherwise, select the search result above the current active one
        }
      }
    });

    input.addEventListener('focus', (e) => {

      if (fuse !== null && e.target.value.trim() != '') {
        executeSearch(e.target.value.trim());
      }
      else if (fuse === null) {
        fetchJSONFile(options.url, function(data) {
          fuse = new Fuse.default(data, fuseOptions);
        });
      }
    });

    input.addEventListener('blur', (e) => {
      if (e.target.value === '') {
        executeSearch(null);
      }
    });

    input.addEventListener('input', (e) => {
      if (e.target.value.length > 1) {
        executeSearch(e.target.value.trim());
      } else {
        executeSearch(null);
      }
    });

    function fetchJSONFile(path, callback) {
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          if (callback) {
            callback(JSON.parse(httpRequest.responseText));
          }
        }
      };
      httpRequest.open('GET', path);
      httpRequest.send();
    }


    function executeSearch(term) {

      let results = [];
      let searchitems = '';

      if (term === null || term === '') {
        resultsAvailable = false;
      } else {

        results = fuse.search(term);

        if (results.length === 0) {
          resultsAvailable = false;
          searchitems = `<li class="empty">${format(null)}</li>`;
        } else {

          let urls = [];
          for (let item in results.slice(0,max)) {
            const obj = results[item].item;
            if (urls.indexOf(obj.permalink) < 0) {
              searchitems += `<li>${format(obj)}</li>`;
              urls.push(obj.permalink);
            }
          }
          resultsAvailable = true;
        }
      }

      list.innerHTML = searchitems;
      if (results.length > 0) {
        first = list.firstChild.querySelector('a');
        last = list.lastChild.querySelector('a');
      }
    }
  }

  module.exports = init;

})();