
(function() {

  'use strict';

  const
  RMR = require('rmr-util'),
  Fuse = require('fuse.js');

  const init = function(options) {

    if (arguments.length == 0) {
      options = {
        node: '.rmr-search'
      };
    }

    let
    fuse = null, // search engine
    searchVisible = true,
    parent = RMR.Object.has(options, 'node') ? RMR.Node.get(options.node) : document.querySelector('.rmr-search'),
    list = RMR.Node.create('ul'),
    first = null, // first child of search list
    last = null, // last child of search list
    input = parent ? parent.querySelector('input') : null, // input box for search
    resultsAvailable = false; // Did we get any search results?

    const
    max = RMR.Object.has(options, 'max') ? parseInt(options.max, 10) : 5,
    index = RMR.Object.has(options, 'index') ? options.index : 'index.json',
    format = RMR.Object.has(options, 'format') ? options.format : (obj) => { return obj; },
    fuseOptions = options.fuse;

    if (! parent) {
      console.error('no parent for rmr-search');
      return;
    }

    parent.appendChild(list);

    const svg = parent.querySelector(':scope > svg');
    if (svg) {
      svg.addEventListener('click', (e) => {
        input.focus();
      });
    }

    // if 
    document.addEventListener('mouseup', (e) => {
      const
      target = e.target,
      isChild = RMR.Node.ancestor(target, parent, true);

      if (! isChild) {
        executeSearch(null);
      }
    });
  
    document.addEventListener('keydown', (e) => {

      if (e.keyCode == 40) { // down
        if (searchVisible && resultsAvailable) {
          e.preventDefault();
          if (document.activeElement === input) {
            first.focus();
          }
          else if (document.activeElement === last ) {
            input.focus();
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
        fetchJSONFile(index, function(data) {
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