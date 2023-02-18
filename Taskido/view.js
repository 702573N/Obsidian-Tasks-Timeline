let {pages, inbox, select, taskOrder, taskFiles, globalTaskFilter, dailyNoteFolder, dailyNoteFormat, done, sort, css, forward, dateFormat, options, section} = input;

// Error Handling
if (!pages && pages!="") { dv.span('> [!ERROR] Missing pages parameter\n> \n> Please set the pages parameter like\n> \n> `pages: ""`'); return false };
if (dailyNoteFormat) { if (dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g).length != dailyNoteFormat.length) { dv.span('> [!ERROR] The `dailyNoteFormat` contains invalid characters'); return false }};

// Get, Set, Eval Pages
if (pages=="") { var tasks = dv.pages().file.tasks } else { if (pages.startsWith("dv.pages")) { var tasks = eval(pages) } else { var tasks = dv.pages(pages).file.tasks } };
if (!taskFiles) { taskFiles = [...new Set(dv.pages().file.map(f=>f.tasks.filter(t=>!t.completed)).path)].sort(); } else { taskFiles = [...new Set(dv.pagePaths(taskFiles))].sort() };
if (!options) {options = ""};
if (!dailyNoteFolder) {dailyNoteFolder = ""} else {dailyNoteFolder = dailyNoteFolder+"/"};
if (!dailyNoteFormat) {dailyNoteFormat = "YYYY-MM-DD"};
if (!taskOrder) {taskOrder = ["overdue", "due", "scheduled", "start", "process", "unplanned","done","cancelled"]};
if (!sort) {sort = "t=>t.order"};
if (!dateFormat) {dateFormat = "ddd, MMM D"};
if (!select) {select = "dailyNote"};

// Variables
var timelineDates = [];
var tid = (new Date()).getTime();
var today = moment().format("YYYY-MM-DD");
var dailyNoteRegEx = momentToRegex(dailyNoteFormat);

// Set Root
const rootNode = dv.el("div", "", {cls: "taskido "+options, attr: {id: "taskido"+tid}});
if (css) { var style = document.createElement("style"); style.innerHTML = css; rootNode.querySelector("span").append(style) };

// Icons
var doneIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M7.5 12.5L10.5 15.5L16 10"></path></svg>';
var dueIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
var scheduledIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>';
var startIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>';
var overdueIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
var processIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"></path><path d="M12 13v9"></path><path d="M12 2v4"></path></svg>';
var dailynoteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
var unplannedIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.18 4.18A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18"></path><path d="M21 15.5V6a2 2 0 0 0-2-2H9.5"></path><path d="M16 2v4"></path><path d="M3 10h7"></path><path d="M21 10h-5.5"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>';
var taskIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>';
var addIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
var tagIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>';
var repeatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>';
var priorityIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
var fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>';
var forwardIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 17 20 12 15 7"></polyline><path d="M4 18v-2a4 4 0 0 1 4-4h12"></path></svg>';
var alertIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
var cancelledIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

