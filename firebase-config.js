// Firebase Configuration and Services (Compat Version)
// Using Firebase v9 compat for better browser support

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYmpV2yMeWTPhmzp4XdR2jjaJeRqeCrkI",
    authDomain: "bosmatik-app.firebaseapp.com",
    projectId: "bosmatik-app",
    storageBucket: "bosmatik-app.firebasestorage.app",
    messagingSenderId: "801380201209",
    appId: "1:801380201209:web:c5134b0a44db8fe724e828",
    measurementId: "G-5S01645R4Y"
};

// Wait for Firebase scripts to load
function waitForFirebase() {
    return new Promise((resolve) => {
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase zaten yüklü');
            resolve();
        } else {
            console.log('⏳ Firebase yükleniyor...');
            const checkFirebase = setInterval(() => {
                if (typeof firebase !== 'undefined') {
                    console.log('✅ Firebase yüklendi');
                    clearInterval(checkFirebase);
                    resolve();
                }
            }, 100);
            
            // 10 saniye timeout
            setTimeout(() => {
                clearInterval(checkFirebase);
                console.error('❌ Firebase yüklenemedi - timeout');
                resolve();
            }, 10000);
        }
    });
}

// Firebase Service Class
class FirebaseService {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.app = null;
        this.auth = null;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔥 Firebase başlatılıyor...');
            await waitForFirebase();
            
