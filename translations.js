// Boşmatik Çeviri Dosyası
const translations = {
    tr: {
        // Header
        title: "🎮 Boşmatik",
        subtitle: "Günlük boş yapma seviyeni keşfet ve arkadaşlarınla yarış!",
        level: "Seviye",
        totalPoints: "Toplam Puan",
        dailyStreak: "Günlük Seri",
        
        // Main Section
        mainTitle: "📱 Bugün Ne Kadar Boş Yaptın?",
        
        // Activity Groups
        socialMediaTitle: "🔥 Sosyal Medya & Eğlence",
        entertainmentTitle: "🎯 Diğer Boş Aktiviteler",
        productiveTitle: "💪 Üretken Aktiviteler (Puan Azaltır)",
        
        // Activities
        instagram: "📸 Fotoğraf Paylaşım:",
        tiktok: "🎵 Kısa Video:",
        youtube: "📺 Video İzleme:",
        twitter: "🐦 Mikroblog:",
        facebook: "👥 Sosyal Ağ:",
        twitch: "🎮 Canlı Yayın:",
        discord: "💬 Sesli Sohbet:",
        snapchat: "👻 Anlık Mesaj:",
        linkedin: "💼 Profesyonel Ağ:",
        reddit: "🤖 Forum:",
        netflix: "🍿 Dizi/Film İzleme:",
        games: "🎮 Oyun:",
        spotify: "🎵 Müzik Dinleme:",
        random: "🤷‍♂️ Rastgele Gezinme:",
        shopping: "🛒 Online Alışveriş:",
        whatsapp: "📱 Anlık Mesajlaşma:",
        telegram: "✈️ Mesajlaşma:",
        reading: "📚 Kitap Okuma:",
        exercise: "🏃‍♂️ Spor:",
        learning: "🎓 Öğrenme/Kurs:",
        
        // Time unit
        hours: "saat",
        
        // Buttons
        calculateBtn: "Boş Yapma Seviyemi Hesapla!",
        newDayBtn: "🌅 Yeni Gün Başlat",
        clearBtn: "Temizle",
        calculateBtnShort: "Hesapla",
        themeToggle: "Tema Değiştir",
        okBtn: "Tamam",
        
        // Settings
        settings: "⚙️ Ayarlar",
        notificationSettings: "🔔 Bildirim Ayarları",
        appSettings: "📱 Uygulama Ayarları",
        enableNotifications: "Bildirimleri Etkinleştir",
        notificationTime: "Günlük Hatırlatma Saati",
        achievementNotifications: "Başarı Bildirimleri",
        weeklyReport: "Haftalık Rapor",
        autoReset: "Otomatik Günlük Sıfırlama",
        soundEffects: "Ses Efektleri",
        testNotification: "🔔 Test Bildirimi Gönder",
        
        // Notifications
        dailyReminderTitle: "🎮 Boşmatik",
        dailyReminderBody: "Bugün ne kadar boş yaptın? Hemen kontrol et!",
        weeklyReportTitle: "📊 Haftalık Rapor",
        weeklyReportBody: "Bu hafta toplam {hours} saat boş yaptın!",
        testNotificationTitle: "🔔 Test Bildirimi",
        testNotificationBody: "Bildirimler düzgün çalışıyor! 🎉",
        testNotificationSent: "🔔 Test bildirimi gönderildi!",
        notificationsEnabled: "🔔 Bildirimler etkinleştirildi!",
        notificationsDisabled: "🔕 Bildirimler devre dışı bırakıldı.",
        notificationNotSupported: "Bu tarayıcı bildirimleri desteklemiyor.",
        notificationDenied: "Bildirimler engellenmiş. Tarayıcı ayarlarından etkinleştirin.",
        openApp: "Uygulamayı Aç",
        dismiss: "Kapat",
        
        // Results
        todayLevel: "Bugünkü Boş Yapma Seviyesi:",
        pointsLabel: "Boş Puan",
        analysisTitle: "📊 Boş Yapma Analizi",
        leaderboardTitle: "🏆 Günlük Sıralama",
        achievementsTitle: "🎖️ Başarılar",
        tipsTitle: "💡 Boş Yapma İpuçları",
        
        // Achievement Categories
        dailyAchievements: "🌅 Günlük",
        weeklyAchievements: "🔥 Haftalık", 
        monthlyAchievements: "🏆 Aylık",
        yearlyAchievements: "🌟 Yıllık",
        
        // Achievement Category Names (for dynamic display)
        categoryNames: {
            daily: "🌅 Günlük",
            weekly: "🔥 Haftalık", 
            monthly: "🏆 Aylık",
            yearly: "🌟 Yıllık"
        },
        
        // Levels
        levels: {
            productive: "Üretken Karınca",
            lightWaster: "Hafif Boşçu",
            mediumWaster: "Orta Seviye Boşçu",
            advancedWaster: "İleri Seviye Boşçu",
            master: "Boş Yapma Ustası",
            legend: "Boş Yapma Efsanesi",
            god: "Boş Yapma Tanrısı"
        },
        
        // Messages
        newDayStarted: "🌅 Yeni gün başladı! Tüm veriler sıfırlandı!",
        allDataCleared: "🗑️ Tüm veriler temizlendi!",
        maxHoursWarning: "⚠️ Maksimum 24 saat girilebilir!",
        maxHoursReached: "⚠️ Maksimum 24 saat sınırına ulaşıldı!",
        productiveAdded: "✨ Harika! Üretken aktivite eklendi! 💪",
        newDayConfirm: "🔄 Yeni güne başlamak için tüm günlük verileri sıfırlamak istiyor musun?",
        newAchievement: "🏆 Yeni Başarı!",
        achievementUnlocked: "Başarı Kilidi Açıldı!",
        bonusPoints: "Bonus Puan",
        levelUpMessage: "Tebrikler! {level}. seviyeye ulaştınız! 🎉",
        
        // Achievements
        achievements: {
            daily_first_entry: { name: "Günlük Giriş", desc: "Bugün ilk giriş" },
            daily_social_limit: { name: "Sosyal Medya Kontrolü", desc: "Sosyal medyada 3 saatten az" },
            daily_entertainment_limit: { name: "Eğlence Dengesi", desc: "Eğlence aktivitelerinde 2.5 saatten az" },
            daily_productive_goal: { name: "Günlük Üretkenlik", desc: "2+ saat üretken aktivite" },
            daily_balanced: { name: "Dengeli Gün", desc: "Hem boş hem üretken aktivite" },
            daily_low_waste: { name: "Az Boş Yapan", desc: "5 saatten az boş aktivite" },
            
            week_streak: { name: "Haftalık Seri", desc: "7 gün üst üste giriş" },
            week_social_master: { name: "Sosyal Medya Ustası", desc: "8+ saat sosyal medya (haftalık)" },
            week_tiktok_addict: { name: "Kısa Video Bağımlısı", desc: "5+ saat kısa video" },
            week_netflix_binge: { name: "Dizi Maratoncusu", desc: "6+ saat dizi/film" },
            week_gamer: { name: "Oyun Tutkunu", desc: "8+ saat oyun" },
            week_bookworm: { name: "Kitap Kurdu", desc: "10+ saat kitap okuma" },
            week_athlete: { name: "Sporcu Ruhu", desc: "8+ saat spor" },
            
            month_streak: { name: "Aylık Seri", desc: "30 gün üst üste giriş" },
            month_multitasker: { name: "Çoklu Platform Ustası", desc: "10+ farklı platformda aktif" },
            month_time_waster: { name: "Zaman Tüketicisi", desc: "50+ toplam boş saat" },
            month_boş_master: { name: "Boş Yapma Ustası", desc: "35+ boş puan" },
            month_learner: { name: "Öğrenme Gurusu", desc: "30+ saat öğrenme" },
            month_balanced_master: { name: "Denge Ustası", desc: "20+ saat üretken aktivite" },
            
            year_legend: { name: "Boşmatik Efsanesi", desc: "365 gün üst üste giriş" },
            year_point_master: { name: "Puan Koleksiyoncusu", desc: "100,000+ toplam puan" },
            year_level_god: { name: "Seviye Tanrısı", desc: "50. seviyeye ulaş" },
            year_boş_god: { name: "Boş Yapma Tanrısı", desc: "100+ boş puan tek seferde" },
            year_productivity_king: { name: "Üretkenlik Kralı", desc: "500+ saat üretken aktivite" }
        },
        
        // Tips
        tips: [
            "Kısa video uygulamasında 'sadece 5 dakika' diyerek başlayıp 3 saat geçirmek boş yapma sanatının zirvesidir! 🎭",
            "Fotoğraf paylaşım uygulamasında arkadaşının arkadaşının tatil fotoğraflarına bakmak da boş yapma puanı kazandırır! 📸",
            "Video izleme sitesinde 'nasıl üretken olunur' videoları izlemek ironik bir boş yapma aktivitesidir! 🤔",
            "Online alışverişte sepete ekleyip almamak da bir boş yapma türüdür! 🛒",
            "Sosyal medyada eski sevgilinin profilini stalklama = ekstra boş puan! 🕵️‍♂️",
            "Dizi/film platformunda 30 dakika içerik seçmek, izlemekten daha uzun sürebilir! 🎬",
            "Telefonda oyun oynarken 'sadece bu level' demek ünlü son sözlerdendir! 🎮",
            "Rastgele internet gezintisi sırasında nasıl buraya geldiğini unutmak normaldır! 🌐"
        ]
    },
    
    en: {
        // Header
        title: "🎮 Wastematic",
        subtitle: "Discover your daily time-wasting level and compete with friends!",
        level: "Level",
        totalPoints: "Total Points",
        dailyStreak: "Daily Streak",
        
        // Main Section
        mainTitle: "📱 How Much Time Did You Waste Today?",
        
        // Activity Groups
        socialMediaTitle: "🔥 Social Media & Entertainment",
        entertainmentTitle: "🎯 Other Wasting Activities",
        productiveTitle: "💪 Productive Activities (Reduces Points)",
        
        // Activities
        instagram: "📸 Photo Sharing:",
        tiktok: "🎵 Short Video:",
        youtube: "📺 Video Watching:",
        twitter: "🐦 Microblog:",
        facebook: "👥 Social Network:",
        twitch: "🎮 Live Streaming:",
        discord: "💬 Voice Chat:",
        snapchat: "👻 Instant Message:",
        linkedin: "💼 Professional Network:",
        reddit: "🤖 Forum:",
        netflix: "🍿 Series/Movie Watching:",
        games: "🎮 Gaming:",
        spotify: "🎵 Music Listening:",
        random: "🤷‍♂️ Random Browsing:",
        shopping: "🛒 Online Shopping:",
        whatsapp: "📱 Instant Messaging:",
        telegram: "✈️ Messaging:",
        reading: "📚 Reading:",
        exercise: "🏃‍♂️ Exercise:",
        learning: "🎓 Learning/Course:",
        
        // Time unit
        hours: "hours",
        
        // Buttons
        calculateBtn: "Calculate My Wasting Level!",
        newDayBtn: "🌅 Start New Day",
        clearBtn: "Clear",
        calculateBtnShort: "Calculate",
        themeToggle: "Toggle Theme",
        okBtn: "OK",
        
        // Settings
        settings: "⚙️ Settings",
        notificationSettings: "🔔 Notification Settings",
        appSettings: "📱 App Settings",
        enableNotifications: "Enable Notifications",
        notificationTime: "Daily Reminder Time",
        achievementNotifications: "Achievement Notifications",
        weeklyReport: "Weekly Report",
        autoReset: "Auto Daily Reset",
        soundEffects: "Sound Effects",
        testNotification: "🔔 Send Test Notification",
        
        // Notifications
        dailyReminderTitle: "🎮 Wastematic",
        dailyReminderBody: "How much time did you waste today? Check now!",
        weeklyReportTitle: "📊 Weekly Report",
        weeklyReportBody: "You wasted {hours} hours this week!",
        testNotificationTitle: "🔔 Test Notification",
        testNotificationBody: "Notifications are working properly! 🎉",
        testNotificationSent: "🔔 Test notification sent!",
        notificationsEnabled: "🔔 Notifications enabled!",
        notificationsDisabled: "🔕 Notifications disabled.",
        notificationNotSupported: "This browser doesn't support notifications.",
        notificationDenied: "Notifications are blocked. Enable them in browser settings.",
        openApp: "Open App",
        dismiss: "Dismiss",
        
        // Results
        todayLevel: "Today's Time-Wasting Level:",
        pointsLabel: "Waste Points",
        analysisTitle: "📊 Time-Wasting Analysis",
        leaderboardTitle: "🏆 Daily Ranking",
        achievementsTitle: "🎖️ Achievements",
        tipsTitle: "💡 Time-Wasting Tips",
        
        // Achievement Categories
        dailyAchievements: "🌅 Daily",
        weeklyAchievements: "🔥 Weekly",
        monthlyAchievements: "🏆 Monthly", 
        yearlyAchievements: "🌟 Yearly",
        
        // Achievement Category Names (for dynamic display)
        categoryNames: {
            daily: "🌅 Daily",
            weekly: "🔥 Weekly",
            monthly: "🏆 Monthly", 
            yearly: "🌟 Yearly"
        },
        
        // Levels
        levels: {
            productive: "Productive Ant",
            lightWaster: "Light Waster",
            mediumWaster: "Medium Waster",
            advancedWaster: "Advanced Waster",
            master: "Time-Wasting Master",
            legend: "Time-Wasting Legend",
            god: "Time-Wasting God"
        },
        
        // Messages
        newDayStarted: "🌅 New day started! All data has been reset!",
        allDataCleared: "🗑️ All data cleared!",
        maxHoursWarning: "⚠️ Maximum 24 hours can be entered!",
        maxHoursReached: "⚠️ Maximum 24 hours limit reached!",
        productiveAdded: "✨ Great! Productive activity added! 💪",
        newDayConfirm: "🔄 Do you want to reset all daily data to start a new day?",
        newAchievement: "🏆 New Achievement!",
        achievementUnlocked: "Achievement Unlocked!",
        bonusPoints: "Bonus Points",
        levelUpMessage: "Congratulations! You reached level {level}! 🎉",
        
        // Achievements
        achievements: {
            daily_first_entry: { name: "Daily Login", desc: "First login today" },
            daily_social_limit: { name: "Social Media Control", desc: "Less than 3 hours on social media" },
            daily_entertainment_limit: { name: "Entertainment Balance", desc: "Less than 2.5 hours on entertainment" },
            daily_productive_goal: { name: "Daily Productivity", desc: "2+ hours of productive activity" },
            daily_balanced: { name: "Balanced Day", desc: "Both wasting and productive activities" },
            daily_low_waste: { name: "Low Waster", desc: "Less than 5 hours of wasting activities" },
            
            week_streak: { name: "Weekly Streak", desc: "7 consecutive days login" },
            week_social_master: { name: "Social Media Master", desc: "8+ hours social media (weekly)" },
            week_tiktok_addict: { name: "Short Video Addict", desc: "5+ hours short video" },
            week_netflix_binge: { name: "Series Marathoner", desc: "6+ hours series/movies" },
            week_gamer: { name: "Gaming Enthusiast", desc: "8+ hours gaming" },
            week_bookworm: { name: "Bookworm", desc: "10+ hours reading" },
            week_athlete: { name: "Athletic Spirit", desc: "8+ hours exercise" },
            
            month_streak: { name: "Monthly Streak", desc: "30 consecutive days login" },
            month_multitasker: { name: "Multi-Platform Master", desc: "Active on 10+ platforms" },
            month_time_waster: { name: "Time Consumer", desc: "50+ total wasting hours" },
            month_boş_master: { name: "Wasting Master", desc: "35+ waste points" },
            month_learner: { name: "Learning Guru", desc: "30+ hours learning" },
            month_balanced_master: { name: "Balance Master", desc: "20+ hours productive activity" },
            
            year_legend: { name: "Wastematic Legend", desc: "365 consecutive days login" },
            year_point_master: { name: "Point Collector", desc: "100,000+ total points" },
            year_level_god: { name: "Level God", desc: "Reach level 50" },
            year_boş_god: { name: "Wasting God", desc: "100+ waste points in single session" },
            year_productivity_king: { name: "Productivity King", desc: "500+ hours productive activity" }
        },
        
        // Tips
        tips: [
            "Starting with 'just 5 minutes' on short video apps and ending up spending 3 hours is the pinnacle of time-wasting art! 🎭",
            "Looking at your friend's friend's vacation photos on photo sharing apps also earns waste points! 📸",
            "Watching 'how to be productive' videos on video platforms is an ironic waste activity! 🤔",
            "Adding items to your cart and not buying them is also a type of time-wasting! 🛒",
            "Stalking your ex's profile on social media = extra waste points! 🕵️‍♂️",
            "Spending 30 minutes choosing content on streaming platforms can take longer than watching it! 🎬",
            "Saying 'just this level' while playing mobile games are famous last words! 🎮",
            "Forgetting how you got somewhere during random internet browsing is totally normal! 🌐"
        ]
    }
};

