// Example chapters (you can load from Supabase later)
const chapters = [
  {
    id: "chapter1",
    text: `
~chapterHero~Chapter I: The Indie Game Journey~~chapterHero~
~story~Many never reach this point. Not because success is difficult, but because the patterns that lead to it remain hidden. Recognizing them changes everything.~~story~
~pullQuote~“Maybe the next millionaire indie programmer is reading this page. If starting from scratch, this is the path to follow.”~~pullQuote~
~story~Across the globe, countless indie games quietly reach tens of thousands of players worldwide when the right combination of creativity and strategy was applied.~~story~
~lesson~The first lesson is simple but often ignored: real results come from **action with effective tools**, not theory alone.~~lesson~
~tools~Tools that often make a difference in early success:
- Game engines: Unity, Godot
- Graphics: free assets, Photoshop
- Marketing: Discord communities, Reddit, Twitter
- Analytics: Google Analytics, simple tracking~~tools~
~actionStep~Pick one tool today. Experiment with it. Movement matters more than preparation.~~actionStep~
~miniStory~One simple game, built over a weekend, gained its first 10 players through Reddit posts. Those 10 became the first feedback loop, fueling improvements that eventually reached hundreds more.~~miniStory~
~milestone~First measurable success: even 10 players counts. Celebrate it, track it, learn from it.~~milestone~
~lesson~Curiosity combined with pattern awareness separates stagnation from momentum.~~lesson~
~story~Most guidance in books tells what to do. Effective paths show **how results are achieved**, including common mistakes and practical shortcuts that beginners rarely see.~~story~
~miniStory~A game with minimal graphics and simple mechanics reached 50,000 players in months — because the developer understood where attention flows and how to engage early adopters.~~miniStory~
~pullQuote~“There exists a mindset many never discover — and the space between awareness and ignorance is where opportunities are found.”~~pullQuote~
~actionStep~Look around: what small experiment can be done today? Track it. Measure it. Adjust. Repeat.~~actionStep~
~story~Excitement, curiosity, even skepticism indicate readiness. Each insight is a door, and every small step is a key.~~story~
~lesson~Momentum begins when small actions meet attention and feedback.~~lesson~
~cliffhanger~Next, the approach that separates hobby projects from games that actually reach players will be revealed. Most beginners never notice it — and this insight often determines long-term success.~~cliffhanger~
`
  },
  {
    id: "chapter2",
    text: "~chapterHero~Chapter II: [Title]~~chapterHero~\n~story~Chapter 2 content goes here...~~story~"
  },
  // Add more chapters here...
];

// Function to parse our tags
function parseTags(text) {
  const regex = /~(\w+)~([\s\S]*?)~~\1~/g;
  let html = '';
  let match;
  while ((match = regex.exec(text)) !== null) {
    html += `<div class="${match[1]}">${match[2].trim()}</div>\n`;
  }
  return html;
}

// Load chapters into swiper slides
const bookSlides = document.getElementById('bookSlides');
chapters.forEach((chapter, index) => {
  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');
  slide.id = chapter.id;

  // Lock chapter >3 if not registered
  if (index > 2) { 
    slide.innerHTML = `<div style="text-align:center; font-size:1.2em; color:#e74c3c;">Chapter locked. Please register to continue.</div>`;
    slide.onclick = showPopup;
  } else {
    slide.innerHTML = parseTags(chapter.text);
  }

  bookSlides.appendChild(slide);
});

// Initialize Swiper
const swiper = new Swiper('.swiper-container', {
  direction: 'horizontal',
  parallax: true,
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

// Register popup
function showPopup() {
  document.getElementById('registerPopup').style.display = 'flex';
}
function closePopup() {
  document.getElementById('registerPopup').style.display = 'none';
}
