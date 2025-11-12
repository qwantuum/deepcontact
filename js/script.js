// User authentication state
let isLoggedIn = false;
let currentUser = {
    username: 'квантум',
    avatar: 'К',
    avatarImage: null,
    bannerImage: null
};

// Other users data
const otherUsers = {
    'alex': {
        username: 'Алексей',
        avatar: 'А',
        status: 'Онлайн',
        posts: [
            {
                id: 101,
                text: 'Привет всем! Сегодня отличный день для программирования.',
                time: '2 часа назад',
                likes: 5,
                comments: 2,
                shares: 1,
                liked: false,
                media: []
            }
        ]
    },
    'maria': {
        username: 'Мария',
        avatar: 'М',
        status: 'Был(a) 2 часа назад',
        posts: [
            {
                id: 102,
                text: 'Люблю слушать музыку во время работы. Какие у вас любимые треки?',
                time: '5 часов назад',
                likes: 8,
                comments: 3,
                shares: 0,
                liked: false,
                media: []
            }
        ]
    },
    'dmitry': {
        username: 'Дмитрий',
        avatar: 'Д',
        status: 'Онлайн',
        posts: [
            {
                id: 103,
                text: 'Только что закончил новый проект. Очень доволен результатом!',
                time: 'Вчера',
                likes: 12,
                comments: 5,
                shares: 2,
                liked: false,
                media: []
            }
        ]
    },
    'anna': {
        username: 'Анна',
        avatar: 'А',
        status: 'Был(a) вчера',
        posts: [
            {
                id: 104,
                text: 'Кто планирует поездку на выходные? Поделитесь идеями!',
                time: '2 дня назад',
                likes: 7,
                comments: 4,
                shares: 1,
                liked: false,
                media: []
            }
        ]
    }
};

// Music data
const musicTracks = [
    {
        id: 1,
        title: "Электронная композиция",
        artist: "Quantum Beats",
        duration: "3:45",
        src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_ec9bdb0c6c.mp3?filename=ambient-piano-amp-strings-120117.mp3"
    },
    {
        id: 2,
        title: "Мечты о будущем",
        artist: "Neural Network",
        duration: "4:20",
        src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_ec9bdb0c6c.mp3?filename=ambient-piano-amp-strings-120117.mp3"
    },
    {
        id: 3,
        title: "Космическое путешествие",
        artist: "Deep Space",
        duration: "5:15",
        src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_ec9bdb0c6c.mp3?filename=ambient-piano-amp-strings-120117.mp3"
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
const audioPlayer = document.getElementById('audio-player');
let userTracks = [];
let posts = [];
let currentMedia = [];
let currentLanguage = 'ru';
let currentViewingUser = null;

// Initialize the application
function initApp() {
    // Check if user is logged in (in a real app, this would be done with a server)
    const savedUser = localStorage.getItem('deepContactUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            showApp();
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('deepContactUser');
        }
    } else {
        // Show auth screen if not logged in
        document.getElementById('auth-screen').style.display = 'flex';
    }

    // Load user tracks from localStorage
    const savedTracks = localStorage.getItem('userTracks');
    if (savedTracks) {
        try {
            userTracks = JSON.parse(savedTracks);
            if (!Array.isArray(userTracks)) userTracks = [];
            console.log('Loaded user tracks:', userTracks.length);
            } catch (e) {
                console.error('Error parsing user tracks:', e);
                userTracks = [];
            }
    }

    // Load posts from localStorage
    const savedPosts = localStorage.getItem('userPosts');
    if (savedPosts) {
        try {
            posts = JSON.parse(savedPosts);
            if (!Array.isArray(posts)) posts = [];
            renderPosts();
            renderProfilePosts();
        } catch (e) {
            console.error('Error parsing posts:', e);
            posts = [];
        }
    }

    // Initialize music player
    initMusicPlayer();
    
    // Initialize other components
    initEventListeners();
    updateDateTime();

    // Load language preference
    const savedLang = localStorage.getItem('deepContactLanguage');
    if (savedLang) {
        currentLanguage = savedLang;
        changeLanguage(currentLanguage);
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('deepContactTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // Load mode preference
    const savedMode = localStorage.getItem('deepContactMode');
    if (savedMode === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('mode-toggle').checked = false;
    }

    console.log('DeepContact initialized successfully');
}

// Apply theme
function applyTheme(theme) {
    // Remove all theme classes from body
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-red');
    
    // Add selected theme class
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Update active theme option
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        }
    });
    
    // Save to localStorage
    localStorage.setItem('deepContactTheme', theme);
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('deepContactLanguage', lang);
    
    // Update language options
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        }
    });
}

