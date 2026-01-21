class Bosmatik {
    constructor() {
        this.userData = this.loadUserData();
        this.achievements = this.initializeAchievements();
        this.leaderboardData = this.loadLeaderboard();
        this.initializeEventListeners();
        this.updateUserStats();
        this.generateDailyTip();
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('calculate');
        const inputs = document.querySelectorAll('input[type="number"]');
        
        // Hesapla butonu - hem enhanced hem de direkt çalışma
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                try {
                    // Önce direkt hesaplamayı dene
                    this.calculateBoşYapma();
                } catch (error) {
                    console.error('Direkt hesaplama hatası:', error);
                    // Hata varsa enhanced'ı dene
                    enhancedCalculate();
                }
            });
        }
        
        inputs.forEach(input => {
            // Input değişikliklerini dinle
            input.addEventListener('input', () => {
                this.validateInput(input);
                this.saveInputData();
            });
            
            // Focus kaybedince de kontrol et
            input.addEventListener('blur', () => {
                this.validateInput(input);
                this.saveInputData();
            });
            
            // Paste olayını da kontrol et
            input.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.validateInput(input);
                    this.saveInputData();
                }, 10);
            });
            
            // Negatif değerleri ve geçersiz karakterleri engelle
            input.addEventListener('keydown', (e) => {
                // İzin verilen tuşlar: sayılar, nokta, backspace, delete, tab, enter, ok tuşları
                const allowedKeys = [8, 9, 13, 27, 46, 110, 190];
                const isNumber = (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
                const isAllowedKey = allowedKeys.includes(e.keyCode);
                
                if (!isNumber && !isAllowedKey) {
                    e.preventDefault();
                }
                
                // Eksi işaretini engelle
                if (e.key === '-') {
                    e.preventDefault();
                }
            });
        });
    }

    validateInput(input) {
        let value = parseFloat(input.value);
        
        // Boş veya geçersiz değerleri 0 yap
        if (input.value === '' || isNaN(value) || value < 0) {
            input.value = 0;
            return;
        }
        
        // Maksimum 24 saat sınırı
        if (value > 24) {
            input.value = 24;
            // Kullanıcıya uyarı göster
            this.showWarning('⚠️ Maksimum 24 saat girilebilir!');
            return;
        }
        
        // Ondalık basamakları sınırla (2 basamak)
        if (value.toString().includes('.')) {
            const rounded = Math.round(value * 100) / 100;
            input.value = rounded;
        }
    }

    showWarning(message) {
        // Mevcut uyarıyı kaldır
        const existingWarning = document.querySelector('.warning-message');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        const warningMsg = document.createElement('div');
        warningMsg.className = 'warning-message';
        warningMsg.innerHTML = message;
        warningMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(245, 101, 101, 0.3);
        `;
        document.body.appendChild(warningMsg);
        
        setTimeout(() => {
            warningMsg.remove();
        }, 2000);
    }

    loadUserData() {
        const defaultData = {
            level: 1,
            totalPoints: 0,
            dailyStreak: 0,
            lastPlayDate: null,
            unlockedAchievements: {
                daily: [],
                weekly: [],
                monthly: [],
                yearly: []
            },
            dailyScores: [],
            lastDailyReset: null,
            lastInputReset: null
        };
        
        try {
            const saved = localStorage.getItem('bosmatik-user');
            let userData = saved ? JSON.parse(saved) : defaultData;
            
            // Eski format kontrolü (array ise object'e çevir)
            if (Array.isArray(userData.unlockedAchievements)) {
                console.log('🔄 Eski başarı formatı tespit edildi, güncelleniyor...');
                userData.unlockedAchievements = {
                    daily: [],
                    weekly: userData.unlockedAchievements || [],
                    monthly: [],
                    yearly: []
                };
            }
            
            // Eksik kategorileri ekle
            if (!userData.unlockedAchievements) {
                userData.unlockedAchievements = defaultData.unlockedAchievements;
            }
            
            ['daily', 'weekly', 'monthly', 'yearly'].forEach(category => {
                if (!Array.isArray(userData.unlockedAchievements[category])) {
                    userData.unlockedAchievements[category] = [];
                }
            });
            
            // Diğer eksik alanları ekle
            userData = { ...defaultData, ...userData };
            
            // Günlük başarıları sıfırla (her gün)
            this.resetDailyAchievements(userData);
            
            // Günlük input verilerini sıfırla (her gün)
            this.resetDailyInputs(userData);
            
            return userData;
        } catch (error) {
            console.error('Kullanıcı verisi yükleme hatası:', error);
            return defaultData;
        }
    }

    resetDailyAchievements(userData) {
        const today = new Date().toDateString();
        
        if (userData.lastDailyReset !== today) {
            userData.unlockedAchievements.daily = [];
            userData.lastDailyReset = today;
            console.log('🌅 Günlük başarılar sıfırlandı!');
        }
    }

    resetDailyInputs(userData) {
        const now = new Date();
        const today = now.toDateString();
        const currentHour = now.getHours();
        
        // Eğer saat 00:00 - 06:00 arasındaysa ve daha sıfırlanmadıysa sıfırla
        // Veya tamamen farklı bir gün ise sıfırla
        const shouldReset = (userData.lastInputReset !== today) && 
                           (currentHour >= 0 && currentHour < 6 || userData.lastInputReset !== today);
        
        if (shouldReset) {
            // Tüm input'ları sıfırla
            localStorage.removeItem('bosmatik-inputs');
            userData.lastInputReset = today;
            console.log('🔄 Günlük veriler sıfırlandı!');
            
            // Kullanıcıya bilgi ver (sadece gece yarısı sonrası)
            if (currentHour >= 0 && currentHour < 6) {
                setTimeout(() => {
                    this.showDailyResetNotification();
                }, 1000);
            }
        }
    }

    showDailyResetNotification() {
        const notification = document.createElement('div');
        notification.className = 'daily-reset-notification';
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">🌅 Yeni Gün Başladı!</div>
            <div style="font-size: 0.9rem;">Günlük veriler sıfırlandı. İyi günler!</div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    saveUserData() {
        localStorage.setItem('bosmatik-user', JSON.stringify(this.userData));
    }

    saveInputData() {
        const data = {};
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            let value = parseFloat(input.value);
            // Geçersiz değerleri 0 yap
            if (isNaN(value) || value < 0) {
                value = 0;
                input.value = 0;
            }
            // Maksimum sınır kontrolü
            if (value > 24) {
                value = 24;
                input.value = 24;
            }
            data[input.id] = value;
        });
        localStorage.setItem('bosmatik-inputs', JSON.stringify(data));
    }

    loadInputData() {
        const saved = localStorage.getItem('bosmatik-inputs');
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    // Geçersiz değerleri 0 yap
                    let value = data[key];
                    if (isNaN(value) || value < 0) {
                        value = 0;
                    }
                    input.value = value;
                }
            });
        } else {
            // Eğer kayıtlı veri yoksa (sıfırlanmışsa) tüm input'ları 0 yap
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.value = 0;
            });
        }
    }

    calculateBoşYapma() {
        console.log('🎯 Hesaplama başladı...');
        
        try {
            const activities = this.getActivityData();
            console.log('📊 Aktivite verileri:', activities);
            
            const boşScore = this.calculateBoşScore(activities);
            console.log('📈 Boş skor:', boşScore);
            
            const level = this.getBoşLevel(boşScore);
            console.log('🎖️ Seviye:', level);
            
            // Puan hesapla ve kaydet
            const pointsEarned = Math.floor(boşScore * 10);
            this.userData.totalPoints += pointsEarned;
            this.updateLevel();
            this.updateStreak();
            
            // Günlük skor kaydet
            const today = new Date().toDateString();
            this.userData.dailyScores = this.userData.dailyScores.filter(score => score.date !== today);
            this.userData.dailyScores.push({
                date: today,
                score: boşScore,
                points: pointsEarned,
                activities: activities
            });
            
            // Başarıları kontrol et
            this.checkAchievements(boşScore, activities);
            
            this.saveUserData();
            this.displayResults(boşScore, level, pointsEarned, activities);
            this.updateLeaderboard(boşScore);
            this.createChart(activities);
            
            // Firebase entegrasyonu
            updateFirebaseLeaderboard(boşScore, activities);
            
            console.log('✅ Hesaplama tamamlandı!');
            
            // Sonuçları göster
            const resultsElement = document.getElementById('results');
            if (resultsElement) {
                resultsElement.style.display = 'block';
                resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('❌ Hesaplama hatası:', error);
            alert('Hesaplama sırasında bir hata oluştu. Sayfayı yenileyin.');
        }
    }

    getActivityData() {
        return {
            // Sosyal Medya (yüksek puan)
            'Fotoğraf Paylaşım': { time: this.getValidNumber('instagram'), multiplier: 3 },
            'Kısa Video': { time: this.getValidNumber('tiktok'), multiplier: 4 },
            'Video İzleme': { time: this.getValidNumber('youtube'), multiplier: 2.5 },
            'Mikroblog': { time: this.getValidNumber('twitter'), multiplier: 2 },
            'Sosyal Ağ': { time: this.getValidNumber('facebook'), multiplier: 2 },
            'Canlı Yayın': { time: this.getValidNumber('twitch'), multiplier: 2.5 },
            'Sesli Sohbet': { time: this.getValidNumber('discord'), multiplier: 1.5 },
            'Anlık Mesaj': { time: this.getValidNumber('snapchat'), multiplier: 3 },
            'Profesyonel Ağ': { time: this.getValidNumber('linkedin'), multiplier: 1 },
            'Forum': { time: this.getValidNumber('reddit'), multiplier: 2.5 },
            
            // Eğlence (orta puan)
            'Dizi/Film İzleme': { time: this.getValidNumber('netflix'), multiplier: 2 },
            'Oyun': { time: this.getValidNumber('games'), multiplier: 1.5 },
            'Müzik Dinleme': { time: this.getValidNumber('spotify'), multiplier: 0.5 },
            'Rastgele Gezinme': { time: this.getValidNumber('random'), multiplier: 3.5 },
            'Online Alışveriş': { time: this.getValidNumber('shopping'), multiplier: 2.5 },
            'Anlık Mesajlaşma': { time: this.getValidNumber('whatsapp'), multiplier: 1.5 },
            'Mesajlaşma': { time: this.getValidNumber('telegram'), multiplier: 1.5 },
            
            // Üretken aktiviteler (puan azaltır)
            'Kitap': { time: this.getValidNumber('reading'), multiplier: -1 },
            'Spor': { time: this.getValidNumber('exercise'), multiplier: -1.5 },
            'Öğrenme': { time: this.getValidNumber('learning'), multiplier: -2 }
        };
    }

    getValidNumber(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return 0;
        
        let value = parseFloat(input.value);
        
        // Geçersiz değerleri 0 yap
        if (isNaN(value) || value < 0) {
            value = 0;
            input.value = 0;
        }
        
        // Maksimum 24 saat sınırı
        if (value > 24) {
            value = 24;
            input.value = 24;
        }
        
        return value;
    }

    calculateBoşScore(activities) {
        let totalScore = 0;
        Object.values(activities).forEach(activity => {
            totalScore += activity.time * activity.multiplier;
        });
        return Math.max(0, totalScore);
    }

    getBoşLevel(score) {
        const levels = [
            { min: 0, max: 2, name: t('levels.productive') || 'Üretken Karınca', emoji: '🐜', color: '#48bb78' },
            { min: 2, max: 5, name: t('levels.lightWaster') || 'Hafif Boşçu', emoji: '😊', color: '#4299e1' },
            { min: 5, max: 8, name: t('levels.mediumWaster') || 'Orta Seviye Boşçu', emoji: '😎', color: '#ed8936' },
            { min: 8, max: 12, name: t('levels.advancedWaster') || 'İleri Seviye Boşçu', emoji: '🤪', color: '#9f7aea' },
            { min: 12, max: 16, name: t('levels.master') || 'Boş Yapma Ustası', emoji: '🏆', color: '#f56565' },
            { min: 16, max: 20, name: t('levels.legend') || 'Boş Yapma Efsanesi', emoji: '👑', color: '#d69e2e' },
            { min: 20, max: Infinity, name: t('levels.god') || 'Boş Yapma Tanrısı', emoji: '🌟', color: '#805ad5' }
        ];
        
        return levels.find(level => score >= level.min && score < level.max) || levels[levels.length - 1];
    }

    updateLevel() {
        const newLevel = Math.floor(this.userData.totalPoints / 1000) + 1;
        if (newLevel > this.userData.level) {
            this.userData.level = newLevel;
            const levelUpTitle = `${t('level') || 'Seviye'} ${newLevel}!`;
            const levelUpDesc = `${t('levelUpMessage') || 'Tebrikler! {level}. seviyeye ulaştınız! 🎉'}`.replace('{level}', newLevel);
            this.showAchievement(levelUpTitle, levelUpDesc);
        }
    }

    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (this.userData.lastPlayDate === yesterday) {
            this.userData.dailyStreak++;
        } else if (this.userData.lastPlayDate !== today) {
            this.userData.dailyStreak = 1;
        }
        
        this.userData.lastPlayDate = today;
    }

    displayResults(score, level, points, activities) {
        document.getElementById('levelEmoji').textContent = level.emoji;
        document.getElementById('levelName').textContent = level.name;
        document.getElementById('pointsEarned').textContent = `+${points}`;
        
        // Sonuç kartının rengini değiştir
        const resultCard = document.querySelector('.result-card');
        resultCard.style.background = `linear-gradient(135deg, ${level.color} 0%, ${level.color}aa 100%)`;
        
        this.updateUserStats();
    }

    updateUserStats() {
        document.getElementById('userLevel').textContent = this.userData.level;
        document.getElementById('totalPoints').textContent = this.userData.totalPoints.toLocaleString();
        document.getElementById('dailyStreak').textContent = this.userData.dailyStreak;
    }

    createChart(activities) {
        const chartContainer = document.getElementById('timeChart');
        chartContainer.innerHTML = '';

        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
            '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
        ];

        let colorIndex = 0;
        
        Object.entries(activities).forEach(([activity, data]) => {
            if (data.time > 0) {
                const score = data.time * data.multiplier;
                const isNegative = data.multiplier < 0;
                
                const barElement = document.createElement('div');
                barElement.className = 'chart-bar';
                
                const percentage = Math.min(100, (data.time / 8) * 100); // 8 saat maksimum olarak kabul et
                
                barElement.innerHTML = `
                    <div class="chart-label">${activity}</div>
                    <div class="chart-visual">
                        <div class="chart-fill" style="width: ${percentage}%; background: ${isNegative ? '#48bb78' : colors[colorIndex % colors.length]}"></div>
                    </div>
                    <div class="chart-value">${data.time}s (${score > 0 ? '+' : ''}${score.toFixed(1)}p)</div>
                `;
                
                chartContainer.appendChild(barElement);
                if (!isNegative) colorIndex++;
            }
        });
    }

    initializeAchievements() {
        return {
            // Günlük Başarılar (Her gün sıfırlanır)
            daily: [
                { id: 'daily_first_entry', name: 'Günlük Giriş', desc: 'Bugün ilk giriş', emoji: '🌅', condition: () => true },
                { id: 'daily_social_limit', name: 'Sosyal Medya Kontrolü', desc: 'Sosyal medyada 3 saatten az', emoji: '📱', condition: (score, activities) => {
                    const socialTime = (activities['Fotoğraf Paylaşım']?.time || 0) + (activities['Kısa Video']?.time || 0) + 
                                     (activities['Mikroblog']?.time || 0) + (activities['Sosyal Ağ']?.time || 0) + 
                                     (activities['Anlık Mesaj']?.time || 0) + (activities['Forum']?.time || 0);
                    return socialTime < 3;
                }},
                { id: 'daily_entertainment_limit', name: 'Eğlence Dengesi', desc: 'Eğlence aktivitelerinde 2.5 saatten az', emoji: '🎯', condition: (score, activities) => {
                    const entertainmentTime = (activities['Dizi/Film İzleme']?.time || 0) + (activities.Oyun?.time || 0) + 
                                            (activities['Canlı Yayın']?.time || 0) + (activities['Sesli Sohbet']?.time || 0);
                    return entertainmentTime < 2.5;
                }},
                { id: 'daily_productive_goal', name: 'Günlük Üretkenlik', desc: '2+ saat üretken aktivite', emoji: '💪', condition: (score, activities) => {
                    const productiveTime = (activities.Kitap?.time || 0) + (activities.Spor?.time || 0) + (activities.Öğrenme?.time || 0);
                    return productiveTime >= 2;
                }},
                { id: 'daily_balanced', name: 'Dengeli Gün', desc: 'Hem boş hem üretken aktivite', emoji: '⚖️', condition: (score, activities) => {
                    const productiveTime = (activities.Kitap?.time || 0) + (activities.Spor?.time || 0) + (activities.Öğrenme?.time || 0);
                    const totalBoşTime = Object.values(activities).reduce((sum, activity) => {
                        return activity.multiplier > 0 ? sum + activity.time : sum;
                    }, 0);
                    return productiveTime > 0 && totalBoşTime > 0;
                }},
                { id: 'daily_low_waste', name: 'Az Boş Yapan', desc: '5 saatten az boş aktivite', emoji: '🎖️', condition: (score, activities) => {
                    const totalBoşTime = Object.values(activities).reduce((sum, activity) => {
                        return activity.multiplier > 0 ? sum + activity.time : sum;
                    }, 0);
                    return totalBoşTime < 5;
                }}
            ],

            // Haftalık Başarılar
            weekly: [
                { id: 'week_streak', name: 'Haftalık Seri', desc: '7 gün üst üste giriş', emoji: '🔥', condition: () => this.userData.dailyStreak >= 7 },
                { id: 'week_social_master', name: 'Sosyal Medya Ustası', desc: '8+ saat sosyal medya (haftalık)', emoji: '📱', condition: (score, activities) => {
                    const socialTime = (activities['Fotoğraf Paylaşım']?.time || 0) + (activities['Kısa Video']?.time || 0) + 
                                     (activities['Mikroblog']?.time || 0) + (activities['Sosyal Ağ']?.time || 0) + 
                                     (activities['Anlık Mesaj']?.time || 0) + (activities['Forum']?.time || 0);
                    return socialTime >= 8;
                }},
                { id: 'week_tiktok_addict', name: 'Kısa Video Bağımlısı', desc: '5+ saat kısa video', emoji: '🎵', condition: (score, activities) => activities['Kısa Video']?.time >= 5 },
                { id: 'week_netflix_binge', name: 'Dizi Maratoncusu', desc: '6+ saat dizi/film', emoji: '🍿', condition: (score, activities) => activities['Dizi/Film İzleme']?.time >= 6 },
                { id: 'week_gamer', name: 'Oyun Tutkunu', desc: '8+ saat oyun', emoji: '🎮', condition: (score, activities) => activities.Oyun?.time >= 8 },
                { id: 'week_bookworm', name: 'Kitap Kurdu', desc: '10+ saat kitap okuma', emoji: '📚', condition: (score, activities) => activities.Kitap?.time >= 10 },
                { id: 'week_athlete', name: 'Sporcu Ruhu', desc: '8+ saat spor', emoji: '🏃‍♂️', condition: (score, activities) => activities.Spor?.time >= 8 }
            ],

            // Aylık Başarılar
            monthly: [
                { id: 'month_streak', name: 'Aylık Seri', desc: '30 gün üst üste giriş', emoji: '🏆', condition: () => this.userData.dailyStreak >= 30 },
                { id: 'month_multitasker', name: 'Çoklu Platform Ustası', desc: '10+ farklı platformda aktif', emoji: '🔥', condition: (score, activities) => {
                    const activePlatforms = Object.values(activities).filter(activity => activity.time > 1).length;
                    return activePlatforms >= 10;
                }},
                { id: 'month_time_waster', name: 'Zaman Tüketicisi', desc: '50+ toplam boş saat', emoji: '⏰', condition: (score, activities) => {
                    const totalTime = Object.values(activities).reduce((sum, activity) => {
                        return activity.multiplier > 0 ? sum + activity.time : sum;
                    }, 0);
                    return totalTime >= 50;
                }},
                { id: 'month_boş_master', name: 'Boş Yapma Ustası', desc: '35+ boş puan', emoji: '👑', condition: (score) => score >= 35 },
                { id: 'month_learner', name: 'Öğrenme Gurusu', desc: '30+ saat öğrenme', emoji: '🎓', condition: (score, activities) => activities.Öğrenme?.time >= 30 },
                { id: 'month_balanced_master', name: 'Denge Ustası', desc: '20+ saat üretken aktivite', emoji: '⚖️', condition: (score, activities) => {
                    const productiveTime = (activities.Kitap?.time || 0) + (activities.Spor?.time || 0) + (activities.Öğrenme?.time || 0);
                    return productiveTime >= 20;
                }}
            ],

            // Yıllık Başarılar (Efsane)
            yearly: [
                { id: 'year_legend', name: 'Boşmatik Efsanesi', desc: '365 gün üst üste giriş', emoji: '🌟', condition: () => this.userData.dailyStreak >= 365 },
                { id: 'year_point_master', name: 'Puan Koleksiyoncusu', desc: '100,000+ toplam puan', emoji: '💎', condition: () => this.userData.totalPoints >= 100000 },
                { id: 'year_level_god', name: 'Seviye Tanrısı', desc: '50. seviyeye ulaş', emoji: '🎖️', condition: () => this.userData.level >= 50 },
                { id: 'year_boş_god', name: 'Boş Yapma Tanrısı', desc: '100+ boş puan tek seferde', emoji: '🌟', condition: (score) => score >= 100 },
                { id: 'year_productivity_king', name: 'Üretkenlik Kralı', desc: '500+ saat üretken aktivite', emoji: '👑', condition: (score, activities) => {
                    const productiveTime = (activities.Kitap?.time || 0) + (activities.Spor?.time || 0) + (activities.Öğrenme?.time || 0);
                    return productiveTime >= 500;
                }}
            ]
        };
    }

    checkAchievements(score, activities) {
        const allAchievements = this.achievements;
        
        // unlockedAchievements yapısını kontrol et ve düzelt
        if (!this.userData.unlockedAchievements || Array.isArray(this.userData.unlockedAchievements)) {
            this.userData.unlockedAchievements = {
                daily: [],
                weekly: [],
                monthly: [],
                yearly: []
            };
        }
        
        // Her kategoriyi kontrol et
        ['daily', 'weekly', 'monthly', 'yearly'].forEach(category => {
            // Kategori array'ini kontrol et
            if (!Array.isArray(this.userData.unlockedAchievements[category])) {
                this.userData.unlockedAchievements[category] = [];
            }
            
            allAchievements[category].forEach(achievement => {
                try {
                    if (!this.userData.unlockedAchievements[category].includes(achievement.id)) {
                        if (achievement.condition(score, activities)) {
                            this.userData.unlockedAchievements[category].push(achievement.id);
                            this.showAchievement(achievement.name, achievement.desc, category);
                            
                            // Kategori bazında puan bonusu
                            const bonusPoints = this.getCategoryBonus(category);
                            this.userData.totalPoints += bonusPoints;
                            
                            console.log(`🏆 ${category.toUpperCase()} başarı açıldı: ${achievement.name} (+${bonusPoints} puan)`);
                        }
                    }
                } catch (error) {
                    console.error(`Başarı kontrol hatası (${achievement.id}):`, error);
                }
            });
        });
        
        this.displayAchievements();
    }

    getCategoryBonus(category) {
        const bonuses = {
            daily: 50,
            weekly: 200,
            monthly: 500,
            yearly: 2000
        };
        return bonuses[category] || 0;
    }

    showAchievement(title, description, category) {
        const popup = document.getElementById('achievementPopup');
        const text = document.getElementById('achievementText');
        
        const categoryColors = {
            daily: '#4ecdc4',
            weekly: '#ff6b6b', 
            monthly: '#9f7aea',
            yearly: '#f6ad55'
        };
        
        const categoryNames = {
            daily: t('categoryNames.daily') || 'Günlük',
            weekly: t('categoryNames.weekly') || 'Haftalık',
            monthly: t('categoryNames.monthly') || 'Aylık',
            yearly: t('categoryNames.yearly') || 'Yıllık'
        };
        
        text.innerHTML = `
            <div style="color: ${categoryColors[category]}; font-weight: bold; margin-bottom: 10px;">
                ${categoryNames[category]} ${t('newAchievement') || 'Başarı!'}
            </div>
            <strong>${title}</strong><br>
            ${description}<br>
            <small style="color: #666; margin-top: 10px; display: block;">
                +${this.getCategoryBonus(category)} ${t('bonusPoints') || 'Bonus Puan!'}
            </small>
        `;
        
        popup.style.display = 'flex';
        
        setTimeout(() => {
            popup.style.display = 'none';
        }, 4000);
    }

    showAchievement(title, description) {
        const popup = document.getElementById('achievementPopup');
        const text = document.getElementById('achievementText');
        
        text.innerHTML = `<strong>${title}</strong><br>${description}`;
        popup.style.display = 'flex';
        
        setTimeout(() => {
            popup.style.display = 'none';
        }, 3000);
    }

    displayAchievements() {
        const grid = document.getElementById('achievementGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const allAchievements = this.achievements;
        const categoryColors = {
            daily: '#4ecdc4',
            weekly: '#ff6b6b', 
            monthly: '#9f7aea',
            yearly: '#f6ad55'
        };
        
        const categoryNames = {
            daily: t('categoryNames.daily') || '🌅 Günlük',
            weekly: t('categoryNames.weekly') || '🔥 Haftalık',
            monthly: t('categoryNames.monthly') || '🏆 Aylık',
            yearly: t('categoryNames.yearly') || '🌟 Yıllık'
        };
        
        // unlockedAchievements yapısını kontrol et
        if (!this.userData.unlockedAchievements || Array.isArray(this.userData.unlockedAchievements)) {
            this.userData.unlockedAchievements = {
                daily: [],
                weekly: [],
                monthly: [],
                yearly: []
            };
        }
        
        // Her kategori için başlık ve başarıları göster
        ['daily', 'weekly', 'monthly', 'yearly'].forEach(category => {
            // Kategori array'ini kontrol et
            if (!Array.isArray(this.userData.unlockedAchievements[category])) {
                this.userData.unlockedAchievements[category] = [];
            }
            
            // Kategori başlığı
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'achievement-category-header';
            categoryHeader.innerHTML = `
                <h4 style="color: ${categoryColors[category]}; margin: 20px 0 10px 0; font-size: 1.1rem;">
                    ${categoryNames[category]} Başarılar
                </h4>
            `;
            grid.appendChild(categoryHeader);
            
            // Kategori başarıları
            const categoryGrid = document.createElement('div');
            categoryGrid.className = 'achievement-category-grid';
            categoryGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
                padding: 15px;
                background: linear-gradient(135deg, ${categoryColors[category]}10 0%, ${categoryColors[category]}05 100%);
                border-radius: 10px;
                border-left: 4px solid ${categoryColors[category]};
            `;
            
            if (allAchievements[category]) {
                allAchievements[category].forEach(achievement => {
                    const isUnlocked = this.userData.unlockedAchievements[category].includes(achievement.id);
                    
                    // Çeviri sisteminden başarı bilgilerini al
                    const achievementData = t(`achievements.${achievement.id}`) || { name: achievement.name, desc: achievement.desc };
                    
                    const item = document.createElement('div');
                    item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
                    
                    if (isUnlocked) {
                        item.style.borderColor = categoryColors[category];
                        item.style.background = `linear-gradient(135deg, ${categoryColors[category]}20 0%, ${categoryColors[category]}10 100%)`;
                    }
                    
                    item.innerHTML = `
                        <span class="achievement-emoji">${isUnlocked ? achievement.emoji : '🔒'}</span>
                        <div class="achievement-name">${achievementData.name}</div>
                        <div class="achievement-desc">${achievementData.desc}</div>
                        ${isUnlocked ? `<div class="achievement-bonus">+${this.getCategoryBonus(category)} puan</div>` : ''}
                    `;
                    
                    categoryGrid.appendChild(item);
                });
            }
            
            grid.appendChild(categoryGrid);
        });
    }

    loadLeaderboard() {
        const defaultLeaderboard = [
            { name: 'Sen', score: 0, isUser: true },
            { name: 'Ahmet', score: 15.5 },
            { name: 'Ayşe', score: 12.3 },
            { name: 'Mehmet', score: 18.7 },
            { name: 'Fatma', score: 9.2 },
            { name: 'Ali', score: 22.1 },
            { name: 'Zeynep', score: 7.8 }
        ];
        
        const saved = localStorage.getItem('bosmatik-leaderboard');
        return saved ? JSON.parse(saved) : defaultLeaderboard;
    }

    updateLeaderboard(userScore) {
        // Kullanıcının skorunu güncelle
        const userEntry = this.leaderboardData.find(entry => entry.isUser);
        if (userEntry) {
            userEntry.score = userScore;
        }
        
        // Sırala
        this.leaderboardData.sort((a, b) => b.score - a.score);
        
        // Leaderboard'u göster
        this.displayLeaderboard();
        
        localStorage.setItem('bosmatik-leaderboard', JSON.stringify(this.leaderboardData));
    }

    displayLeaderboard() {
        const list = document.getElementById('leaderboardList');
        list.innerHTML = '';
        
        this.leaderboardData.slice(0, 7).forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${entry.isUser ? 'user-entry' : ''}`;
            
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';
            
            item.innerHTML = `
                <div class="rank ${rankClass}">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${entry.name} ${entry.isUser ? '(Sen)' : ''}</div>
                    <div class="player-score">${entry.score.toFixed(1)} boş puan</div>
                </div>
            `;
            
            if (entry.isUser) {
                item.style.background = 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)';
                item.style.border = '2px solid #f39c12';
            }
            
            list.appendChild(item);
        });
    }

    generateDailyTip() {
        const tips = t('tips') || [
            "TikTok'ta 'sadece 5 dakika' diyerek başlayıp 3 saat geçirmek boş yapma sanatının zirvesidir! 🎭",
            "Instagram'da arkadaşının arkadaşının tatil fotoğraflarına bakmak da boş yapma puanı kazandırır! 📸"
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        const tipElement = document.getElementById('dailyTip');
        if (tipElement) {
            tipElement.innerHTML = `
                <div class="tip-text">${randomTip}</div>
            `;
        }
    }



    showSuccessMessage(message) {
        const successMsg = document.createElement('div');
        successMsg.innerHTML = message;
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
    }

    quickAdd(inputId, hours) {
        const input = document.getElementById(inputId);
        const currentValue = parseFloat(input.value) || 0;
        let newValue = currentValue + hours;
        
        // Maksimum 24 saat kontrolü
        if (newValue > 24) {
            newValue = 24;
            this.showWarning('⚠️ Maksimum 24 saat sınırına ulaşıldı!');
        }
        
        input.value = newValue.toFixed(2);
        
        // Check if it's a productive activity
        const isProductive = ['reading', 'exercise', 'learning'].includes(inputId);
        
        if (isProductive) {
            // Special animation for productive activities
            input.classList.add('productive-glow');
            setTimeout(() => {
                input.classList.remove('productive-glow');
            }, 1000);
            
            // Show encouraging message
            this.showSuccessMessage(t('productiveAdded') || '✨ Harika! Üretken aktivite eklendi! 💪');
        } else {
            // Regular animation for other activities
            input.style.background = '#c6f6d5';
            setTimeout(() => {
                input.style.background = 'white';
            }, 500);
        }
        
        this.saveInputData();
    }
}

// Global fonksiyonlar
function closeAchievement() {
    document.getElementById('achievementPopup').style.display = 'none';
}

function quickAdd(inputId, hours) {
    if (window.bosmatikApp) {
        window.bosmatikApp.quickAdd(inputId, hours);
    }
}



// Uygulama başlat
document.addEventListener('DOMContentLoaded', () => {
    window.bosmatikApp = new Bosmatik();
    window.bosmatikApp.loadInputData();
    window.bosmatikApp.displayAchievements();
    window.bosmatikApp.displayLeaderboard();
    
    // Modal event listeners - removed import functionality
});

// Sayfa yüklendiğinde hoş geldin mesajı
window.addEventListener('load', () => {
    console.log('🎮 Boşmatik - Günlük Boş Yapma Takipçisi');
    console.log('Sosyal medyada ne kadar vakit geçirdiğini öğren ve arkadaşlarınla yarış!');
});
// Button Style Management
function switchButtonStyle(style) {
    const floatingBtn = document.getElementById('calculate');
    const bottomBar = document.getElementById('bottomBar');
    const styleBtns = document.querySelectorAll('.style-btn');
    
    // Remove active class from all style buttons
    styleBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    switch(style) {
        case 'floating':
            floatingBtn.style.display = 'block';
            floatingBtn.className = 'calculate-btn floating-btn';
            bottomBar.style.display = 'none';
            break;
            
        case 'bottom':
            floatingBtn.style.display = 'none';
            bottomBar.style.display = 'block';
            break;
            
        case 'inline':
            floatingBtn.style.display = 'block';
            floatingBtn.className = 'calculate-btn inline-style';
            bottomBar.style.display = 'none';
            break;
    }
    
    // Save preference
    localStorage.setItem('bosmatik-button-style', style);
}

function clearAllInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = 0;
        input.style.background = '#ffebee';
        setTimeout(() => {
            input.style.background = 'white';
        }, 300);
    });
    
    if (window.bosmatikApp) {
        window.bosmatikApp.saveInputData();
    }
    
    // Show success message
    const msg = document.createElement('div');
    msg.innerHTML = '🗑️ Tüm veriler temizlendi!';
    msg.style.cssText = `
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
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 2000);
}



