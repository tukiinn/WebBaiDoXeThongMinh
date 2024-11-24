
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const spotsRef = database.ref('/parking/spots');
const historyRef = database.ref('/parking/history');
const servoControlRef = database.ref('/servo/control');
const maxSpots = 4;
const spotNames = ['A1', 'A2', 'A3', 'A4'];
    
function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').innerText = `${hours}:${minutes}:${seconds}`;
}

updateCurrentTime();
setInterval(updateCurrentTime, 1000);

function openGate() {
    servoControlRef.set('open').then(() => {
        document.getElementById('gateStatus').innerText = 'Cửa: Mở';
    });
}

function closeGate() {
    servoControlRef.set('close').then(() => {
        document.getElementById('gateStatus').innerText = 'Cửa: Đóng';
    });
}

function calculateDurationAndFee(entryTime) {
    const now = Date.now() / 1000;
    const durationInMinutes = Math.floor((now - entryTime) / 60);
    const fee = durationInMinutes * 1000;
    return {
        duration: durationInMinutes > 0 ? `${durationInMinutes} phút` : '0 phút',
        fee: `${fee} VNĐ`
    };
}

spotsRef.on('value', function(snapshot) {
    const spots = snapshot.val();
    const parkingTable = document.getElementById('parkingTable');
    parkingTable.innerHTML = '';

    let occupiedCount = 0;

    spotNames.forEach(spot => {
        const spotData = spots[spot] || {
            occupied: false
        };
        const status = spotData.occupied ? 'occupied' : 'free';
        const entryTime = spotData.entry_time || null;

        let duration = '0 phút';
        let fee = '0 VNĐ';

        if (status === 'occupied' && entryTime) {
            const result = calculateDurationAndFee(entryTime);
            duration = result.duration;
            fee = result.fee;
        }

        if (status === 'occupied') occupiedCount++;

        const row = `<tr>
            <td>${spot}</td>
            <td class="${status === 'occupied' ? 'status-occupied' : 'status-free'}">${status === 'occupied' ? 'Đã Đỗ' : 'Còn Trống'}</td>
            <td>${entryTime ? convertToVietnamTime(entryTime) : 'Chưa Có'}</td>
            <td>${duration}</td>
            <td>${fee}</td>
        </tr>`;
        parkingTable.innerHTML += row;
    });

    document.getElementById('occupied_spots_count').innerText = occupiedCount;
    document.getElementById('remaining_spots').innerText = maxSpots - occupiedCount;

    // Gửi dữ liệu đến Telegram một lần
    // sendDataToTelegram(occupiedCount, spots);
});

historyRef.on('value', function(snapshot) {
    const history = snapshot.val() || {};
    const historyTable = document.getElementById('historyTable');
    historyTable.innerHTML = '';

    for (const spot in history) {
        const records = history[spot].records || {};
        for (const recordId in records) {
            const record = records[recordId];
            const entryTime = record.entry_time || 'Chưa có';
            const exitTime = record.exit_time || 'Chưa ra';
            const fee = record.fee || '0 VNĐ';
            const duration = exitTime !== 'Chưa ra' ? `${Math.floor((exitTime - entryTime) / 60)} phút` : 'Đang đỗ';

            const row = `<tr>
                <td>${recordId}</td>
                <td>${spot}</td>
                <td>${exitTime !== 'Chưa ra' ? 'Đã Ra' : 'Chưa Ra'}</td>
                <td>${convertToVietnamTime(entryTime)}</td>
                <td>${exitTime !== 'Chưa ra' ? convertToVietnamTime(exitTime) : 'Chưa ra'}</td>
                <td>${duration}</td>
                <td>${fee} VNĐ</td>
            </tr>`;
            historyTable.innerHTML += row;
        }
    }
});


function convertToVietnamTime(timestamp) {
    if (timestamp === 'Chưa có' || timestamp === 'Chưa ra') {
        return timestamp;
    }
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
}

function sendDataToTelegram(occupiedCount, spots) {
    const telegramToken = '7693032578:AAHIfmBIzhSklkKgP5VhsVFy8PLioPxj5IQ';
    const chatId = '6998063684';

    let spotDetails = '*Thông tin vị trí:* \n';
    for (const spotName in spots) {
        const spotData = spots[spotName];
        const status = spotData.occupied ? '✅ Đã Đỗ' : '🔲 Còn Trống';
        const entryTime = spotData.entry_time ? convertToVietnamTime(spotData.entry_time) : 'Chưa có';
        const fee = spotData.occupied && spotData.entry_time ? calculateDurationAndFee(spotData.entry_time).fee : '0 VNĐ';

        spotDetails += `- *Vị trí ${spotName}:* ${status}\n  *Thời gian vào:* ${entryTime}\n  *Phí tạm tính:* ${fee}\n\n`;
    }

    const message = `*Cập nhật tình trạng đỗ xe:*\n*Số vị trí đã đỗ:* ${occupiedCount}\n\n${spotDetails}`;

    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.ok) {
                console.error('Error sending message:', data.description);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}



        // Hiện nút cuộn khi cuộn trang xuống
        window.onscroll = function() {
            var button = document.querySelector('.scroll-to-top');
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                button.style.display = "block";
            } else {
                button.style.display = "none";
            }
        };

        // Hàm cuộn về đầu trang
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