// Show main app
function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateUIForUser();
}

// Update UI for logged in user
function updateUIForUser() {
    document.getElementById('username-display').textContent = currentUser.username;
    document.getElementById('user-avatar').textContent = currentUser.avatar;
    
    // Update avatar image if exists
    if (currentUser.avatarImage) {
        document.getElementById('user-avatar').style.backgroundImage = `url(${currentUser.avatarImage})`;
        document.getElementById('user-avatar').textContent = '';
    }
    
    document.getElementById('feed-avatar').textContent = currentUser.avatar;
    
    // Update feed avatar image if exists
    if (currentUser.avatarImage) {
        document.getElementById('feed-avatar').style.backgroundImage = `url(${currentUser.avatarImage})`;
        document.getElementById('feed-avatar').textContent = '';
    }
    
    document.getElementById('profile-name').textContent = currentUser.username;
    document.getElementById('profile-avatar').textContent = currentUser.avatar;
    
    // Update profile avatar image if exists
    if (currentUser.avatarImage) {
        document.getElementById('profile-avatar').style.backgroundImage = `url(${currentUser.avatarImage})`;
        document.getElementById('profile-avatar').textContent = '';
    }
    
    document.getElementById('settings-username').value = currentUser.username;
    
    // Update banner if exists
    if (currentUser.bannerImage) {
        document.getElementById('profile-banner').style.backgroundImage = `url(${currentUser.bannerImage})`;
        document.getElementById('profile-banner').style.backgroundSize = 'cover';
        document.getElementById('profile-banner').style.backgroundPosition = 'center';
    }
    
    // Update posts count
    document.getElementById('posts-count').textContent = posts.filter(post => post.author === currentUser.username).length;
}

