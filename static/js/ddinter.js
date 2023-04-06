// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
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
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}

function addLoading(){
  var loadingdiv = document.getElementById("loadingdiv");
  loadingdiv.innerHTML = "<b> Loading... </b>"
}

function deleteLoading(){
  var loadingdiv = document.getElementById("loadingdiv");
  loadingdiv.innerHTML = ""
}

function updatetable(druglist){
    var mytable = document.getElementById("drugtable");
    
    var header = mytable.createTHead();
    var row = header.insertRow(0);
    row.style.backgroundColor = "black";
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1)
    var cell3 = row.insertCell(2)
    cell1.innerHTML = "<b>Drug1</b>";
    cell2.innerHTML = "<b>Drug2</b>";
    cell3.innerHTML = "<b>Level</b>";

    colorList = {"Major": "#904d35", "Moderate": "#9e9236", "Minor": "#409e56", "Unknown": "#6a6969"};

    var ind = 1;
    druglist.map(drug => {
        var row = mytable.insertRow(ind++)
        row.style.backgroundColor = colorList[drug["level"]]
        console.log(row.style.backgroundColor);


        var cell1 = row.insertCell(0)
        var cell2 = row.insertCell(1)
        var cell3 = row.insertCell(2)
        cell1.innerHTML = drug["drug1"];
        cell2.innerHTML = drug["drug2"];
        cell3.innerHTML = drug["level"]
    });

    deleteLoading();
}

function addNote(count){
  console.log(count);
  if(count !== 0){
    var notediv = document.getElementById("notediv");
    notediv.innerHTML = "*Note: <b>Unknown interaction means there might be an interaction between the drugs but with unknown severity.</b>"
  }
}

async function submitList(){
    var myNodelist = document.getElementsByTagName("li");
    var drugs = [];
    for(var i=0; i < myNodelist.length; i++){
        var node = myNodelist[i];
        node.removeChild(node.lastChild);
        drugs.push(node.innerHTML);
    }
    console.log(drugs);

    addLoading();
    var response = await fetch('http://127.0.0.1:8000/home/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "drugs": drugs })
    });

    response = await response.json();
    console.log("response = ", response);

    var druglist = response["data"];
    console.log("druglist  = ", druglist);

    const level_to_int = {
        "Major": 0,
        "Moderate": 1,
        "Minor": 2,
        "Unknown": 3,
    }

    druglist.sort(function(a, b){
        return level_to_int[a["level"]] - level_to_int[b["level"]];
    });
    console.log("druglist  = ", druglist);
    
    console.log("I am here, where are you?");

    var count = {"Major": 0, "Moderate": 0, "Minor": 0, "Unknown": 0};
    for(var i=0; i<druglist.length; i++){
      count[druglist[i]["level"]]++;
    }
    console.log(count)

    updatetable(druglist);
    addNote(count)
}
