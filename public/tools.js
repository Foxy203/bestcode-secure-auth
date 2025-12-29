// JavaScript Encrypt/Decrypt Tools for BestCode

// ==========================
// CAESAR CIPHER
// ==========================
function runCaesar(isEncrypt) {
    const text = document.getElementById('caesarText').value;
    let shift = parseInt(document.getElementById('caesarShift').value) || 0;

    // If decryption, reverse the shift
    if (!isEncrypt) {
        shift = -shift;
    }

    let result = '';

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char.match(/[a-z]/i)) {
            const code = text.charCodeAt(i);
            // Uppercase letters
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
            }
            // Lowercase letters
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
            }
        }
        result += char;
    }
    document.getElementById('caesarResult').value = result;
}


// ==========================
// VIGENERE CIPHER
// ==========================
function runVigenere(isEncrypt) {
    const text = document.getElementById('vigText').value;
    const key = document.getElementById('vigKey').value.replace(/[^a-zA-Z]/g, '');

    if (!key) {
        alert('Vui lòng nhập Key (chỉ chữ cái)!');
        return;
    }

    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char.match(/[a-z]/i)) {
            const code = text.charCodeAt(i);
            const isUpper = (code >= 65 && code <= 90);
            const base = isUpper ? 65 : 97;

            const keyChar = key[keyIndex % key.length];
            const keyShift = keyChar.toLowerCase().charCodeAt(0) - 97;

            let shift = isEncrypt ? keyShift : -keyShift;

            char = String.fromCharCode(((code - base + shift) % 26 + 26) % 26 + base);

            keyIndex++;
        }
        result += char;
    }
    document.getElementById('vigResult').value = result;
}


// ==========================
// HASHING (MD5, SHA1, SHA256)
// ==========================
function runHash() {
    const text = document.getElementById('hashInput').value;

    if (typeof CryptoJS === 'undefined') {
        alert('Hệ thống đang tải thư viện Crypto. Vui lòng thử lại sau giây lát.');
        return;
    }

    // Calculate Hashes
    const md5 = CryptoJS.MD5(text).toString();
    const sha1 = CryptoJS.SHA1(text).toString();
    const sha256 = CryptoJS.SHA256(text).toString();

    document.getElementById('md5Output').value = md5;
    document.getElementById('sha1Output').value = sha1;
    document.getElementById('sha256Output').value = sha256;
}
