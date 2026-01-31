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
// 📹 DEBUG: CHECK WHAT'S IN DATABASE
// ===============================
async function debugSupabaseData() {
  console.log("🔍 DEBUG: Checking Supabase database...");
  
  try {
    // Get ALL chapters from database
    const { data, error } = await supabaseClient
      .from('chapters')
      .select('*')
      .order('chapter_number', { ascending: true });

    if (error) {
      console.error("❌ Database query error:", error);
      return null;
    }

    console.log(`📊 Database contains ${data.length} chapters:`);
    
    if (data.length === 0) {
      console.log("⚠️ Database is EMPTY! No chapters found.");
    } else {
      // Display all chapters
      data.forEach((chapter, index) => {
        console.log(`   ${index + 1}. Chapter ${chapter.chapter_number}: "${chapter.title}"`);
        console.log(`      Free: ${chapter.is_free}, Content: ${chapter.content ? 'Yes' : 'No'}, ID: ${chapter.id}`);
      });
      
      // Count free vs locked
      const freeChapters = data.filter(ch => ch.is_free).length;
      const lockedChapters = data.filter(ch => !ch.is_free).length;
      console.log(`📈 Free chapters: ${freeChapters}, Locked chapters: ${lockedChapters}`);
    }
    
    return data;
    
  } catch (err) {
    console.error("❌ Debug error:", err);
    return null;
  }
}

// ===============================
// 📹 CUSTOM TAG PARSER
// Simple tag parser for content
// ===============================
function parseTags(text) {
  if (!text) return '<p class="story">No content available for this chapter.</p>';
  
  // Simple replacement for tags
  let html = text
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
  
  return html;
}

// ===============================
// 📹 BACKGROUND IMAGE SELECTION
// Returns appropriate background based on chapter
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
  
  // Return corresponding background or default to first one
  return backgrounds[chapterNumber - 1] || backgrounds[0];
}

// ===============================
// 📹 BUILD CHAPTERS LIST
// Shows ALL chapters (free and locked) in navigation
// ===============================
function buildChaptersList(chapters) {
  const chaptersList = document.getElementById('chaptersList');
  
  if (!chaptersList) {
    console.error("❌ chaptersList element not found!");
    return;
  }
  
  chaptersList.innerHTML = '';
  
  console.log(`📝 Building navigation list with ${chapters.length} chapters`);
  
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
    
    // Create chapter item HTML
    item.innerHTML = `
      <div class="chapter-number">${chapter.chapter_number.toString().padStart(2, '0')}</div>
      <div class="chapter-details">
        <div class="chapter-title">${displayTitle}</div>
        ${chapter.is_free ? 
          '<span class="free-badge">FREE</span>' : 
          '<span class="premium-badge">PREMIUM</span>'
        }
      </div>
      ${chapter.is_free ? 
        '<i class="fas fa-book-open chapter-open"></i>' : 
        '<i class="fas fa-lock chapter-lock"></i>'
      }
    `;
    
    // Click handler - ALL chapters are clickable
    item.addEventListener('click', () => {
      console.log(`Clicked chapter ${chapter.chapter_number}: ${chapter.title}`);
      
      if (chapter.is_free) {
        // Load and read free chapter
        loadChapter(index);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 992) {
          closeSidebar();
        }
      } else {
        // Show popup for locked chapter
        console.log(`Chapter ${chapter.chapter_number} is locked, showing popup`);
        showPopup(`Chapter ${chapter.chapter_number}: ${displayTitle}`);
      }
    });
    
    chaptersList.appendChild(item);
  });
  
  console.log(`✅ Navigation built with ${chapters.length} items`);
}