// Initialze
getMeta(tasks);
getTimeline(tasks);
getSelectOptions();
setEvents();
function getMeta(tasks) {
	
	for (i=0;i<tasks.length;i++) {
		let happens = {};
		var taskText = tasks[i].text;
		var taskFile = getFilename(tasks[i].path);
		var filePath = tasks[i].link.path;
		
		// Inbox
		if (inbox && inbox == filePath && tasks[i].completed == false && !taskText.match(/[🛫|⏳|📅|✅] *(\d{4}-\d{2}-\d{2})/)) {
			timelineDates.push(today);
			happens["unplanned"] = today;
			tasks[i].order = taskOrder.indexOf("unplanned");
		};
		
		// Daily Notes
		var dailyNoteMatch = taskFile.match(eval(dailyNoteRegEx));
		var dailyTaskMatch = taskText.match(/[🛫|⏳|📅|✅] *(\d{4}-\d{2}-\d{2})/);
		if (dailyNoteMatch && tasks[i].completed == false && tasks[i].checked == false) {
			tasks[i].dailyNote = true;
			if(!dailyTaskMatch) {
				if (moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD") < today) {
					if (forward == true) {
						timelineDates.push(today);
						happens["unplanned"] = today;
						tasks[i].order = taskOrder.indexOf("unplanned");
					} else {
						timelineDates.push(moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD"));
						happens["unplanned"] = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
						tasks[i].order = taskOrder.indexOf("unplanned");
					};
				} else {
					timelineDates.push(moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD"));
					happens["unplanned"] = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
					tasks[i].order = taskOrder.indexOf("unplanned");
				};
			};
		} else if (dailyNoteMatch && tasks[i].completed == false && tasks[i].checked == true && moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD") >= today) {
			timelineDates.push(moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD"));
			happens["cancelled"] = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
			tasks[i].order = taskOrder.indexOf("cancelled");
		} else if (dailyNoteMatch) {
			tasks[i].dailyNote = true;
		} else if (!dailyNoteMatch) {
			tasks[i].dailyNote = false;
		};
		
		// Dataview Tasks
		while (inlineFields = /\[([^\]]+)\:\:([^\]]+)\]/g.exec(tasks[i].text)) {
			var inlineField = inlineFields[0];
			var fieldKey = inlineFields[1].toLowerCase();
			var fieldValue = inlineFields[2];
			if ( fieldKey == "due" || fieldKey == "scheduled" || fieldKey == "start" || fieldKey == "completion") {
				var fieldDate = moment(fieldValue).format("YYYY-MM-DD");
				if (tasks[i].completed == false  && tasks[i].checked == false) {
					if ( fieldKey == "due" && fieldDate < today ) {
						if (forward == true) {
							happens["overdue"] = fieldDate;
							happens["overdueForward"] = today;
							tasks[i].order = taskOrder.indexOf("overdue");
						} else {
							happens["overdue"] = fieldDate;
							tasks[i].order = taskOrder.indexOf("overdue");
							timelineDates.push(fieldDate);
						};
					} else if ( fieldKey == "due" && fieldDate == today ) {
						happens["due"] = fieldDate;
						tasks[i].order = taskOrder.indexOf("due");
						timelineDates.push(fieldDate);
					} else if ( fieldKey == "due" && fieldDate > today ) {
						happens["due"] = fieldDate;
						tasks[i].order = taskOrder.indexOf("due");
						timelineDates.push(fieldDate);
					};
					if ( fieldKey == "scheduled" && fieldDate < today ) {
						happens["scheduled"] = fieldDate;
						happens["scheduledForward"] = today;
						tasks[i].order = taskOrder.indexOf("scheduled");
					} else if (fieldKey == "scheduled") {
						happens["scheduled"] = fieldDate;
						tasks[i].order = taskOrder.indexOf("scheduled");
						timelineDates.push(fieldDate);
					};
					if ( fieldKey == "start" && fieldDate < today ) {
						happens["start"] = fieldDate;
						happens["startForward"] = today;
						tasks[i].order = taskOrder.indexOf("start");
					} else if (fieldKey == "start") {
						happens["start"] = fieldDate;
						tasks[i].order = taskOrder.indexOf("start");
						timelineDates.push(fieldDate);
					};
				} else if (tasks[i].completed == true && tasks[i].checked == true) {
					if (fieldKey == "completion") {
						happens["done"] = fieldDate;
						tasks[i].order = taskOrder.indexOf("done");
					};
				} else if (tasks[i].completed == false && tasks[i].checked == true && fieldDate >= today) {
						happens["cancelled"] = fieldDate;
						tasks[i].order = taskOrder.indexOf("cancelled");	
				};
			};
			tasks[i].text = tasks[i].text.replace(inlineField, "");
		};
		
		// Tasks Plugin Tasks
		var dueMatch = taskText.match(/📅 *(\d{4}-\d{2}-\d{2})/);
		if (dueMatch && tasks[i].completed == false && tasks[i].checked == false) {
			tasks[i].text = tasks[i].text.replace(dueMatch[0], "");
			if ( dueMatch[1] < today ) {
				if (forward == true) {
					happens["overdue"] = dueMatch[1];
					happens["overdueForward"] = today;
					tasks[i].order = taskOrder.indexOf("overdue");
				} else {
					happens["overdue"] = dueMatch[1];
					tasks[i].order = taskOrder.indexOf("overdue");
					timelineDates.push(dueMatch[1]);
				};
			} else if ( dueMatch[1] == today ) {
				happens["due"] = dueMatch[1];
				tasks[i].order = taskOrder.indexOf("due");
				timelineDates.push(dueMatch[1]);
			} else if ( dueMatch[1] > moment().format("YYYY-MM-DD") ) {
				happens["due"] = dueMatch[1];
				tasks[i].order = taskOrder.indexOf("due");
				timelineDates.push(dueMatch[1]);
			};
		} else if (dueMatch && tasks[i].completed == true && tasks[i].checked == true) {
			tasks[i].text = tasks[i].text.replace(dueMatch[0], "");
		} else if (dueMatch && tasks[i].completed == false && tasks[i].checked == true && dueMatch[1] >= today) {
			tasks[i].text = tasks[i].text.replace(dueMatch[0], "");
			happens["cancelled"] = dueMatch[1];
			tasks[i].order = taskOrder.indexOf("cancelled");
			timelineDates.push(dueMatch[1]);
		};
		var scheduledMatch = taskText.match(/⏳ *(\d{4}-\d{2}-\d{2})/);
		if (scheduledMatch && tasks[i].completed == false && tasks[i].checked == false) {
			tasks[i].text = tasks[i].text.replace(scheduledMatch[0], "");
			if ( scheduledMatch[1] < today ) {
				happens["scheduled"] = scheduledMatch[1];
				happens["scheduledForward"] = today;
				tasks[i].order = taskOrder.indexOf("scheduled");
			} else {
				happens["scheduled"] = scheduledMatch[1];
				tasks[i].order = taskOrder.indexOf("scheduled");
				timelineDates.push(scheduledMatch[1]);
			};
		} else if (scheduledMatch && tasks[i].completed == true) {
			tasks[i].text = tasks[i].text.replace(scheduledMatch[0], "");
		};
		var startMatch = taskText.match(/🛫 *(\d{4}-\d{2}-\d{2})/);
		if (startMatch && tasks[i].completed == false && tasks[i].checked == false) {
			tasks[i].text = tasks[i].text.replace(startMatch[0], "");
			if ( startMatch[1] < today ) {
				happens["start"] = startMatch[1];
				happens["startForward"] = today;
				tasks[i].order = taskOrder.indexOf("start");
			} else {
				happens["start"] = startMatch[1];
				tasks[i].order = taskOrder.indexOf("start");
				timelineDates.push(startMatch[1]);
			};
		} else if (startMatch && tasks[i].completed == true) {
			tasks[i].text = tasks[i].text.replace(startMatch[0], "");
		};
		var doneMatch = taskText.match(/✅ *(\d{4}-\d{2}-\d{2})/);
		if (doneMatch && tasks[i].completed == true && tasks[i].checked == true) {
			tasks[i].text = tasks[i].text.replace(doneMatch[0], "");
			if (done == true || doneMatch[1] == today) {
				timelineDates.push(doneMatch[1]);
				happens["done"] = doneMatch[1];
				tasks[i].order = taskOrder.indexOf("done");
			};
		};
		var repeatMatch = taskText.match(/🔁 ?([a-zA-Z0-9, !]+)/)
		if (repeatMatch) {
			tasks[i].repeat = repeatMatch[1];
			tasks[i].text = tasks[i].text.replace(repeatMatch[0], "");
		};
		var lowMatch = taskText.includes("🔽");
		if (lowMatch) {
			tasks[i].text = tasks[i].text.replace("🔽","");
			tasks[i].priority = "D";
			tasks[i].priorityLabel = "low priority";
		};
		var mediumMatch = taskText.includes("🔼");
		if (mediumMatch) {
			tasks[i].text = tasks[i].text.replace("🔼","");
			tasks[i].priority = "B";
			tasks[i].priorityLabel = "medium priority";
		};
		var highMatch = taskText.includes("⏫");
		if (highMatch) {
			tasks[i].text = tasks[i].text.replace("⏫","");
			tasks[i].priority = "A";
			tasks[i].priorityLabel = "high priority";
		};
		if (!lowMatch && !mediumMatch && !highMatch) {
			tasks[i].priority = "C";
		}
		if (globalTaskFilter) {
			tasks[i].text = tasks[i].text.replaceAll(globalTaskFilter,"");
		} else {
			tasks[i].text = tasks[i].text.replaceAll("#task","");
		};

		// Link Detection
		while (outerLink = /\[([^\]]+)\]\(([^)]+)\)/g.exec(tasks[i].text)) {
 			tasks[i].text = tasks[i].text.replace(outerLink[0], "<a class='external-link outerLink' href='" + outerLink[2] + "'>" + outerLink[1] + "</a>");
 		};

 		while (innerLink = /\[\[([^\]]+)\]\]/g.exec(tasks[i].text)) {
 			tasks[i].text = tasks[i].text.replace(innerLink[0], "<a class='internal-link innerLink' href='" + innerLink[1] + "'>" + innerLink[1] + "</a>");
 		};
		
		// Markdown Highlights
		while (mark = /\=\=([^\]]+)\=\=/g.exec(tasks[i].text)) {
			tasks[i].text = tasks[i].text.replace(mark[0], "<mark>" + mark[1] + "</mark>");
		};
		
		// Reminder Syntax
		var reminderMatch = taskText.match(/⏰ *(\d{4}-\d{2}-\d{2}) *(\d{2}\:\d{2})|⏰ *(\d{4}-\d{2}-\d{2})|(\(\@(\d{4}-\d{2}-\d{2}) *(\d{2}\:\d{2})\))|(\(\@(\d{4}-\d{2}-\d{2})\))/);
		if (reminderMatch) {
			tasks[i].text = tasks[i].text.replace(reminderMatch[0], "");
		};
		
		tasks[i].happens = happens;
	};
	timelineDates.push(today);
	timelineDates = [...new Set(timelineDates)].sort();
};

