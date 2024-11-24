// Khởi tạo Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAfsiWU2vrpPfUAALpNyc0C0uQh6w3fIMY",
    authDomain: "teatest-2bdb8.firebaseapp.com",
    databaseURL: "https://teatest-2bdb8-default-rtdb.firebaseio.com",
    projectId: "teatest-2bdb8",
    storageBucket: "teatest-2bdb8.appspot.com",
    messagingSenderId: "562665891497",
    appId: "1:562665891497:web:d2b1ad70b01d1a639babb8"
};

// Đảm bảo Firebase được khởi tạo sau khi SDK được tải
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Lấy dữ liệu từ Firebase
async function fetchData() {
    const historyRef = database.ref('/parking/history'); // Đường dẫn đến dữ liệu lịch sử đỗ xe
    const snapshot = await historyRef.get();
    const history = snapshot.val() || {};

    let totalRevenue = 0; // Khởi tạo tổng doanh thu
    let totalVehicles = 0; // Khởi tạo tổng số xe
    const revenueByDate = {}; // Đối tượng lưu doanh thu theo ngày
    const revenueByLocation = {}; // Đối tượng lưu doanh thu theo vị trí

    for (const spot in history) {
        const records = history[spot].records || {};
        for (const recordId in records) {
            const record = records[recordId];
            const entryTime = record.entry_time; // Giả định entry_time là timestamp
            const exitTime = record.exit_time; // Giả định exit_time là timestamp
            const fee = record.fee || 0;

            if (exitTime) {
                const exitDate = new Date(exitTime * 1000).toLocaleDateString(); // Chuyển đổi exit_time thành ngày
                revenueByDate[exitDate] = (revenueByDate[exitDate] || 0) + fee; // Cộng doanh thu theo ngày
                totalRevenue += fee; // Cộng doanh thu vào tổng doanh thu
            }

            revenueByLocation[spot] = (revenueByLocation[spot] || 0) + fee; // Cộng doanh thu theo vị trí

            // Đếm số xe ra vào
            totalVehicles++; // Mỗi record tương ứng với một xe ra vào
        }
    }

    // Cập nhật UI
    document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString()} VND`; // Cập nhật doanh thu
    document.getElementById('totalVehicles').textContent = totalVehicles; // Cập nhật số xe

    // Vẽ biểu đồ
    drawRevenueChart(revenueByDate); // Biểu đồ doanh thu theo ngày
    drawLocationChart(revenueByLocation); // Biểu đồ doanh thu theo vị trí
}

// Vẽ biểu đồ doanh thu theo ngày
function drawRevenueChart(revenueByDate) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const labels = Object.keys(revenueByDate);
    const data = Object.values(revenueByDate);

    const chart = new Chart(ctx, {
        type: 'line', // Biểu đồ đường
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu theo ngày (VND)', // Thêm "VND" vào chú thích
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' VND'; // Thêm "VND" vào trục y
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ doanh thu theo vị trí đỗ xe
function drawLocationChart(revenueByLocation) {
    const ctx = document.getElementById('locationChart').getContext('2d');
    const labels = Object.keys(revenueByLocation);
    const data = Object.values(revenueByLocation);

    const chart = new Chart(ctx, {
        type: 'doughnut', // Biểu đồ doughnut
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu theo vị trí đỗ xe (VND)', // Thêm "VND" vào chú thích
                data: data,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
        }
    });
}

// Khởi động lấy dữ liệu
fetchData();