// Enhanced Calculate Function with Animation
function enhancedCalculate() {
    const btn = document.getElementById('calculate');
    
    // Add calculating animation
    btn.classList.add('calculating');
    
    // Simulate processing time for better UX
    setTimeout(() => {
        try {
            if (window.bosmatikApp) {
                window.bosmatikApp.calculateBoşYapma();
            }
        } catch (error) {
            console.error('Hesaplama hatası:', error);
        }
        
        btn.classList.remove('calculating');
        
        // Add success animation
        btn.classList.add('success');
        setTimeout(() => {
            btn.classList.remove('success');
        }, 600);
        
    }, 500); // Süreyi kısalttım
}

// Load saved button style on page load
document.addEventListener('DOMContentLoaded', () => {
    // Inline style is now default and only option
    console.log('📱 Boşmatik yüklendi - Inline buton modu aktif');
});
// Manuel Reset Function
function manualReset() {
    if (confirm('🔄 Yeni güne başlamak için tüm günlük verileri sıfırlamak istiyor musun?')) {
        // Input verilerini sıfırla
        localStorage.removeItem('bosmatik-inputs');
        
        // Günlük başarıları sıfırla
        if (window.bosmatikApp) {
            window.bosmatikApp.userData.unlockedAchievements.daily = [];
            window.bosmatikApp.userData.lastDailyReset = new Date().toDateString();
            window.bosmatikApp.userData.lastInputReset = new Date().toDateString();
            window.bosmatikApp.saveUserData();
        }
        
        // Tüm input'ları sıfırla
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = 0;
            input.style.background = '#ffebee';
            setTimeout(() => {
                input.style.background = 'white';
            }, 300);
        });
        
        // Sonuçları gizle
        const results = document.getElementById('results');
        if (results) {
            results.style.display = 'none';
        }
        
        // Başarıları yeniden göster
        if (window.bosmatikApp) {
            window.bosmatikApp.displayAchievements();
            window.bosmatikApp.updateUserStats();
        }
        
        // Başarı mesajı
        const msg = document.createElement('div');
        msg.innerHTML = '🌅 Yeni gün başladı! Tüm veriler sıfırlandı!';
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            z-index: 1001;
            font-size: 1.2rem;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
            animation: popIn 0.5s ease;
        `;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 3000);
    }
}
// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install prompt
    showInstallPrompt();
});

function showInstallPrompt() {
    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt';
    installPrompt.innerHTML = `
        <div class="install-prompt-content">
            <div>
                <strong>📱 Boşmatik'i Yükle</strong><br>
                <small>Ana ekranına ekle, daha hızlı erişim!</small>
            </div>
            <div>
                <button onclick="installApp()">Yükle</button>
                <button onclick="dismissInstall()" style="margin-left: 10px; background: transparent;">Hayır</button>
            </div>
        </div>
    `;
    document.body.appendChild(installPrompt);
    
    // Auto hide after 10 seconds
    setTimeout(() => {
        if (document.body.contains(installPrompt)) {
            installPrompt.remove();
        }
    }, 10000);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('📱 Kullanıcı uygulamayı yükledi');
            }
            deferredPrompt = null;
        });
    }
    dismissInstall();
}

function dismissInstall() {
    const prompt = document.querySelector('.install-prompt');
    if (prompt) {
        prompt.remove();
    }
}

// Check if app is installed
window.addEventListener('appinstalled', (evt) => {
    console.log('📱 Boşmatik başarıyla yüklendi!');
    // Show success message
    if (window.bosmatikApp) {
        window.bosmatikApp.showSuccessMessage('🎉 Boşmatik ana ekranına eklendi!');
    }
});

// Detect if running as PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// PWA specific features
if (isPWA()) {
    console.log('📱 PWA modunda çalışıyor');
    // Add PWA specific styling or features
    document.body.classList.add('pwa-mode');
}

// Import elementlerini engelle ve temizle
function removeImportElements() {
    // Auto-import-section'ı sil
    const autoImportSection = document.querySelector('.auto-import-section');
    if (autoImportSection) {
        autoImportSection.remove();
        console.log('🗑️ Auto-import-section silindi');
    }
    
    // Usage-modal-content'i sil
    const usageModalContent = document.querySelector('.usage-modal-content');
    if (usageModalContent) {
        usageModalContent.remove();
        console.log('🗑️ Usage-modal-content silindi');
    }
    
    // ImportUsage butonunu sil
    const importButton = document.getElementById('importUsage');
    if (importButton) {
        importButton.remove();
        console.log('🗑️ Import butonu silindi');
    }
    
    // Tüm import ile ilgili elementleri sil
    document.querySelectorAll('*').forEach(el => {
        if (el.textContent && (
            el.textContent.includes('Kullanım Verilerini İçe Aktar') ||
            el.textContent.includes('Android telefonda: Ayarlar') ||
            el.textContent.includes('Dijital Sağlık')
        )) {
            el.remove();
            console.log('🗑️ Import elementi silindi:', el.tagName);
        }
    });
}

// Sayfa yüklendiğinde temizle
document.addEventListener('DOMContentLoaded', removeImportElements);

// Sürekli kontrol et (her 1 saniyede)
setInterval(removeImportElements, 1000);

// MutationObserver ile yeni eklenen elementleri engelle
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
                // Auto-import-section kontrolü
                if (node.classList && node.classList.contains('auto-import-section')) {
                    node.remove();
                    console.log('🚫 Auto-import-section engellendi');
                }
                
                // Usage-modal-content kontrolü
                if (node.classList && node.classList.contains('usage-modal-content')) {
                    node.remove();
                    console.log('🚫 Usage-modal-content engellendi');
                }
                
                // İçerik kontrolü
                if (node.textContent && (
                    node.textContent.includes('Kullanım Verilerini İçe Aktar') ||
                    node.textContent.includes('Android telefonda: Ayarlar')
                )) {
                    node.remove();
                    console.log('🚫 Import elementi engellendi');
                }
                
                // Alt elementleri de kontrol et
                if (node.querySelector) {
                    const importElements = node.querySelectorAll('.auto-import-section, .usage-modal-content, #importUsage');
                    importElements.forEach(el => {
                        el.remove();
                        console.log('🚫 Alt import elementi engellendi');
                    });
                }
            }
        });
    });
});

// Observer'ı başlat
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});

console.log('🛡️ Import engelleyici aktif!');
// Dil seçici butonlarını güncelle
function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`lang-${currentLanguage}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Sayfa yüklendiğinde dil butonlarını güncelle
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateLanguageButtons();
    }, 100);
});
// Dark Mode Functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bosmatik-theme', newTheme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('bosmatik-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
});

