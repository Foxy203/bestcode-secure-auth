async function loadUsers() {
    const tbody = document.getElementById('userTable');
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Đang tải...</td></tr>';

    try {
        // Use the secret if passed in URL or hardcoded
        const urlParams = new URLSearchParams(window.location.search);
        const secret = urlParams.get('secret') || 'haiquydeptrai';

        const response = await fetch(`/api/admin/users?secret=${secret}`);

        if (response.status === 403) {
            tbody.innerHTML = '<tr><td colspan="2" style="color: red; text-align: center;">Truy cập bị từ chối! (Sai Admin Secret)</td></tr>';
            return;
        }

        const users = await response.json();

        tbody.innerHTML = '';
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Chưa có người dùng nào. Hãy đăng ký thử!</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td class="email">${user.email}</td>
                        <td class="hash">${user.password}</td>
                    `;
            tbody.appendChild(row);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="2" style="color: red;">Lỗi kết nối server: ${error.message}</td></tr>`;
    }
}

// Load immediately
loadUsers();
