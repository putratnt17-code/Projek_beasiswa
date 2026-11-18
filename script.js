const STORAGE_KEY = "dataMahasiswaBeasiswa";
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const gpaInput = document.getElementById("gpa");
const otherScholarshipInput = document.getElementById("otherScholarship");
const winnerInput = document.getElementById("winner");
const tableBody = document.getElementById("studentTable");

let students = loadStudents();

function loadStudents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function calculateEligibility(gpa, receivesOtherScholarship, isNationalWinner) {
  // P = IPK minimal 3,50; Q = tidak menerima beasiswa lain; R = juara nasional.
  const P = gpa >= 3.5 ? 1 : 0;
  const Q = receivesOtherScholarship === false ? 1 : 0;
  const R = isNationalWinner === true ? 1 : 0;

  // F = (P AND Q) OR R
  const F = (P && Q) || R ? 1 : 0;
  return { P, Q, R, F };
}

function render() {
  tableBody.innerHTML = "";

  if (students.length === 0) {
    tableBody.innerHTML = '<tr class="empty-row"><td colspan="9">Belum ada data mahasiswa. Silakan tambahkan melalui formulir di atas.</td></tr>';
  } else {
    students.forEach((student, index) => {
      const row = document.createElement("tr");
      const resultClass = student.F === 1 ? "yes" : "no";
      const resultText = student.F === 1 ? "Layak" : "Tidak layak";
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHTML(student.name)}</td>
        <td>${Number(student.gpa).toFixed(2)}</td>
        <td class="center">${student.P}</td>
        <td class="center">${student.Q}</td>
        <td class="center">${student.R}</td>
        <td class="center"><strong>${student.F}</strong></td>
        <td><span class="result ${resultClass}">${resultText}</span></td>
        <td><button class="delete-btn" type="button" data-id="${student.id}" aria-label="Hapus ${escapeHTML(student.name)}">Hapus</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("eligibleCount").textContent = students.filter(s => s.F === 1).length;
  document.getElementById("notEligibleCount").textContent = students.filter(s => s.F === 0).length;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const gpa = Number(gpaInput.value);
  const receivesOtherScholarship = otherScholarshipInput.value === "yes";
  const isNationalWinner = winnerInput.value === "yes";

  if (!name) {
    alert("Nama mahasiswa harus diisi.");
    nameInput.focus();
    return;
  }
  if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
    alert("IPK harus berupa angka dari 0,00 sampai 4,00.");
    gpaInput.focus();
    return;
  }
  if (!otherScholarshipInput.value || !winnerInput.value) {
    alert("Silakan lengkapi semua kriteria.");
    return;
  }

  const result = calculateEligibility(gpa, receivesOtherScholarship, isNationalWinner);
  students.push({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name,
    gpa,
    ...result
  });

  saveStudents();
  render();
  form.reset();
  nameInput.focus();
});

tableBody.addEventListener("click", event => {
  const button = event.target.closest(".delete-btn");
  if (!button) return;
  students = students.filter(student => student.id !== button.dataset.id);
  saveStudents();
  render();
});

document.getElementById("clearAll").addEventListener("click", () => {
  if (students.length === 0) {
    alert("Belum ada data yang bisa dihapus.");
    return;
  }
  if (confirm("Yakin ingin menghapus seluruh data mahasiswa?")) {
    students = [];
    saveStudents();
    render();
  }
});

render();
