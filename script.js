// 🔹 1. CONNECT TO SUPABASE
const SUPABASE_URL = "https://yapeslxvrhvxbramrjhh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k0IQraaeYBMuQ3vs0-D66Q_PXNKT228";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔹 2. TAG PARSER (your custom book markup)
function parseTags(text) {
  const regex = /~(\w+)~([\s\S]*?)~~\1~/g;
  let html = '';
  let match;
  while ((match = regex.exec(text)) !== null) {
    html += `<div class="${match[1]}">${match[2].trim()}</div>\n`;
  }
  return html;
}

// 🔹 3. LOAD CHAPTERS FROM SUPABASE
async function loadChapters() {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error("Error loading chapters:", error);
    return;
  }

  const bookSlides = document.getElementById('bookSlides');
  bookSlides.innerHTML = ""; // clear loading state

  data.forEach((chapter, index) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.id = `chapter${chapter.chapter_number}`;

    // 🔒 Lock if not free and user not logged in
    if (!chapter.is_free) {
      slide.innerHTML = `
        <div style="text-align:center;">
          <h2>${chapter.title}</h2>
          <p style="color:#e74c3c; font-size:1.2em;">🔒 This chapter is locked.</p>
          <button onclick="showPopup()">Register / Login to Continue</button>
        </div>
      `;
    } else {
      slide.innerHTML = `
        <div class="chapterHero">${chapter.title}</div>
        ${parseTags(chapter.content)}
      `;
    }

    bookSlides.appendChild(slide);
  });

  initSwiper(); // initialize after content loads
}

// 🔹 4. INIT SWIPER (AFTER CHAPTERS LOAD)
function initSwiper() {
  new Swiper('.swiper-container', {
    direction: 'horizontal',
    speed: 1000,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar'
    }
  });
}

// 🔹 5. REGISTER POPUP
function showPopup() {
  document.getElementById('registerPopup').style.display = 'flex';
}
function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}

// 🔹 6. START APP
loadChapters();
