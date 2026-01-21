// Simple Firebase Configuration
console.log('🔥 Firebase config yükleniyor...');

// Early function declarations to prevent timing issues
window.openSettings = function() {
    console.log('⚙️ Early openSettings called');
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'flex';
        if (typeof loadSettingsUI === 'function') loadSettingsUI();
        if (typeof updateSettingsModalTexts === 'function') updateSettingsModalTexts();
    } else {
        console.error('Settings modal not found');
    }
};

window.toggleTheme = function() {
    console.log('🌙 Early toggleTheme called');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bosmatik-theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
};

window.openProfile = function() {
    console.log('👤 Early openProfile called');
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Load current user data
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            const user = window.firebaseAuth.currentUser;
            const displayNameInput = document.getElementById('displayName');
            const currentName = document.getElementById('currentName');
            const currentAvatar = document.getElementById('currentAvatar');
            
            if (displayNameInput) displayNameInput.value = user.displayName || '';
            if (currentName) currentName.textContent = user.displayName || 'Anonim Kullanıcı';
            
            if (currentAvatar) {
                if (user.photoURL) {
                    currentAvatar.innerHTML = `<img src="${user.photoURL}" alt="Profile" class="current-avatar-img">`;
                } else {
                    currentAvatar.textContent = '👤';
                }
            }
        }
        
        if (typeof updateProfileTexts === 'function') updateProfileTexts();
    } else {
        console.error('Profile modal not found');
    }
};

window.closeSettings = function() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
};

window.closeProfile = function() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
};

window.selectAvatar = function(avatar) {
    window.selectedAvatar = avatar;
    
    // Update visual selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-avatar="${avatar}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Update preview
    const currentAvatar = document.getElementById('currentAvatar');
    if (currentAvatar) {
        currentAvatar.textContent = avatar;
    }
};

window.saveProfile = async function() {
    const displayName = document.getElementById('displayName').value.trim();
    
    if (!displayName) {
        alert('Görünen isim gerekli!');
        return;
    }
    
    if (displayName.length > 20) {
        alert('Görünen isim çok uzun! (Max 20 karakter)');
        return;
    }
    
    try {
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            await window.firebaseAuth.currentUser.updateProfile({
                displayName: displayName
            });
            
            console.log('✅ Profil güncellendi:', displayName);
            updateAuthUI(window.firebaseAuth.currentUser);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.innerHTML = '✅ Profil güncellendi!';
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #48bb78;
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 1001;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
            
            window.closeProfile();
        }
    } catch (error) {
        console.error('❌ Profil kaydetme hatası:', error);
        alert('Profil güncellenirken hata oluştu: ' + error.message);
    }
};

console.log('✅ Early functions declared');

// Firebase Configuration

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYmpV2yMeWTPhmzp4XdR2jjaJeRqeCrkI",
    authDomain: "bosmatik-app.firebaseapp.com",
    projectId: "bosmatik-app",
    storageBucket: "bosmatik-app.firebasestorage.app",
    messagingSenderId: "801380201209",
    appId: "1:801380201209:web:c5134b0a44db8fe724e828"
};

// Global variables
let app, auth, db;

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM yüklendi, Firebase başlatılıyor...');
    
    // Load theme immediately
    const savedTheme = localStorage.getItem('bosmatik-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    console.log('🎨 Theme loaded:', savedTheme);
    
    setTimeout(() => {
        initializeFirebase();
    }, 1000);
});

function initializeFirebase() {
    try {
        console.log('🔥 Firebase başlatma deneniyor...');
        
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase yüklenmemiş!');
            setTimeout(initializeFirebase, 1000);
            return;
        }
        
        console.log('✅ Firebase global objesi bulundu');
        
        // Initialize Firebase
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app başlatıldı');
        } else {
            app = firebase.app();
            console.log('✅ Firebase app zaten mevcut');
        }
        
        // Initialize services
        auth = firebase.auth();
        db = firebase.firestore();
        
        console.log('✅ Firebase servisleri hazır');
        
        // Setup auth listener
        auth.onAuthStateChanged(function(user) {
            console.log('� Auth durumu değişti:', user ? user.uid : 'çıkış');
            updateAuthUI(user);
        });
        
        // Make functions global
        window.firebaseReady = true;
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        
        console.log('🎉 Firebase tamamen hazır!');
        
    } catch (error) {
        console.error('❌ Firebase başlatma hatası:', error);
        setTimeout(initializeFirebase, 2000);
    }
}