// Initialize music player
function initMusicPlayer() {
    // Populate music list
    const musicList = document.getElementById('music-list');
    if (!musicList) return;
    
    musicList.innerHTML = '';
    
    // Add default tracks
    musicTracks.forEach((track, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item' + (index === currentTrackIndex ? ' active' : '');
        musicItem.innerHTML = `
            <div class="music-cover">
                <i class="fas fa-music"></i>
            </div>
            <div class="music-details">
                <div class="music-title">${track.title}</div>
                <div class="music-artist">${track.artist}</div>
            </div>
            <div class="music-duration">${track.duration}</div>
        `;
        musicItem.addEventListener('click', () => playTrack(index));
        musicList.appendChild(musicItem);
    });
    
    // Add user tracks
    userTracks.forEach((track, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `
            <div class="music-cover">
                <i class="fas fa-music"></i>
            </div>
            <div class="music-details">
                <div class="music-title">${track.title}</div>
                <div class="music-artist">${track.artist}</div>
            </div>
            <div class="music-duration">${track.duration}</div>
            <button class="delete-music" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        musicItem.addEventListener('click', () => playUserTrack(index));
        musicList.appendChild(musicItem);
    });

    // Set first track as current
    if (musicTracks.length > 0) {
        updateCurrentTrackInfo();
    }
}

// Play a track from the default list
function playTrack(index) {
    if (index < 0 || index >= musicTracks.length) return;
    
    currentTrackIndex = index;
    const track = musicTracks[index];
    
    // Check if audio source is accessible
    const testAudio = new Audio();
    testAudio.src = track.src;
    testAudio.onerror = () => {
        console.error('Failed to load audio:', track.src);
        showMessage('Не удалось загрузить аудиофайл', 'error');
        return;
    };
    
    audioPlayer.src = track.src;
    audioPlayer.play().catch(e => {
        console.error('Error playing audio:', e);
        showMessage('Ошибка воспроизведения аудио', 'error');
    });
    
    isPlaying = true;
    document.getElementById('play-icon').classList.remove('fa-play');
    document.getElementById('play-icon').classList.add('fa-pause');
    
    // Update active track in list
    document.querySelectorAll('.music-item').forEach(item => item.classList.remove('active'));
    const items = document.querySelectorAll('.music-item');
    if (items[index]) {
        items[index].classList.add('active');
    }
    
    updateCurrentTrackInfo();
}

// Play a user-uploaded track
function playUserTrack(index) {
    if (index < 0 || index >= userTracks.length) return;
    
    const track = userTracks[index];
    audioPlayer.src = track.src;
    audioPlayer.play().catch(e => {
        console.error('Error playing audio:', e);
        showMessage('Ошибка воспроизведения аудио', 'error');
    });
    
    isPlaying = true;
    document.getElementById('play-icon').classList.remove('fa-play');
    document.getElementById('play-icon').classList.add('fa-pause');
    
    // Update current track info
    document.getElementById('current-track-title').textContent = track.title;
    document.getElementById('current-track-artist').textContent = track.artist;
    
    // Update active track in list
    document.querySelectorAll('.music-item').forEach(item => item.classList.remove('active'));
    const items = document.querySelectorAll('.music-item');
    if (items[musicTracks.length + index]) {
        items[musicTracks.length + index].classList.add('active');
    }
}

// Update current track information
function updateCurrentTrackInfo() {
    const track = musicTracks[currentTrackIndex];
    document.getElementById('current-track-title').textContent = track.title;
    document.getElementById('current-track-artist').textContent = track.artist;
}

// Render posts
function renderPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Здесь пока нет постов. Будьте первым, кто поделится чем-то интересным!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author-avatar">${post.authorAvatar}</div>
                <div>
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-content">${post.text}</div>
            ${post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media.map(media => 
                        media.type === 'image' ? 
                        `<img src="${media.src}" alt="Post image">` : 
                        `<video controls><source src="${media.src}" type="video/mp4"></video>`
                    ).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <div class="post-action ${post.liked ? 'active' : ''}" data-post-id="${post.id}" data-action="like">
                    <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                    <span>${post.likes}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}" data-action="comment">
                    <i class="far fa-comment"></i>
                    <span>${post.comments}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}" data-action="share">
                    <i class="far fa-share-square"></i>
                    <span>${post.shares}</span>
                </div>
            </div>
            ${post.author === currentUser.username ? `
                <button class="delete-post" data-post-id="${post.id}">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        `;
        postsContainer.appendChild(postElement);
    });
}

// Render profile posts
function renderProfilePosts() {
    const profilePostsContainer = document.getElementById('profile-posts-container');
    if (!profilePostsContainer) return;
    
    profilePostsContainer.innerHTML = '';
    
    const userPosts = posts.filter(post => post.author === currentUser.username);
    
    if (userPosts.length === 0) {
        profilePostsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">У вас пока нет постов</p>';
        return;
    }
    
    userPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author-avatar">${post.authorAvatar}</div>
                <div>
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-content">${post.text}</div>
            ${post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media.map(media => 
                        media.type === 'image' ? 
                        `<img src="${media.src}" alt="Post image">` : 
                        `<video controls><source src="${media.src}" type="video/mp4"></video>`
                    ).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <div class="post-action ${post.liked ? 'active' : ''}" data-post-id="${post.id}" data-action="like">
                    <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                    <span>${post.likes}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}" data-action="comment">
                    <i class="far fa-comment"></i>
                    <span>${post.comments}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}" data-action="share">
                    <i class="far fa-share-square"></i>
                    <span>${post.shares}</span>
                </div>
            </div>
            <button class="delete-post" data-post-id="${post.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        profilePostsContainer.appendChild(postElement);
    });
}

// Render other user posts
function renderOtherUserPosts(userId) {
    const otherUserPostsContainer = document.getElementById('other-user-posts-container');
    if (!otherUserPostsContainer) return;
    
    otherUserPostsContainer.innerHTML = '';
    
    const user = otherUsers[userId];
    if (!user || !user.posts || user.posts.length === 0) {
        otherUserPostsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">У пользователя пока нет постов</p>';
        return;
    }
    
    user.posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author-avatar">${user.avatar}</div>
                <div>
                    <div class="post-author">${user.username}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-content">${post.text}</div>
            ${post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media.map(media => 
                        media.type === 'image' ? 
                        `<img src="${media.src}" alt="Post image">` : 
                        `<video controls><source src="${media.src}" type="video/mp4"></video>`
                    ).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <div class="post-action ${post.liked ? 'active' : ''}" data-post-id="${post.id}" data-action="like" data-user-id="${userId}">
                    <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                    <span>${post.likes}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}" data-action="comment" data-user-id="${userId}">
                    <i class="far fa-comment"></i>
                    <span>${post.comments}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}" data-action="share" data-user-id="${userId}">
                    <i class="far fa-share-square"></i>
                    <span>${post.shares}</span>
                </div>
            </div>
        `;
        otherUserPostsContainer.appendChild(postElement);
    });
}

