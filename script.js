// ===============================
// 📹 SUPABASE CONNECTION
// ===============================
const SUPABASE_URL = "https://yapeslxvrhvxbramrjhh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k0IQraaeYBMuQ3vs0-D66Q_PXNKT228";

// Use Supabase v2 client from CDN global
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let chaptersData = [];
let currentChapterIndex = 0;

// ===============================
// 📹 CUSTOM TAG PARSER
// Simple tag parser
// ===============================
function parseTags(text) {
  if (!text) return '<p>No content available</p>';
  
  // Simple replacement for now
  return text
    .replace(/~story~/g, '<div class="story">')
    .replace(/~~story~/g, '</div>')
    .replace(/~pullQuote~/g, '<div class="pullQuote">')
    .replace(/~~pullQuote~/g, '</div>')
    .replace(/~lesson~/g, '<div class="lesson">')
    .replace(/~~lesson~/g, '</div>')
    .replace(/~tools~/g, '<div class="tools">')
    .replace(/~~tools~/g, '</div>')
    .replace(/~actionStep~/g, '<div class="actionStep">')
    .replace(/~~actionStep~/g, '</div>')
    .replace(/~milestone~/g, '<div class="milestone">')
    .replace(/~~milestone~/g, '</div>')
    .replace(/~miniStory~/g, '<div class="miniStory">')
    .replace(/~~miniStory~/g, '</div>')
    .replace(/~cliffhanger~/g, '<div class="cliffhanger">')
    .replace(/~~cliffhanger~/g, '</div>')
    .replace(/~reference~/g, '<div class="reference">')
    .replace(/~~reference~/g, '</div>');
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
// 📹 BUILD CHAPTERS LIST
// Shows ALL chapters (free and locked)
// ===============================
function buildChaptersList(chapters) {
  const chaptersList = document.getElementById('chaptersList');
  chaptersList.innerHTML = '';
  
  chapters.forEach((chapter, index) => {
    const item = document.createElement('div');
    item.className = `chapter-item ${chapter.is_free ? '' : 'locked'}`;
    item.setAttribute('data-index', index);
    item.setAttribute('data-chapter-number', chapter.chapter_number);
    
    // Extract clean chapter title
    let displayTitle = chapter.title;
    const titleMatch = chapter.title.match(/Chapter \d+:\s*(.+)/i);
    if (titleMatch) {
      displayTitle = titleMatch[1];
    }
    
    // Create chapter item
    item.innerHTML = `
      <div class="chapter-number">${chapter.chapter_number.toString().padStart(2, '0')}</div>
      <div class="chapter-details">
        <div class="chapter-title">${displayTitle}</div>
        ${!chapter.is_free ? '<span class="premium-badge">PREMIUM</span>' : '<span class="free-badge">FREE</span>'}
      </div>
      ${!chapter.is_free ? '<i class="fas fa-lock chapter-lock"></i>' : '<i class="fas fa-book-open chapter-open"></i>'}
    `;
    
    // Click handler - ALWAYS clickable, shows popup if locked
    item.addEventListener('click', () => {
      // If chapter is free, load it
      if (chapter.is_free) {
        loadChapter(index);
        if (window.innerWidth < 992) {
          closeSidebar();
        }
      } else {
        // If chapter is locked, show popup
        showPopup(`Chapter ${chapter.chapter_number}: ${displayTitle}`);
      }
    });
    
    chaptersList.appendChild(item);
  });
  
  // Mark first chapter as active if it exists
  if (chapters.length > 0) {
    document.querySelector('.chapter-item[data-index="0"]')?.classList.add('active');
  }
}

// ===============================
// 📹 LOAD CHAPTER CONTENT
// ===============================
function loadChapter(index) {
  if (index < 0 || index >= chaptersData.length) return;
  
  const chapter = chaptersData[index];
  currentChapterIndex = index;
  
  // Update header
  document.getElementById('currentChapterTitle').textContent = chapter.title;
  document.getElementById('chapterProgress').textContent = 
    `Chapter ${chapter.chapter_number} of ${chaptersData.length}`;
  
  // Update active state
  document.querySelectorAll('.chapter-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.chapter-item[data-index="${index}"]`)?.classList.add('active');
  
  // Load content
  const chapterViewer = document.getElementById('chapterViewer');
  const backgroundUrl = getBackgroundImage(chapter.chapter_number);
  
  chapterViewer.style.background = 
    `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${backgroundUrl}')`;
  chapterViewer.style.backgroundSize = 'cover';
  chapterViewer.style.backgroundPosition = 'center';
  
  // Check if chapter is locked
  if (!chapter.is_free) {
    chapterViewer.innerHTML = `
      <div class="chapter-content">
        <div class="chapter-viewer-header">
          <h1 class="chapter-viewer-title">${chapter.title}</h1>
          <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number} • Premium Content</p>
        </div>
        <div style="text-align:center; padding: 60px 0;">
          <div style="font-size: 4em; margin-bottom: 20px; color: #f39c12;">
            <i class="fas fa-lock"></i>
          </div>
          <h2 style="color:#f39c12; font-size: 2em; margin-bottom: 20px;">Premium Chapter Locked</h2>
          <p style="color: rgba(255,255,255,0.8); font-size: 1.2em; margin-bottom: 30px; max-width: 500px; margin: 0 auto 30px;">
            Register or log in to access this premium chapter.
          </p>
          <button onclick="showPopup('${chapter.title}')" style="
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            border: none;
            padding: 18px 50px;
            font-size: 1.2em;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
          ">
            <i class="fas fa-unlock-alt"></i> Unlock Chapter
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // Free chapter - show content
  chapterViewer.innerHTML = `
    <div class="chapter-content">
      <div class="chapter-viewer-header">
        <h1 class="chapter-viewer-title">${chapter.title}</h1>
        <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number}</p>
      </div>
      ${parseTags(chapter.content)}
      
      <!-- Navigation -->
      <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between;">
        ${index > 0 ? `
          <button onclick="navigateChapter(${index - 1})" style="
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <i class="fas fa-arrow-left"></i> Previous
          </button>
        ` : '<div></div>'}
        
        ${index < chaptersData.length - 1 ? `
          <button onclick="navigateChapter(${index + 1})" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            Next <i class="fas fa-arrow-right"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ===============================
// 📹 NAVIGATE CHAPTER
// Handles next/previous with lock check
// ===============================
function navigateChapter(index) {
  if (index < 0 || index >= chaptersData.length) return;
  
  const chapter = chaptersData[index];
  if (!chapter.is_free) {
    showPopup(`Chapter ${chapter.chapter_number}: ${chapter.title}`);
  } else {
    loadChapter(index);
  }
}

// ===============================
// 📹 LOAD CHAPTERS FROM SUPABASE
// ===============================
async function loadChapters() {
  try {
    console.log("Loading chapters from Supabase...");
    
    const { data, error } = await supabaseClient
      .from('chapters')
      .select('*')
      .order('chapter_number', { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      document.getElementById('chaptersList').innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: rgba(255,255,255,0.7);">
          <h3 style="color: #e74c3c;">Error Loading Chapters</h3>
          <p>Please check your internet connection and try again.</p>
        </div>
      `;
      return;
    }

    console.log(`Loaded ${data.length} chapters from Supabase`);
    
    // Debug: Log all chapters
    data.forEach((ch, i) => {
      console.log(`Chapter ${i + 1}: ${ch.title} (Free: ${ch.is_free})`);
    });

    chaptersData = data;
    
    if (data.length === 0) {
      console.warn("No chapters found in database!");
      document.getElementById('chaptersList').innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: rgba(255,255,255,0.7);">
          <h3 style="color: #f39c12;">No Chapters Found</h3>
          <p>There are no chapters in your database yet.</p>
        </div>
      `;
      return;
    }
    
    // Build navigation with ALL chapters
    buildChaptersList(data);
    
    // Load first available chapter
    const firstFreeIndex = data.findIndex(ch => ch.is_free);
    if (firstFreeIndex !== -1) {
      loadChapter(firstFreeIndex);
    } else {
      // If no free chapters, show first chapter (locked)
      loadChapter(0);
    }
    
  } catch (err) {
    console.error("Unexpected error:", err);
    document.getElementById('chaptersList').innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: rgba(255,255,255,0.7);">
        <h3 style="color: #e74c3c;">Connection Error</h3>
        <p>Failed to load chapters. Please refresh the page.</p>
      </div>
    `;
  }
}

// ===============================
// 📹 SIDEBAR CONTROLS
// ===============================
function toggleSidebar() {
  document.getElementById('chaptersSidebar').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('chaptersSidebar').classList.remove('open');
}

// ===============================
// 📹 READ MODE
// ===============================
function toggleReadMode() {
  document.body.classList.toggle('read-mode');
  const button = document.getElementById('readModeToggle');
  if (document.body.classList.contains('read-mode')) {
    button.innerHTML = '<i class="fas fa-times"></i> Exit Read Mode';
  } else {
    button.innerHTML = '<i class="fas fa-book-reader"></i> Read Mode';
  }
}

// ===============================
// 📹 POPUP CONTROLS
// ===============================
function showPopup(chapterTitle = "Premium Content") {
  // Update popup with chapter title
  const titleElement = document.querySelector('#registerPopupContent h2');
  if (titleElement) {
    titleElement.innerHTML = `<i class="fas fa-lock"></i> ${chapterTitle}`;
  }
  
  document.getElementById('registerPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}

function registerUser() {
  alert('Registration form would appear here. In a real app, this would redirect to registration.');
  closePopup();
}

function showLogin() {
  alert('Login form would appear here.');
  closePopup();
}

// ===============================
// 📹 INITIALIZE
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  // Setup buttons
  document.getElementById('navToggle').addEventListener('click', toggleSidebar);
  document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
  document.getElementById('readModeToggle').addEventListener('click', toggleReadMode);
  
  // Close sidebar when clicking outside (mobile)
  document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('chaptersSidebar');
    const navToggle = document.getElementById('navToggle');
    
    if (window.innerWidth < 992 && 
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !navToggle.contains(e.target)) {
      closeSidebar();
    }
  });
  
  // Close popup when clicking outside
  document.getElementById('registerPopup').addEventListener('click', function(e) {
    if (e.target === this) {
      closePopup();
    }
  });
  
  // Load chapters
  loadChapters();
});
