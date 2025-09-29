let formMode = "search"; // tracks current mode of the form

// initialize class form when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing class page...");
  try {
    setFormForSearch();
    initClassDropdown();
    initInstructorDropdown();
    addClassDropdownListener();
    console.log("Class page initialization complete");
  } catch (err) {
    console.error("Error during initialization:", err);
  }
});

// search button - switch to search mode
document.getElementById("searchBtn").addEventListener("click", async () => {
  clearClassForm();
  setFormForSearch();
  initClassDropdown();
});

// add button - switch to add mode
document.getElementById("addBtn").addEventListener("click", async () => {
  console.log("Add New button clicked!");
  setFormForAdd();
  console.log("Form mode set to:", formMode);
});

// save button - create new class
document.getElementById("saveBtn").addEventListener("click", async () => {
  console.log("Save button clicked, formMode:", formMode);
  if (formMode === "add") {
    try {
      // get next class id
      console.log("Fetching next class ID...");
      const res = await fetch("/api/class/getNextId");
      const { nextId } = await res.json();
      console.log("Got next class ID:", nextId);
      document.getElementById("classIdText").value = nextId;
      document.getElementById("classIdHidden").value = nextId;

      const form = document.getElementById("classForm");

      // get class type selection
      const generalRadio = form.querySelector('input[name="classType"][value="General"]');
      const specialRadio = form.querySelector('input[name="classType"][value="Special"]');
      const classType = generalRadio.checked ? "General" : "Special";

      // prepare class data
      const classData = {
        classId: nextId,
        className: form.className.value.trim(),
        instructorId: form.instructorIdSelect.value.trim(),
        classType: classType,
        description: form.description.value.trim(),
        daytime: [{
          day: form.day.value,
          time: form.time.value,
          duration: parseInt(form.duration.value) || 60
        }],
        payRate: parseFloat(form.payRate.value) || 45
      };

      // validation - check required fields
      if (!classData.className || !classData.instructorId || !classData.daytime[0].day || !classData.daytime[0].time) {
        alert("Please fill in all required fields: Class Name, Instructor, Day, Time");
        return;
      }

      // check for schedule conflicts
      const conflictRes = await checkScheduleConflict(classData.daytime[0].day, classData.daytime[0].time, classData.daytime[0].duration);
      if (conflictRes.hasConflict) {
        if (!confirm(`Schedule conflict detected: ${conflictRes.message}. Continue anyway?`)) {
          return;
        }
      }

      console.log("Class data:", classData);
      
      // save class to database
      const addRes = await fetch("/api/class/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      });

      const result = await addRes.json();
      if (!addRes.ok)
        throw new Error(result.message || "Failed to add class");

      alert(`Class ${classData.classId} added successfully! New class "${classData.className}" scheduled.`);
      form.reset();
      setFormForSearch(); // return to search mode
    } catch (err) {
      console.error("Error in save operation:", err);
      alert("Error: " + err.message);
    }
  }
});

// delete button - remove class
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const select = document.getElementById("classIdSelect");
  const classId = select.value;

  if (!classId) {
    alert("Please select a class to delete");
    return;
  }

  if (!confirm(`Are you sure you want to delete class ${classId}?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/class/deleteClass?classId=${classId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Class delete failed");
    }

    alert(`Class ${classId} successfully deleted`);
    clearClassForm();
    initClassDropdown();
  } catch (err) {
    alert("Error deleting class: " + err.message);
  }
});

// populate class dropdown for search
async function initClassDropdown() {
  const select = document.getElementById("classIdSelect");
  try {
    const response = await fetch("/api/class/getAllClasses");
    const classes = await response.json();

    // clear existing options
    select.innerHTML = '<option value="">-- Choose a class to view --</option>';

    classes.forEach((classItem) => {
      const option = document.createElement("option");
      option.value = classItem.classId;
      option.textContent = `${classItem.classId}: ${classItem.className}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load class IDs: ", err);
    alert("Error loading classes: " + err.message);
  }
}

// populate instructor dropdown
async function initInstructorDropdown() {
  const select = document.getElementById("instructorIdSelect");
  try {
    const response = await fetch("/api/instructor/getInstructorIds");
    const instructors = await response.json();

    // clear existing options
    select.innerHTML = '<option value="">-- Choose an instructor --</option>';

    instructors.forEach((instructor) => {
      const option = document.createElement("option");
      option.value = instructor.instructorId;
      option.textContent = `${instructor.instructorId}: ${instructor.firstName} ${instructor.lastName}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load instructor IDs: ", err);
    alert("Error loading instructors: " + err.message);
  }
}

// handle class selection for search
async function addClassDropdownListener() {
  const form = document.getElementById("classForm");
  const select = document.getElementById("classIdSelect");
  select.addEventListener("change", async () => {
    const classId = select.value;
    if (!classId) return;

    console.log("Loading class:", classId);
    try {
      const res = await fetch(`/api/class/getClass?classId=${classId}`);
      if (!res.ok) throw new Error("Class search failed");

      const data = await res.json();
      console.log("Class data:", data);
      if (!data || Object.keys(data).length === 0) {
        alert("No class found");
        return;
      }

      // fill form with class data
      form.className.value = data.className || "";
      form.instructorIdSelect.value = data.instructorId || "";
      form.description.value = data.description || "";
      form.payRate.value = data.payRate || "";

      // set class type radio button
      const generalRadio = form.querySelector('input[name="classType"][value="General"]');
      const specialRadio = form.querySelector('input[name="classType"][value="Special"]');
      if (data.classType === "General") {
        generalRadio.checked = true;
      } else {
        specialRadio.checked = true;
      }

      // set schedule info
      if (data.daytime && data.daytime.length > 0) {
        form.day.value = data.daytime[0].day || "";
        form.time.value = data.daytime[0].time || "";
        form.duration.value = data.daytime[0].duration || 60;
      }
    } catch (err) {
      alert(`Error searching class: ${classId} - ${err.message}`);
    }
  });
}

// check for schedule conflicts
async function checkScheduleConflict(day, time, duration) {
  try {
    const response = await fetch("/api/class/getAllClasses");
    const classes = await response.json();
    
    // convert time to minutes for easier comparison
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + duration;
    
    for (const existingClass of classes) {
      if (existingClass.daytime && existingClass.daytime.length > 0) {
        const schedule = existingClass.daytime[0];
        if (schedule.day === day) {
          const [existingHours, existingMinutes] = schedule.time.split(':').map(Number);
          const existingStart = existingHours * 60 + existingMinutes;
          const existingEnd = existingStart + (schedule.duration || 60);
          
          // check for time overlap
          if ((startTime < existingEnd) && (endTime > existingStart)) {
            return {
              hasConflict: true,
              message: `Conflicts with ${existingClass.className} (${schedule.day} ${schedule.time})`
            };
          }
        }
      }
    }
    
    return { hasConflict: false };
  } catch (err) {
    console.error("Error checking schedule conflict:", err);
    return { hasConflict: false }; // assume no conflict if check fails
  }
}

// clear the class form
function clearClassForm() {
  document.getElementById("classForm").reset();
  document.getElementById("classIdSelect").innerHTML = '<option value="">-- Choose a class to view --</option>';
}

// set form for search mode
function setFormForSearch() {
  formMode = "search";
  // show class dropdown for search
  document.getElementById("classIdLabel").style.display = "block";
  document.getElementById("classIdTextLabel").style.display = "none";
  document.getElementById("classIdText").style.display = "none";
  document.getElementById("classIdText").value = "";
  document.getElementById("classForm").reset();
}

// set form for add mode  
function setFormForAdd() {
  console.log("setFormForAdd() called");
  formMode = "add";
  console.log("Form mode changed to:", formMode);
  
  // hide class dropdown, show text input
  document.getElementById("classIdLabel").style.display = "none";
  document.getElementById("classIdTextLabel").style.display = "block";
  document.getElementById("classIdText").style.display = "block";
  document.getElementById("classIdText").value = "";
  document.getElementById("classForm").reset();
  console.log("Form elements updated for add mode");
}
