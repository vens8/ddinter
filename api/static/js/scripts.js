  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('DOM content loaded');
    var scrollpos = localStorage.getItem('scrollpos');
    if (scrollpos) window.scrollTo(0, scrollpos);
  });

  window.onbeforeunload = function (e) {
    localStorage.setItem('scrollpos', window.scrollY);
  };

    window.tagsList = [];
  console.log('initial value', window.tagsList);

  document.getElementById("myUL").innerHTML= "";
// Create a "close" button and append it to each list item
var myNodelist = document.getElementById("myUL").childNodes; // Yaha bhi hein ek LI
for (var i = 0; i < myNodelist.length; i++) {
  myNodelist[i].parentNode.removeChild(myNodelist[i]);
}
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function () {
    var div = this.parentElement;
    console.log("Close button click hua!");
    div.style.display = "none";
  }
}

function showError(message) {
  const errorLabel = document.getElementById("error-label");
  errorLabel.innerText = message;
  errorLabel.classList.remove("d-none");
  errorLabel.classList.add("animate__animated", "animate__fadeIn");
}

function hideError() {
  const errorLabel = document.getElementById("error-label");
  errorLabel.innerText = "";
  errorLabel.classList.add("d-none");
  errorLabel.classList.remove("animate__animated", "animate__fadeIn");
}


function newElement() {
  const ul = document.getElementById("myUL");
  ul.innerHTML = ""; // clear the existing list items
	if (window.tagsList.length == 0) {
		showError("Please add at least one drug tag before confirmation!");
	}
	else {
		hideError();  // Hide error if any
	  for (let i = 0; i < window.tagsList.length; i++) {
		const li = document.createElement("li");
		const t = document.createTextNode(window.tagsList[i]);
		li.appendChild(t);

		const span = document.createElement("button");
		const txt = document.createTextNode("X");
		span.className = "close btn btn-sm";
		span.setAttribute("type", "button");
		span.appendChild(txt);
		li.appendChild(span);

		ul.appendChild(li);

		// add delete functionality
		span.addEventListener("click", function () {
		  const li = this.parentElement;
		  ul.removeChild(li);
		});
	  }
	  console.log('tagslist inside new element', window.tagsList)
	}
}


function reset() {
    document.getElementById("myUL").innerHTML = "";
    var table = document.getElementById("drugtable");
    table.innerHTML = "";
    var tagSection = document.getElementById("tag-section");
    tagSection.innerHTML = ""; // delete all the tag elements
    window.tagsList.length = 0; // reset the tagsList array
    deleteNote();
}

function showDropdown() {
  console.log("dropdown called");
  const dropdown = document.querySelector('.dropdown-list');
  dropdown.classList.toggle('show');
}

function deleteList() {
  document.getElementById("myUL").innerHTML= "";
}

function deleteTable(){
  var table = document.getElementById("drugtable");
  table.innerHTML = "";
}

function addLoading() {
  var loadingdiv = document.getElementById("loadingdiv");
  loadingdiv.innerHTML = "<b> Loading... </b>"
}

function deleteLoading() {
  var loadingdiv = document.getElementById("loadingdiv");
  loadingdiv.innerHTML = ""
}

function updateTable(interactions) {
  deleteTable();
  deleteNote();
  if (interactions.length > 0) {
  	hideError();  // Hide error if any
    var mytable = document.getElementById("drugtable");

    var header = mytable.createTHead();
    header.classList.add("text-white"); // add text-white class to thead
    var row = header.insertRow(0);
    row.style.backgroundColor = "#A6A9EB";
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = "<b>Drug1</b>";
    cell2.innerHTML = "<b>Drug2</b>";
    cell3.innerHTML = "<b>Level</b>";

//    colorList = { "Major": "#f44336", "Moderate": "#E8A847", "Minor": "#6BB87F", "Unknown": "#999999" };
    colorList = { "Major": "#F8D7DA", "Moderate": "#fff3cd", "Minor": "#d1e7dd", "Unknown": "#999999" };
    textColorList = { "Major": "#f44336", "Moderate": "#e9a845", "Minor": "#6cb87d", "Unknown": "#FCFBF9" };


    var ind = 1;
    interactions.map(interaction => {
      var row = mytable.insertRow(ind++)
      row.style.backgroundColor = colorList[interaction["severity"]]
      row.style.color = textColorList[interaction["severity"]];
	  row.style.fontWeight = "bold";
	  row.style.border = "1px solid #000000";
      var cell1 = row.insertCell(0)
      var cell2 = row.insertCell(1)
      var cell3 = row.insertCell(2)
      cell1.innerHTML = interaction["drug1"];
      cell2.innerHTML = interaction["drug2"];
      cell3.innerHTML = interaction["severity"]
    });
    deleteList();
  }
  else {
    // Display HTML message for no interactions
    deleteList();
    // alert("No interactions found!");
    showError("No interactions found!");
  }

  // deleteLoading();
}

