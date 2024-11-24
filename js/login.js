// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfsiWU2vrpPfUAALpNyc0C0uQh6w3fIMY",
    authDomain: "teatest-2bdb8.firebaseapp.com",
    databaseURL: "https://teatest-2bdb8-default-rtdb.firebaseio.com",
    projectId: "teatest-2bdb8",
    storageBucket: "teatest-2bdb8.appspot.com",
    messagingSenderId: "562665891497",
    appId: "1:562665891497:web:d2b1ad70b01d1a639babb8"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Xuất auth và database
const auth = firebase.auth();
const database = firebase.database();

// Hàm cập nhật giao diện điều hướng
function updateNavbarUI(user) {
    const userInfo = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');
    const greeting = document.getElementById('greeting');

    if (user) {
        userInfo.style.display = 'block';
        loginLink.style.display = 'none';
        greeting.textContent = `Xin chào, ${user.email}`;
    } else {
        userInfo.style.display = 'none';
        loginLink.style.display = 'block';
    }
}

// Lắng nghe thay đổi trạng thái đăng nhập
auth.onAuthStateChanged((user) => {
    updateNavbarUI(user);
});

// Đăng xuất
document.getElementById('logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.signOut();
    alert('Đăng xuất thành công!');

    window.location.href = 'login.html';
});

export { auth, database };
