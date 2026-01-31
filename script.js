// ===============================
// 📹 SUPABASE CONNECTION
// ===============================
const SUPABASE_URL = "https://yapeslxvrhvxbramrjhh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k0IQraaeYBMuQ3vs0-D66Q_PXNKT228";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global swiper instance
let swiperInstance = null;
let chaptersData = [];

// ===============================
// 📹 CUSTOM TAG PARSER
// ===============================
function parseTags(text) {
  const regex = /~(\w+)~([\s\S]*?)~~\1~/g;
  let html = '';
  let match;

  while ((match = regex.exec(text)) !== null) {
    html += `<div class="${match[1]}">${match[2].trim()}</div>\n`;
  }

  return html;
}

// ===============================
// 📹 BACKGROUND IMAGE SELECTION
// ===============================
function getBackgroundImage(chapterNumber) {
  const backgrounds = [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&q=80',
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1920&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1920&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1920&q=80',
    'https://images.unsplash.com/photo-1488229297570-58520851e868?w=1920&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80'
  ];

  return backgrounds[chapterNumber - 1] || backgrounds[0];
}

// ===============================
// 📹 CHAPTER NAVIGATION FUNCTIONS
// ===============================
function toggleChapterNav() {
  const nav = document.getElementById('chapterNav');
  nav.classList.toggle('open');
}

function goToChapter(index) {
  if (swiperInstance) {
    swiperInstance.slideTo(index);
    if (window.innerWidth < 768) toggleChapterNav();
  }
}

function updateActiveChapter(index) {
  document.querySelectorAll('.chapter-item').forEach(item => item.classList.remove('active'));
  const activeItem = document.querySelector(`.chapter-item[data-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ===============================
// 📹 BUILD CHAPTER NAVIGATION
// ===============================
function buildChapterNavigation(chapters) {
  const chapterList = document.getElementById('chapterList');
  chapterList.innerHTML = '';

  chapters.forEach((chapter, index) => {
    const item = document.createElement('div');
    item.className = `chapter-item ${chapter.is_free ? '' : 'locked'}`;
    item.setAttribute('data-index', index);

    let displayTitle = chapter.title.replace(/^Chapter \d+:\s*/i, '');

    item.innerHTML = `
      <div class="chapter-number">${chapter.chapter_number.toString().padStart(2, '0')}</div>
      <div class="chapter-title">${displayTitle}</div>
      ${!chapter.is_free ? '<i class="fas fa-lock chapter-lock"></i>' : ''}
    `;

    item.addEventListener('click', () => {
      if (chapter.is_free) goToChapter(index);
      else showPopup();
    });

    chapterList.appendChild(item);
  });
}

// ===============================
// 📹 LOAD CHAPTERS FROM SUPABASE
// ===============================
let totalChapters = 0;

async function loadChapters() {
  const { data, error } = await supabaseClient
    .from('chapters')
    .select('*')
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error("❌ Supabase error:", error);
    document.getElementById('bookSlides').innerHTML = `
      <div class="swiper-slide">
        <div class="slider-inner">
          <div class="loading-content">
            <h2>Error loading chapters.</h2>
            <p style="color: rgba(255,255,255,0.7);">Please refresh the page.</p>
          </div>
        </div>
      </div>`;
    return;
  }

  totalChapters = data.length;
  chaptersData = data;

  const bookSlides = document.getElementById('bookSlides');
  bookSlides.innerHTML = "";

  data.forEach(chapter => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.id = `chapter${chapter.chapter_number}`;

    const bg = getBackgroundImage(chapter.chapter_number);

    if (!chapter.is_free) {
      slide.innerHTML = `
        <div class="slider-inner" data-swiper-parallax="100">
          <img src="${bg}" class="background-image">
          <div class="swiper-content" data-swiper-parallax="2000">
            <div class="chapterHero">${chapter.title}</div>
            <div style="text-align:center; padding:40px 0;">
              <p style="color:#e74c3c; font-size:1.5em; margin-bottom:20px;">🔒 This chapter is locked.</p>
              <p style="color: rgba(255,255,255,0.8); margin-bottom:30px;">Login or register to continue reading this guide.</p>
              <button onclick="showPopup()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 15px 40px;
                font-size: 1.1em;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
              ">Unlock Content</button>
            </div>
          </div>
        </div>`;
    } else {
      slide.innerHTML = `
        <div class="slider-inner" data-swiper-parallax="100">
          <img src="${bg}" class="background-image">
          <div class="swiper-content" data-swiper-parallax="2000">
            <div class="chapterHero">${chapter.title}</div>
            ${parseTags(chapter.content)}
          </div>
        </div>`;
    }

    bookSlides.appendChild(slide);
  });

  buildChapterNavigation(data);
  document.querySelector('.slide-range.total').textContent = totalChapters.toString().padStart(2, '0');

  initSwiper();
}

// ===============================
// 📹 SWIPER INITIALIZATION
// ===============================
function initSwiper() {
  swiperInstance = new Swiper('.swiper-container-h', {
    direction: 'horizontal',
    effect: 'slide',
    parallax: true,
    speed: 1600,
    loop: false,
    keyboard: { enabled: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: { el: '.swiper-pagination', type: 'progressbar' },
    on: {
      slideChange: function () {
        const currentSlide = (this.activeIndex + 1).toString().padStart(2, '0');
        document.querySelector('.slide-range.one').textContent = currentSlide;
        updateActiveChapter(this.activeIndex);
        const content = this.slides[this.activeIndex].querySelector('.swiper-content');
        if (content) content.scrollTop = 0;
      },
      init: function () { updateActiveChapter(0); }
    }
  });
}

// ===============================
// 📹 LOGIN / REGISTER POPUP
// ===============================
function showPopup() {
  document.getElementById('registerPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}

// Toggle login/register forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

document.getElementById('loginTabBtn').addEventListener('click', () => {
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
});

document.getElementById('registerTabBtn').addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});

// ===============================
// 📹 SUPABASE AUTH - LOGIN
// ===============================
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
  else {
    alert(`Welcome back!`);
    closePopup();
  }
});

// ===============================
// 📹 SUPABASE AUTH - REGISTER
// ===============================
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const username = document.getElementById('registerUsername').value;
  const name = document.getElementById('registerName').value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { username, name } }
  });

  if (error) alert(error.message);
  else {
    alert(`Registration successful! Please check your email to confirm.`);
    closePopup();
  }
});

// ===============================
// 📹 ESC TO CLOSE NAV
// ===============================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const nav = document.getElementById('chapterNav');
    if (nav.classList.contains('open')) toggleChapterNav();
    closePopup();
  }
});

// ===============================
// 🚀 START APP
// ===============================
loadChapters();