function addNote(count) {
  // console.log(count);
  if (count["Unknown"] > 0) {
    var notediv = document.getElementById("notediv");
    notediv.style.display = "block";
    notediv.innerHTML = "*Note: <b>Unknown interaction means there might be an interaction between the drugs but with unknown severity.</b>"
  }
}

function deleteNote() {
  var notediv = document.getElementById("notediv");
  notediv.innerHTML = "";
  notediv.style.display = "none";
}


function fetchData() {
    console.log("Fetching Data...");
	fetch('/getSynonyms')
	.then(response => response.json())
	.then(data1 => {
		window.synonyms = data1;  // Declare the variable as global
//		console.log('synonymsDict', window.synonyms);

		fetch('/getDrugsList')
		.then(response => response.json())
		.then(data2 => {
		window.drugsList = data2;  // Declare the variable as global
//		console.log('inside', window.drugsList);

		// Creating a swapped drugsList
		window.swappedDrugsList = {};
		for (const key in window.drugsList) {
		  const value = window.drugsList[key];
		  window.swappedDrugsList[value] = key;
		}
		initDropdown();
		})
		.catch(error => {
			console.error('Error fetching drugs list:', error);
		});})
	.catch(error => {
		console.error('Error fetching synonyms:', error);
	});
}

function checkFetch() {
  const dropdown = document.querySelector('.dropdown-list');
  // Loop through the dictionary and add an option element for each key-value pair
  // console.log("count", dropdown.childElementCount);
  if (dropdown.childElementCount === 0) {
    fetchData();
  }
}

window.fetchData = fetchData;

