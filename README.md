# Taskido: Obsidian-Tasks-Timeline
#### Your probably want [Obsidian-Task-Timeline](https://github.com/702573N/Obsidian-Tasks-Timeline) this is fork has been tweaked to fit my personal needs.

## About
This fork has 2 main goals:

1. Add greater support for [Obsidian Kanban](https://github.com/mgmeyers/obsidian-kanban)
2. Make things more colorful

---

## Kanban Support
This fork adds support for Kanban date format: `@{2023-12-25}` as well as cleaning up Kanban cards that appear on the timeline. Previously that time would display on the timeline as "@@{1:00 PM}", this has been tweaked to simply display as "at 1:00PM".

---

## Relative Time
Another minor change with this branch was how relative dates are calculated. Instead of using moment.js to calculate the difference in time, this has been hardcoded as such:

```javascript
function getRelative(someDate) {
	let date = moment(someDate);
	return date.calendar(null,{
    lastDay : '[Yesterday]',
    sameDay : '[Today]',
    nextDay : '[Tomorrow]',
    lastWeek : '[last] dddd',
    nextWeek : 'dddd',
    sameElse : 'L'
	});
};
```

This is simply because I did not like how the calculations were displaying on the timeline. For example, on Monday, a task set for Friday without a set time would show "in 3 days". Another example would be 6:00PM on a Thursday showing a task for Friday as "in 6 hours" when there has been no set time for the deadline. I would much prefer it simply show the day or date that the task is due. This is a little redundant, I know, as the tasks appear on the timeline. I am simply stating why I decided to make this change.

---

## Task colors
Tasks can be displayed on the timeline in color. This matches the color property of the note file that the task is from. In order for this to work you need to add the color property to the note's frontmatter. If you are running the latest catalyst build you can simply add this the properties field using `control/cmd + ;`. For the public release you will need to add the following to the first line in your note:

>[!note] Note
>The hex value needs to be wrapped in quotation marks to work.

```
---
color: "#74c7ec"
---
```

---

## Tag colors
On the roadmap is more efficient way to extract the tag metadata from a kanban board and display them on the timeline. This is a WIP.