function getRelative(someDate) {
	let date = moment(someDate);
	if (moment().diff(date, 'days') >= 1 || moment().diff(date, 'days') <= -1) {
		return date.fromNow();
	} else {
		return date.calendar().split(' ')[0];
	};
};

function getSelectOptions() {
	// Push daily note and Inbox files
	const currentDailyNote = dailyNoteFolder + moment().format(dailyNoteFormat) + ".md";
	taskFiles.push(currentDailyNote);
	if (inbox) {taskFiles.push(inbox)};
	taskFiles = [...new Set(taskFiles)].sort();
	// Loop files
	const fileSelect = rootNode.querySelector('.fileSelect');
	taskFiles.forEach(function(file) {
		var opt = document.createElement('option');
		opt.value = file;
		var secondParentFolder = file.split("/")[file.split("/").length - 3] == null ? "" : "… / ";
		var parentFolder = file.split("/")[file.split("/").length - 2] == null ? "" : secondParentFolder + "📂&nbsp;" + file.split("/")[file.split("/").length - 2] + " / ";
		var filePath = parentFolder + "📄&nbsp;" + getFilename(file);
		opt.innerHTML =  filePath;
		opt.title = file;
		if (select && file == select) {
			opt.setAttribute('selected', true);
		} else if (select && select == "dailyNote" && file == currentDailyNote) {
			opt.setAttribute('selected', true);
		};
		fileSelect.appendChild(opt);
	});
};

