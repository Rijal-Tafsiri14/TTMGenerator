let barangList = [];
let riwayat = JSON.parse(localStorage.getItem("riwayatTTM")) || [];

// tambah barang
function tambahBarang() {
  const nama = document.getElementById("namaBarang").value;
  const qty = document.getElementById("qty").value;
  const satuan = document.getElementById("satuan").value;
  const ket = document.getElementById("keterangan").value;

  if (!nama || !qty) {
    alert("Nama barang dan Qty wajib diisi!");
    return;
  }

  barangList.push({ nama, qty, satuan, ket });
  renderTabelBarang();

  document.getElementById("namaBarang").value = "";
  document.getElementById("qty").value = "";
  document.getElementById("keterangan").value = "";
}

// render tabel sementara
function renderTabelBarang() {
  const tbody = document.querySelector("#tabel-barang tbody");
  tbody.innerHTML = "";
  barangList.forEach((b, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${b.nama}</td>
        <td>${b.qty}</td>
        <td>${b.satuan}</td>
        <td>${b.ket}</td>
        <td><button class="btn-danger" onclick="hapusBarang(${i})">Hapus</button></td>
      </tr>`;
  });
}

function hapusBarang(index) {
  barangList.splice(index, 1);
  renderTabelBarang();
}

// generate TTM
function generateTTM() {
  if (barangList.length === 0) {
    alert("Tambahkan barang terlebih dahulu!");
    return;
  }

  const divisi = document.getElementById("divisi").value;
  const notes = document.getElementById("notes").value;
  const ttmNumber = "TTM-" + Date.now();
  const date = new Date().toLocaleString();

  document.getElementById("ttm-number").innerText = ttmNumber;
  document.getElementById("print-date").innerText = date;
  document.getElementById("preview-divisi").innerText = divisi;
  document.getElementById("preview-notes").innerText = notes;

  JsBarcode("#barcode", ttmNumber, { format: "CODE128", width: 2, height: 40 });

  const tbody = document.querySelector("#preview-tabel tbody");
  tbody.innerHTML = "";
  barangList.forEach((b, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${b.nama}</td>
        <td>${b.qty}</td>
        <td>${b.satuan}</td>
        <td>${b.ket}</td>
      </tr>`;
  });

  riwayat.push({ ttmNumber, divisi, date, barangList, notes, foto: null });
  localStorage.setItem("riwayatTTM", JSON.stringify(riwayat));

  document.getElementById("preview").classList.remove("hidden");
}

function kirimTTM() {
  alert("TTM berhasil dikirim!");
  closePreview();
}

function closePreview() {
  document.getElementById("preview").classList.add("hidden");
  barangList = [];
  renderTabelBarang();
}

// tampilkan riwayat
function lihatRiwayat() {
  const tbody = document.querySelector("#tabel-riwayat tbody");
  tbody.innerHTML = "";
  riwayat.forEach((r, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${r.ttmNumber}</td>
        <td>${r.divisi}</td>
        <td>${r.date}</td>
        <td><button class="btn-primary" onclick="lihatDetail(${i})">Lihat</button></td>
        <td>
          ${r.foto ? `<img src="${r.foto}" width="50">` :
          `<input type="file" accept="image/*" onchange="uploadFoto(${i}, this)">`}
        </td>
        <td><button class="btn-danger" onclick="hapusRiwayat(${i})">Hapus</button></td>
      </tr>`;
  });
  document.getElementById("riwayat").classList.remove("hidden");
}

function lihatDetail(i) {
  const r = riwayat[i];
  document.getElementById("ttm-number").innerText = r.ttmNumber;
  document.getElementById("print-date").innerText = r.date;
  document.getElementById("preview-divisi").innerText = r.divisi;
  document.getElementById("preview-notes").innerText = r.notes;

  JsBarcode("#barcode", r.ttmNumber, { format: "CODE128", width: 2, height: 40 });

  const tbody = document.querySelector("#preview-tabel tbody");
  tbody.innerHTML = "";
  r.barangList.forEach((b, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${b.nama}</td>
        <td>${b.qty}</td>
        <td>${b.satuan}</td>
        <td>${b.ket}</td>
      </tr>`;
  });

  document.getElementById("preview").classList.remove("hidden");
  document.getElementById("riwayat").classList.add("hidden");
}

function closeRiwayat() {
  document.getElementById("riwayat").classList.add("hidden");
}

// upload bukti foto
function uploadFoto(index, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    riwayat[index].foto = e.target.result;
    localStorage.setItem("riwayatTTM", JSON.stringify(riwayat));
    lihatRiwayat();
  };
  reader.readAsDataURL(file);
}

function hapusRiwayat(index) {
  if (confirm("Yakin hapus riwayat ini?")) {
    riwayat.splice(index, 1);
    localStorage.setItem("riwayatTTM", JSON.stringify(riwayat));
    lihatRiwayat();
  }
}
// EXPORT JSON
document.getElementById("exportBtn").addEventListener("click", () => {
  try {
    if (!riwayat || riwayat.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const dataStr = JSON.stringify(riwayat, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "riwayatTTM.json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export error:", err);
    alert("Export gagal, cek console!");
  }
});

// IMPORT JSON
document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data)) {
        riwayat = data;
        localStorage.setItem("riwayatTTM", JSON.stringify(riwayat));
        alert("Import berhasil! Silakan buka Riwayat.");
      } else {
        alert("Format file tidak valid.");
      }
    } catch (err) {
      alert("Gagal membaca file.");
    }
  };
  reader.readAsText(file);
});