// Add media to post
function addMedia(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showMessage('Файл слишком большой. Максимальный размер: 10MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const media = {
                    type: type,
                    src: event.target.result
                };
                currentMedia.push(media);
                renderMediaPreview();
            };
            reader.onerror = function() {
                showMessage('Ошибка при чтении файла', 'error');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Render media preview
function renderMediaPreview() {
    const mediaPreview = document.getElementById('media-preview');
    if (!mediaPreview) return;
    
    mediaPreview.innerHTML = '';
    
    currentMedia.forEach((media, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.innerHTML = `
            ${media.type === 'image' ? 
                `<img src="${media.src}" alt="Preview">` : 
                `<video src="${media.src}"></video>`
            }
            <button class="remove-media" data-index="${index}">&times;</button>
        `;
        mediaPreview.appendChild(mediaItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-media').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            currentMedia.splice(index, 1);
            renderMediaPreview();
        });
    });
}

// Show other user profile
function showOtherUserProfile(userId) {
    const user = otherUsers[userId];
    if (!user) return;
    
    currentViewingUser = userId;
    
    // Update UI
    document.getElementById('other-user-name').textContent = user.username;
    document.getElementById('other-user-avatar').textContent = user.avatar;
    document.getElementById('other-user-status').textContent = user.status;
    document.getElementById('other-user-posts').textContent = user.posts ? user.posts.length : 0;
    document.getElementById('other-user-followers').textContent = Math.floor(Math.random() * 100);
    
    // Render posts
    renderOtherUserPosts(userId);
    
    // Hide all tabs and show other user profile
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById('other-user-profile').style.display = 'block';
    
    // Update navigation
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = type === 'error' ? 'error-message' : 'success-message';
    messageElement.textContent = message;
    
    // Add to top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(messageElement, mainContent.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    const buttonText = button.querySelector('span');
    if (isLoading) {
        button.disabled = true;
        buttonText.innerHTML = '<div class="spinner"></div>Загрузка...';
    } else {
        button.disabled = false;
        // Reset to original text based on button id
        const buttonId = button.id;
        if (buttonId === 'login-button') {
            buttonText.textContent = 'Войти';
        } else if (buttonId === 'register-button') {
            buttonText.textContent = 'Зарегистрироваться';
        } else if (buttonId === 'upload-music-button') {
            buttonText.textContent = 'Загрузить';
        } else if (buttonId === 'save-settings') {
            buttonText.textContent = 'Сохранить изменения';
        }
    }
}

