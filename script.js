// ===============================
// 📹 SUPABASE CONNECTION
// ===============================
const SUPABASE_URL = "https://yapeslxvrhvxbramrjhh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k0IQraaeYBMuQ3vs0-D66Q_PXNKT228";

// Use Supabase v2 client from CDN global
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global swiper instance
let swiperInstance = null;
let chaptersData = [];

// ===============================
// 📹 CUSTOM TAG PARSER
// Converts ~story~text~~story~ into styled HTML
// If no tags found, displays as plain text
// ===============================
function parseTags(text) {
  const regex = /~(\w+)~([\s\S]*?)~~\1~/g;
  let html = '';
  let match;
  let hasMatches = false;

  while ((match = regex.exec(text)) !== null) {
    html += `<div class="${match[1]}">${match[2].trim()}</div>\n`;
    hasMatches = true;
  }

  // If no custom tags found, display as plain text with basic formatting
  if (!hasMatches) {
    // Convert line breaks to <br> and preserve paragraphs
    const formattedText = text
      .trim()
      .split('\n\n')  // Split by double line breaks (paragraphs)
      .map(paragraph => {
        const trimmed = paragraph.trim();
        if (trimmed) {
          return `<p style="margin-bottom: 20px; line-height: 1.8; color: rgba(255,255,255,0.9);">${trimmed.replace(/\n/g, '<br>')}</p>`;
        }
        return '';
      })
      .join('');
    
    html = `<div class="plain-text">${formattedText}</div>`;
  }

  return html;
}

// ===============================
// 📹 BACKGROUND IMAGE SELECTION
// Returns appropriate background based on chapter
// ===============================
function getBackgroundImage(chapterNumber) {
  const backgrounds = [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80', // Ch 1 - Wake up call
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&q=80', // Ch 2 - Head start
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1920&q=80', // Ch 3 - Content
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80', // Ch 4 - Community
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80', // Ch 5 - Steam
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80', // Ch 6 - Demo
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1920&q=80', // Ch 7 - Press
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80', // Ch 8 - Launch
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80', // Ch 9 - Post-launch
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80', // Ch 10 - Things go wrong
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80', // Ch 11 - Sustainable
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1920&q=80', // Ch 12 - Second game
    'https://images.unsplash.com/photo-1488229297570-58520851e868?w=1920&q=80', // Ch 13 - Resources
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80'  // Ch 14 - Case studies
  ];
  
  // Return corresponding background or default to first one
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
    // Close navigation on mobile after selection
    if (window.innerWidth < 768) {
      toggleChapterNav();
    }
  }
}

function updateActiveChapter(index) {
  // Remove active class from all chapter items
  document.querySelectorAll('.chapter-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to current chapter
  const activeItem = document.querySelector(`.chapter-item[data-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    
    // Scroll chapter into view in the navigation
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
    
    // Extract clean chapter title (remove "Chapter X:" prefix if exists)
    let displayTitle = chapter.title;
    const titleMatch = chapter.title.match(/Chapter \d+:\s*(.+)/i);
    if (titleMatch) {
      displayTitle = titleMatch[1];
    }
    
    item.innerHTML = `
      <div class="chapter-number">${chapter.chapter_number.toString().padStart(2, '0')}</div>
      <div class="chapter-title">${displayTitle}</div>
      ${!chapter.is_free ? '<i class="fas fa-lock chapter-lock"></i>' : ''}
    `;
    
    item.addEventListener('click', () => {
      if (chapter.is_free) {
        goToChapter(index);
      } else {
        showPopup();
      }
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
    document.getElementById('bookSlides').innerHTML =
      `<div class="swiper-slide">
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

  data.forEach((chapter) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.id = `chapter${chapter.chapter_number}`;

    const backgroundUrl = getBackgroundImage(chapter.chapter_number);

    // 🔒 LOCKED CHAPTER
    if (!chapter.is_free) {
      slide.innerHTML = `
        <div class="slider-inner" data-swiper-parallax="100">
          <img src="${backgroundUrl}" alt="Chapter ${chapter.chapter_number}" class="background-image">
          <div class="swiper-content" data-swiper-parallax="2000">
            <div class="chapterHero">${chapter.title}</div>
            <div style="text-align:center; padding: 40px 0;">
              <p style="color:#e74c3c; font-size:1.5em; margin-bottom: 20px;">🔒 This chapter is locked.</p>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 30px;">Register or login to continue reading this guide.</p>
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
        </div>
      `;
    } 
    // 📖 FREE CHAPTER
    else {
      slide.innerHTML = `
        <div class="slider-inner" data-swiper-parallax="100">
          <img src="${backgroundUrl}" alt="Chapter ${chapter.chapter_number}" class="background-image">
          <div class="swiper-content" data-swiper-parallax="2000">
            <div class="chapterHero">${chapter.title}</div>
            ${parseTags(chapter.content)}
          </div>
        </div>
      `;
    }

    bookSlides.appendChild(slide);
  });

  // Build chapter navigation
  buildChapterNavigation(data);

  // Update total chapter number in pagination
  document.querySelector('.slide-range.total').textContent = 
    totalChapters.toString().padStart(2, '0');

  initSwiper(); // initialize slider after content loads
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
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    // IMPORTANT: Disable mousewheel horizontal scrolling
    // This allows vertical scrolling inside content
    mousewheel: false,
    
    // Enable touch gestures for left/right swipe only
    touchRatio: 1,
    touchAngle: 45, // Only swipe when angle is close to horizontal
    
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar'
    },
    on: {
      slideChange: function () {
        // Update current slide number
        const currentSlide = (this.activeIndex + 1).toString().padStart(2, '0');
        document.querySelector('.slide-range.one').textContent = currentSlide;
        
        // Update active chapter in navigation
        updateActiveChapter(this.activeIndex);
        
        // Scroll content back to top when changing chapters
        const currentSlideElement = this.slides[this.activeIndex];
        const contentElement = currentSlideElement.querySelector('.swiper-content');
        if (contentElement) {
          contentElement.scrollTop = 0;
        }
      },
      init: function() {
        // Set initial active chapter
        updateActiveChapter(0);
      }
    }
  });
}

// ===============================
// 📹 REGISTER POPUP CONTROLS
// ===============================
function showPopup() {
  document.getElementById('registerPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}

// ===============================
// 📹 CLOSE NAV ON ESCAPE KEY
// ===============================
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const nav = document.getElementById('chapterNav');
    if (nav.classList.contains('open')) {
      toggleChapterNav();
    }
  }
});

// ===============================
// 🚀 START APP
// ===============================
loadChapters();