// Modern UI Enhancements
function addModernAnimations() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.activity-group, .achievement-item, .result-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.quick-add, .calculate-btn, .lang-btn, .theme-toggle');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(2);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize modern animations
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addModernAnimations, 500);
});
// Push Notification System
class NotificationManager {
    constructor() {
        this.settings = this.loadSettings();
        this.initializeNotifications();
    }
    
    loadSettings() {
        const defaultSettings = {
            enabled: false,
            time: '20:00',
            achievements: true,
            weeklyReport: true,
            autoReset: true,
            soundEffects: true
        };
        
        const saved = localStorage.getItem('bosmatik-notification-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    
    saveSettings() {
        localStorage.setItem('bosmatik-notification-settings', JSON.stringify(this.settings));
    }
    
    async initializeNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Service Worker'ı kaydet
            try {
                const registration = await navigator.serviceWorker.ready;
                console.log('🔔 Service Worker hazır, bildirimler aktif');
            } catch (error) {
                console.error('Service Worker hatası:', error);
            }
        }
    }
    
    async requestPermission() {
        if (!('Notification' in window)) {
            alert(t('notificationNotSupported') || 'Bu tarayıcı bildirimleri desteklemiyor.');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            alert(t('notificationDenied') || 'Bildirimler engellenmiş. Tarayıcı ayarlarından etkinleştirin.');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    async enableNotifications() {
        const hasPermission = await this.requestPermission();
        if (hasPermission) {
            this.settings.enabled = true;
            this.saveSettings();
            this.scheduleDailyReminder();
            this.showSuccessMessage(t('notificationsEnabled') || '🔔 Bildirimler etkinleştirildi!');
            return true;
        }
        return false;
    }
    
    disableNotifications() {
        this.settings.enabled = false;
        this.saveSettings();
        this.clearScheduledNotifications();
        this.showSuccessMessage(t('notificationsDisabled') || '🔕 Bildirimler devre dışı bırakıldı.');
    }
    
    scheduleDailyReminder() {
        if (!this.settings.enabled) return;
        
        const [hours, minutes] = this.settings.time.split(':');
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Eğer bugünkü saat geçmişse, yarına planla
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const delay = scheduledTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendDailyReminder();
            // Sonraki gün için tekrar planla
            this.scheduleDailyReminder();
        }, delay);
        
        console.log(`📅 Günlük hatırlatma planlandı: ${scheduledTime.toLocaleString()}`);
    }
    