// Mevcut dil
let currentLanguage = localStorage.getItem('bosmatik-language') || 'tr';

// Çeviri fonksiyonu
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    return value || key;
}

// Dil değiştirme fonksiyonu
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('bosmatik-language', lang);
    updatePageTexts();
    
    // Update settings modal if it's open
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal && settingsModal.style.display === 'flex') {
        updateSettingsTexts();
    }
    
    // Başarıları yeniden göster
    if (window.bosmatikApp) {
        window.bosmatikApp.displayAchievements();
        window.bosmatikApp.generateDailyTip();
    }
    
    // Update language buttons
    updateLanguageButtons();
}

// Sayfa metinlerini güncelle
function updatePageTexts() {
    // Header
    document.querySelector('header h1').textContent = t('title');
    document.querySelector('header p').textContent = t('subtitle');
    
    // Stats labels
    document.querySelectorAll('.stat-label')[0].textContent = t('level');
    document.querySelectorAll('.stat-label')[1].textContent = t('totalPoints');
    document.querySelectorAll('.stat-label')[2].textContent = t('dailyStreak');
    
    // Main title
    document.querySelector('.input-section h2').textContent = t('mainTitle');
    
    // Activity group titles
    document.querySelector('.social-media h3').textContent = t('socialMediaTitle');
    document.querySelector('.entertainment h3').textContent = t('entertainmentTitle');
    document.querySelector('.productive h3').textContent = t('productiveTitle');
    
    // Activity labels
    const activities = [
        'instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'twitch',
        'discord', 'snapchat', 'linkedin', 'reddit', 'netflix', 'games',
        'spotify', 'random', 'shopping', 'whatsapp', 'telegram', 'reading',
        'exercise', 'learning'
    ];
    
    activities.forEach(activity => {
        const label = document.querySelector(`label[for="${activity}"]`);
        if (label) {
            label.textContent = t(activity);
        }
    });
    
    // Time unit
    document.querySelectorAll('.input-row span').forEach(span => {
        if (span.textContent.trim() === 'saat' || span.textContent.trim() === 'hours') {
            span.textContent = t('hours');
        }
    });
    
    // Buttons
    const calculateBtn = document.querySelector('.btn-text');
    if (calculateBtn) {
        calculateBtn.textContent = t('calculateBtn');
    }
    
    const newDayBtn = document.querySelector('.reset-btn-inline');
    if (newDayBtn) {
        newDayBtn.textContent = t('newDayBtn');
    }
    
    // Results section
    const resultLabels = {
        '.label': 'todayLevel',
        '.points-label': 'pointsLabel',
        '.breakdown h3': 'analysisTitle',
        '.leaderboard h3': 'leaderboardTitle',
        '.achievements h3': 'achievementsTitle',
        '.tips h3': 'tipsTitle'
    };
    
    Object.entries(resultLabels).forEach(([selector, key]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = t(key);
        }
    });
    
    // Achievement popup
    const achievementTitle = document.getElementById('achievementTitle');
    if (achievementTitle) {
        achievementTitle.textContent = t('newAchievement');
    }
    
    const achievementOkBtn = document.getElementById('achievementOkBtn');
    if (achievementOkBtn) {
        achievementOkBtn.textContent = t('okBtn');
    }
    
    // Settings modal - her zaman güncelle
    updateSettingsModalTexts();
}