function setEvents() {
	rootNode.querySelectorAll('.counter').forEach(cnt => cnt.addEventListener('click', (() => {
		var activeFocus = Array.from(rootNode.classList).filter(c=>c.endsWith("Filter") && !c.startsWith("today"));
		if (activeFocus == cnt.id+"Filter") {
			rootNode.classList.remove(activeFocus);
			return false;
		};
		rootNode.classList.remove.apply(rootNode.classList, Array.from(rootNode.classList).filter(c=>c.endsWith("Filter") && !c.startsWith("today")));
		rootNode.classList.add(cnt.id+"Filter");
	})));
	rootNode.querySelector('.todayHeader').addEventListener('click', (() => {
		rootNode.classList.toggle("todayFocus");
	}));
	rootNode.querySelectorAll('.task:not(.star, .add)').forEach(t => t.addEventListener('click', ((e) => {
		var link = t.getAttribute("data-link");
		var line = t.getAttribute("data-line");
		var col = t.getAttribute("data-col");
		if (e.target.closest(".task .tag")) {
			// Tag
		} else if (e.target.closest(".timeline .icon")) {
			// Check
			var task = e.target.closest(".task");
			var icon = e.target.closest(".timeline .icon");
			task.className = "task done";
			icon.innerHTML = doneIcon;
			completeTask(link, line, col);
		} else {
			// File
			openFile(link, line, col);
		};
	})));
	rootNode.querySelector('.ok').addEventListener('click', (() => {
		var filePath = rootNode.querySelector('.fileSelect').value;
		var newTask = rootNode.querySelector('.newTask').value;
		if (newTask.length > 1) {
			try {
				var abstractFilePath = app.vault.getAbstractFileByPath(filePath);
				if (abstractFilePath) {
					app.vault.read(abstractFilePath).then(function(fileText) {
						app.vault.modify(abstractFilePath, addNewTask(fileText, newTask));
					});
				} else {
					app.vault.create(filePath, "- [ ] " + newTask);
				};
				new Notice("New task saved!");
				rootNode.querySelector('.newTask').value = "";
				rootNode.querySelector('.newTask').focus();
			} catch(err) {
				new Notice("Something went wrong!");
			};
		} else {
			rootNode.querySelector('.newTask').focus();
		};
	}));
	rootNode.querySelector('.fileSelect').addEventListener('change', (() => {
		rootNode.querySelector('.newTask').focus();
	}));
	rootNode.querySelector('.newTask').addEventListener('input', (() => {
		var input = rootNode.querySelector('.newTask');
		var newTask = input.value;
		
		// Icons
		if (newTask.includes("due ")) { input.value = newTask.replace("due", "📅") };
		if (newTask.includes("start ")) { input.value = newTask.replace("start", "🛫") };
		if (newTask.includes("scheduled ")) { input.value = newTask.replace("scheduled", "⏳") };
		if (newTask.includes("done ")) { input.value = newTask.replace("done", "✅") };
		if (newTask.includes("high ")) { input.value = newTask.replace("high", "⏫") };
		if (newTask.includes("medium ")) { input.value = newTask.replace("medium", "🔼") };
		if (newTask.includes("low ")) { input.value = newTask.replace("low", "🔽") };
		if (newTask.includes("repeat ")) { input.value = newTask.replace("repeat", "🔁") };
		if (newTask.includes("recurring ")) { input.value = newTask.replace("recurring", "🔁") };
		
		// Dates
		if (newTask.includes("today ")) { input.value = newTask.replace("today", moment().format("YYYY-MM-DD")) };
		if (newTask.includes("tomorrow ")) { input.value = newTask.replace("tomorrow", moment().add(1, "days").format("YYYY-MM-DD")) };
		if (newTask.includes("yesterday ")) { input.value = newTask.replace("yesterday", moment().subtract(1, "days").format("YYYY-MM-DD")) };
		
		// In X days/weeks/month/years
		var futureDate = newTask.match(/(in)\W(\d{1,3})\W(days|day|weeks|week|month|years|year) /);
		if (futureDate) {
			var x = parseInt(futureDate[2]);
			var unit = futureDate[3];
			var date = moment().add(x, unit).format("YYYY-MM-DD[ ]")
			input.value = newTask.replace(futureDate[0], date);
		};
		
		// Next Weekday
		var weekday = newTask.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday) /);
		if (weekday) {
			var weekdays = ["","monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
			const dayINeed = weekdays.indexOf(weekday[1]);
			if (moment().isoWeekday() < dayINeed) {
			  input.value = newTask.replace(weekday[1], moment().isoWeekday(dayINeed).format("YYYY-MM-DD")); 
			} else {
			  input.value = newTask.replace(weekday[1], moment().add(1, 'weeks').isoWeekday(dayINeed).format("YYYY-MM-DD"));
			};
		};
		
		rootNode.querySelector('.newTask').focus();
	}));
	rootNode.querySelector('.newTask').addEventListener('keyup', ((e) => {
		if (e.which === 13) { // Enter key
			rootNode.querySelector('.ok').click();
		};
	}));
	rootNode.querySelector('.newTask').addEventListener('focus', (() => {
		rootNode.querySelector('.quickEntryPanel').classList.add("focus");
	}));
	rootNode.querySelector('.newTask').addEventListener('blur', (() => {
		rootNode.querySelector('.quickEntryPanel').classList.remove("focus");
	}));
};