    sendDailyReminder() {
        if (!this.settings.enabled) return;
        
        const title = t('dailyReminderTitle') || '🎮 Boşmatik';
        const body = t('dailyReminderBody') || 'Bugün ne kadar boş yaptın? Hemen kontrol et!';
        
        this.showNotification(title, {
            body: body,
            icon: './icon-192.png',
            badge: './icon-192.png',
            tag: 'daily-reminder',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: t('openApp') || 'Uygulamayı Aç'
                },
                {
                    action: 'dismiss',
                    title: t('dismiss') || 'Kapat'
                }
            ]
        });
    }
    
    sendAchievementNotification(achievementName, achievementDesc) {
        if (!this.settings.achievements) return;
        
        const title = t('newAchievement') || '🏆 Yeni Başarı!';
        const body = `${achievementName}: ${achievementDesc}`;
        
        this.showNotification(title, {
            body: body,
            icon: './icon-192.png',
            badge: './icon-192.png',
            tag: 'achievement',
            requireInteraction: true
        });
    }
    
    sendWeeklyReport(stats) {
        if (!this.settings.weeklyReport) return;
        
        const title = t('weeklyReportTitle') || '📊 Haftalık Rapor';
        const body = t('weeklyReportBody') || `Bu hafta toplam ${stats.totalHours} saat boş yaptın!`;
        
        this.showNotification(title, {
            body: body,
            icon: './icon-192.png',
            badge: './icon-192.png',
            tag: 'weekly-report'
        });
    }
    
    showNotification(title, options) {
        if ('serviceWorker' in navigator && this.settings.enabled) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, options);
            });
        } else if (Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }
    
    testNotification() {
        console.log('🔔 Test bildirimi başlatılıyor...');
        
        const title = t('testNotificationTitle') || '🔔 Test Bildirimi';
        const body = t('testNotificationBody') || 'Bildirimler düzgün çalışıyor! 🎉';
        
        // First check if notifications are supported
        if (!('Notification' in window)) {
            console.error('Bildirimler desteklenmiyor');
            alert(t('notificationNotSupported') || 'Bu tarayıcı bildirimleri desteklemiyor.');
            return;
        }
        
        console.log('Bildirim izni durumu:', Notification.permission);
        
        // Check permission and request if needed
        if (Notification.permission === 'default') {
            console.log('İzin isteniyor...');
            Notification.requestPermission().then(permission => {
                console.log('İzin sonucu:', permission);
                if (permission === 'granted') {
                    this.sendTestNotification(title, body);
                } else {
                    alert(t('notificationDenied') || 'Bildirimler engellenmiş. Tarayıcı ayarlarından etkinleştirin.');
                }
            }).catch(error => {
                console.error('İzin isteme hatası:', error);
                alert('Bildirim izni alınırken hata oluştu: ' + error.message);
            });
        } else if (Notification.permission === 'granted') {
            console.log('İzin zaten verilmiş, bildirim gönderiliyor...');
            this.sendTestNotification(title, body);
        } else {
            console.error('Bildirim izni reddedilmiş');
            alert(t('notificationDenied') || 'Bildirimler engellenmiş. Tarayıcı ayarlarından etkinleştirin.');
        }
    }
    
    sendTestNotification(title, body) {
        console.log('Test bildirimi gönderiliyor:', title, body);
        
        try {
            // Önce basit Notification API'yi dene (daha güvenilir)
            const notification = new Notification(title, {
                body: body,
                icon: './icon-192.png',
                tag: 'test',
                requireInteraction: false
            });
            
            console.log('✅ Test bildirimi başarıyla oluşturuldu');
            this.showSuccessMessage(t('testNotificationSent') || '🔔 Test bildirimi gönderildi!');
            
            // Bildirim tıklandığında
            notification.onclick = function() {
                console.log('Test bildirimi tıklandı');
                window.focus();
                notification.close();
            };
            
            // 5 saniye sonra otomatik kapat
            setTimeout(() => {
                notification.close();
                console.log('Test bildirimi otomatik kapatıldı');
            }, 5000);
            
        } catch (error) {
            console.error('Basit bildirim hatası:', error);
            
            // Service Worker ile dene
            if ('serviceWorker' in navigator) {
                console.log('Service Worker ile deneniyor...');
                navigator.serviceWorker.ready.then(registration => {
                    return registration.showNotification(title, {
                        body: body,
                        icon: './icon-192.png',
                        badge: './icon-192.png',
                        tag: 'test',
                        requireInteraction: false,
                        vibrate: [200, 100, 200]
                    });
                }).then(() => {
                    console.log('✅ Service Worker bildirimi başarılı');
                    this.showSuccessMessage(t('testNotificationSent') || '🔔 Test bildirimi gönderildi!');
                }).catch(swError => {
                    console.error('Service Worker bildirim hatası:', swError);
                    // Yine de başarı mesajı göster çünkü izin verilmiş
                    this.showSuccessMessage('Bildirim gönderildi (hata olabilir: ' + swError.message + ')');
                });
            } else {
                console.error('Service Worker desteklenmiyor');
                // Yine de başarı mesajı göster
                this.showSuccessMessage('Bildirim API\'si çalışıyor (görsel bildirim gösterilmeyebilir)');
            }
        }
    }
    
    clearScheduledNotifications() {
        // Mevcut timeout'ları temizle (basit implementasyon)
        console.log('🗑️ Planlanmış bildirimler temizlendi');
    }
    
    showSuccessMessage(message) {
        const successMsg = document.createElement('div');
        successMsg.innerHTML = message;
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
            box-shadow: 0 5px 15px rgba(72, 187, 120, 0.3);
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }
}

