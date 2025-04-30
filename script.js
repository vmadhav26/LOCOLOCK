// Variables for user authentication
let users = [];
let currentUser = null;

// DOM Elements
const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");
const mainPortal = document.getElementById("mainPortal");
const showPasswordCheckbox = document.getElementById("showPassword");

const locationReminderSection = document.getElementById("locationReminder");
const taskManagementSection = document.getElementById("taskManagement");
const preferredList = document.getElementById("preferredList");
const taskResponses = document.getElementById("taskResponses");

let locationMap, taskMap;
let locationMarker, taskMarker;
let locationGeofence, taskGeofence;

// Authentication
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("signupBtn").addEventListener("click", signup);
document.getElementById("goToSignupLink").addEventListener("click", () => switchSection(signupSection));
document.getElementById("goToLoginLink").addEventListener("click", () => switchSection(loginSection));
showPasswordCheckbox.addEventListener("change", togglePasswordVisibility);

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        alert("Login successful!");
        showMainPortal();
    } else {
        alert("Invalid email or password.");
    }
}

function signup() {
    const email = document.getElementById("signupEmail").value;
    const phone = document.getElementById("signupPhone").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (users.some(u => u.email === email)) {
        alert("Email already registered.");
        return;
    }

    users.push({ email, phone, password });
    alert("Signup successful! Please login.");
    switchSection(loginSection);
}

function switchSection(sectionToShow) {
    loginSection.style.display = "none";
    signupSection.style.display = "none";
    sectionToShow.style.display = "block";
}

function showMainPortal() {
    document.getElementById("authSection").style.display = "none";
    mainPortal.style.display = "block";
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const passwordField = document.getElementById("loginPassword");
    passwordField.type = showPasswordCheckbox.checked ? "text" : "password";
}

// Feature Selection
document.getElementById("locationReminderBtn").addEventListener("click", () => {
    locationReminderSection.style.display = "block";
    taskManagementSection.style.display = "none";
});

document.getElementById("taskManagementBtn").addEventListener("click", () => {
    taskManagementSection.style.display = "block";
    locationReminderSection.style.display = "none";
});

// Google Maps Initialization
function initMap() {
    const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // Default location: San Francisco

    // Location Reminder Map
    locationMap = new google.maps.Map(document.getElementById("mapLocation"), {
        center: defaultLocation,
        zoom: 12,
    });

    locationMap.addListener("click", (e) => {
        setMarker(locationMap, e.latLng, "location");
    });

    // Task Management Map
    taskMap = new google.maps.Map(document.getElementById("mapTask"), {
        center: defaultLocation,
        zoom: 12,
    });

    taskMap.addListener("click", (e) => {
        setMarker(taskMap, e.latLng, "task");
    });
}

function setMarker(map, position, type) {
    if (type === "location") {
        if (locationMarker) locationMarker.setMap(null);
        locationMarker = new google.maps.Marker({ position, map });
    } else if (type === "task") {
        if (taskMarker) taskMarker.setMap(null);
        taskMarker = new google.maps.Marker({ position, map });
    }
}

// Location Reminder
document.getElementById("setLocationReminderBtn").addEventListener("click", () => {
    if (locationMarker) {
        locationGeofence = new google.maps.Circle({
            center: locationMarker.getPosition(),
            radius: 500, // 500 meters
            map: locationMap,
            fillColor: "#FF0000",
            fillOpacity: 0.3,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
        });
        alert("Location-based reminder set!");
    } else {
        alert("Please select a location on the map.");
    }
});

// Task Management
document.getElementById("addPersonBtn").addEventListener("click", () => {
    const person = document.getElementById("preferredPerson").value;
    if (person) {
        const listItem = document.createElement("li");
        listItem.textContent = person;
        preferredList.appendChild(listItem);
        document.getElementById("preferredPerson").value = "";
    }
});

document.getElementById("assignTaskBtn").addEventListener("click", () => {
    if (taskMarker) {
        const taskDescription = document.getElementById("taskDescription").value;
        const personItems = preferredList.getElementsByTagName("li");

        if (!taskDescription) {
            alert("Please enter a task description.");
            return;
        }

        if (personItems.length === 0) {
            alert("Please add at least one person to the preferred list.");
            return;
        }

        taskResponses.innerHTML = ""; // Clear previous responses

        Array.from(personItems).forEach((personItem) => {
            const responseDiv = document.createElement("div");
            responseDiv.className = "response";
            responseDiv.innerHTML = `
                <span>${personItem.textContent}</span>
                <button class="acceptBtn">Accept</button>
                <button class="denyBtn">Deny</button>
            `;
            taskResponses.appendChild(responseDiv);
        });

        alert("Task assigned! Waiting for responses.");
    } else {
        alert("Please set a task location on the map.");
    }
});

// Task Response Handling
taskResponses.addEventListener("click", (e) => {
    if (e.target.classList.contains("acceptBtn")) {
        e.target.parentElement.innerHTML = `<span>${e.target.parentElement.children[0].textContent} - Task Accepted</span>`;
    } else if (e.target.classList.contains("denyBtn")) {
        e.target.parentElement.innerHTML = `<span>${e.target.parentElement.children[0].textContent} - Task Denied</span>`;
    }
});

// Initialize the map on window load
window.onload = initMap;
