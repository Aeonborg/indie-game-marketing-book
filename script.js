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
// 📹 BUILD CHAPTERS LIST
// Show ALL chapters including locked ones
// ===============================
function buildChaptersList(chapters) {
  const chaptersList = document.getElementById('chaptersList');
  chaptersList.innerHTML = '';
  
  chapters.forEach((chapter, index) => {
    const item = document.createElement('div');
    item.className = `chapter-item ${chapter.is_free ? '' : 'locked'}`;
    item.setAttribute('data-index', index);
    item.setAttribute('data-chapter-number', chapter.chapter_number);
    
    // Extract clean chapter title (remove "Chapter X:" prefix if exists)
    let displayTitle = chapter.title;
    const titleMatch = chapter.title.match(/Chapter \d+:\s*(.+)/i);
    if (titleMatch) {
      displayTitle = titleMatch[1];
    }
    
    // Get first 100 characters of content for preview
    let previewText = '';
    if (chapter.content) {
      // Remove tags for preview
      previewText = chapter.content.replace(/~\w+~/g, '').substring(0, 100) + '...';
    }
    
    item.innerHTML = `
      <div class="chapter-number">${chapter.chapter_number.toString().padStart(2, '0')}</div>
      <div class="chapter-details">
        <div class="chapter-title">${displayTitle}</div>
        <div class="chapter-preview">${previewText}</div>
        ${!chapter.is_free ? '<span class="premium-badge">PREMIUM</span>' : ''}
      </div>
      ${!chapter.is_free ? '<i class="fas fa-lock chapter-lock"></i>' : ''}
    `;
    
    item.addEventListener('click', () => {
      if (chapter.is_free) {
        loadChapter(index);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 992) {
          closeSidebar();
        }
      } else {
        showPopup(chapter.title);
      }
    });
    
    chaptersList.appendChild(item);
  });
  
  // Set first chapter as active
  if (chapters.length > 0 && chapters[0].is_free) {
    document.querySelector('.chapter-item[data-index="0"]').classList.add('active');
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
  
  // Update active state in chapters list
  document.querySelectorAll('.chapter-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.chapter-item[data-index="${index}"]`).classList.add('active');
  
  // Scroll to active chapter in list
  const activeItem = document.querySelector('.chapter-item.active');
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // Load chapter content
  const chapterViewer = document.getElementById('chapterViewer');
  const backgroundUrl = getBackgroundImage(chapter.chapter_number);
  
  // Set background image
  chapterViewer.style.background = 
    `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${backgroundUrl}')`;
  chapterViewer.style.backgroundSize = 'cover';
  chapterViewer.style.backgroundPosition = 'center';
  chapterViewer.style.backgroundAttachment = 'fixed';
  
  // 🔒 LOCKED CHAPTER
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
            This chapter contains exclusive premium content that requires registration.
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
            box-shadow: 0 5px 15px rgba(243, 156, 18, 0.3);
          ">
            <i class="fas fa-unlock-alt"></i> Unlock Premium Content
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // 📖 FREE CHAPTER
  chapterViewer.innerHTML = `
    <div class="chapter-content">
      <div class="chapter-viewer-header">
        <h1 class="chapter-viewer-title">${chapter.title}</h1>
        <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number} • Free Chapter</p>
      </div>
      ${parseTags(chapter.content)}
      
      <!-- Navigation buttons -->
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
            transition: all 0.3s;
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
            transition: all 0.3s;
          ">
            Next <i class="fas fa-arrow-right"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ===============================
// 📹 NAVIGATE CHAPTER (with lock check)
// ===============================
function navigateChapter(index) {
  if (index < 0 || index >= chaptersData.length) return;
  
  const chapter = chaptersData[index];
  if (!chapter.is_free) {
    showPopup(chapter.title);
  } else {
    loadChapter(index);
  }
}

// ===============================
// 📹 LOAD CHAPTERS FROM SUPABASE
// ===============================
async function loadChapters() {
  const { data, error } = await supabaseClient
    .from('chapters')
    .select('*')
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error("❌ Supabase error:", error);
    document.getElementById('chaptersList').innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: rgba(255,255,255,0.7);">
        <h3 style="color: #e74c3c;">Error loading chapters</h3>
        <p>Please refresh the page or try again later.</p>
      </div>
    `;
    return;
  }

  chaptersData = data;
  
  // Build chapters list (shows ALL chapters including locked)
  buildChaptersList(data);
  
  // Load first free chapter
  const firstFreeIndex = data.findIndex(chapter => chapter.is_free);
  if (firstFreeIndex !== -1) {
    loadChapter(firstFreeIndex);
  } else {
    // If no free chapters, show first chapter (locked)
    loadChapter(0);
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
// 📹 READ MODE TOGGLE
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
// 📹 REGISTER POPUP CONTROLS
// ===============================
function showPopup(chapterTitle = "") {
  // Update popup title if chapter title is provided
  if (chapterTitle) {
    const popupTitle = document.querySelector('#registerPopupContent h2');
    if (popupTitle) {
      popupTitle.innerHTML = `<i class="fas fa-lock"></i> ${chapterTitle}`;
    }
  }
  
  document.getElementById('registerPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}

function registerUser() {
  // In a real app, this would trigger registration flow
  alert('Registration functionality would go here. In a real app, this would open a registration form.');
  closePopup();
}

function showLogin() {
  // In a real app, this would trigger login flow
  alert('Login functionality would go here. In a real app, this would open a login form.');
  closePopup();
}

// ===============================
// 📹 KEYBOARD SHORTCUTS
// ===============================
document.addEventListener('keydown', function(e) {
  // Escape key: close sidebar and popup
  if (e.key === 'Escape') {
    closeSidebar();
    closePopup();
    
    // Exit read mode
    if (document.body.classList.contains('read-mode')) {
      toggleReadMode();
    }
  }
  
  // Arrow keys for navigation
  if (!document.body.classList.contains('read-mode')) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentChapterIndex + 1;
      if (nextIndex < chaptersData.length) {
        const nextChapter = chaptersData[nextIndex];
        if (nextChapter.is_free) {
          loadChapter(nextIndex);
        } else {
          showPopup(nextChapter.title);
        }
      }
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentChapterIndex - 1;
      if (prevIndex >= 0) {
        const prevChapter = chaptersData[prevIndex];
        if (prevChapter.is_free) {
          loadChapter(prevIndex);
        } else {
          showPopup(prevChapter.title);
        }
      }
    }
  }
});

// ===============================
// 🚀 INITIALIZE APP
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  document.getElementById('navToggle').addEventListener('click', toggleSidebar);
  document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
  document.getElementById('readModeToggle').addEventListener('click', toggleReadMode);
  
  // Close sidebar when clicking outside on mobile
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
  
  // Load chapters from Supabase
  loadChapters();
});
