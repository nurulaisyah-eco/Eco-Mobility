/* =========================================================
   EduKreasi Interactivity Script
   Semua tombol & elemen dibuat interaktif
   ========================================================= */

/* -------------------------------
   GLOBAL STATE
--------------------------------- */
const STORAGE_KEY = "edukreasi_progress";
let progressData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

/* -------------------------------
   UTILITIES
--------------------------------- */
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
}

function showToast(message, type = "info") {
  // type: info, success, error
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow text-white z-50 animate-fadeIn " +
    (type === "success"
      ? "bg-teal-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-gray-800");
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("animate-fadeOut");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* -------------------------------
   MATERI - SIMPAN & BUKA
--------------------------------- */
function addToProgress(title) {
  if (!progressData.includes(title)) {
    progressData.push(title);
    saveProgress();
    showToast(`${title} disimpan ke progres Anda.`, "success");
  } else {
    showToast(`${title} sudah ada di progres.`, "info");
  }
}

// Modal untuk tombol Buka
const modal = document.createElement("div");
modal.className =
  "fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50";
modal.innerHTML = `
  <div class="bg-white rounded-lg max-w-lg w-full p-6 relative shadow-lg">
    <button id="modalClose" class="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
      <i class="fa-solid fa-times"></i>
    </button>
    <h3 id="modalTitle" class="text-xl font-bold mb-2">Judul Materi</h3>
    <p id="modalContent" class="text-sm text-slate-600">
      Konten materi akan ditampilkan di sini.
    </p>
  </div>
`;
document.body.appendChild(modal);

function openMaterial(title) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById(
    "modalContent"
  ).innerText = `Ini adalah materi "${title}". Anda bisa menambahkan konten dinamis di sini.`;
  modal.classList.remove("hidden");
}

document.getElementById("modalClose").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Event untuk tombol "Buka"
document.querySelectorAll("#materi article button:first-child").forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = btn.closest("article").querySelector("h3").innerText;
    openMaterial(title);
  });
});

/* -------------------------------
   CHART - INFOGRAFIS
--------------------------------- */
const chartData = [
  { label: "Sekolah", value: 75 },
  { label: "Kursus", value: 45 },
  { label: "Mandiri", value: 60 },
  { label: "Komunitas", value: 30 },
];

function drawChart() {
  const svg = document.getElementById("chart");
  const labelsWrap = document.getElementById("labels");
  svg.innerHTML = "";
  labelsWrap.innerHTML = "";
  const max = Math.max(...chartData.map((d) => d.value)) || 100;
  const pad = 10;
  const w = 100,
    h = 100;
  const colW = (w - pad * 2) / chartData.length;

  chartData.forEach((d, i) => {
    const x = pad + i * colW + colW * 0.15;
    const barW = colW * 0.7;
    const barH = (d.value / max) * (h - 20);
    const y = h - pad - barH;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barW);
    rect.setAttribute("height", barH);
    rect.setAttribute("rx", 2);
    rect.setAttribute("fill", i % 2 === 0 ? "#06b6d4" : "#7c3aed");
    rect.style.cursor = "pointer";
    rect.addEventListener("click", () => {
      showToast(`${d.label}: ${d.value}%`, "info");
      highlightBar(i);
    });
    svg.appendChild(rect);

    const labelBtn = document.createElement("button");
    labelBtn.className = "px-2 py-1 rounded text-xs bg-white border";
    labelBtn.innerText = d.label;
    labelBtn.addEventListener("click", () => highlightBar(i));
    labelsWrap.appendChild(labelBtn);
  });
}

function highlightBar(index) {
  document.querySelectorAll("#chart rect").forEach((bar, i) => {
    if (i === index) {
      bar.setAttribute("stroke", "rgba(0,0,0,0.08)");
      bar.setAttribute("stroke-width", "2");
    } else {
      bar.removeAttribute("stroke");
    }
  });
}

drawChart();

/* -------------------------------
   EKSPOR SVG & CETAK
--------------------------------- */
function exportSVG() {
  const svg = document.getElementById("chart");
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "infografis.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Infografis diekspor sebagai SVG.", "success");
}

function printPage() {
  window.print();
  showToast("Membuka dialog cetak...", "info");
}

document
  .querySelector("#download button:first-child")
  .addEventListener("click", exportSVG);
document
  .querySelector("#download button:last-child")
  .addEventListener("click", printPage);

/* -------------------------------
   MENU MOBILE TOGGLE
--------------------------------- */
document.getElementById("menuBtn").addEventListener("click", () => {
  const nav = document.querySelector("header nav");
  const expanded = nav.style.display === "flex";
  nav.style.display = expanded ? "none" : "flex";
  document
    .getElementById("menuBtn")
    .setAttribute("aria-expanded", String(!expanded));
});

/* -------------------------------
   SEARCH FILTER
--------------------------------- */
document.getElementById("search").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  document.querySelectorAll("#materi article").forEach((card) => {
    const title = card.querySelector("h3").innerText.toLowerCase();
    card.style.display = title.includes(keyword) ? "" : "none";
  });
});

/* -------------------------------
   SCROLLSPY NAVIGATION
--------------------------------- */
const sections = document.querySelectorAll("main section[id]");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 60;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });
  document
    .querySelectorAll("header nav a")
    .forEach((a) =>
      a.classList.toggle("text-teal-500", a.getAttribute("href") === "#" + current)
    );
});

/* -------------------------------
   ACCESSIBILITY SHORTCUTS
--------------------------------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "1") {
    document
      .querySelectorAll("article")[0]
      ?.scrollIntoView({ behavior: "smooth" });
  }
});

/* -------------------------------
   LOTTIE FALLBACK
--------------------------------- */
document.querySelectorAll("lottie-player").forEach((player) => {
  player.addEventListener("error", () => {
    const img = document.createElement("img");
    img.src =
      "https://via.placeholder.com/800x450.png?text=Animasi+Tidak+Dapat+Dimuat";
    player.replaceWith(img);
  });
});

/* -------------------------------
   TOAST ANIMATION STYLES
--------------------------------- */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn { from {opacity:0; transform: translateY(10px);} to {opacity:1; transform: translateY(0);} }
@keyframes fadeOut { from {opacity:1;} to {opacity:0;} }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
.animate-fadeOut { animation: fadeOut 0.3s ease-in forwards; }
`;
document.head.appendChild(style);