function initDropdown() {
  const drugsList = window.drugsList;
  const dropdown = document.querySelector('.dropdown-list');
  // Loop through the dictionary and add an option element for each key-value pair
  for (let key in window.drugsList) {
    let newListItem = document.createElement('div');
    newListItem.classList.add('dropdown-list-item');
    newListItem.textContent = window.drugsList[key];
    dropdown.appendChild(newListItem);
  }

  // Get the dropdown input and list elements
  const input = document.querySelector('.myInput');
  const list = document.querySelector('.dropdown-list');
  list.style.top = input.offsetTop + input.offsetHeight + 'px';
	list.style.left = input.offsetLeft + 'px';
  list.style.display = 'block';

  // Add a click event listener to the input field
  input.addEventListener('click', function() {
    console.log("Im being clicked");
    // Toggle the visibility of the dropdown list
    list.style.top = input.offsetTop + input.offsetHeight + 'px';
    list.style.left = input.offsetLeft + 'px';
    if (list.style.display === 'block') {
      list.style.display = 'none';
    } else {
      list.style.display = 'block';
    }
  });

// Add a click event listener to each dropdown list item
const items = document.querySelectorAll('.dropdown-list-item');
items.forEach(function(item) {
  item.addEventListener('click', function() {
    // Update the input field with the selected item
    input.value = item.textContent;
    // Trigger an input event on the input field to simulate user input
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    addTag();
    const event2 = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(event2);
  });
});


  // Hide the dropdown list if the user clicks outside of it
  document.addEventListener('click', function(event) {
    console.log('document click');
    if (!input.contains(event.target) && !list.contains(event.target)) {
      console.log('hid dropdown list because you clicked outside!');
      list.style.display = 'none';
    }
  });

  const dropdownSearch = document.querySelector('.myInput');
  const dropdownList = document.querySelector('.dropdown-list');
  const originalDropdownHTML = dropdownList.innerHTML;
  // Add event listener to the search input

  dropdownSearch.addEventListener('input', () => {
    const searchValue = dropdownSearch.value.toLowerCase().trim();
    let found = false;
    // Show/hide options based on search input
    for (let i = 0; i < dropdownList.children.length; i++) {
      const option = dropdownList.children[i];
      const optionText = option.textContent.toLowerCase();

      if (optionText.includes(searchValue) || (synonyms[option.textContent] && synonyms[option.textContent].some((synonym) => synonym.toLowerCase().includes(searchValue)))) {
        option.style.display = 'block';
        found = true;
      } else {
        //dropdownList.innerHTML = '<div class="dropdown-list-item">Option not found</div>';
        option.style.display = 'none';

      }
    }
  });

window.selectedOptionIndex = -1; // initialize the selected option index to 0

dropdownSearch.addEventListener('keydown', (event) => {
  console.log('dropdown search key pressed');
  const key = event.key;
  if (key === "ArrowUp" || key === "ArrowDown") {
    event.preventDefault();
    const visibleOptions = Array.from(dropdownList.children).filter((option) => option.style.display !== 'none');
    if (visibleOptions.length > 0) {
      if (window.selectedOptionIndex === -1) {
        window.selectedOptionIndex = key === "ArrowUp" ? visibleOptions.length - 1 : 0;
      } else {
        window.selectedOptionIndex = (window.selectedOptionIndex + (key === "ArrowUp" ? -1 : 1) + visibleOptions.length) % visibleOptions.length;
      }
      visibleOptions.forEach((option, index) => {
        if (index === window.selectedOptionIndex) {
          option.classList.add('selected');
          dropdownSearch.value = option.textContent;
        } else {
          option.classList.remove('selected');
        }
      });
    }
  }
});



  // Show options on click
  dropdownSearch.addEventListener('click', () => {
    console.log("now being clicked");
    dropdownList.classList.toggle('show');
    dropdownSearch.value = '';
    for (let i = 0; i < dropdownList.children.length; i++) {
      const option = dropdownList.children[i];
      option.style.display = 'block';
    }
  });
}

function findInteractions(drugIDs) {
  var interactions = [];
  // Make a POST request to the backend for sending list of drug IDs
  return fetch('/getInteractions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ drugIDs: drugIDs })
  })
  .then(response => response.json())
  .then(data => {
    interactions = data.interactions;
    return interactions;
  })
  .catch(error => console.error(error));
}