function addNewTask(fileText, newTask) {
	let newFileText;
	const newTaskText = "- [ ] " + newTask;
	if (section != undefined) {
		const lines = fileText.split("\n");
		const index = lines.indexOf(section);
		if (index != -1) {
			lines.splice(index + 1, 0, newTaskText);
			newFileText = lines.join("\n");
			return newFileText;
		} else {
			var createSection = confirm("Section marker '" + section + "' not found. Would you like to create it?");
			if (createSection == true) {
				newFileText = fileText.replace(/\n+$/, "") + "\n\n" + section + "\n\n" + newTaskText;
				return newFileText;
			};
		};
	};
	newFileText = fileText.replace(/\n+$/, "") + "\n\n" + newTaskText;
	return newFileText;
};

function openFile(link, line, col) {
	app.workspace.openLinkText('', link).then(() => {
		if (line && col) {
			try {
				const view = app.workspace.activeLeaf.getViewState();
				view.state.mode = 'source'; // mode = source || preview
				app.workspace.activeLeaf.setViewState(view);
				var cmEditor = app.workspace.activeLeaf.view.editor;
				cmEditor.setSelection({line: parseInt(line), ch: 6},{line: parseInt(line), ch: parseInt(col)});
				cmEditor.focus();
			} catch(err) {
				new Notice("Something went wrong!")
			};
		};
	});
};