// Global notification manager
let notificationManager;

// Settings Modal Functions
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
    loadSettingsUI();
    updateSettingsModalTexts(); // Ayarlar modalı açıldığında metinleri güncelle
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function loadSettingsUI() {
    if (!notificationManager) return;
    
    const settings = notificationManager.settings;
    
    document.getElementById('enableNotifications').checked = settings.enabled;
    document.getElementById('notificationTime').value = settings.time;
    document.getElementById('achievementNotifications').checked = settings.achievements;
    document.getElementById('weeklyReport').checked = settings.weeklyReport;
    document.getElementById('autoReset').checked = settings.autoReset;
    document.getElementById('soundEffects').checked = settings.soundEffects;
    
    // Show/hide notification time based on enabled state
    const timeGroup = document.getElementById('notificationTimeGroup');
    timeGroup.style.display = settings.enabled ? 'flex' : 'none';
}

async function toggleNotifications() {
    const enabled = document.getElementById('enableNotifications').checked;
    
    if (enabled) {
        const success = await notificationManager.enableNotifications();
        if (!success) {
            document.getElementById('enableNotifications').checked = false;
            return;
        }
    } else {
        notificationManager.disableNotifications();
    }
    
    // Show/hide notification time
    const timeGroup = document.getElementById('notificationTimeGroup');
    timeGroup.style.display = enabled ? 'flex' : 'none';
}

