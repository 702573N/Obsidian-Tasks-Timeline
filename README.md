# Taskido: Obsidian-Tasks-Timeline
#### A custom view build with [Obsidian-Dataview](https://github.com/blacksmithgu/obsidian-dataview) to display tasks from [Obsidian-Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) and from your daily notes in a highly customisable timeline

<p align="center"><img width="400" alt="Semi_Transparent" src="https://user-images.githubusercontent.com/59178587/210307060-5ed916ee-819d-46b1-9a5e-efdd15728957.png"></p>

- All your tasks in a clean and simple timeline view
- Focus today and filter to do, overdue or unplanned tasks
- Quick add new tasks without having to open notes
- Forward tasks from past days to today
- Relative dates for quicker classification
- Scratch tasks to your inbox for better time management
- Custom colors for all your tags and notes

---

## Story
Many Obsidian and Task Plugin users need to build certain queries using the Dataview Plugin, or with the queries included in the Task Plugin. These queries then allow the user to keep track of certain previously defined tasks. The visual representation of the query result is very plain and rigid, as are the customisation options for the display. The aim of this customised view is to make almost all of the user's tinkered queries redundant with an all-round solution.

Although I initially developed the Obsidian Tasks Calendar, I now work exclusively with the Timeline, as it shows me all the information at any given time without overwhelming me.

---

## Setup
1.  Install "Dataview Plugin" from the external plugins
2.  Create a new folder called "Taskido" or any other name and paste the files "view.js" and "view.css" into it
3.  Create a new note or edit an existing one and add the following code line:

    ````
    ```dataviewjs
    await dv.view("taskido", {pages: ""})
    ```
    ````
    
    If you paste the main files (js/css) into another folder then "Taskido", you have to replace the name between the first quotation marks.
 
 4. There are more parameters to customize the look and feel of Taskido but there aren't necessary.
 
    Parameters must be declared in the curly bracket and all parameters are separated by a comma. The name of the parameter is followed by a colon, a space and quotes in which the corresponding value of the parameter is declared.

    The options parameter is the only parameter to which multiple values (separated by a space (no comma)) can be assigned. The values declared in options function as style classes within the CSS (Cascading Style Sheet) and primarily serve to hide elements when they are not needed.
    
    True and false values are always declared without quotes.

    All this together results in the following structure:
    
    ```
    dv.view("YourScriptFolder", {parameter: "value", parameter: "value", parameter: true, parameter: "value value value value"})
    
    For example...
    
    dv.view("taskido", {pages: "", select: "Task Management/Inbox.md", inbox: "Task Management/Inbox.md", dailyNoteFolder: "Daily Notes", forward:true, options: ""})
    
    To get a little structure you yan also write...
    
    dv.view("taskido", {
        pages: "", 
        select: "Task Management/Inbox.md", 
        inbox: "Task Management/Inbox.md", 
        dailyNoteFolder: "Daily Notes", 
        forward: true,
        options: ""
    })
    ```

---

## Required parameter

### pages:
For help and instruction take a look here [Dataview Help](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvpagessource)
```
pages: ""
```
Get all tasks from all notes in obsidian.

```
pages: '"Task Management/Work"'
```
Set a custom folder to get tasks from.

The dv.pages command is the same and works exactly the same like in dataview-plugin.

```
pages: "dv.pages().file.tasks.where(t => t.tags.includes('#Pierre'))"
pages: "dv.pages().file.tasks.where(t=>!t.checked && t.header.subpath != 'Log')"
pages: "dv.pages().file.where(f=>f.tags.includes('#ToDo') || f.tags.includes('#Task')).where(f=>f.folder != 'Inbox').tasks"
```
It is also possible to define complex queries. These must start with `dv.pages` and output tasks as a result.

---

## Optional parameters
```
options: "noCounters"
options: "noQuickEntry"
options: "noYear"
options: "noRelative"
options: "noRepeat"
options: "noPriority"
options: "noTag"
options: "noFile"
options: "noInfo"
options: "noDone"
```
With this options you can hide some elements which they do not need, or which disturb.

### Combining options
```
options: "noCounters noQuickEntry noInfo"
```
All options can be combined with each other as desired.

### Focus/Filter options
```
options: "todayFocus"
```
With this option you can set default focus on today after open the timeline.

```
options: "todoFilter"
options: "overdueFilter"
options: "unplannedFilter"
```

With this options you can set a default filter after open the timeline.

### dailyNoteFolder:
```
dailyNoteFolder: "MyCustomFolder"
dailyNoteFolder: "Inbox/Daily Notes/Work"
```
Here you can set a custom folder path for the daily notes if they should not be saved in the default folder for new files. Of course, folder structures with several levels can also be defined here.

### dailyNoteFormat:
```
dailyNoteFormat: "YYYY, MMMM DD - dddd"
dailyNoteFormat: "YYYY-[W]ww"
```
You can set a custom format with a limited base set of characters: Y M D [W] ww d . , - : (SPACE). Without this parameter the default format "YYYY-MM-DD" is used to identify your daily notes.

### globalTaskFilter:
```
globalTaskFilter: "#task"
```
Set a global task filter to hide from task text/description inside tasks-calendar.

