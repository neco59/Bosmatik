// Simple Firebase Configuration
console.log('🔥 Firebase config yükleniyor...');

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
                <div class="user-profile">
                    <div class="user-avatar-container">
                        ${photoURL ? 
                            `<img src="${photoURL}" alt="Profile" class="user-avatar">` : 
                            `<div class="user-avatar-emoji">👤</div>`
                        }
                    </div>
                    <div class="user-details">
                        <div class="user-name">${displayName}</div>
                        <div class="user-stats">Giriş yapıldı ✅</div>
                    </div>
                </div>
            `;
            console.log('✅ User info güncellendi');
        }
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