function updateNotificationTime() {
    const time = document.getElementById('notificationTime').value;
    notificationManager.settings.time = time;
    notificationManager.saveSettings();
    notificationManager.scheduleDailyReminder();
}

function updateAchievementNotifications() {
    const enabled = document.getElementById('achievementNotifications').checked;
    notificationManager.settings.achievements = enabled;
    notificationManager.saveSettings();
}

function updateWeeklyReport() {
    const enabled = document.getElementById('weeklyReport').checked;
    notificationManager.settings.weeklyReport = enabled;
    notificationManager.saveSettings();
}

function updateAutoReset() {
    const enabled = document.getElementById('autoReset').checked;
    notificationManager.settings.autoReset = enabled;
    notificationManager.saveSettings();
}

function updateSoundEffects() {
    const enabled = document.getElementById('soundEffects').checked;
    notificationManager.settings.soundEffects = enabled;
    notificationManager.saveSettings();
}

// Firebase Login Functions
async function loginWithGoogle() {
    try {
        if (!window.firebaseService) {
            console.error('Firebase servisi yüklenmemiş');
            alert('Firebase servisi yükleniyor, lütfen bekleyin...');
            return;
        }
        const user = await window.firebaseService.loginWithGoogle();
        console.log('Google giriş başarılı:', user.displayName);
    } catch (error) {
        console.error('Google giriş hatası:', error);
        alert('Google girişi başarısız: ' + error.message);
    }
}