// Ayarlar modalı metinlerini güncelle (ayrı fonksiyon)
function updateSettingsModalTexts() {
    const settingsTitle = document.getElementById('settingsTitle');
    if (settingsTitle) {
        settingsTitle.textContent = t('settings');
    }
    
    const notificationSettingsTitle = document.getElementById('notificationSettingsTitle');
    if (notificationSettingsTitle) {
        notificationSettingsTitle.textContent = t('notificationSettings');
    }
    
    const appSettingsTitle = document.getElementById('appSettingsTitle');
    if (appSettingsTitle) {
        appSettingsTitle.textContent = t('appSettings');
    }
    
    const enableNotificationsLabel = document.getElementById('enableNotificationsLabel');
    if (enableNotificationsLabel) {
        enableNotificationsLabel.textContent = t('enableNotifications');
    }
    
    const notificationTimeLabel = document.getElementById('notificationTimeLabel');
    if (notificationTimeLabel) {
        notificationTimeLabel.textContent = t('notificationTime');
    }
    
    const achievementNotificationsLabel = document.getElementById('achievementNotificationsLabel');
    if (achievementNotificationsLabel) {
        achievementNotificationsLabel.textContent = t('achievementNotifications');
    }
    
    const weeklyReportLabel = document.getElementById('weeklyReportLabel');
    if (weeklyReportLabel) {
        weeklyReportLabel.textContent = t('weeklyReport');
    }
    
    const autoResetLabel = document.getElementById('autoResetLabel');
    if (autoResetLabel) {
        autoResetLabel.textContent = t('autoReset');
    }
    
    const soundEffectsLabel = document.getElementById('soundEffectsLabel');
    if (soundEffectsLabel) {
        soundEffectsLabel.textContent = t('soundEffects');
    }
    
    const testNotificationBtn = document.getElementById('testNotificationBtn');
    if (testNotificationBtn) {
        testNotificationBtn.textContent = t('testNotification');
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    updatePageTexts();
    
    // Firebase leaderboard'ını yükle
    setTimeout(() => {
        if (window.firebaseService) {
            loadFirebaseLeaderboard();
        }
    }, 2000);
});

// Global fonksiyon olarak erişilebilir hale getir
window.updateSettingsModalTexts = updateSettingsModalTexts;
