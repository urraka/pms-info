var texture_data = [];
var process_list = [];
var load_count = 0;
var timer = null;

initialize();

function process_map(map, map_name)
{
	texture_data.push({
		"map": map_name,
		"texture": map.texture
	});
}

function show_data()
{
	var table = document.createElement("table");
	
	for (var i = 0; i < texture_data.length; i++)
	{
		var tr = document.createElement("tr");
		var td = [0,0].map(function(x){ return document.createElement("td"); });
		
		td[0].textContent = texture_data[i].map;
		td[1].textContent = texture_data[i].texture;
		
		td.forEach(function(x){ tr.appendChild(x); });
		table.appendChild(tr);
	}
	
	var old_table = document.querySelector("table");

	if (old_table)
		document.body.removeChild(document.querySelector("table"));

	document.body.appendChild(table);
}

function load_map(file, map_name, callback)
{
	var reader = new FileReader();

	reader.onload = function() {
		try { process_map(Map.parse(reader.result), map_name); }
		catch (e) { console.log("Failed to process " + map_name); }
		callback();
	};

	reader.readAsArrayBuffer(file);
}

function process_more()
{
	var file = process_list.shift();
	var ext = file.name.split(".").pop().toLowerCase();

	document.querySelector("#loader").textContent = "Loading " +
		(load_count - process_list.length) + "/" + load_count;

	if (ext === "pms")
	{
		var map_name = file.name.replace(/\.pms$/i, "");

		load_map(file, map_name, function()
		{
			if (process_list.length === 0)
			{
				timer = null;
				load_count = 0;
				document.querySelector("#loader").textContent = "Generating table...";

				setTimeout(function() {
					show_data();
					document.body.classList.remove("loading");
				}, 0);
			}
			else
				setTimeout(process_more, 0);
		});
	}
	else
		setTimeout(process_more, 0);
}

function on_drop(event)
{
	event.preventDefault();

	for (var i = 0; i < event.dataTransfer.files.length; i++)
		process_list.push(event.dataTransfer.files[i]);

	load_count += event.dataTransfer.files.length;

	if (timer === null)
	{
		document.querySelector("#loader").textContent = "Loading 1/" + load_count;
		document.body.classList.add("loading");
		timer = setTimeout(process_more, 0);
	}
}

function initialize()
{
	document.addEventListener("drop", on_drop);
	document.addEventListener("dragover", function(e){ e.preventDefault(); });
	document.addEventListener("dragenter", function(e){ e.preventDefault(); });
}
