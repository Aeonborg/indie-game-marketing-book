// ===============================
// 📹 BUILD CHAPTERS LIST
// Show ALL chapters including locked ones
// ===============================
function buildChaptersList(chapters) {
  const chaptersList = document.getElementById('chaptersList');
@@ -86,6 +87,7 @@ function buildChaptersList(chapters) {
      <div class="chapter-details">
        <div class="chapter-title">${displayTitle}</div>
        <div class="chapter-preview">${previewText}</div>
        ${!chapter.is_free ? '<span class="premium-badge">PREMIUM</span>' : ''}
      </div>
      ${!chapter.is_free ? '<i class="fas fa-lock chapter-lock"></i>' : ''}
    `;
@@ -98,7 +100,7 @@ function buildChaptersList(chapters) {
          closeSidebar();
        }
      } else {
        showPopup();
        showPopup(chapter.title);
      }
    });

@@ -154,16 +156,18 @@ function loadChapter(index) {
      <div class="chapter-content">
        <div class="chapter-viewer-header">
          <h1 class="chapter-viewer-title">${chapter.title}</h1>
          <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number}</p>
          <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number} • Premium Content</p>
        </div>
        <div style="text-align:center; padding: 60px 0;">
          <div style="font-size: 4em; margin-bottom: 20px;">🔒</div>
          <h2 style="color:#e74c3c; font-size: 2em; margin-bottom: 20px;">This Chapter is Locked</h2>
          <div style="font-size: 4em; margin-bottom: 20px; color: #f39c12;">
            <i class="fas fa-lock"></i>
          </div>
          <h2 style="color:#f39c12; font-size: 2em; margin-bottom: 20px;">Premium Chapter Locked</h2>
          <p style="color: rgba(255,255,255,0.8); font-size: 1.2em; margin-bottom: 30px; max-width: 500px; margin: 0 auto 30px;">
            Register or log in to continue reading this guide and unlock all premium content.
            This chapter contains exclusive premium content that requires registration.
          </p>
          <button onclick="showPopup()" style="
            background: #3498db;
          <button onclick="showPopup('${chapter.title}')" style="
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            border: none;
            padding: 18px 50px;
@@ -172,7 +176,7 @@ function loadChapter(index) {
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            box-shadow: 0 5px 15px rgba(243, 156, 18, 0.3);
          ">
            <i class="fas fa-unlock-alt"></i> Unlock Premium Content
          </button>
@@ -187,14 +191,14 @@ function loadChapter(index) {
    <div class="chapter-content">
      <div class="chapter-viewer-header">
        <h1 class="chapter-viewer-title">${chapter.title}</h1>
        <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number}</p>
        <p class="chapter-viewer-subtitle">Chapter ${chapter.chapter_number} • Free Chapter</p>
      </div>
      ${parseTags(chapter.content)}
      
      <!-- Navigation buttons -->
      <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between;">
        ${index > 0 ? `
          <button onclick="loadChapter(${index - 1})" style="
          <button onclick="navigateChapter(${index - 1})" style="
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
@@ -207,12 +211,12 @@ function loadChapter(index) {
            gap: 8px;
            transition: all 0.3s;
          ">
            <i class="fas fa-arrow-left"></i> Previous Chapter
            <i class="fas fa-arrow-left"></i> Previous
          </button>
        ` : '<div></div>'}
        
        ${index < chaptersData.length - 1 ? `
          <button onclick="loadChapter(${index + 1})" style="
          <button onclick="navigateChapter(${index + 1})" style="
            background: #3498db;
            color: white;
            border: none;
@@ -225,14 +229,28 @@ function loadChapter(index) {
            gap: 8px;
            transition: all 0.3s;
          ">
            Next Chapter <i class="fas fa-arrow-right"></i>
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
@@ -255,7 +273,7 @@ async function loadChapters() {

  chaptersData = data;

  // Build chapters list
  // Build chapters list (shows ALL chapters including locked)
  buildChaptersList(data);

  // Load first free chapter
@@ -295,14 +313,34 @@ function toggleReadMode() {
// ===============================
// 📹 REGISTER POPUP CONTROLS
// ===============================
function showPopup() {
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
@@ -322,15 +360,27 @@ document.addEventListener('keydown', function(e) {
  if (!document.body.classList.contains('read-mode')) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentChapterIndex < chaptersData.length - 1) {
        loadChapter(currentChapterIndex + 1);
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
      if (currentChapterIndex > 0) {
        loadChapter(currentChapterIndex - 1);
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
@@ -358,6 +408,13 @@ document.addEventListener('DOMContentLoaded', function() {
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