async function loginAnonymously() {
    try {
        if (!window.firebaseService) {
            console.error('Firebase servisi yüklenmemiş');
            alert('Firebase servisi yükleniyor, lütfen bekleyin...');
            return;
        }
        const user = await window.firebaseService.loginAnonymously();
        console.log('Anonim giriş başarılı:', user.uid);
    } catch (error) {
        console.error('Anonim giriş hatası:', error);
        alert('Anonim giriş başarısız: ' + error.message);
    }
}

async function logout() {
    try {
        if (!window.firebaseService) return;
        await window.firebaseService.logout();
    } catch (error) {
        console.error('Çıkış hatası:', error);
    }
}

// Firebase Leaderboard Integration
async function updateFirebaseLeaderboard(score, activities) {
    if (!window.firebaseService || !window.firebaseService.currentUser) {
        console.log('Firebase kullanıcısı yok, yerel sıralama kullanılıyor');
        return;
    }

    try {
        const scoreData = {
            score: score,
            points: Math.floor(score * 10),
            activities: activities
        };

        await window.firebaseService.submitScore(scoreData);
        console.log('✅ Firebase skorları güncellendi');
        
        // Gerçek sıralamayı yükle
        await loadFirebaseLeaderboard();
    } catch (error) {
        console.error('Firebase skor gönderme hatası:', error);
    }
}

