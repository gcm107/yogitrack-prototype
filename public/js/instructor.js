let formMode = "search"; // Tracks the current mode of the form
let originalData = {}; // Store original data for comparison
let hasChanges = false; // Track if form has unsaved changes

// Fetch all instructor IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {

  // adding debug output for form submission.
  console.log("DOM loaded, initializing instructor page...");
  try {
    setFormForSearch();
    initInstructorDropdown();
    addInstructorDropdownListener();

    // debug output
    console.log("Instructor page initialization complete");
  } catch (err) {
    console.error("Error during initialization:", err);
  }
});

// SEARCH
document.getElementById("searchBtn").addEventListener("click", async () => {
  clearInstructorForm();
  setFormForSearch();
  initInstructorDropdown();
});


//ADD
document.getElementById("addBtn").addEventListener("click", async () => {
  console.log("Add New button clicked!");
  setFormForAdd();
  console.log("Form mode set to:", formMode);
});

//SAVE
document.getElementById("saveBtn").addEventListener("click", async () => {
  // debugging why my form isnt working but the post from terminal works.
  console.log("Save button clicked, formMode:", formMode);
  if (formMode === "add") {
    try {
      //Get max ID for instructorId
      console.log("Fetching next ID...");
      const res = await fetch("/api/instructor/getNextId");
      const {nextId } = await res.json();
      console.log("Got next ID:", nextId);
      document.getElementById("instructorIdText").value = nextId;
      document.getElementById("instructorIdHidden").value = nextId;

    const form = document.getElementById("instructorForm");

      // get preferred contact method
      const phoneRadio = form.querySelector('input[name="pref"][value="phone"]');
      const emailRadio = form.querySelector('input[name="pref"][value="email"]');
      const preferredContact = phoneRadio.checked ? "phone" : "email"; // was undefined.
      
      // name channge to use camelCase
      const instructorData = {
        instructorId: nextId,
        firstName: form.firstName.value.trim(), // changed frm firstname to firstName
        lastName: form.lastName.value.trim(),
        address: form.address.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        preferredContact: preferredContact,
      };

      // validation - check required fields
      if (!instructorData.firstName || !instructorData.lastName || !instructorData.email || !instructorData.phone) {
        alert("Please fill in all required fields: First Name, Last Name, Email, Phone");
        return;
      }

      // validation -check if instructor name already exists
      const checkRes = await fetch(`/api/instructor/search?firstName=${instructorData.firstName}&lastName=${instructorData.lastName}`);
      if (checkRes.ok) {
        const existingData = await checkRes.json();
        if (existingData && !confirm(`Instructor "${instructorData.firstName} ${instructorData.lastName}" may already exist. Continue anyway?`)) {
          return;
        }
      }

      console.log("Instructor data:", instructorData);
      
      const addRes = await fetch("/api/instructor/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instructorData),
      });

      const result = await addRes.json();
      if (!addRes.ok)
        throw new Error(result.message || "Failed to add instructor");

      alert(`Instructor ${instructorData.instructorId} added successfully!`);
      form.reset();
      setFormForSearch(); // Return to search mode after successful add
    } catch (err) {
      console.error("Error in save operation:", err);
      alert("Error: " + err.message);
    }
  }
});

//DELETE
document.getElementById("deleteBtn").addEventListener("click", async () => {
  var select = document.getElementById("instructorIdSelect");
  var instructorId = select.value.split(":")[0];

  const response = await fetch(
    `/api/instructor/deleteInstructor?instructorId=${instructorId}`, {
      method: "DELETE"
    });

  if (!response.ok) {
    throw new Error("Instructor delete failed");
  } else {
    alert(`Instructor with id ${instructorId} successfully deleted`);
    clearInstructorForm();
    initInstructorDropdown();
    
  }
});

async function initInstructorDropdown() {
  const select = document.getElementById("instructorIdSelect");
  try {
    const response = await fetch("/api/instructor/getInstructorIds");
    const instructorIds = await response.json();

    instructorIds.forEach((instr) => {
      const option = document.createElement("option");
      option.value = instr.instructorId;

      // name changed to camelCase
      option.textContent = `${instr.instructorId}:${instr.firstName} ${instr.lastName}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load instructor IDs: ", err);
    alert("Error loading instructors: " + err.message);
  }
}

async function addInstructorDropdownListener() {
  const form = document.getElementById("instructorForm");
  const select = document.getElementById("instructorIdSelect");
  select.addEventListener("change", async () => {
    var instructorId = select.value.split(":")[0];
    console.log(instructorId);
    try {
      const res = await fetch(
        `/api/instructor/getInstructor?instructorId=${instructorId}`
      );
      if (!res.ok) throw new Error("Instructor search failed");

      const data = await res.json();
      console.log(data);
      if (!data || Object.keys(data).length === 0) {
        alert("No instructor found");
        return;
      }

      //Fill form with data, name changed to camelCase
      form.firstName.value = data.firstName || "";
      form.lastName.value = data.lastName || "";
      form.address.value = data.address || "";
      form.phone.value = data.phone || "";
      form.email.value = data.email || "";

      // set preferred contact radio button
      const phoneRadio = form.querySelector('input[name="pref"][value="phone"]');
      const emailRadio = form.querySelector('input[name="pref"][value="email"]');
      if (data.preferredContact === "phone") {
        phoneRadio.checked = true;
      } else {
        emailRadio.checked = true;
      }
    } catch (err) {
      alert(`Error searching package: ${instructorId} - ${err.message}`);
    }
  });
}

function clearInstructorForm() {
  document.getElementById("instructorForm").reset(); // Clears all inputs including text, textarea, and unchecks radio buttons
  document.getElementById("instructorIdSelect").innerHTML = '<option value="">-- Choose an instructor to view --</option>';
}

function setFormForSearch() {
  formMode = "search";
  //toggle back to search mode
  document.getElementById("instructorIdLabel").style.display = "block"; // Show dropdown
  document.getElementById("instructorIdTextLabel").style.display = "none"; // Hide text input
  document.getElementById("instructorIdText").value = "";
  document.getElementById("instructorIdText").style.display = "none";
  document.getElementById("instructorForm").reset();
}

function setFormForAdd() {
  console.log("setFormForAdd() called");
  formMode = "add";
  console.log("Form mode changed to:", formMode);
  
  //hiding the instructor id drop down and label
  document.getElementById("instructorIdLabel").style.display = "none";
  document.getElementById("instructorIdTextLabel").style.display = "block";
  document.getElementById("instructorIdText").style.display = "block";
  document.getElementById("instructorIdText").value = "";
  document.getElementById("instructorForm").reset();
  console.log("Form elements updated for add mode");
}