function completeTask(link, line, col) {
	app.workspace.openLinkText('', link).then(() => {
		if (line && col) {
			try {
				const view = app.workspace.activeLeaf.getViewState();
				view.state.mode = 'source'; // mode = source || preview
				app.workspace.activeLeaf.setViewState(view);
				var cmEditor = app.workspace.activeLeaf.view.editor;
				var cmLine = cmEditor.getLine(parseInt(line));
				if (cmLine.includes("🔁")) {var addRange = 1} else {var addRange = 0};
				cmEditor.setCursor(parseInt(line), parseInt(col));
				app.commands.executeCommandById('obsidian-tasks-plugin:toggle-done');
				cmEditor.setSelection({line: parseInt(line) + addRange, ch: 6},{line: parseInt(line) + addRange, ch: parseInt(col) + 13});
				cmEditor.focus();
			} catch(err) {
				new Notice("Something went wrong!")
			};
		};
	});
};

function getFilename(path) {
	var filename = path.match(/^(?:.*\/)?([^\/]+?|)(?=(?:\.[^\/.]*)?$)/)[1];
	return filename;
};

function getMetaFromNote(task, metaName) {
	var meta = dv.pages('"'+task.link.path+'"')[metaName][0];
	if (meta) { return meta } else { return "" };
};