async function loadFirebaseLeaderboard() {
    if (!window.firebaseService) {
        console.log('Firebase servisi yok');
        return;
    }

    try {
        const dailyLeaderboard = await window.firebaseService.getLeaderboard('daily', 10);
        const alltimeLeaderboard = await window.firebaseService.getLeaderboard('alltime', 10);
        
        displayFirebaseLeaderboard(dailyLeaderboard, alltimeLeaderboard);
    } catch (error) {
        console.error('Firebase sıralama yükleme hatası:', error);
    }
}

function displayFirebaseLeaderboard(dailyLeaderboard, alltimeLeaderboard) {
    const leaderboardContainer = document.getElementById('leaderboardList');
    if (!leaderboardContainer) return;

    let html = '<div class="leaderboard-tabs">';
    html += '<button class="tab-btn active" onclick="showLeaderboardTab(\'daily\')">📅 Günlük</button>';
    html += '<button class="tab-btn" onclick="showLeaderboardTab(\'alltime\')">🏆 Tüm Zamanlar</button>';
    html += '</div>';

    // Daily Leaderboard
    html += '<div id="dailyLeaderboard" class="leaderboard-content">';
    if (dailyLeaderboard.length > 0) {
        dailyLeaderboard.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            html += `
                <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}">
                    <div class="rank">${medal}</div>
                    <div class="user-info">
                        ${user.photoURL ? `<img src="${user.photoURL}" alt="Avatar" class="user-avatar-small">` : '👤'}
                        <span class="username">${user.displayName}</span>
                    </div>
                    <div class="score">${user.score.toFixed(1)} puan</div>
                </div>
            `;
        });
    } else {
        html += '<div class="no-data">Henüz günlük skor yok</div>';
    }
    html += '</div>';

    // All Time Leaderboard
    html += '<div id="alltimeLeaderboard" class="leaderboard-content" style="display: none;">';
    if (alltimeLeaderboard.length > 0) {
        alltimeLeaderboard.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            html += `
                <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}">
                    <div class="rank">${medal}</div>
                    <div class="user-info">
                        ${user.photoURL ? `<img src="${user.photoURL}" alt="Avatar" class="user-avatar-small">` : '👤'}
                        <span class="username">${user.displayName}</span>
                    </div>
                    <div class="score">Seviye ${user.level} • ${user.totalPoints.toLocaleString()} puan</div>
                </div>
            `;
        });
    } else {
        html += '<div class="no-data">Henüz kullanıcı yok</div>';
    }
    html += '</div>';

    leaderboardContainer.innerHTML = html;
}

function showLeaderboardTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Show/hide content
    document.getElementById('dailyLeaderboard').style.display = tab === 'daily' ? 'block' : 'none';
    document.getElementById('alltimeLeaderboard').style.display = tab === 'alltime' ? 'block' : 'none';
}

// Profile Management Functions
let selectedAvatar = '👤';

function openProfile() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    
    // Load current profile data
    if (window.firebaseService && window.firebaseService.userProfile) {
        const profile = window.firebaseService.userProfile;
        document.getElementById('displayName').value = profile.displayName || '';
        document.getElementById('currentName').textContent = profile.displayName || 'Anonim Kullanıcı';
        
        const currentAvatar = profile.customAvatar || profile.photoURL || '👤';
        if (!profile.photoURL || profile.customAvatar) {
            document.getElementById('currentAvatar').textContent = currentAvatar;
            selectedAvatar = currentAvatar;
            selectAvatar(currentAvatar);
        } else {
            document.getElementById('currentAvatar').innerHTML = `<img src="${profile.photoURL}" alt="Profile" class="current-avatar-img">`;
            selectedAvatar = '👤';
        }
    }
    
    modal.style.display = 'flex';
    updateProfileTexts();
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function selectAvatar(avatar) {
    selectedAvatar = avatar;
    
    // Update visual selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`[data-avatar="${avatar}"]`).classList.add('selected');
    
    // Update preview
    document.getElementById('currentAvatar').textContent = avatar;
}

async function saveProfile() {
    const displayName = document.getElementById('displayName').value.trim();
    
    if (!displayName) {
        alert(t('displayNameRequired') || 'Görünen isim gerekli!');
        return;
    }
    
    if (displayName.length > 20) {
        alert(t('displayNameTooLong') || 'Görünen isim çok uzun! (Max 20 karakter)');
        return;
    }
    
    try {
        if (!window.firebaseService) {
            throw new Error('Firebase servisi yok');
        }
        
        await window.firebaseService.updateUserProfile(displayName, selectedAvatar);
        
        // Show success message
        showSuccessMessage(t('profileUpdated') || '✅ Profil güncellendi!');
        
        closeProfile();
    } catch (error) {
        console.error('Profil kaydetme hatası:', error);
        alert(t('profileUpdateError') || 'Profil güncellenirken hata oluştu: ' + error.message);
    }
}

function updateProfileTexts() {
    // Update profile modal texts based on current language
    const profileTitle = document.getElementById('profileTitle');
    if (profileTitle) {
        profileTitle.textContent = t('editProfile') || '👤 Profil Düzenle';
    }
    
    const displayNameLabel = document.getElementById('displayNameLabel');
    if (displayNameLabel) {
        displayNameLabel.textContent = t('displayName') || 'Görünen İsim';
    }
    
    const avatarLabel = document.getElementById('avatarLabel');
    if (avatarLabel) {
        avatarLabel.textContent = t('selectAvatar') || 'Avatar Seç';
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.textContent = t('cancel') || 'İptal';
    }
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.textContent = t('save') || 'Kaydet';
    }
}

function showSuccessMessage(message) {
    const successMsg = document.createElement('div');
    successMsg.innerHTML = message;
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
        box-shadow: 0 5px 15px rgba(72, 187, 120, 0.3);
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

function testNotification() {
    if (!notificationManager) return;
    notificationManager.testNotification();
}

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    notificationManager = new NotificationManager();
    
    // Başarı bildirimlerini entegre et
    if (window.bosmatikApp) {
        const originalShowAchievement = window.bosmatikApp.showAchievement;
        window.bosmatikApp.showAchievement = function(title, description, category) {
            originalShowAchievement.call(this, title, description, category);
            if (notificationManager) {
                notificationManager.sendAchievementNotification(title, description);
            }
        };
    }
});
