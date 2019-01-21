var scenery_data = {};
var process_list = [];
var load_count = 0;
var timer = null;

initialize();

function process_map(map, map_name)
{
	for (var i = 0; i < map.images.length; i++)
	{
		var name = map.images[i].toLowerCase();
		scenery_data[name] = scenery_data[name] || {};
	}

	for (var i = 0; i < map.objects.length; i++)
	{
		var j = map.objects[i].style - 1;

		if (j >= 0 && j < map.images.length)
		{
			var id = map.images[j].toLowerCase();
			var sx = Math.abs(Math.floor(map.objects[i].scalex * 100 + 0.5));
			var sy = Math.abs(Math.floor(map.objects[i].scaley * 100 + 0.5));
			var k = sx + "," + sy;

			scenery_data[id][k] = scenery_data[id][k] || {
				"sx": sx,
				"sy": sy,
				"count": 0,
				"maps": []
			};

			scenery_data[id][k].count++;

			if (scenery_data[id][k].maps.indexOf(map_name) === -1)
				scenery_data[id][k].maps.push(map_name);
		}
	}
}

function show_data()
{
	var table = document.createElement("table");
	var sceneries = Object.keys(scenery_data).sort();

	for (var i = 0; i < sceneries.length; i++)
	{
		var id = sceneries[i];

		var scales = Object.keys(scenery_data[id]).sort(function(a, b) {
			var a_data = scenery_data[id][a];
			var b_data = scenery_data[id][b];

			var a1 = Math.max(a_data.sx, a_data.sy);
			var a2 = Math.min(a_data.sx, a_data.sy);
			var b1 = Math.max(b_data.sx, b_data.sy);
			var b2 = Math.min(b_data.sx, b_data.sy);

			var aw = a1 * 100 + a2;
			var bw = b1 * 100 + b2;

			return (bw - aw) || (b_data.count - a_data.count);
		});

		for (var j = 0; j < scales.length; j++)
		{
			var tr = document.createElement("tr");
			var td = [0,0,0,0].map(function(x){ return document.createElement("td"); });
			var data = scenery_data[id][scales[j]];

			td[0].textContent = j === 0 ? id : "";
			td[1].textContent = data.sx + "%, " + data.sy + "%";
			td[2].textContent = "(" + data.count + ")";
			td[3].textContent = data.maps.sort().join(", ");

			td.forEach(function(x){ tr.appendChild(x); });
			table.appendChild(tr);
		}
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