// ===============================
// 📹 LOAD CHAPTER CONTENT
// ===============================
function loadChapter(index) {
  if (index < 0 || index >= chaptersData.length) {
    console.error(`❌ Invalid chapter index: ${index}`);
    return;
  }
  
  const chapter = chaptersData[index];
  currentChapterIndex = index;
  
  console.log(`📖 Loading chapter ${index + 1}/${chaptersData.length}: ${chapter.title}`);
  
  // Update header with current chapter info
  document.getElementById('currentChapterTitle').textContent = chapter.title;
  document.getElementById('chapterProgress').textContent = 
    `Chapter ${chapter.chapter_number} of ${chaptersData.length}`;
  
  // Update active state in chapters list
  document.querySelectorAll('.chapter-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`.chapter-item[data-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    
    // Scroll active chapter into view
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
    console.log(`🔒 Chapter ${chapter.chapter_number} is locked, showing premium message`);
    
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
            This chapter contains exclusive premium content. Register or log in to continue reading.
          </p>
          <button onclick="showPopup('${chapter.title.replace(/'/g, "\\'")}')" style="
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
            <i class="fas fa-unlock-alt"></i> Unlock Premium Content
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // 📖 FREE CHAPTER
  console.log(`📚 Chapter ${chapter.chapter_number} is free, loading content`);
  
  const parsedContent = parseTags(chapter.content);
  
  chapterViewer.innerHTML = `
    <div class="chapter-content">
      <div class="chapter-viewer-header">
        <h1 class="chapter-viewer-title">${chapter.title}</h1>
        <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number}</p>
      </div>
      ${parsedContent}
      
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
// Handles next/previous navigation
// ===============================
function navigateChapter(index) {
  if (index < 0 || index >= chaptersData.length) return;
  
  const chapter = chaptersData[index];
  console.log(`Navigating to chapter ${chapter.chapter_number}: ${chapter.is_free ? 'FREE' : 'LOCKED'}`);
  
  if (!chapter.is_free) {
    // Show popup for locked chapter
    let displayTitle = chapter.title;
    const titleMatch = chapter.title.match(/Chapter \d+:\s*(.+)/i);
    if (titleMatch) {
      displayTitle = titleMatch[1];
    }
    showPopup(`Chapter ${chapter.chapter_number}: ${displayTitle}`);
  } else {
    // Load free chapter
    loadChapter(index);
  }
}

// ===============================
// 📹 LOAD CHAPTERS FROM SUPABASE
// Main function to load ALL chapters
// ===============================
async function loadChapters() {
  console.log("🚀 Starting to load chapters from Supabase...");
  
  try {
    // First, debug to see what's actually in the database
    const debugData = await debugSupabaseData();
    
    if (!debugData || debugData.length === 0) {
      console.error("❌ No chapters found in database!");
      document.getElementById('chaptersList').innerHTML = `
        <div class="empty-message">
          <h3><i class="fas fa-book"></i> No Chapters Found</h3>
          <p>Your database appears to be empty or contains no chapters.</p>
          <p>Please add chapters to your Supabase 'chapters' table.</p>
        </div>
      `;
      
      // Update header to show empty state
      document.getElementById('currentChapterTitle').textContent = "No Chapters Available";
      document.getElementById('chapterProgress').textContent = "Add chapters to your database";
      
      return;
    }
    
    // Store all chapters
    chaptersData = debugData;
    
    console.log(`✅ Loaded ${chaptersData.length} TOTAL chapters into memory`);
    
    // Build navigation with ALL chapters
    buildChaptersList(chaptersData);
    
    // Find the first free chapter
    const firstFreeIndex = chaptersData.findIndex(ch => ch.is_free);
    
    if (firstFreeIndex !== -1) {
      console.log(`📚 Starting with free chapter #${firstFreeIndex + 1}: ${chaptersData[firstFreeIndex].title}`);
      loadChapter(firstFreeIndex);
    } else {
      console.log("⚠️ No free chapters found. Starting with first chapter (locked)");
      loadChapter(0);
    }
    
  } catch (err) {
    console.error("💥 Unexpected error loading chapters:", err);
    
    document.getElementById('chaptersList').innerHTML = `
      <div class="error-message">
        <h3><i class="fas fa-exclamation-circle"></i> Connection Error</h3>
        <p>Failed to connect to the server.</p>
        <p>Please check your internet connection and refresh the page.</p>
        <p style="font-size: 0.8em; margin-top: 10px;">Error: ${err.message}</p>
      </div>
    `;
  }
}

// ===============================
// 📹 SIDEBAR CONTROLS
// ===============================
function toggleSidebar() {
  const sidebar = document.getElementById('chaptersSidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
    console.log(`Sidebar ${sidebar.classList.contains('open') ? 'opened' : 'closed'}`);
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('chaptersSidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

// ===============================
// 📹 READ MODE TOGGLE
// ===============================
function toggleReadMode() {
  document.body.classList.toggle('read-mode');
  const button = document.getElementById('readModeToggle');
  if (button) {
    if (document.body.classList.contains('read-mode')) {
      button.innerHTML = '<i class="fas fa-times"></i> Exit Read Mode';
    } else {
      button.innerHTML = '<i class="fas fa-book-reader"></i> Read Mode';
    }
  }
}

// ===============================
// 📹 REGISTER POPUP CONTROLS
// ===============================
function showPopup(chapterTitle = "Premium Content") {
  console.log(`Showing popup for: ${chapterTitle}`);
  
  // Update popup title
  const titleElement = document.querySelector('#registerPopupContent h2');
  if (titleElement) {
    titleElement.innerHTML = `<i class="fas fa-lock"></i> ${chapterTitle}`;
  }
  
  document.getElementById('registerPopup').style.display = 'flex';
}

function closePopup() {
  console.log("Closing popup");
  document.getElementById('registerPopup').style.display = 'none';
}

function registerUser() {
  alert('Registration form would appear here. In a real app, this would redirect to a registration page.');
  closePopup();
}

function showLogin() {
  alert('Login form would appear here. In a real app, this would redirect to a login page.');
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
          let displayTitle = nextChapter.title;
          const titleMatch = nextChapter.title.match(/Chapter \d+:\s*(.+)/i);
          if (titleMatch) {
            displayTitle = titleMatch[1];
          }
          showPopup(`Chapter ${nextChapter.chapter_number}: ${displayTitle}`);
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
          let displayTitle = prevChapter.title;
          const titleMatch = prevChapter.title.match(/Chapter \d+:\s*(.+)/i);
          if (titleMatch) {
            displayTitle = titleMatch[1];
          }
          showPopup(`Chapter ${prevChapter.chapter_number}: ${displayTitle}`);
        }
      }
    }
  }
});

// ===============================
// 🚀 INITIALIZE APP
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  console.log("📚 Indie Game Marketing Guide - Initializing...");
  
  // Set up event listeners
  const navToggle = document.getElementById('navToggle');
  const closeSidebarBtn = document.getElementById('closeSidebar');
  const readModeToggle = document.getElementById('readModeToggle');
  
  if (navToggle) {
    navToggle.addEventListener('click', toggleSidebar);
  }
  
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
  }
  
  if (readModeToggle) {
    readModeToggle.addEventListener('click', toggleReadMode);
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('chaptersSidebar');
    const navToggle = document.getElementById('navToggle');
    
    if (window.innerWidth < 992 && 
        sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !navToggle.contains(e.target)) {
      closeSidebar();
    }
  });
  
  // Close popup when clicking outside
  const popup = document.getElementById('registerPopup');
  if (popup) {
    popup.addEventListener('click', function(e) {
      if (e.target === this) {
        closePopup();
      }
    });
  }
  
  // Load chapters from Supabase
  loadChapters();
});