            // Initialize Firebase v8
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app başlatıldı');
            } else {
                this.app = firebase.app();
                console.log('✅ Firebase app zaten var');
            }
            
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            console.log('✅ Firebase servisleri başlatıldı');
            
            // Setup auth listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('✅ Kullanıcı giriş yaptı:', user.uid);
                    this.loadUserProfile();
                    this.updateUserStatus();
                } else {
                    console.log('❌ Kullanıcı çıkış yaptı');
                    this.currentUser = null;
                    this.userProfile = null;
                }
                this.updateUI();
            });
            
        } catch (error) {
            console.error('❌ Firebase başlatma hatası:', error);
        }
    }

    // Google Login
    async loginWithGoogle() {
        try {
            console.log('🔑 Google giriş başlatılıyor...');
            
            if (!this.auth) {
                console.error('❌ Firebase Auth başlatılmamış');
                throw new Error('Firebase Auth başlatılmamış');
            }
            
            console.log('✅ Firebase Auth hazır');
            
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase global objesi yok');
                throw new Error('Firebase yüklenmemiş');
            }
            
            console.log('✅ Firebase global objesi var');
            
            const provider = new firebase.auth.GoogleAuthProvider();
            console.log('✅ Google provider oluşturuldu');
            
            provider.addScope('profile');
            provider.addScope('email');
            console.log('✅ Scope\'lar eklendi');
            
            console.log('🚀 signInWithPopup çağrılıyor...');
            const result = await this.auth.signInWithPopup(provider);
            
            console.log('🎉 Google giriş başarılı!');
            console.log('Kullanıcı:', result.user.displayName);
            console.log('Email:', result.user.email);
            
            return result.user;
        } catch (error) {
            console.error('❌ Google giriş hatası:');
            console.error('Hata kodu:', error.code);
            console.error('Hata mesajı:', error.message);
            console.error('Tam hata:', error);
            throw error;
        }
    }

    // Anonymous Login
    async loginAnonymously() {
        try {
            console.log('🎭 Anonim giriş başlatılıyor...');
            
            if (!this.auth) {
                throw new Error('Firebase Auth başlatılmamış');
            }
            
            const result = await this.auth.signInAnonymously();
            console.log('🎭 Anonim giriş başarılı:', result.user.uid);
            return result.user;
        } catch (error) {
            console.error('Anonim giriş hatası:', error);
            throw error;
        }
    }

    // Load User Profile
    async loadUserProfile() {
        if (!this.currentUser || !this.db) return;

        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            } else {
                // Create new user profile
                this.userProfile = {
                    uid: this.currentUser.uid,
                    displayName: this.currentUser.displayName || 'Anonim Kullanıcı',
                    email: this.currentUser.email || '',
                    photoURL: this.currentUser.photoURL || '',
                    totalPoints: 0,
                    level: 1,
                    dailyStreak: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                };
                await this.db.collection('users').doc(this.currentUser.uid).set(this.userProfile);
            }
        } catch (error) {
            console.error('Kullanıcı profili yükleme hatası:', error);
        }
    }

    // Update User Status
    async updateUserStatus() {
        if (!this.currentUser || !this.userProfile || !this.db) return;

        try {
            await this.db.collection('users').doc(this.currentUser.uid).update({
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Kullanıcı durumu güncelleme hatası:', error);
        }
    }

    // Submit Score
    async submitScore(scoreData) {
        if (!this.currentUser || !this.db) {
            throw new Error('Kullanıcı giriş yapmamış');
        }

        try {
            // Add to scores collection
            const scoreDoc = {
                userId: this.currentUser.uid,
                displayName: this.userProfile?.displayName || 'Anonim Kullanıcı',
                photoURL: this.userProfile?.photoURL || '',
                customAvatar: this.userProfile?.customAvatar || '',
                score: scoreData.score,
                points: scoreData.points,
                activities: scoreData.activities,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toDateString()
            };

            await this.db.collection('scores').add(scoreDoc);

            // Update user profile
            const newTotalPoints = (this.userProfile?.totalPoints || 0) + scoreData.points;
            const newLevel = Math.floor(newTotalPoints / 1000) + 1;

            this.userProfile = {
                ...this.userProfile,
                totalPoints: newTotalPoints,
                level: newLevel,
                lastScore: scoreData.score,
                lastScoreDate: new Date().toDateString()
            };

            await this.db.collection('users').doc(this.currentUser.uid).update(this.userProfile);

            console.log('📊 Skor gönderildi:', scoreData.score);
            return true;
        } catch (error) {
            console.error('Skor gönderme hatası:', error);
            throw error;
        }
    }

    // Get Leaderboard
    async getLeaderboard(timeframe = 'daily', limitCount = 10) {
        if (!this.db) return [];

        try {
            let query;
            
            if (timeframe === 'daily') {
                // Today's scores
                query = this.db.collection('scores')
                    .orderBy('score', 'desc')
                    .limit(limitCount);
            } else if (timeframe === 'alltime') {
                // All time best users
                query = this.db.collection('users')
                    .orderBy('totalPoints', 'desc')
                    .limit(limitCount);
            }

            const querySnapshot = await query.get();
            const leaderboard = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                leaderboard.push({
                    id: doc.id,
                    ...data,
                    rank: leaderboard.length + 1
                });
            });

            console.log(`🏆 ${timeframe} sıralaması yüklendi:`, leaderboard.length, 'kullanıcı');
            return leaderboard;
        } catch (error) {
            console.error('Sıralama yükleme hatası:', error);
            return [];
        }
    }

    // Update User Profile
    async updateUserProfile(displayName, customAvatar) {
        if (!this.currentUser || !this.db) {
            throw new Error('Kullanıcı giriş yapmamış');
        }

        try {
            const updatedProfile = {
                ...this.userProfile,
                displayName: displayName,
                customAvatar: customAvatar,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('users').doc(this.currentUser.uid).update(updatedProfile);
            
            this.userProfile = updatedProfile;
            this.updateUI();
            
            console.log('✅ Profil güncellendi:', displayName, customAvatar);
            return true;
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            throw error;
        }
    }

    // Update UI based on auth state
    updateUI() {
        const loginSection = document.getElementById('loginSection');
        const userSection = document.getElementById('userSection');
        const userInfo = document.getElementById('userInfo');

        if (this.currentUser && this.userProfile) {
            // Show user section
            if (loginSection) loginSection.style.display = 'none';
            if (userSection) userSection.style.display = 'block';
            
            if (userInfo) {
                const avatar = this.userProfile.customAvatar || this.userProfile.photoURL || '👤';
                const displayName = this.userProfile.displayName || 'Anonim Kullanıcı';
                
                userInfo.innerHTML = `
                    <div class="user-profile" onclick="openProfile()">
                        <div class="user-avatar-container">
                            ${this.userProfile.photoURL && !this.userProfile.customAvatar ? 
                                `<img src="${this.userProfile.photoURL}" alt="Profile" class="user-avatar">` : 
                                `<div class="user-avatar-emoji">${avatar}</div>`
                            }
                            <div class="edit-indicator">✏️</div>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${displayName}</div>
                            <div class="user-stats">Seviye ${this.userProfile.level} • ${this.userProfile.totalPoints.toLocaleString()} puan</div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Show login section
            if (loginSection) loginSection.style.display = 'block';
            if (userSection) userSection.style.display = 'none';
        }
    }

    // Logout
    async logout() {
        try {
            if (this.auth) {
                await this.auth.signOut();
                console.log('👋 Çıkış yapıldı');
            }
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    }
}

// Initialize Firebase Service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseService = new FirebaseService();
});
