// 🔧 app.js (Updated JavaScript for search, filters, UI fixes)

import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// DOM Elements
const form = document.getElementById("student-form");
const studentList = document.getElementById("student-list");
const searchBar = document.getElementById("search-bar");
const noResults = document.getElementById("no-results");
const filterClub = document.getElementById("filter-club");
const filterHousing = document.getElementById("filter-housing");
const filterYear = document.getElementById("filter-year");
const filterInternship = document.getElementById("filter-internship");
const filterOffcampus = document.getElementById("filter-offcampus");
const clearFilters = document.getElementById("clear-filters");
const searchBtn = document.getElementById("search-button");

// Options
const clubOptions = [
  "ACM Whitman Student Chapter", "All Club Sports", "Badminton Club", "Climate Justice Coalition",
  "Cooking and Baking Club", "Folk Music and Dance Club", "GDSC", "KnitWhits", "Mycology Club",
  "Photography Club", "Pre-Health Society", "SOS Volunteer Club", "Tabletop Games", "Tap Dance Club",
  "The Coloring Cascade", "Whitman Car Club", "Whitman College Book Club", "Whitman College Model United Nations",
  "Whitman College Pre-Law Society", "Whitman College Robotics and Optics Club",
  "Whitman College Student Chapter of the American Chemical Society", "Whitman Equestrian Club",
  "Whitman Outdoor Wellness", "Whitman Sand Volleyball Club", "Whitman Students Dracula Club",
  "Whitman Video Game Club", "Whitman Votes"
];

const housingOptions = [
  "Anderson Hall", "Douglas Hall", "Jewett Hall", "Lyman Hall", "Prentiss Hall", "Stanton Hall",
  "Chinese Language and Culture House", "Community Service Co-op", "Das Deutsche Haus", "Environmental House",
  "Fine Arts House", "La Maison Française", "La Casa Hispana", "Lavender House", "Multicultural House",
  "Spirituality House", "Tekisuijuku", "Wellness House", "Writing House"
];

function populateOptions(selectId, options) {
  const select = document.getElementById(selectId);
  options.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

populateOptions("club", clubOptions);
populateOptions("housing", housingOptions);
populateOptions("filter-club", clubOptions);
populateOptions("filter-housing", housingOptions);

// Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const major = document.getElementById("major").value;
  const year = document.getElementById("year").value;
  const email = document.getElementById("email").value;
  const housing = document.getElementById("housing").value;
  const club = document.getElementById("club").value;
  const offcampus = document.getElementById("offcampus").value;
  const internship = document.getElementById("internship").value;
  const selectedTags = Array.from(document.querySelectorAll(".tag:checked")).map(tag => tag.value);

  try {
    await addDoc(collection(db, "students"), {
      name, major, year, email, housing, club, offcampus, internship, tags: selectedTags
    });
    alert("Student profile added!");
    form.reset();
  } catch (err) {
    console.error("Error adding document: ", err);
  }
});

let allStudents = [];
onSnapshot(collection(db, "students"), (snapshot) => {
  allStudents = [];
  snapshot.forEach((doc) => {
    allStudents.push({ id: doc.id, ...doc.data() });
  });
  renderStudents(allStudents);
});

function renderStudents(students) {
  studentList.innerHTML = "";
  noResults.classList.add("hidden");

  if (students.length === 0) {
    noResults.classList.remove("hidden");
    return;
  }

  students.forEach((student) => {
    const tagsHTML = student.tags?.length
      ? student.tags.map(tag => `<span class="tag ${tag.toLowerCase().replace(/ /g, '-')}">${tag}</span>`).join(" ")
      : "<em>No tags</em>";

    const div = document.createElement("div");
    div.classList.add("student-card");
    div.innerHTML = `
      <h3>${student.name}</h3>
      <p><strong>Major:</strong> ${student.major}</p>
      <p><strong>Year:</strong> ${student.year}</p>
      <p><strong>Housing:</strong> ${student.housing}</p>
      <p><strong>Club/Sport:</strong> ${student.club}</p>
      <p><strong>Off-Campus Study:</strong> ${student.offcampus}</p>
      <p><strong>Internship Grant:</strong> ${student.internship}</p>
      <p><strong>Tags:</strong> ${tagsHTML}</p>
      <a href="mailto:${student.email}" class="connect-btn">📧 Connect</a>
    `;
    studentList.appendChild(div);
  });
}

function applyFilters() {
    let keyword = searchBar.value.trim().toLowerCase();
    let filtered = [...allStudents];
  
    if (keyword) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(keyword) ||
        s.major?.toLowerCase().includes(keyword) ||
        s.year?.toLowerCase().includes(keyword) ||
        s.housing?.toLowerCase().includes(keyword) ||
        s.club?.toLowerCase().includes(keyword) ||
        s.tags?.some(tag => tag.toLowerCase().includes(keyword))
      );
    }
  
    if (filterClub.value) filtered = filtered.filter(s => s.club === filterClub.value);
    if (filterHousing.value) filtered = filtered.filter(s => s.housing === filterHousing.value);
    if (filterYear.value) filtered = filtered.filter(s => s.year === filterYear.value);
    if (filterInternship.value) filtered = filtered.filter(s => s.internship === filterInternship.value);
    if (filterOffcampus.value) filtered = filtered.filter(s => s.offcampus === filterOffcampus.value);
  
    renderStudents(filtered);
  }
  


[searchBar, filterClub, filterHousing, filterYear, filterInternship, filterOffcampus].forEach(input => {
  input.addEventListener("input", applyFilters);
});

searchBtn?.addEventListener("click", applyFilters);

clearFilters.addEventListener("click", () => {
  searchBar.value = "";
  filterClub.value = "";
  filterHousing.value = "";
  filterYear.value = "";
  filterInternship.value = "";
  filterOffcampus.value = "";
  renderStudents(allStudents);
});
