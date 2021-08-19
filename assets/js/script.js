var tasks = {};

// audit task
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find('span').text().trim();
  // to ensure element is getting to the function
  //console.log(date);

  // convert to moment object at 5:00pm
  var time = moment(date, 'L').set('hour', 17);
  // this should print out an object for the value of the date variable
  //console.log(time);

  // remove any old classes from element
  $(taskEl).removeClass('list-group-item-warning list-group-item-danger');

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass('list-group-item-danger');
  }
  else if (Math.abs(moment().diff(time, 'days')) <=2) {
    $(taskEl).addClass('list-group-item-warning');
  }
};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// making lists sortable
$('.card .list-group').sortable( {
  connectWith: $('.card .list-group'),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    //console.log("activate", this);
  },
  deactivate: function(event) {
    //console.log("deactivate", this);
  },
  over: function(event) {
    //console.log("over", event.target);
  },
  out: function(event) {
    //console.log("out", event.target);
  },
  update: function(event) {
  // array to store the task date in
    var tempArr =[];
  // loop over current set of children in sortable list
    $(this)
    .children()
    .each(function() {
      tempArr.push ({
      text: $(this)
      .find('p')
      .text()
      .trim(),
      date: $(this)
      .find('span')
      .text()
      .trim(),
        });
    });
  // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
  
  // update array on task object and save
    tasks[arrName]= tempArr;
    saveTasks();
   // console.log(tempArr);
  },
  stop: function(event) {
    $(this).removeClass('dropover');
  }
});

// ability to delete task by task
$('#trash').droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();
    //console.log("drop");
  },
  over: function(event, ui) {
   // console.log("over");
  },
  out: function(event, ui) {
   // console.log("out");
  }
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// task text was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
  .text()
  .trim();
  
  // create new input element
  var dateInput = $('<input>').attr('type', 'text').addClass('form-control').val(date);

  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("change", "input[type='text]", function() {
  // get current value of textarea
  var text = $(this).val();

  // get status type and postition in the list
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace(".list-group-item")
  .index();

  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // create new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);
  $(this).replaceWith(dateInput);

  //automatically bring up the calendar
  dateInput.trigger('focus');
});

// value of due date change handler
$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
    $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
});

// added datepicker
$('#modalDueDate').datepicker({
  minDate: 1
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


