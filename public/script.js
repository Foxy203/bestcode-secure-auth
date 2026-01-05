document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const toggleBtn = document.getElementById('togglePassword');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    // UI Elements
    const strengthLabel = document.getElementById('strengthLabel');
    const crackTimeDisplay = document.getElementById('crackTime');
    const feedbackDisplay = document.getElementById('feedback');
    const apiMessage = document.getElementById('apiMessage');

    // Toggle Password Visibility
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleBtn.classList.toggle('fa-eye-slash');
            toggleBtn.classList.toggle('fa-eye');
            toggleBtn.style.color = type === 'password' ? '#9CA3AF' : '#4F46E5';
        });
    }

    // Passphrase Generator
    const generateBtn = document.getElementById('generatePassphrase');
    if (generateBtn) {
        const wordList = ['sky', 'blue', 'ocean', 'deep', 'forest', 'river', 'mountain', 'stone', 'fire', 'wind', 'light', 'shadow', 'storm', 'rain', 'sun', 'moon', 'star', 'cloud', 'leaf', 'rock', 'gold', 'silver', 'iron', 'copper', 'emerald', 'ruby', 'sapphire', 'pearl', 'jade', 'obsidian', 'amber', 'crystal', 'glass', 'paper', 'ink', 'silk', 'velvet', 'cotton', 'wool', 'linen', 'steel', 'bronze', 'platinum', 'diamond', 'graphite', 'quartz', 'granite', 'marble', 'sand', 'dust'];
        function generatePassphrase() {
            const words = [];
            for (let i = 0; i < 4; i++) {
                const idx = Math.floor(Math.random() * wordList.length);
                words.push(wordList[idx]);
            }
            return words.join('-');
        }
        generateBtn.addEventListener('click', () => {
            const pass = generatePassphrase();
            passwordInput.value = pass;
            // Trigger input event to update strength meter
            const event = new Event('input');
            passwordInput.dispatchEvent(event);
        });
    }

    // Real-time Strength Check
    if (passwordInput && typeof zxcvbn !== 'undefined') {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const userInputs = [];
            if (nameInput) userInputs.push(nameInput.value);
            if (emailInput) userInputs.push(emailInput.value);

            if (!password) {
                resetMeter();
                return;
            }

            // Call zxcvbn (loaded globally via CDN)
            const result = zxcvbn(password, userInputs);
            updateMeter(result);
        });
    }

    function resetMeter() {
        const segments = document.querySelectorAll('.segment');
        segments.forEach(seg => {
            seg.style.backgroundColor = '#E5E7EB';
            seg.classList.remove('active');
        });
        if (strengthLabel) strengthLabel.innerText = 'Độ mạnh: Không';
        if (crackTimeDisplay) crackTimeDisplay.innerText = '--';
        if (feedbackDisplay) feedbackDisplay.innerText = '';
        if (submitBtn) submitBtn.disabled = true;
    }

    function updateMeter(result) {
        const score = result.score; // 0 - 4
        const segments = document.querySelectorAll('.segment');

        // Reset all first
        segments.forEach(seg => {
            seg.style.backgroundColor = '#E5E7EB';
            seg.classList.remove('active');
            seg.style.transform = 'scaleY(1)';
        });

        // Color Mapping
        let color = '#EF4444'; // default red
        let activeCount = 1;

        if (score === 0) { color = '#EF4444'; activeCount = 1; }      // Too weak
        else if (score === 1) { color = '#EF4444'; activeCount = 2; } // Weak
        else if (score === 2) { color = '#F59E0B'; activeCount = 3; } // Fair
        else if (score === 3) { color = '#EAB308'; activeCount = 4; } // Good
        else if (score === 4) { color = '#10B981'; activeCount = 4; } // Strong

        // Fill segments
        for (let i = 0; i < activeCount; i++) {
            if (segments[i]) {
                segments[i].style.backgroundColor = color;
                segments[i].classList.add('active');
                segments[i].style.transform = 'scaleY(1.2)';
            }
        }

        const labels = ['Quá Yếu', 'Yếu', 'Trung Bình', 'Tốt', 'Mạnh'];
        if (strengthLabel) {
            strengthLabel.innerText = `${labels[score]}`;
            strengthLabel.style.color = color;
        }

        if (crackTimeDisplay) {
            let timeText = result.crack_times_display.offline_slow_hashing_1e4_per_second;
            // Translate time units
            const timeMap = {
                "less than a second": "ngay lập tức",
                "second": "giây",
                "seconds": "giây",
                "minute": "phút",
                "minutes": "phút",
                "hour": "giờ",
                "hours": "giờ",
                "day": "ngày",
                "days": "ngày",
                "month": "tháng",
                "months": "tháng",
                "year": "năm",
                "years": "năm",
                "centuries": "thế kỷ"
            };

            // Simple replace for known units
            Object.keys(timeMap).forEach(key => {
                timeText = timeText.replace(new RegExp(`\\b${key}\\b`, 'g'), timeMap[key]);
            });

            crackTimeDisplay.innerText = timeText;
        }

        if (feedbackDisplay) {
            if (result.feedback.warning) {
                const warningMap = {
                    "This is similar to a commonly used password": "Mật khẩu này tương tự một mật khẩu phổ biến",
                    "This is a top-10 common password": "Đây là một trong 10 mật khẩu phổ biến nhất",
                    "This is a top-100 common password": "Đây là một trong 100 mật khẩu phổ biến nhất",
                    "This is a very common password": "Mật khẩu này rất phổ biến",
                    "Straight rows of keys are easy to guess": "Các phím thẳng hàng rất dễ đoán",
                    "Short keyboard patterns are easy to guess": "Các mẫu phím ngắn rất dễ đoán",
                    "Use a longer keyboard pattern with more turns": "Hãy dùng mẫu phím dài hơn và đổi hướng nhiều hơn",
                    "Repeats like \"aaa\" are easy to guess": "Ký tự lặp lại như \"aaa\" rất dễ đoán",
                    "Repeats like \"abcabcabc\" are only slightly harder to guess than \"abc\"": "Lặp lại chuỗi như \"abcabcabc\" cũng dễ đoán",
                    "Sequences like abc or 6543 are easy to guess": "Chuỗi liên tiếp như abc hay 6543 rất dễ đoán",
                    "Recent years are easy to guess": "Các năm gần đây rất dễ đoán",
                    "Dates are often easy to guess": "Ngày tháng thường rất dễ đoán",
                    "Names and surnames by themselves are easy to guess": "Tên riêng rất dễ đoán",
                    "Common names and surnames are easy to guess": "Tên phổ biến rất dễ đoán",
                    "Capitalization doesn't help very much": "Viết hoa không giúp ích nhiều lắm",
                    "All-uppercase is almost as easy to guess as all-lowercase": "Viết hoa toàn bộ cũng dễ đoán như viết thường",
                    "Reverse words are not much harder to guess": "Từ viết ngược cũng không khó đoán hơn",
                    "Predictable substitutions like '@' instead of 'a' don't help very much": "Thay thế ký tự kiểu '@' cho 'a' không giúp ích nhiều"
                };
                const msg = result.feedback.warning;
                feedbackDisplay.innerText = `⚠️ ${warningMap[msg] || msg}`;
            } else if (score < 3) {
                // Provide suggestions for stronger passwords
                const suggestions = [
                    "Sử dụng ít nhất 12 ký tự",
                    "Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
                    "Tránh các từ hoặc mẫu phổ biến",
                    "Cân nhắc sử dụng cụm từ gồm 4 từ ngẫu nhiên"
                ];
                feedbackDisplay.innerText = suggestions.join(' • ');
            } else {
                feedbackDisplay.innerText = "";
            }
        }

        if (submitBtn) submitBtn.disabled = score < 3;
    }

    // ==========================
    // HANDLE LOGIN FORM
    // ==========================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const apiMessage = document.getElementById('apiMessage');

            // Reset UI
            loginBtn.disabled = true;
            loginBtn.innerText = 'Đăng nhập...';
            apiMessage.style.display = 'none';
            apiMessage.className = 'api-message';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    apiMessage.classList.add('success');
                    apiMessage.style.display = 'block';
                    apiMessage.innerText = `Thành công! ${data.message}`;
                    loginBtn.innerText = 'Đăng nhập';
                    loginBtn.disabled = false;
                } else {
                    apiMessage.classList.add('error');
                    apiMessage.style.display = 'block';

                    if (response.status === 429 && data.remainingTime) {
                        // Rate Limited - Start Countdown
                        startCountdown(loginBtn, apiMessage, data.remainingTime, data.attemptsRemaining);
                    } else {
                        apiMessage.innerText = `Lỗi: ${data.error}`;
                        if (data.attemptsRemaining !== undefined) {
                            apiMessage.innerText += ` (Còn ${data.attemptsRemaining} lần thử)`;
                        }
                        loginBtn.innerText = 'Đăng nhập';
                        loginBtn.disabled = false;
                    }
                }
            } catch (error) {
                apiMessage.innerText = 'Lỗi kết nối server.';
                apiMessage.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerText = 'Đăng nhập';
            }
        });
    }

    function startCountdown(btn, msgDisplay, seconds, attemptsLeft) {
        btn.disabled = true;
        let left = seconds;

        const updateText = () => {
            let text = `Bị khóa ${left}s`;
            if (attemptsLeft !== undefined) {
                text += ` (Còn ${attemptsLeft} lần thử)`;
            }
            msgDisplay.innerText = text;
            btn.innerText = `Chờ ${left}s`;
        };

        // Initial display
        updateText();
        msgDisplay.style.display = 'block';
        msgDisplay.classList.add('error');

        const interval = setInterval(() => {
            left--;
            if (left <= 0) {
                clearInterval(interval);
                btn.disabled = false;
                btn.innerText = 'Đăng nhập';
                msgDisplay.innerText = '';
                msgDisplay.style.display = 'none';
            } else {
                updateText();
            }
        }, 1000);
    }

    // ==========================
    // HANDLE REGISTER FORM
    // ==========================
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;

            submitBtn.disabled = true;
            submitBtn.innerText = 'Đang mã hóa...';
            apiMessage.className = 'api-message';
            apiMessage.innerText = '';
            apiMessage.style.display = 'none';

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    apiMessage.classList.add('success');
                    // Show success modal
                    const modal = document.getElementById('successModal');
                    if (modal) modal.style.display = 'block';
                    apiMessage.style.display = 'block';
                    apiMessage.innerText = `Thành công! ${data.message}`;
                } else {
                    apiMessage.classList.add('error');
                    apiMessage.style.display = 'block';
                    apiMessage.innerText = `Lỗi: ${data.error}`;
                    if (window.zxcvbn && zxcvbn(password).score >= 3) {
                        submitBtn.disabled = false;
                    }
                }
            } catch (error) {
                apiMessage.classList.add('error');
                apiMessage.style.display = 'block';
                apiMessage.innerText = 'Đã xảy ra lỗi mạng.';
                submitBtn.disabled = false;
            } finally {
                if (submitBtn.innerText === 'Encrypting...') {
                    submitBtn.innerText = 'Tạo Tài khoản';
                }
            }
        });

        // Modal navigation
        const goToLoginBtn = document.getElementById('goToLogin');
        if (goToLoginBtn) {
            goToLoginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }
});