function momentToRegex(momentFormat) {
	momentFormat = momentFormat.replaceAll(".", "\\.");
	momentFormat = momentFormat.replaceAll(",", "\\,");
	momentFormat = momentFormat.replaceAll("-", "\\-");
	momentFormat = momentFormat.replaceAll(":", "\\:");
	momentFormat = momentFormat.replaceAll(" ", "\\s");
	
	momentFormat = momentFormat.replace("dddd", "\\w{1,}");
	momentFormat = momentFormat.replace("ddd", "\\w{1,3}");
	momentFormat = momentFormat.replace("dd", "\\w{2}");
	momentFormat = momentFormat.replace("d", "\\d{1}");
	
	momentFormat = momentFormat.replace("YYYY", "\\d{4}");
	momentFormat = momentFormat.replace("YY", "\\d{2}");
	
	momentFormat = momentFormat.replace("MMMM", "\\w{1,}");
	momentFormat = momentFormat.replace("MMM", "\\w{3}");
	momentFormat = momentFormat.replace("MM", "\\d{2}");
	
	momentFormat = momentFormat.replace("DDDD", "\\d{3}");
	momentFormat = momentFormat.replace("DDD", "\\d{1,3}");
	momentFormat = momentFormat.replace("DD", "\\d{2}");
	momentFormat = momentFormat.replace("D", "\\d{1,2}");
	
	momentFormat = momentFormat.replace("ww", "\\d{1,2}");
	
	regEx = "/^(" + momentFormat + ")$/";

	return regEx;
};

