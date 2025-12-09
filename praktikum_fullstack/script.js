const API_URL = 'backend/';

// Elemen DOM
const form = document.getElementById('mahasiswaForm');
const idInput = document.getElementById('id');
const namaInput = document.getElementById('nama');
const nimInput = document.getElementById('nim');
const tableBody = document.querySelector('#mahasiswaTable tbody');
const submitButton = document.getElementById('submitButton');
const cancelButton = document.getElementById('cancelButton');
const loadingMessage = document.getElementById('loadingMessage');

// --- Fungsi Utama (READ) ---
async function fetchMahasiswa() {
    loadingMessage.style.display = 'block';
    try {
        const response = await fetch(API_URL + 'get.php');
        const result = await response.json();

        if (result.success) {
            renderTable(result.data);
        } else {
            alert('Gagal memuat data: ' + result.message);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Terjadi kesalahan koneksi ke server.');
    } finally {
        loadingMessage.style.display = 'none';
    }
}

function renderTable(data) {
    tableBody.innerHTML = '';
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data mahasiswa.</td></tr>';
        return;
    }

    data.forEach(mhs => {
        const row = tableBody.insertRow();

        row.insertCell().textContent = mhs.id;
        row.insertCell().textContent = mhs.nim;
        row.insertCell().textContent = mhs.nama;
        row.insertCell().textContent = mhs.created_at;

        const actionCell = row.insertCell();
        
        // Tombol Edit
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ubah';
        editBtn.className = 'action-btn edit-btn';
        editBtn.onclick = () => loadForEdit(mhs);
        actionCell.appendChild(editBtn);

        // Tombol Hapus
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.onclick = () => deleteMahasiswa(mhs.id);
        actionCell.appendChild(deleteBtn);
    });
}

// --- Fungsi CRUD Lainnya ---

// CREATE & UPDATE (Handle Submit Form)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = idInput.value;
    const nama = namaInput.value;
    const nim = nimInput.value;
    
    // Tentukan apakah ini operasi INSERT (CREATE) atau UPDATE
    const isUpdate = id !== '';
    const endpoint = isUpdate ? 'put.php' : 'post.php';
    const method = 'POST'; // Kita pakai POST untuk semua CRUD, tapi bedakan endpoint PHP-nya.

    const dataToSend = {
        nama: nama,
        nim: nim
    };
    if (isUpdate) {
        dataToSend.id = id;
    }

    try {
        const response = await fetch(API_URL + endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            form.reset();
            resetFormState(); // Reset state setelah berhasil
            fetchMahasiswa(); // Muat ulang data
        } else {
            alert('Gagal: ' + result.message);
        }

    } catch (error) {
        console.error('Error submitting data:', error);
        alert('Terjadi kesalahan saat mengirim data.');
    }
});

// Load data ke form untuk di-Edit
function loadForEdit(mhs) {
    idInput.value = mhs.id;
    namaInput.value = mhs.nama;
    nimInput.value = mhs.nim;
    
    document.querySelector('#mahasiswaForm h2').textContent = 'Ubah Data Mahasiswa (ID: ' + mhs.id + ')';
    submitButton.textContent = 'Perbarui Data';
    cancelButton.style.display = 'inline-block';
    window.scrollTo(0, 0); // Gulir ke atas form
}

// DELETE
async function deleteMahasiswa(id) {
    if (!confirm(`Yakin ingin menghapus data mahasiswa ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(API_URL + 'delete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            fetchMahasiswa(); // Muat ulang data
        } else {
            alert('Gagal menghapus: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        alert('Terjadi kesalahan saat menghapus data.');
    }
}

// Reset Form State
cancelButton.addEventListener('click', resetFormState);

function resetFormState() {
    form.reset();
    idInput.value = ''; // Pastikan ID dikosongkan
    document.querySelector('#mahasiswaForm h2').textContent = 'Tambah Data Mahasiswa';
    submitButton.textContent = 'Simpan';
    cancelButton.style.display = 'none';
}


// Inisialisasi: Muat data pertama kali saat halaman dimuat
fetchMahasiswa();