// Initialize event listeners
function initEventListeners() {
    // Login Form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const loginButton = document.getElementById('login-button');
        setButtonLoading(loginButton, true);
        
        // In a real app, this would validate against a server
        const username = this.querySelector('input[type="text"]').value;
        const password = this.querySelector('input[type="password"]').value;
        
        // Simulate API call
        setTimeout(() => {
            // Simple validation
            if (username && password) {
                currentUser = {
                    username: username,
                    avatar: username.charAt(0).toUpperCase(),
                    avatarImage: null,
                    bannerImage: null
                };
                
                try {
                    localStorage.setItem('deepContactUser', JSON.stringify(currentUser));
                    isLoggedIn = true;
                    showApp();
                    showMessage('Успешный вход!', 'success');
                } catch (e) {
                    console.error('Error saving user data:', e);
                    showMessage('Ошибка при сохранении данных', 'error');
                }
            } else {
                showMessage('Пожалуйста, заполните все поля', 'error');
            }
            
            setButtonLoading(loginButton, false);
        }, 1000);
    });

    // Register Form
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const registerButton = document.getElementById('register-button');
        setButtonLoading(registerButton, true);
        
        const username = this.querySelectorAll('input[type="text"]')[0].value;
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
        
        // Simulate API call
        setTimeout(() => {
            // Simple validation
            if (username && email && password && password === confirmPassword) {
                currentUser = {
                    username: username,
                    avatar: username.charAt(0).toUpperCase(),
                    avatarImage: null,
                    bannerImage: null
                };
                
                try {
                    localStorage.setItem('deepContactUser', JSON.stringify(currentUser));
                    isLoggedIn = true;
                    showApp();
                    showMessage('Аккаунт успешно создан!', 'success');
                } catch (e) {
                    console.error('Error saving user data:', e);
                    showMessage('Ошибка при сохранении данных', 'error');
                }
            } else if (password !== confirmPassword) {
                showMessage('Пароли не совпадают!', 'error');
            } else {
                showMessage('Пожалуйста, заполните все поля', 'error');
            }
            
            setButtonLoading(registerButton, false);
        }, 1000);
    });

    // Show Register Form
    document.getElementById('show-register').addEventListener('click', function() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('register-screen').style.display = 'flex';
    });

    // Show Login Form
    document.getElementById('show-login').addEventListener('click', function() {
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    });

    // Tab Navigation
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If we're viewing another user's profile, go back to main app
            if (document.getElementById('other-user-profile').style.display === 'block') {
                document.getElementById('other-user-profile').style.display = 'none';
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.style.display = 'none';
                });
            }
            
            // Remove active class from all links and tabs
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
                tab.style.display = 'none';
            });
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
                tabElement.style.display = 'block';
            }
        });
    });

    // Theme Switching
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all theme options
            document.querySelectorAll('.theme-option').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
        });
    });

    // Language Switching
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
            showMessage(`Язык изменен на ${this.textContent}`, 'success');
        });
    });

    // Dark/Light Mode Toggle
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.remove('light-mode');
                localStorage.setItem('deepContactMode', 'dark');
            } else {
                document.body.classList.add('light-mode');
                localStorage.setItem('deepContactMode', 'light');
            }
        });
    }

    // Music Player Controls
    document.getElementById('play-btn').addEventListener('click', function() {
        if (isPlaying) {
            audioPlayer.pause();
            document.getElementById('play-icon').classList.remove('fa-pause');
            document.getElementById('play-icon').classList.add('fa-play');
        } else {
            if (audioPlayer.src) {
                audioPlayer.play().catch(e => {
                    console.error('Error playing audio:', e);
                    showMessage('Ошибка воспроизведения аудио', 'error');
                });
            } else if (musicTracks.length > 0) {
                playTrack(0);
            }
            document.getElementById('play-icon').classList.remove('fa-play');
            document.getElementById('play-icon').classList.add('fa-pause');
        }
        isPlaying = !isPlaying;
    });

    document.getElementById('prev-btn').addEventListener('click', function() {
        if (musicTracks.length > 0) {
            currentTrackIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
            playTrack(currentTrackIndex);
        }
    });

    document.getElementById('next-btn').addEventListener('click', function() {
        if (musicTracks.length > 0) {
            currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
            playTrack(currentTrackIndex);
        }
    });

    // Progress Bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
        });
    }

    // Volume Control
    const volumeBar = document.getElementById('volume-bar');
    if (volumeBar) {
        volumeBar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.volume = percent;
            document.getElementById('volume-level').style.width = `${percent * 100}%`;
        });
    }

    // Audio player events
    audioPlayer.addEventListener('timeupdate', function() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
        
        // Update time display
        const currentTimeElement = document.getElementById('current-time');
        const totalTimeElement = document.getElementById('total-time');
        if (currentTimeElement && totalTimeElement) {
            currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
            totalTimeElement.textContent = formatTime(audioPlayer.duration);
        }
    });

    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
        document.getElementById('play-icon').classList.remove('fa-pause');
        document.getElementById('play-icon').classList.add('fa-play');
        
        // Auto-play next track
        if (musicTracks.length > 0) {
            currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
            playTrack(currentTrackIndex);
        }
    });

    // Upload Form
    document.getElementById('upload-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const uploadButton = document.getElementById('upload-music-button');
        setButtonLoading(uploadButton, true);
        
        const title = document.getElementById('track-title').value;
        const artist = document.getElementById('track-artist').value;
        const fileInput = document.getElementById('track-file');
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showMessage('Файл слишком большой. Максимальный размер: 10MB', 'error');
                setButtonLoading(uploadButton, false);
                return;
            }
            
            const url = URL.createObjectURL(file);
            
            // Create a new track object
            const newTrack = {
                id: userTracks.length + 1,
                title: title,
                artist: artist,
                duration: '0:00', // In a real app, you would calculate this
                src: url
            };
            
            userTracks.push(newTrack);
            
            try {
                localStorage.setItem('userTracks', JSON.stringify(userTracks));
                
                // Reset form and update music list
                this.reset();
                initMusicPlayer();
                
                showMessage('Трек успешно загружен!', 'success');
            } catch (e) {
                console.error('Error saving track:', e);
                showMessage('Ошибка при сохранении трека', 'error');
            }
        } else {
            showMessage('Пожалуйста, выберите файл', 'error');
        }
        
        setButtonLoading(uploadButton, false);
    });

    // Banner Upload
    document.getElementById('banner-upload-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('Файл слишком большой. Максимальный размер: 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentUser.bannerImage = event.target.result;
                    try {
                        localStorage.setItem('deepContactUser', JSON.stringify(currentUser));
                        document.getElementById('profile-banner').style.backgroundImage = `url(${event.target.result})`;
                        document.getElementById('profile-banner').style.backgroundSize = 'cover';
                        document.getElementById('profile-banner').style.backgroundPosition = 'center';
                        showMessage('Баннер успешно обновлен!', 'success');
                    } catch (e) {
                        console.error('Error saving banner:', e);
                        showMessage('Ошибка при сохранении баннера', 'error');
                    }
                };
                reader.onerror = function() {
                    showMessage('Ошибка при чтении файла', 'error');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Avatar Upload
    document.getElementById('avatar-upload-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showMessage('Файл слишком большой. Максимальный размер: 2MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentUser.avatarImage = event.target.result;
                    try {
                        localStorage.setItem('deepContactUser', JSON.stringify(currentUser));
                        updateUIForUser();
                        showMessage('Аватар успешно обновлен!', 'success');
                    } catch (e) {
                        console.error('Error saving avatar:', e);
                        showMessage('Ошибка при сохранении аватара', 'error');
                    }
                };
                reader.onerror = function() {
                    showMessage('Ошибка при чтении файла', 'error');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Save Settings
    document.getElementById('save-settings').addEventListener('click', function() {
        const saveButton = document.getElementById('save-settings');
        setButtonLoading(saveButton, true);
        
        const newUsername = document.getElementById('settings-username').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Simulate API call
        setTimeout(() => {
            if (newUsername) {
                currentUser.username = newUsername;
                currentUser.avatar = newUsername.charAt(0).toUpperCase();
                try {
                    localStorage.setItem('deepContactUser', JSON.stringify(currentUser));
                    updateUIForUser();
                } catch (e) {
                    console.error('Error saving user data:', e);
                    showMessage('Ошибка при сохранении данных', 'error');
                }
            }
            
            if (newPassword && newPassword === confirmPassword) {
                // In a real app, this would update the password on the server
                showMessage('Пароль успешно изменен!', 'success');
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } else if (newPassword && newPassword !== confirmPassword) {
                showMessage('Пароли не совпадают!', 'error');
            }
            
            showMessage('Настройки сохранены!', 'success');
            setButtonLoading(saveButton, false);
        }, 1000);
    });

    // Publish Post
    document.getElementById('publish-post').addEventListener('click', function() {
        const postInput = document.getElementById('post-text');
        if (postInput.value.trim() !== '' || currentMedia.length > 0) {
            const newPost = {
                id: Date.now(), // Use timestamp for unique ID
                author: currentUser.username,
                authorAvatar: currentUser.avatar,
                text: postInput.value,
                media: [...currentMedia],
                time: new Date().toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                likes: 0,
                comments: 0,
                shares: 0,
                liked: false
            };
            
            posts.unshift(newPost);
            
            try {
                localStorage.setItem('userPosts', JSON.stringify(posts));
                renderPosts();
                renderProfilePosts();
                
                // Reset form
                postInput.value = '';
                currentMedia = [];
                const mediaPreview = document.getElementById('media-preview');
                if (mediaPreview) {
                    mediaPreview.innerHTML = '';
                }
                
                // Update posts count
                document.getElementById('posts-count').textContent = posts.filter(post => post.author === currentUser.username).length;
                
                showMessage('Пост опубликован!', 'success');
            } catch (e) {
                console.error('Error saving post:', e);
                showMessage('Ошибка при сохранении поста', 'error');
            }
        } else {
            showMessage('Введите текст поста или добавьте медиа!', 'error');
        }
    });

    // Add Photo/Video buttons
    document.getElementById('add-photo').addEventListener('click', function() {
        addMedia('image');
    });

    document.getElementById('add-video').addEventListener('click', function() {
        addMedia('video');
    });

    // User cards
    document.querySelectorAll('.user-card').forEach(card => {
        card.addEventListener('click', function() {
            const userId = this.getAttribute('data-user');
            showOtherUserProfile(userId);
        });
    });

    // Post actions (like, comment, share)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.post-action')) {
            const actionElement = e.target.closest('.post-action');
            const postId = parseInt(actionElement.getAttribute('data-post-id'));
            const action = actionElement.getAttribute('data-action');
            const userId = actionElement.getAttribute('data-user-id');
            
            if (action === 'like') {
                // Handle like action
                if (userId) {
                    // Like on other user's post
                    const user = otherUsers[userId];
                    const post = user.posts.find(p => p.id === postId);
                    if (post) {
                        post.liked = !post.liked;
                        post.likes += post.liked ? 1 : -1;
                        renderOtherUserPosts(userId);
                    }
                } else {
                    // Like on own post
                    const post = posts.find(p => p.id === postId);
                    if (post) {
                        post.liked = !post.liked;
                        post.likes += post.liked ? 1 : -1;
                        renderPosts();
                        renderProfilePosts();
                        try {
                            localStorage.setItem('userPosts', JSON.stringify(posts));
                        } catch (e) {
                            console.error('Error saving posts:', e);
                        }
                    }
                }
            } else if (action === 'comment') {
                showMessage('Функция комментариев будет реализована в будущем!', 'info');
            } else if (action === 'share') {
                showMessage('Функция репоста будет реализована в будущем!', 'info');
            }
        }
    });

    // Delete post
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-post')) {
            const deleteButton = e.target.closest('.delete-post');
            const postId = parseInt(deleteButton.getAttribute('data-post-id'));
            
            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
                posts = posts.filter(post => post.id !== postId);
                try {
                    localStorage.setItem('userPosts', JSON.stringify(posts));
                    renderPosts();
                    renderProfilePosts();
                    
                    // Update posts count
                    document.getElementById('posts-count').textContent = posts.filter(post => post.author === currentUser.username).length;
                    
                    showMessage('Пост удален', 'success');
                } catch (e) {
                    console.error('Error deleting post:', e);
                    showMessage('Ошибка при удалении поста', 'error');
                }
            }
        }
    });

    // Delete music
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-music')) {
            const deleteButton = e.target.closest('.delete-music');
            const trackIndex = parseInt(deleteButton.getAttribute('data-index'));
            
            if (confirm('Вы уверены, что хотите удалить этот трек?')) {
                userTracks.splice(trackIndex, 1);
                try {
                    localStorage.setItem('userTracks', JSON.stringify(userTracks));
                    initMusicPlayer();
                    showMessage('Трек удален', 'success');
                } catch (e) {
                    console.error('Error deleting track:', e);
                    showMessage('Ошибка при удалении трека', 'error');
                }
            }
        }
    });
}

// Format time for display
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Date and Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateTimeStr = now.toLocaleDateString('ru-RU', options);
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        datetimeElement.textContent = dateTimeStr;
    }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Update time every minute
setInterval(updateDateTime, 60000);