// Simple Google Login
async function loginWithGoogle() {
    try {
        console.log('🔑 Google giriş başlatılıyor...');
        
        if (!window.firebaseReady || !window.firebaseAuth) {
            alert('Firebase henüz hazır değil, lütfen bekleyin...');
            return;
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        console.log('🚀 Google popup açılıyor...');
        const result = await window.firebaseAuth.signInWithPopup(provider);
        
        console.log('🎉 Google giriş başarılı!');
        console.log('Kullanıcı:', result.user.displayName);
        
        // Manuel UI güncelleme
        console.log('🔄 UI manuel güncelleniyor...');
        updateAuthUI(result.user);
        
        return result.user;
        
    } catch (error) {
        console.error('❌ Google giriş hatası:', error);
        alert('Google giriş hatası: ' + error.message);
    }
}

// Simple Anonymous Login
async function loginAnonymously() {
    try {
        console.log('🎭 Anonim giriş başlatılıyor...');
        
        if (!window.firebaseReady || !window.firebaseAuth) {
            alert('Firebase henüz hazır değil, lütfen bekleyin...');
            return;
        }
        
        const result = await window.firebaseAuth.signInAnonymously();
        console.log('🎉 Anonim giriş başarılı!');
        
        // Manuel UI güncelleme
        console.log('🔄 UI manuel güncelleniyor...');
        updateAuthUI(result.user);
        
        return result.user;
        
    } catch (error) {
        console.error('❌ Anonim giriş hatası:', error);
        alert('Anonim giriş hatası: ' + error.message);
    }
}

// Simple Logout
async function logout() {
    try {
        if (window.firebaseAuth) {
            await window.firebaseAuth.signOut();
            console.log('👋 Çıkış yapıldı');
            
            // Manuel UI güncelleme
            console.log('🔄 UI manuel güncelleniyor...');
            updateAuthUI(null);
        }
    } catch (error) {
        console.error('❌ Çıkış hatası:', error);
    }
}

// Update UI based on auth state
function updateAuthUI(user) {
    console.log('🔄 updateAuthUI çağrıldı, user:', user ? user.displayName : 'null');
    
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const userInfo = document.getElementById('userInfo');

    console.log('📋 DOM elementleri:', {
        loginSection: !!loginSection,
        userSection: !!userSection,
        userInfo: !!userInfo
    });

    if (user) {
        console.log('✅ Kullanıcı var, giriş ekranını gizliyorum...');
        
        // User logged in - Hide login, show user section
        if (loginSection) {
            loginSection.style.display = 'none';
            console.log('✅ Login section gizlendi');
        }
        
        if (userSection) {
            userSection.style.display = 'block';
            console.log('✅ User section gösterildi');
        }
        
        if (userInfo) {
            const displayName = user.displayName || 'Anonim Kullanıcı';
            const photoURL = user.photoURL;
            
            console.log('👤 Kullanıcı bilgileri:', { displayName, photoURL });
            
            userInfo.innerHTML = `
                <div class="user-profile" onclick="window.openProfile ? window.openProfile() : console.error('openProfile not available')">
                    <div class="user-avatar-container">
                        ${photoURL ? 
                            `<img src="${photoURL}" alt="Profile" class="user-avatar">` : 
                            `<div class="user-avatar-emoji">👤</div>`
                        }
                        <div class="edit-indicator">✏️</div>
                    </div>
                    <div class="user-details">
                        <div class="user-name">${displayName}</div>
                        <div class="user-stats">Giriş yapıldı ✅</div>
                    </div>
                </div>
            `;
            console.log('✅ User info güncellendi');
        }
        
        // Ensure buttons are visible and working after login
        const settingsBtn = document.getElementById('settingsBtn');
        const themeToggle = document.getElementById('themeToggle');
        
        if (settingsBtn) {
            settingsBtn.style.display = 'block';
            
            // Remove existing onclick to avoid conflicts
            settingsBtn.onclick = null;
            
            // Add event listener
            settingsBtn.addEventListener('click', function() {
                console.log('⚙️ Settings button clicked from Firebase');
                if (typeof window.openSettings === 'function') {
                    window.openSettings();
                } else {
                    console.error('❌ openSettings function not found');
                    // Try to find it in global scope
                    if (typeof openSettings === 'function') {
                        openSettings();
                    }
                }
            });
            console.log('✅ Settings button activated');
        }
        
        if (themeToggle) {
            themeToggle.style.display = 'block';
            
            // Remove existing onclick to avoid conflicts
            themeToggle.onclick = null;
            
            // Add event listener
            themeToggle.addEventListener('click', function() {
                console.log('🌙 Theme toggle clicked from Firebase');
                if (typeof window.toggleTheme === 'function') {
                    window.toggleTheme();
                } else {
                    console.error('❌ toggleTheme function not found');
                    // Try to find it in global scope
                    if (typeof toggleTheme === 'function') {
                        toggleTheme();
                    }
                }
            });
            console.log('✅ Theme toggle activated');
        }
        
        // Ensure language buttons work
        const langTr = document.getElementById('lang-tr');
        const langEn = document.getElementById('lang-en');
        
        if (langTr) {
            langTr.onclick = function() {
                console.log('🇹🇷 Turkish language selected');
                changeLanguage('tr');
            };
            console.log('✅ Turkish language button activated');
        }
        
        if (langEn) {
            langEn.onclick = function() {
                console.log('🇺🇸 English language selected');
                changeLanguage('en');
            };
            console.log('✅ English language button activated');
        }
        
        // Update language button states
        if (typeof updateLanguageButtons === 'function') {
            updateLanguageButtons();
        }
        
        // Ensure profile click handler is working
        setTimeout(() => {
            const userProfile = document.querySelector('.user-profile');
            if (userProfile) {
                userProfile.onclick = function() {
                    console.log('👤 Profile clicked');
                    if (window.openProfile) {
                        window.openProfile();
                    } else {
                        console.error('openProfile function not available');
                    }
                };
                console.log('✅ Profile click handler activated');
            }
            
            // Test all critical functions
            console.log('🧪 Testing function availability:');
            console.log('- openSettings:', typeof window.openSettings);
            console.log('- toggleTheme:', typeof window.toggleTheme);
            console.log('- openProfile:', typeof window.openProfile);
            console.log('- quickAdd:', typeof window.quickAdd);
            console.log('- manualReset:', typeof window.manualReset);
            
        }, 500);
    } else {
        console.log('❌ Kullanıcı yok, giriş ekranını gösteriyorum...');
        
        // User logged out - Show login, hide user section
        if (loginSection) {
            loginSection.style.display = 'block';
            console.log('✅ Login section gösterildi');
        }
        
        if (userSection) {
            userSection.style.display = 'none';
            console.log('✅ User section gizlendi');
        }
    }
    
    console.log('🎯 UI güncelleme tamamlandı');
}

// Make functions global
window.loginWithGoogle = loginWithGoogle;
window.loginAnonymously = loginAnonymously;
window.logout = logout;

// Make sure all UI functions are available globally
document.addEventListener('DOMContentLoaded', function() {
    // Wait for script.js to load
    setTimeout(() => {
        // Settings and theme functions
        if (typeof openSettings !== 'undefined') window.openSettings = openSettings;
        if (typeof closeSettings !== 'undefined') window.closeSettings = closeSettings;
        if (typeof toggleTheme !== 'undefined') window.toggleTheme = toggleTheme;
        if (typeof loadTheme !== 'undefined') window.loadTheme = loadTheme;
        
        // Profile functions
        if (typeof openProfile !== 'undefined') window.openProfile = openProfile;
        if (typeof closeProfile !== 'undefined') window.closeProfile = closeProfile;
        if (typeof saveProfile !== 'undefined') window.saveProfile = saveProfile;
        if (typeof selectAvatar !== 'undefined') window.selectAvatar = selectAvatar;
        
        // Notification functions
        if (typeof testNotification !== 'undefined') window.testNotification = testNotification;
        if (typeof toggleNotifications !== 'undefined') window.toggleNotifications = toggleNotifications;
        if (typeof updateNotificationTime !== 'undefined') window.updateNotificationTime = updateNotificationTime;
        if (typeof updateAchievementNotifications !== 'undefined') window.updateAchievementNotifications = updateAchievementNotifications;
        if (typeof updateWeeklyReport !== 'undefined') window.updateWeeklyReport = updateWeeklyReport;
        if (typeof updateAutoReset !== 'undefined') window.updateAutoReset = updateAutoReset;
        if (typeof updateSoundEffects !== 'undefined') window.updateSoundEffects = updateSoundEffects;
        
        // Other utility functions
        if (typeof quickAdd !== 'undefined') window.quickAdd = quickAdd;
        if (typeof clearAllInputs !== 'undefined') window.clearAllInputs = clearAllInputs;
        if (typeof manualReset !== 'undefined') window.manualReset = manualReset;
        if (typeof closeAchievement !== 'undefined') window.closeAchievement = closeAchievement;
        if (typeof changeLanguage !== 'undefined') window.changeLanguage = changeLanguage;
        
        // Initialize theme
        if (typeof loadTheme !== 'undefined') {
            loadTheme();
        }
        
        console.log('🌐 All functions made globally available');
    }, 2000);
});