### sort:
```
sort: "t=>t.order"
sort: "t=>t.text"
sort: "t=>t.completed"
sort: "t=>t.priority"
```
With the sort paramter you can set your personal sort algorithm to sort your tasks inside a day.

### forward:
```
forward: true
```
This parameter carry forward tasks from past and display them on the current date.

### dateFormat:
```
dateFormat: "YYYY-MM-DD"
dateFormat: "ddd, MMM D"
```
With this parameter you can set a custom date format with moment.js syntax. By default the format "ddd, MMM D" is set.

### select:
```
select: "Task Management/Inbox.md"
```
With this parameter you can set a default file selection for the quick entry panel. By default Taskido select the daily note from today, even if this does not yet exist. By pushing a task into it, the daily note is created automatically.

### inbox:
```
inbox: "Task Management/Inbox.md"
```
With this parameter you can set a custom file as your Inbox to scratch tasks first before moving them into the correct note file (GTD). All tasks from within this file are listed on today, even if the tasks have not yet been assigned a date at all. In this way, tasks can be recorded quickly without having to be fully formulated. So you can return to your actual activities and complete the follow-up of the tasks at a later and more appropriate time.

### taskFiles:
```
taskFiles: "" => files with uncompleted tasks (set by default without declaring this parameter)
taskFiles: "#taskido" => files with tag #taskido
taskFiles: '"Task Management/Work"' => files in folder Task Management
taskFiles: '("Task Management" and -"Task Management/Archive")' => folder Task Management without folder Task Management/Archive
taskFiles: '"Task Management" or #taskido' files in folder Task Management or files with tag #taskido
```
With this parameter you can select files to show up inside quick entry select box.

---

## Note colors
In each note file you can set a custom "color" to show up in the calendar. You only need to add the following metadata to the first line of your note.

<img width="570" alt="Bildschirm­foto 2023-01-02 um 12 17 47" src="https://user-images.githubusercontent.com/59178587/210224314-5a54180f-1c63-490c-8c37-aaff7bb4d707.png">
    
The color should be hex in quotation marks to work properly.

<img width="362" alt="Bildschirm­foto 2023-01-02 um 12 16 25" src="https://user-images.githubusercontent.com/59178587/210224367-31ddc0d2-0ec5-497f-ae22-5ab2be508571.png">

---

## Tag colors
You can set a custom color for all your tags displayed inside Taskido. Here I'm using the nesting tag feature to implement this. The first tag (root-node) is used as hex-color and the second tag after the slash is your main tag:

    `#0a84ff/demo`

If Taskido can identify the first tag as a hex-color, your tag get this as custom var(--tag-color) and var(--tag-background). The hex-color isn't visible on the displayed tag itself because it will be replaced.

The tag-autocomplete functionality inside Obsidian makes it possible to quickly find and re-use an existing tag without typing the hex-color first. This is realy cool and I hope the Obsidian founders will implement this in future.

<img width="183" alt="Bildschirm­foto 2023-01-02 um 11 50 05" src="https://user-images.githubusercontent.com/59178587/210222128-f892d87a-7a2b-4553-a8a6-b5d3d4dd3b51.png">

<img width="311" alt="Bildschirm­foto 2023-01-07 um 09 02 03" src="https://user-images.githubusercontent.com/59178587/211140582-ba3c79d4-7504-42da-ab4b-1886c2c112c0.png">

**Small Color Palette**
```
#ff443a/red #ff9d0a/orange #ffd60a/yellow #30d158/green #66d4cf/mint #40c8e0/teal #64d3ff/cyan #0a84ff/blue #5e5ce6/indigo #bf5af2/purple #ff375f/pink #ac8f68/brown
```

---

## Filter
A small separation give focus on today. Three info boxes (To Do, Overdue, Unplanned
) give you all necessary informations to do your best on today. By clicking on each box, your selected tasks get filtered. By clicking on the "Today" header you can also hide all other days from timeline.

<img width="358" alt="Bildschirm­foto 2023-01-02 um 12 04 05" src="https://user-images.githubusercontent.com/59178587/210223039-094b6586-fdb4-4628-b9f7-863034ec2b33.png">


---

## Quick entry panel

<img width="462" alt="Bildschirm­foto 2023-01-12 um 20 45 52" src="https://user-images.githubusercontent.com/59178587/212165875-a1af22e7-ff74-4267-a802-da64da541160.png">

Quick entry panel to write new tasks and push directly into custom note file. All currently used notes with active tasks were listed in a select box on top of the quick entry panel. The todays daily note is pinned to that list too, even if this file doesn't exist at that moment. If you push a task to that file, the file will be created at that moment. In order to simplify the recording of tasks, some autotext shortcuts have been programmed. The following text snippets will be replaced automatically to Task Plugin syntax:

### Symbol snippets
```
due > 📅
start > 🛫
scheduled > ⏳
done > ✅
high > ⏫
medium > 🔼
low > 🔽
repeat > 🔁
recurring > 🔁
```

### Date snippets

To get yesterday, today, or tomorrow, simply type...
```
today
tomorrow
yesterday
```

If you would like to get the date of the next upcoming weekday by name...
```
monday
tuesday
wednesday
thursday
friday
saturday
sunday
```

Relative dates in the below format can also be converted into YYYY-MM-DD format...
```
in X days/weeks/month/years

for example:

in 3 weeks
or
in 1 year
```

---