async function submitList() {
  var myNodelist = document.getElementById("myUL").childNodes;
    console.log("myNodeList", myNodelist);
  var drugs = [];
  console.log('drugs count', drugs, drugs.length);
  for (var i = 0; i < myNodelist.length; i++) {
    var node = myNodelist[i];
    // console.log("node", node);

    // Check if node has text content
    if (node.textContent.trim().length > 0) {
      // Remove last child if it exists
      if (node.lastChild instanceof Node) {
        node.removeChild(node.lastChild);
      }
      drugs.push(node.innerHTML.trim());
      console.log("node.innerHTML", node.innerHTML);
    }
  }
  // addLoading();
  if (drugs.length == 0 && window.tagsList.length == 0) {
    // alert("Please add at least one drug tag (Press 'Add Tag' or simply click enter)!");
    showError("Please add at least one drug tag (Press 'Add Tag' or simply click enter)!");
  }
  else if (drugs.length == 0 && window.tagsList.length > 0) {
  	showError("Please confirm the drug tags (Press 'Confirm' or simply click shift + enter)!");
  }
  else {
  	hideError();  // Hide error if any
    var count = { "Major": 0, "Moderate": 0, "Minor": 0, "Unknown": 0 };
    drugIDs = []
    for (var i = 0; i < drugs.length; i++) {
      drugIDs.push(window.swappedDrugsList[drugs[i]]);
    }
    var interactions = await findInteractions(drugIDs);
    interactions.sort(function(a, b) {
      var severityOrder = { "Major": 1, "Moderate": 2, "Minor": 3, "Unknown": 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    console.log('interactions in submitList', interactions);
    for (var i = 0; i < interactions.length; i++) {
      count[interactions[i]['severity']]++;
    }
    // console.log(count)
    updateTable(interactions);
    addNote(count)
  }
  // May later want to add else if statement to check all interactions for one drug
}

function retrieveData() {
  var fromDate = document.getElementById("fromDateInput").value;
  var toDate = document.getElementById("toDateInput").value;
  var severity = document.getElementById("severityInput").value;

  var data = {
    fromDate: fromDate,
    toDate: toDate,
    severity: severity
  };

  // Send data to Flask backend using POST request
  fetch('/retrieveData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (response.status === 400) {
      throw new Error('Please provide all the required input.');
    } else if (response.status === 500) {
      throw new Error('Error generating the interaction plot.');
    } else if (response.status === 300) {
      return response.json();
    } else {
      return response.text();
    }
  })
  .then(data => {
    if (typeof data === 'object' && data.message) {
      showError(data.message);
    } else {
      hideError();
      // Create an image element
      var img = new Image();

      // Set the source of the image to the base64-encoded image
      img.src = 'data:image/png;base64,' + data;

      // Append the image element to the container div to display the plot
      var container = document.getElementById("pddiHistoryContainer");
      container.innerHTML = '';
      container.appendChild(img);
    }
  })
  .catch(error => {
    showError(error.message);
    var container = document.getElementById("pddiHistoryContainer");
    container.innerHTML = ''; // Clear the container content
  });
}


function capitalize(str) {
  if (!str) {
    return str;
  }
  const trimmedStr = str.trim();
  return trimmedStr.charAt(0).toUpperCase() + trimmedStr.slice(1);
}

document.getElementById("tag-section").innerHTML = "";

// Add a tag when clicking on the "Add" button
function addTag() {
  var inputValue = capitalize(document.getElementById("myInput").value.trim());
  const dropdownList = document.querySelector('.dropdown-list');
  const input = document.querySelector('.myInput');

  if (inputValue === '') {
    showError("Please enter a drug name!");
  } else if (!window.swappedDrugsList.hasOwnProperty(inputValue)) {
    showError("Please enter a valid drug name!");
  } else if (window.tagsList.includes(inputValue)) {
    // alert("This drug is already added!");
    showError("This drug is already added!");
  } else {
  	hideError();  // Hide error if any
    // Create a new tag element with text and close button
    var tagSection = document.getElementById("tag-section");

	var tag = document.createElement("div");
	tag.classList.add("tag", "badge", "badge-primary", "d-flex", "align-items-center", "justify-content-between", "py-1", "px-2", "ms-10");
	tag.innerHTML = `
	  <span>${inputValue}</span>
	  <button type="button" class="btn-close btn-close-black" aria-label="Close" onclick="deleteTag(this)"></button>
	`;
	tagSection.appendChild(tag);
    window.tagsList.push(inputValue);

	  console.log('tagsList', window.tagsList)
	  document.getElementById("myInput").value = "";  // Clear the input textbox after adding the tag
	  // Trigger an input event on the input field to simulate user input
	  const event = new Event('input', {
		bubbles: true,
		cancelable: true,
	  });
	  input.dispatchEvent(event);
	  dropdownList.style.display = 'block';
	  window.selectedOptionIndex = -1;
  }
}


// Delete a tag when clicking on its delete button
function deleteTag(button) {
  var tag = button.parentElement;
  tag.parentElement.removeChild(tag);
  var tagText = tag.querySelector('span').textContent; // Extract the tag text
  var index = window.tagsList.indexOf(tagText); // Find the index of the tag in the window.tagsList
  if (index !== -1) {
    window.tagsList.splice(index, 1); // Remove the tag from the tagsList
  }
}

let btn = document.getElementById('gfg');
let tagbtn = document.getElementById('tagButton');
let mybtn = document.getElementById('mybtn');

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.shiftKey && event.keyCode === 13) {
    mybtn.click();
  } else if (event.shiftKey && event.keyCode === 13) {
    btn.click();
  } else if (event.keyCode === 13 && !event.shiftKey) {
    tagbtn.click();
  }
});

//import myLoader from "Server/working/static/js/myLoader.js";
const [isLoading, setIsLoading] = useState(false);