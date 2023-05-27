function onWindowLoad() {
    var message = document.querySelector('#message');
    var currentPage = 1; // Current page number
    var itemsPerPage = 5; // Number of items to display per page
    var totalItems; // Total number of items
    var totalPages; // Total number of pages
  
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
      var activeTab = tabs[0];
      var activeTabId = activeTab.id;
      var currentUrl = activeTab.url
  
      return chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: websiteCrawler,
        args: ['body', currentUrl]
      });
    }).then(function (results) {
      console.log(results);
      const urlsList = results[0].result;
      totalItems = urlsList?.length;
      totalPages = Math.ceil(totalItems / itemsPerPage);
  
      const paginationContainer = document.querySelector("#pagination-container");
      const urlsContainer = document.querySelector("#urls-list");
  
      function showPage(pageNumber) {
        // Calculate start and end indexes for the current page
        var startIndex = (pageNumber - 1) * itemsPerPage;
        var endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
        // Clear the URLs container
        urlsContainer.innerHTML = '';
  
        // Loop through the URLs for the current page and append them to the container
        for (let i = startIndex; i < endIndex; i++) {
          const url = urlsList[i];
          var li = document.createElement('li');
          li.className = 'list-group-item';
          li.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
          urlsContainer.appendChild(li);
        }
      }
  
      function createPagination() {
        const paginationList = document.createElement("ul");
        paginationList.classList.add("pagination");
        paginationList.classList.add("flex-wrap"); // Add "flex-wrap" class to enable wrapping
      
        const maxVisiblePages = 1000; // Maximum number of visible pagination links
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);
        let startPage = currentPage - halfVisiblePages;
        let endPage = currentPage + halfVisiblePages;
      
        if (startPage < 1) {
          startPage = 1;
          endPage = maxVisiblePages;
        }
      
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = totalPages - maxVisiblePages + 1;
          if (startPage < 1) {
            startPage = 1;
          }
        }
      
        for (let i = startPage; i <= endPage; i++) {
          const listItem = document.createElement("li");
          listItem.classList.add("page-item");
      
          const link = document.createElement("a");
          link.classList.add("page-link");
          link.href = "#";
          link.textContent = i;
      
          listItem.appendChild(link);
          paginationList.appendChild(listItem);
        }
      
        paginationContainer.appendChild(paginationList);
      
        // Attach click event listener to the pagination links
        paginationList.addEventListener("click", function (event) {
          event.preventDefault();
          if (event.target.classList.contains("page-link")) {
            const pageNumber = parseInt(event.target.textContent);
            showPage(pageNumber);
            currentPage = pageNumber;
            // createPagination(); // Update pagination after page change
          }
        });
      }

      createPagination();
      showPage(currentPage);
    })
    // }).catch(function (error) {
    //     message.innerText = 'There was an error injecting script : \n' + error.message;
    // });
}
  
// Call the function when the window loads
window.onload = onWindowLoad;

function websiteCrawler(selector, currentUrl) { // The selector is usually the body, just for validation
    console.log(currentUrl)
    // if (selector) {
    //     selector = document.querySelector(selector);
    //     if (!selector) return "ERROR: querySelector failed to find node"
    //     return 
    // }

    const anchorTags = document.getElementsByTagName("a");
    const urls = [];

    for (let i = 1; i < anchorTags.length; i++) {
        const url = anchorTags[i].getAttribute("href");

        if (url != null && url.startsWith('/')) {
            var originUrl = new URL(currentUrl);
            var combined_url = `${originUrl.origin}/${url}`.replace(/\/\//g, '/'); // replace all to keep the urls clean not just the first one
            urls.push(combined_url);
        }
    }

    // Filter the array from duplicates before returning it
    const uniqueUrls = [...new Set(urls)];
    return uniqueUrls;
}