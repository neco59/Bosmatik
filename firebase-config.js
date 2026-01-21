// Firebase Configuration and Services
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let messaging = null;

// Initialize messaging if supported
try {
    if ('serviceWorker' in navigator) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.log('Messaging not supported:', error);
}

// Firebase Service Class
class FirebaseService {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.initializeAuth();
    }

    // Authentication
    initializeAuth() {
        onAuthStateChanged(auth, (user) => {
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
    }

    // Anonymous Login
    async loginAnonymously() {
        try {
            const result = await signInAnonymously(auth);
            console.log('🎭 Anonim giriş başarılı:', result.user.uid);
            return result.user;
        } catch (error) {
            console.error('Anonim giriş hatası:', error);
            throw error;
        }
    }

    // Google Login
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log('🔑 Google giriş başarılı:', result.user.displayName);
            return result.user;
        } catch (error) {
            console.error('Google giriş hatası:', error);
            throw error;
        }
    }

    // Load User Profile
    async loadUserProfile() {
        if (!this.currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            if (userDoc.exists()) {
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
                    createdAt: serverTimestamp(),
                    lastActive: serverTimestamp()
                };
                await setDoc(doc(db, 'users', this.currentUser.uid), this.userProfile);
            }
        } catch (error) {
            console.error('Kullanıcı profili yükleme hatası:', error);
        }
    }

    // Update User Status
    async updateUserStatus() {
        if (!this.currentUser || !this.userProfile) return;

        try {
            await setDoc(doc(db, 'users', this.currentUser.uid), {
                ...this.userProfile,
                lastActive: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Kullanıcı durumu güncelleme hatası:', error);
        }
    }

    // Submit Score
    async submitScore(scoreData) {
        if (!this.currentUser) {
            throw new Error('Kullanıcı giriş yapmamış');
        }

        try {
            // Add to scores collection
            const scoreDoc = {
                userId: this.currentUser.uid,
                displayName: this.userProfile?.displayName || 'Anonim Kullanıcı',
                photoURL: this.userProfile?.photoURL || '',
                score: scoreData.score,
                points: scoreData.points,
                activities: scoreData.activities,
                timestamp: serverTimestamp(),
                date: new Date().toDateString()
            };

            await addDoc(collection(db, 'scores'), scoreDoc);

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

            await setDoc(doc(db, 'users', this.currentUser.uid), this.userProfile, { merge: true });

            console.log('📊 Skor gönderildi:', scoreData.score);
            return true;
        } catch (error) {
            console.error('Skor gönderme hatası:', error);
            throw error;
        }
    }

    // Get Leaderboard
    async getLeaderboard(timeframe = 'daily', limitCount = 10) {
        try {
            let q;
            const today = new Date().toDateString();
            
            if (timeframe === 'daily') {
                // Today's scores
                q = query(
                    collection(db, 'scores'),
                    orderBy('score', 'desc'),
                    limit(limitCount)
                );
            } else if (timeframe === 'alltime') {
                // All time best users
                q = query(
                    collection(db, 'users'),
                    orderBy('totalPoints', 'desc'),
                    limit(limitCount)
                );
            }

            const querySnapshot = await getDocs(q);
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

    // Push Notifications
    async requestNotificationPermission() {
        if (!messaging) {
            console.log('Messaging desteklenmiyor');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: 'YOUR_VAPID_KEY' // Bu Firebase Console'dan alınacak
                });
                console.log('🔔 Notification token:', token);
                
                // Token'ı kullanıcı profiline kaydet
                if (this.currentUser) {
                    await setDoc(doc(db, 'users', this.currentUser.uid), {
                        notificationToken: token
                    }, { merge: true });
                }
                
                return token;
            }
            return false;
        } catch (error) {
            console.error('Notification permission hatası:', error);
            return false;
        }
    }

    // Listen for messages
    setupMessageListener() {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            console.log('📨 Mesaj alındı:', payload);
            
            // Show notification
            if (payload.notification) {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: payload.notification.icon || './icon-192.png'
                });
            }
        });
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
                userInfo.innerHTML = `
                    <div class="user-profile">
                        ${this.userProfile.photoURL ? `<img src="${this.userProfile.photoURL}" alt="Profile" class="user-avatar">` : '👤'}
                        <div class="user-details">
                            <div class="user-name">${this.userProfile.displayName}</div>
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
            await auth.signOut();
            console.log('👋 Çıkış yapıldı');
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    }
}

// Global Firebase Service Instance
window.firebaseService = new FirebaseService();

export default FirebaseService;