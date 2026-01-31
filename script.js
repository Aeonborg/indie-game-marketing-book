// ===============================
// 🔹 SUPABASE CONNECTION
// ===============================
const SUPABASE_URL = "https://yapeslxvrhvxbramrjhh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k0IQraaeYBMuQ3vs0-D66Q_PXNKT228";

// Use Supabase v2 client from CDN global
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ===============================
// 🔹 CUSTOM TAG PARSER
// Converts ~story~text~~story~ into styled HTML
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
// 🔹 LOAD CHAPTERS FROM SUPABASE
// ===============================
async function loadChapters() {
  const { data, error } = await supabaseClient
    .from('chapters')
    .select('*')
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error("❌ Supabase error:", error);
    document.getElementById('bookSlides').innerHTML =
      `<div class="swiper-slide"><h2>Error loading chapters.</h2></div>`;
    return;
  }

  const bookSlides = document.getElementById('bookSlides');
  bookSlides.innerHTML = "";

  data.forEach((chapter) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.id = `chapter${chapter.chapter_number}`;

    // 🔒 LOCKED CHAPTER
    if (!chapter.is_free) {
      slide.innerHTML = `
        <div style="text-align:center;">
          <h2>${chapter.title}</h2>
          <p style="color:#e74c3c; font-size:1.2em;">🔒 This chapter is locked.</p>
          <button onclick="showPopup()">Register / Login</button>
        </div>
      `;
    } 
    // 📖 FREE CHAPTER
    else {
      slide.innerHTML = `
        <div class="chapterHero">${chapter.title}</div>
        ${parseTags(chapter.content)}
      `;
    }

    bookSlides.appendChild(slide);
  });

  initSwiper(); // initialize slider after content loads
}


// ===============================
// 🔹 SWIPER INITIALIZATION
// ===============================
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


// ===============================
// 🔹 REGISTER POPUP CONTROLS
// ===============================
function showPopup() {
  document.getElementById('registerPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}


// ===============================
// 🚀 START APP
// ===============================
loadChapters();