function getTimeline(tasks) {
	var yearNode;
	var lastYear = null;
	var containedTypesPerYear = null;

	for (i=0; i<timelineDates.length; i++) {
		
		// Variables
		var tasksFiltered = tasks.filter(t=>Object.values(t.happens).includes(timelineDates[i].toString())).sort(eval(sort));
		var date = moment(timelineDates[i].toString()).format(dateFormat);
		var weekday = moment(timelineDates[i].toString()).format("dddd");
		var year = moment(timelineDates[i].toString()).format("YYYY");
		var detailsCls = "";
		var content = "";
		var containedTypesPerDay = [];
		
		// Add Year Section
		if (year != lastYear) {
			containedTypesPerYear = [];
			lastYear = year;
			yearNode = dv.el("div", "", {cls: "year", attr: {"data-types": ""}})
			if (moment().format("YYYY") == year) { yearNode.classList.add("current") };
			yearNode.innerHTML = year;
			rootNode.querySelector("span").appendChild(yearNode);
		};
		
		// Add Today Information
		if (timelineDates[i] == today) {
			detailsCls += "today";

			var overdueCount = tasks.filter(t=>t.happens["overdue"]).length;
			var dueCount = tasksFiltered.filter(t=>t.happens["due"]).length;
			var startCount = tasksFiltered.filter(t=>t.happens["start"]).length;
			var scheduledCount = tasksFiltered.filter(t=>t.happens["scheduled"]).length;
			var doneCount = tasksFiltered.filter(t=>t.happens["done"]).length;
			var dailynoteCount = tasksFiltered.filter(t=>t.happens["dailynote"]).length;
			var processCount = tasksFiltered.filter(t=>t.happens["process"]).length;
			var todoCount = tasksFiltered.filter(t=>!t.completed && !t.happens["overdue"] && !t.happens["unplanned"]).length;
			var unplannedCount = tasks.filter(t=>t.happens["unplanned"]).length;
			var allCount = doneCount + todoCount + overdueCount;
			
			// Counter
			var todayContent = "<div class='todayHeader' aria-label='Focus today'>Today</div>"
			todayContent += "<div class='counters'>"
			todayContent += "<div class='counter' id='todo' aria-label='Filter tasks to do'><div class='count'>" + todoCount + "</div><div class='label'>To Do</div></div>"
			todayContent += "<div class='counter' id='overdue' aria-label='Filter overdue tasks'><div class='count'>" + overdueCount + "</div><div class='label'>Overdue</div></div>"
			todayContent += "<div class='counter' id='unplanned' aria-label='Filter unplanned tasks'><div class='count'>" + unplannedCount + "</div><div class='label'>Unplanned</div></div>"
			todayContent += "</div>"
			// Quick Entry panel
			todayContent += "<div class='quickEntryPanel'>"
			todayContent += "<div class='left'><select class='fileSelect' aria-label='Select a note to add a new task to'></select><input class='newTask' type='text' placeholder='Enter your tasks here'/></div>"
			todayContent += "<div class='right'><button class='ok' aria-label='Append new task to selected note'>"
			todayContent += '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>'
			todayContent += "</button></div>"
			todayContent += "</div>"
			
			content += todayContent;
		};
		
		tasksFiltered.forEach(function(item) {
			var file = getFilename(item.path);
			var header = item.header.subpath;
			var link = item.link.path.replace("'", "&apos;");
			var text = item.text;
			var posEndLine = item.position.start.line;
			var posEndCol = item.position.end.col;
			var info = "";
			var color = getMetaFromNote(item, "color");
			if (!color) {color = "var(--text-muted)"};
			var cls = Object.keys(item.happens).find(key => item.happens[key] === timelineDates[i].toString()).replace("Forward","");
			var dailyNote = item.dailyNote;
			containedTypesPerDay.push(cls);
			containedTypesPerYear.push(cls);

			// Handle forwarded tasks to get relative by cls
			for (h=0;h<Object.keys(item.happens).length;h++) {
				var key = Object.keys(item.happens)[h];
				var value = Object.values(item.happens)[h];
				var relative = getRelative(moment(value));
				
				// Append relative infos
				if (!key.includes("Forward") && key != "unplanned") {
					info += "<div class='relative' aria-label='" + cls + ": " + value + "'><div class='icon'>" + eval(key+"Icon") +  "</div><div class='label'>" + relative + "</div></div>";
				};
			};

			if (item.repeat) {
				info += "<div class='repeat' aria-label=''><div class='icon'>" + repeatIcon + "</div><div class='label'>" + item.repeat.replace("🔁", "") + "</div></div>";
			};
			
			if (item.priorityLabel) {
				info += "<div class='priority' aria-label=''><div class='icon'>" + priorityIcon + "</div><div class='label'>" + item.priorityLabel + "</div></div>";
			};
			
			info += "<div class='file' aria-label='" + item.path + "'><div class='icon'>" + fileIcon + "</div><div class='label'>" + file + "<span class='header'> > " + header + "</span></div></div>";
			
			item.tags.forEach(function(tag) {
				var tagText = tag.replace("#","");
				var hexColorMatch = tag.match(/([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\/(.*)/);
				if (hexColorMatch) {
					var style = "style='--tag-color:#" + hexColorMatch[1] + ";--tag-background:#" + hexColorMatch[1] + "1a'";
					tagText = hexColorMatch[2];
				} else {
					var style = "style='--tag-color:var(--text-muted)'";
				};
				info += "<a href='" + tag + "' class='tag' " + style + " aria-label='#" + tagText + "'><div class='icon'>" + tagIcon + "</div><div class='label'>" + tagText + "</div></a>";
				text = text.replace(tag, "");
			});
			
			if (item.completed) { var icon = doneIcon } else { var icon = taskIcon };
			if (cls == "overdue") { var icon = alertIcon } else if (cls == "cancelled") { var icon = cancelledIcon };
			var task = "<div data-line='" + posEndLine + "' data-col='" + posEndCol + "' data-link='" + link + "' data-dailynote='" + dailyNote + "' class='task " + cls + "' style='--task-color:" + color + "' aria-label='" + file + "'><div class='timeline'><div class='icon'>" + icon + "</div><div class='stripe'></div></div><div class='lines'><a class='internal-link' href='" + link + "'><div class='content'>" + text + "</div></a><div class='line info'>" + info + "</div></div></div>";
			content += task;
		});
		
		// Set Date Template
		var date = "<div class='dateLine'><div class='date'>" + date + "</div><div class='weekday'>" + "</div></div><div class='content'>" + content + "</div>"
		
		// Append To Root Node
		containedTypesPerDay = [...new Set(containedTypesPerDay)].sort();
		rootNode.querySelector("span").appendChild(dv.el("div", date, {cls: "details " + detailsCls, attr: {"data-year": year, "data-types": containedTypesPerDay.join(" ")}}));
		
		// Set containedTypesPerYear
		containedTypesPerYear = [...new Set(containedTypesPerYear)].sort()
		yearNode.setAttribute("data-types", containedTypesPerYear);
	};
	
	};
