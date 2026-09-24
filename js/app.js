/**
 * R. MAHALAKSHMY - Portfolio Master Logic
 * Orchestrates GSAP ScrollTrigger, Custom Magnetic Cursor, 3D Card Tilt,
 * Web Audio FX Synthesizer, Interactive CLI Terminal, and Project Modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Cybernetic Preloader Sequence
  // =========================================================================
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPercentage = document.getElementById('preloader-percentage');
  const preloaderStatus = document.getElementById('preloader-status');

  const statusMessages = [
    'INITIALIZING 3D NEURAL MATRIX...',
    'CALIBRATING THREE.JS SHADERS...',
    'SYNCING AIML CORE REPOSITORY...',
    'MOUNTING OPTIMUS ENGINE MODULES...',
    'ESTABLISHING BIOMETRIC TELEMETRY...',
    'SYSTEM READY // LAUNCHING...'
  ];

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    if (progress > 100) progress = 100;

    if (preloaderBar) preloaderBar.style.width = `${progress}%`;
    if (preloaderPercentage) preloaderPercentage.textContent = `${progress}%`;

    const statusIndex = Math.min(
      Math.floor((progress / 100) * statusMessages.length),
      statusMessages.length - 1
    );
    if (preloaderStatus) preloaderStatus.textContent = statusMessages[statusIndex];

    if (progress >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.remove('loading');
        initEntranceAnimations();
      }, 500);
    }
  }, 45);

  // =========================================================================
  // 2. Procedural Web Audio API Synthesizer (Futuristic Sci-Fi SFX)
  // =========================================================================
  let audioCtx = null;
  let isSoundEnabled = false;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playSynthTone(freq, type = 'sine', duration = 0.12, volume = 0.08) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn('Audio playback error', err);
    }
  }

  function playHoverSound() {
    playSynthTone(580, 'sine', 0.08, 0.04);
  }

  function playClickSound() {
    playSynthTone(880, 'triangle', 0.14, 0.07);
  }

  function playSuccessSound() {
    if (!isSoundEnabled || !audioCtx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => playSynthTone(freq, 'sine', 0.2, 0.06), idx * 60);
    });
  }

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundStateText = document.getElementById('sound-state-text');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudioContext();
      isSoundEnabled = !isSoundEnabled;
      if (isSoundEnabled) {
        soundToggleBtn.classList.add('playing');
        if (soundStateText) soundStateText.textContent = 'ACTIVE';
        playSuccessSound();
        showToast('Futuristic Sound FX Enabled', 'volume-high');
      } else {
        soundToggleBtn.classList.remove('playing');
        if (soundStateText) soundStateText.textContent = 'MUTED';
        showToast('Sound FX Muted', 'volume-xmark');
      }
    });
  }

  // =========================================================================
  // 3. Custom Magnetic Cursor
  // =========================================================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Expand ring on interactive elements
  const interactiveTargets = document.querySelectorAll(
    'a, button, input, textarea, .tilt-card, .filter-btn, .channel-item'
  );
  interactiveTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => {
      if (cursorRing) cursorRing.classList.add('active');
      playHoverSound();
    });
    target.addEventListener('mouseleave', () => {
      if (cursorRing) cursorRing.classList.remove('active');
    });
    target.addEventListener('click', () => {
      playClickSound();
    });
  });

  // =========================================================================
  // 4. 3D Card Perspective Tilt & Dynamic Spotlight Tracker
  // =========================================================================
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spotlight coordinates for CSS radial-gradient
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Perspective Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
  });

  // =========================================================================
  // 5. GSAP Entrance & ScrollTrigger Animations
  // =========================================================================
  function initEntranceAnimations() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero Timeline Entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl.from('.navbar-wrapper', {
      y: -40,
      opacity: 0,
      duration: 1
    })
    .from('.hero-badge-container', {
      y: 20,
      opacity: 0,
      duration: 0.6
    }, '-=0.6')
    .from('.hero-eyebrow', {
      y: 20,
      opacity: 0,
      duration: 0.5
    }, '-=0.4')
    .from('.hero-name', {
      y: 35,
      opacity: 0,
      duration: 0.8
    }, '-=0.3')
    .from('.hero-subheading', {
      y: 25,
      opacity: 0,
      duration: 0.6
    }, '-=0.4')
    .from('.hero-description', {
      y: 20,
      opacity: 0,
      duration: 0.6
    }, '-=0.4')
    .from('.hero-cta-group', {
      y: 20,
      opacity: 0,
      duration: 0.6
    }, '-=0.4')
    .from('.telemetry-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12
    }, '-=0.4');

    // Scroll-Triggered Section Animations
    if (typeof ScrollTrigger !== 'undefined') {
      // Section headers
      gsap.utils.toArray('.section-header').forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      });

      // About section elements
      gsap.from('.about-visual-col', {
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 75%'
        },
        x: -40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
      });

      gsap.from('.about-text-col', {
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 75%'
        },
        x: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
      });

      // Timeline items
      gsap.utils.toArray('.timeline-card-wrapper').forEach((item, index) => {
        const isLeft = item.classList.contains('left-align');
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 82%'
          },
          x: isLeft ? -50 : 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      });

      // Project Cards Stagger
      gsap.from('.project-card', {
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 80%'
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });

      // Skill meter animation
      gsap.utils.toArray('.meter-fill').forEach((fill) => {
        const targetWidth = fill.style.width;
        fill.style.width = '0%';
        ScrollTrigger.create({
          trigger: fill,
          start: 'top 90%',
          onEnter: () => {
            fill.style.width = targetWidth;
          }
        });
      });
    }
  }

  // =========================================================================
  // 6. Project Category Filtering
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        if (filterVal === 'all' || cardCategory === filterVal) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 7. Project Architecture Detail Modal
  // =========================================================================
  const projectModal = document.getElementById('project-modal');
  const projectModalBody = document.getElementById('project-modal-body');
  const closeProjectModalBtn = document.getElementById('close-project-modal');

  const projectSpecsData = {
    airlineml: {
      title: 'Airline Customer Satisfaction: Production ML System',
      category: 'Production ML Pipeline & Interactive Streamlit Analytics',
      image: 'assets/project-airline-ml.jpg',
      github: 'https://github.com/24ucs159-gif/airline-ml-project',
      tags: ['Python 3.10', 'Random Forest (100 Trees)', 'Scikit-Learn', 'Streamlit UI', 'Data Leakage Free', 'ROC-AUC 0.992', 'Accuracy 95.5%+'],
      stats: [
        { label: 'Accuracy', value: '95.5%+' },
        { label: 'ROC-AUC', value: '0.992' },
        { label: 'F1-Score', value: '0.955' },
        { label: 'Dataset', value: '129.8K Records' }
      ],
      problem: 'Commercial airlines handle vast customer touchpoints spanning ground services, flight delays, seat comfort, and digital booking. Pinpointing which operational pain points directly cause customer churn across 120,000+ passengers is difficult without accurate statistical modeling.',
      solution: 'Constructed an end-to-end production Machine Learning pipeline leveraging 129,880 passenger survey records. Designed leak-free data preprocessing (median & mode imputers, standard scaling, and one-hot encoding fit strictly on training splits), trained an optimized RandomForestClassifier (100 estimators, max depth 18), and deployed a real-time Streamlit web app with interactive probability gauges and passenger presets.',
      architecture: [
        'Automated multi-format dataset detection (.csv, .xlsx, .json) & validation across 129,880 records and 22 features',
        'Atomic ColumnTransformer preventing data leakage: SimpleImputer (median for numeric, mode for categorical) + StandardScaler & OneHotEncoder fit strictly on training split',
        'Stratified 80/20 train-test splitting preserving binary class balance (54.7% satisfied / 45.3% dissatisfied)',
        'RandomForestClassifier optimization achieving ~95.5%+ accuracy, 0.955 F1-score, and 0.992 ROC-AUC',
        'Feature importance extraction isolating top satisfaction drivers: Inflight entertainment, Seat comfort, Ease of Online booking, and Online support',
        'Interactive Streamlit application featuring live inference confidence gauges, dynamic EDA charts, and custom scenario presets',
        'Production model artifact persistence in models/ (random_forest_model.pkl, preprocessor.pkl, model_metadata.json)'
      ],
      codeSnippet: `# Production Leak-Free Preprocessing & Random Forest Pipeline
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier

# 1. Atomic Preprocessing Transformers (Strictly fit on train data)
num_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

preprocessor = ColumnTransformer([
    ('num', num_transformer, numerical_features),
    ('cat', cat_transformer, categorical_features)
])

# 2. Production Random Forest Pipeline
model = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(
        n_estimators=100,
        max_depth=18,
        random_state=42,
        n_jobs=-1
    ))
])

# 3. Fit on Stratified Train Split & Evaluate
model.fit(X_train, y_train)
# Accuracy: ~95.5%+ | ROC-AUC: 0.992 | Weighted F1: 0.955+
joblib.dump(model, 'models/random_forest_model.pkl')`
    },
    neuromed: {
      title: 'NeuroMed: AI Disease Prediction & Diagnostics',
      category: 'Healthcare Machine Learning Platform',
      image: 'assets/project-ai-med.jpg',
      tags: ['Python 3.10', 'Scikit-Learn', 'Pandas & NumPy', 'Streamlit', 'Random Forest', 'ROC-AUC 0.94'],
      problem: 'Early clinical disease detection often suffers from missed subtle multi-variable symptoms across disparate clinical blood and biomarker metrics.',
      solution: 'Engineered a supervised machine learning prediction suite trained on normalized medical indicator datasets. Implemented feature importance analysis (SHAP values) and cross-validated Random Forest & XGBoost classifiers.',
      architecture: [
        'Data Cleaning & MinMax Standardization pipeline',
        'Imbalanced Dataset resampling via SMOTE',
        'Multi-class risk classification with 94.2% test accuracy',
        'Interactive diagnosis probability dashboard with risk tier indicators'
      ],
      codeSnippet: `# Sample Classifier Pipeline Snippet
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42))
])
pipeline.fit(X_train, y_train)
accuracy = pipeline.score(X_test, y_test)
print(f"Model Accuracy: {accuracy * 100:.2f}%")`
    },
    algotrade: {
      title: 'Optimus Algorithmic Trading & Analytics Simulator',
      category: 'Financial Computing & High-Throughput Matching Engine',
      image: 'assets/project-algo-trade.jpg',
      tags: ['Java 17', 'Object-Oriented Design', 'Multi-Threading', 'Data Structures (Queues/Trees)', 'Telemetry'],
      problem: 'Simulating order execution books and testing quantitative momentum trading strategies requires deterministic low-latency processing without thread race conditions.',
      solution: 'Constructed an in-memory limit order book (LOB) utilizing concurrent queues and balanced binary search trees. Designed multi-threaded buy/sell order matching with atomic transaction records.',
      architecture: [
        'ConcurrentLinkedQueue for high-throughput order ingestion',
        'PriorityQueue order book matching based on price-time priority',
        'Thread-safe portfolio risk calculator tracking drawdown and ROI',
        'Real-time console telemetry displaying bid-ask spreads'
      ],
      codeSnippet: `// Thread-Safe Order Dispatcher
public class OrderMatchingEngine {
    private final PriorityQueue<Order> buyOrders = new PriorityQueue<>(Comparator.comparing(Order::getPrice).reversed());
    private final PriorityQueue<Order> sellOrders = new PriorityQueue<>(Comparator.comparing(Order::getPrice));

    public synchronized void matchOrders() {
        while (!buyOrders.isEmpty() && !sellOrders.isEmpty() && 
               buyOrders.peek().getPrice() >= sellOrders.peek().getPrice()) {
            executeTrade(buyOrders.poll(), sellOrders.poll());
        }
    }
}`
    },
    visionpass: {
      title: 'VisionPass: Computer Vision Facial Attendance System',
      category: 'Biometric AI & Real-time Computer Vision',
      image: 'assets/project-vision-face.jpg',
      tags: ['Python', 'OpenCV', 'Deep Learning / CNN', 'Dlib Facial Landmarks', 'SQLite Database'],
      problem: 'Manual collegiate classroom attendance is slow, prone to proxy attendance, and lacks verifiable timestamped auditing.',
      solution: 'Developed an automated biometric pipeline that detects student faces from webcam feeds, extracts 128-dimensional facial embeddings, matches them against an enrolled database, and logs attendance with anti-spoof checks.',
      architecture: [
        'Haar Cascade / HOG face detection with real-time bounding boxes',
        'Facial landmark alignment and Euclidean distance vector matching',
        'Automatic SQLite attendance record logging with cooldown timeouts',
        'Exportable CSV and PDF summary reports for professors'
      ],
      codeSnippet: `# Facial Recognition Verification
import cv2
import face_recognition

def verify_student(frame, known_encodings, student_ids):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
    for encoding in face_encodings:
        matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.55)
        # Process matched student ID...`
    },
    edupulse: {
      title: 'EduPulse: Academic Performance & Analytics Portal',
      category: 'EdTech Full-Stack Management & Telemetry',
      image: 'assets/project-edupulse.jpg',
      tags: ['JavaScript ES6+', 'HTML5 / CSS3', 'Python Flask Backend', 'Relational SQL', 'Chart.js'],
      problem: 'Collegiate students and academic advisors lack a unified, visually engaging dashboard to monitor semester GPA trends, credits remaining, and attendance alerts.',
      solution: 'Built a responsive analytics portal featuring dynamic charts, subject performance breakdown, internal assessment aggregators, and automated GPA forecast modeling.',
      architecture: [
        'Normalized relational SQL schema for courses, marks, and attendance',
        'RESTful API endpoints for instant student report retrieval',
        'Dynamic interactive radar charts comparing individual vs class averages',
        'Automated attendance shortfall warning triggers (< 75%)'
      ],
      codeSnippet: `-- Relational Schema Excerpt
CREATE TABLE student_grades (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id VARCHAR(20) NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    internal_score NUMERIC(5,2),
    final_score NUMERIC(5,2),
    semester INTEGER NOT NULL,
    attendance_rate NUMERIC(4,2)
);`
    }
  };

  function openProjectModal(projectId) {
    const data = projectSpecsData[projectId];
    if (!data || !projectModal || !projectModalBody) return;

    projectModalBody.innerHTML = `
      <div class="project-modal-header" style="margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <span class="project-modal-category" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--cyan); letter-spacing: 0.08em;">${data.category}</span>
          ${data.github ? `
            <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn-card-github" style="font-size: 0.8rem; padding: 0.35rem 0.85rem; color: var(--cyan); border-color: var(--cyan);">
              <i class="fa-brands fa-github"></i>
              <span>GitHub Repository</span>
              <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;"></i>
            </a>
          ` : ''}
        </div>
        <h2 style="font-size: 1.8rem; color: #fff; margin-top: 0.4rem;">${data.title}</h2>
      </div>

      <div style="aspect-ratio: 16/9; overflow: hidden; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border-glass);">
        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      ${data.stats ? `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
        ${data.stats.map(s => `
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.75rem 1rem; text-align: center;">
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--cyan); font-family: var(--font-mono);">${s.value}</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.2rem;">${s.label}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
        ${data.tags.map(tag => `<span class="tag-pill" style="color: var(--cyan); background: rgba(0, 242, 254, 0.08);">${tag}</span>`).join('')}
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-triangle-exclamation" style="color: var(--amber); margin-right: 0.5rem;"></i>Problem Statement</h3>
        <p style="color: var(--text-secondary); line-height: 1.6;">${data.problem}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-lightbulb" style="color: var(--emerald); margin-right: 0.5rem;"></i>Solution & Technical Approach</h3>
        <p style="color: var(--text-secondary); line-height: 1.6;">${data.solution}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-sitemap" style="color: var(--cyan); margin-right: 0.5rem;"></i>System Architecture Highlights</h3>
        <ul style="list-style: none; padding: 0;">
          ${data.architecture.map(arch => `
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
              <i class="fa-solid fa-check" style="color: var(--cyan); margin-top: 0.3rem;"></i>
              <span>${arch}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-code" style="color: var(--purple); margin-right: 0.5rem;"></i>Core Implementation Logic</h3>
        <pre style="background: rgba(0, 0, 0, 0.45); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem; font-family: var(--font-mono); font-size: 0.8rem; color: #cbd5e1; overflow-x: auto;"><code>${escapeHTML(data.codeSnippet)}</code></pre>
      </div>

      ${data.github ? `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; background: rgba(0, 242, 254, 0.05); border: 1px solid var(--border-cyan); border-radius: var(--radius-md); padding: 1rem 1.25rem;">
        <div>
          <div style="font-weight: 600; color: #fff; font-size: 0.95rem;">Explore Full Source Code & Documentation</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 0.2rem;">Pipeline scripts, Streamlit app, datasets & saved models</div>
        </div>
        <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn-primary-glow" style="text-decoration: none; padding: 0.6rem 1.25rem; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 0.5rem;">
          <i class="fa-brands fa-github"></i>
          <span>View on GitHub</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
        </a>
      </div>
      ` : ''}
    `;

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playSuccessSound();
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
  }

  // Bind project modal triggers
  document.querySelectorAll('[data-project]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const projId = trigger.getAttribute('data-project');
      openProjectModal(projId);
    });
  });

  if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  // =========================================================================
  // 8. Interactive CLI Developer Terminal
  // =========================================================================
  const terminalModal = document.getElementById('terminal-modal');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalExecBtn = document.getElementById('terminal-exec-btn');
  const openTerminalBtn = document.getElementById('open-terminal-btn');
  const heroTerminalBtn = document.getElementById('hero-terminal-btn');
  const mobileTerminalBtn = document.getElementById('mobile-terminal-btn');
  const closeTerminalBtn = document.getElementById('close-terminal-btn');
  const minimizeTerminalBtn = document.getElementById('minimize-terminal-btn');

  let commandHistory = [];
  let historyIndex = -1;

  function openTerminal() {
    if (!terminalModal) return;
    terminalModal.classList.add('open');
    terminalModal.setAttribute('aria-hidden', 'false');
    if (terminalInput) {
      setTimeout(() => terminalInput.focus(), 150);
    }
    playClickSound();
  }

  function closeTerminal() {
    if (!terminalModal) return;
    terminalModal.classList.remove('open');
    terminalModal.setAttribute('aria-hidden', 'true');
  }

  [openTerminalBtn, heroTerminalBtn, mobileTerminalBtn].forEach((btn) => {
    if (btn) btn.addEventListener('click', openTerminal);
  });

  [closeTerminalBtn, minimizeTerminalBtn].forEach((btn) => {
    if (btn) btn.addEventListener('click', closeTerminal);
  });

  if (terminalModal) {
    terminalModal.addEventListener('click', (e) => {
      if (e.target === terminalModal) closeTerminal();
    });
  }

  // Keyboard shortcut Ctrl+` or Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      if (terminalModal && terminalModal.classList.contains('open')) {
        closeTerminal();
      } else {
        openTerminal();
      }
    } else if (e.key === 'Escape') {
      closeTerminal();
      closeProjectModal();
    }
  });

  // CLI Command Registry
  const terminalCommands = {
    help: () => `
Available system commands:
  • <span class="cmd-highlight">bio</span>        - Background and career objective
  • <span class="cmd-highlight">education</span>  - Academic credentials & college
  • <span class="cmd-highlight">experience</span> - Industry internship at Optimus Technocrates
  • <span class="cmd-highlight">skills</span>     - Technical competencies & AIML certification
  • <span class="cmd-highlight">projects</span>   - Flagship engineered software solutions
  • <span class="cmd-highlight">airline</span>    - Production Airline Customer Satisfaction ML System
  • <span class="cmd-highlight">contact</span>    - Email, phone, and location channels
  • <span class="cmd-highlight">hire</span>       - Direct recruitment prompt
  • <span class="cmd-highlight">clear</span>      - Clear terminal screen
  • <span class="cmd-highlight">matrix</span>     - Run system matrix sequence
  • <span class="cmd-highlight">date</span>       - Display live Indian Standard Time (IST)
    `,
    bio: () => `
[CANDIDATE BIOGRAPHY]
Name: R. Mahalakshmy
Location: Kallakurichi, Tamil Nadu, India
Status: 3rd Year B.Sc. Computer Science (Expected 2027)
Objective: Motivated and detail-oriented computer science student seeking an internship/entry-level opportunity to apply programming and problem-solving skills, contribute to real-world projects, and grow as a software professional.
Languages: Tamil (Native), English (Good).
    `,
    education: () => `
[ACADEMIC CREDENTIALS]
1. Muthayammal College of Arts and Science, Rasipuram
   Degree: B.Sc. Computer Science (3rd Year, Expected Graduation: 2027)
   Focus: Data Structures, Algorithms, OOP, Database Systems, Computer Networks.

2. A.K.T Matriculation Higher Secondary School, Kallakurichi
   Standard: Higher Secondary Education (HSC) — 61%
    `,
    experience: () => `
[PROFESSIONAL INTERNSHIP]
Role: Software Engineering Intern
Company: Optimus Technocrates India Private Limited
Activities:
  - Engineered modular software features and assisted in code refactoring.
  - Executed automated unit tests and participated in team debugging sessions.
  - Practiced agile sprint workflows and collaborative source code reviews.
    `,
    skills: () => `
[TECHNICAL INVENTORY]
• Programming: Python (88%), Java (82%), C++ (80%), C (85%)
• Specialization: AIML Certified (Supervised/Unsupervised Learning, Neural Nets)
• Web & DB: HTML5, CSS3, JavaScript ES6+, SQL Relational Databases, Git
• Strengths: Fast Learner, Analytical Thinking, Problem Solving, Team Player
    `,
    projects: () => `
[FLAGSHIP PROJECTS]
1. Airline Customer Satisfaction ML System (Python, Random Forest, Streamlit)
   • 95.5%+ Test Accuracy | 0.992 ROC-AUC | 129,880 Pax Records
   • Repo: <a href="https://github.com/24ucs159-gif/airline-ml-project" target="_blank" style="color: var(--cyan);">github.com/24ucs159-gif/airline-ml-project</a>
2. NeuroMed: AI Disease Prediction & Diagnostics (Python, Scikit-Learn, Streamlit)
3. Optimus Algorithmic Trading & Analytics Simulator (Java, Multithreading, OOP)
4. VisionPass: Biometric AI Face Recognition Attendance (Python, OpenCV, SQLite)
5. EduPulse: Academic Performance & Student Analytics Portal (JavaScript, HTML/CSS, SQL)
    `,
    airline: () => `
[✈️ AIRLINE CUSTOMER SATISFACTION - PRODUCTION ML SYSTEM]
• Model: RandomForestClassifier (100 estimators, max depth 18, random_state=42)
• Accuracy: ~95.5%+ | ROC-AUC: 0.992 | Weighted F1: 0.955+
• Dataset: 129,880 survey records across 22 operational features
• Pipeline: Atomic ColumnTransformer (median/mode imputation, StandardScaler, OneHotEncoder)
• Web App: Interactive Streamlit UI with confidence gauges & dynamic EDA
• GitHub: <a href="https://github.com/24ucs159-gif/airline-ml-project" target="_blank" style="color: var(--cyan);">https://github.com/24ucs159-gif/airline-ml-project</a>
    `,
    airlineml: () => `
[✈️ AIRLINE CUSTOMER SATISFACTION - PRODUCTION ML SYSTEM]
• Model: RandomForestClassifier (100 estimators, max depth 18, random_state=42)
• Accuracy: ~95.5%+ | ROC-AUC: 0.992 | Weighted F1: 0.955+
• Dataset: 129,880 survey records across 22 operational features
• Pipeline: Atomic ColumnTransformer (median/mode imputation, StandardScaler, OneHotEncoder)
• Web App: Interactive Streamlit UI with confidence gauges & dynamic EDA
• GitHub: <a href="https://github.com/24ucs159-gif/airline-ml-project" target="_blank" style="color: var(--cyan);">https://github.com/24ucs159-gif/airline-ml-project</a>
    `,
    contact: () => `
[DIRECT COMMUNICATION CHANNELS]
Email: <a href="mailto:maha13022007@gmail.com" style="color: var(--cyan);">maha13022007@gmail.com</a>
Phone: <a href="tel:+919159127654" style="color: var(--cyan);">+91 9159127654</a>
Location: Kallakurichi, Tamil Nadu, India
    `,
    hire: () => {
      setTimeout(() => {
        window.location.href = 'mailto:maha13022007@gmail.com?subject=Job%20/%20Internship%20Offer%20for%20R.%20Mahalakshmy';
      }, 800);
      return `<span style="color: var(--emerald);">[INITIATING RECRUITMENT TRANSMISSION] Opening email client to contact R. Mahalakshmy...</span>`;
    },
    clear: () => {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return null;
    },
    matrix: () => `
<span style="color: var(--emerald);">
01010010 00100000 01001101 01000001 01001000 01000001 01001100 01000001
01001011 01010011 01001000 01001101 01011001 // SYSTEM MATRIX VERIFIED
[NEURAL NETWORKS OPERATIONAL] • [OPTIMUS PROTOCOLS ONLINE]
</span>
    `,
    date: () => {
      const now = new Date();
      return `Current System Time (IST): ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
    }
  };

  function executeTerminalCommand(cmdText) {
    const trimmed = cmdText.trim().toLowerCase();
    if (!trimmed) return;

    commandHistory.push(cmdText);
    historyIndex = commandHistory.length;

    // Echo command
    const echoLine = document.createElement('div');
    echoLine.className = 'terminal-line cmd-echo';
    echoLine.innerHTML = `<span style="color: var(--cyan);">guest@mahalakshmy:~$</span> ${escapeHTML(cmdText)}`;
    terminalOutput.appendChild(echoLine);

    // Evaluate
    if (terminalCommands[trimmed]) {
      const output = terminalCommands[trimmed]();
      if (output) {
        const respLine = document.createElement('div');
        respLine.className = 'terminal-line';
        respLine.innerHTML = output;
        terminalOutput.appendChild(respLine);
      }
    } else {
      const errorLine = document.createElement('div');
      errorLine.className = 'terminal-line error-line';
      errorLine.textContent = `zsh: command not found: ${cmdText}. Type 'help' for available commands.`;
      terminalOutput.appendChild(errorLine);
    }

    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    if (terminalInput) terminalInput.value = '';
    playSynthTone(750, 'sine', 0.05, 0.05);
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeTerminalCommand(terminalInput.value);
      } else if (e.key === 'ArrowUp') {
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
      }
    });
  }

  if (terminalExecBtn && terminalInput) {
    terminalExecBtn.addEventListener('click', () => {
      executeTerminalCommand(terminalInput.value);
    });
  }

  // =========================================================================
  // 9. Contact Form Handling
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitFormBtn = document.getElementById('submit-form-btn');
  const submitText = document.getElementById('submit-text');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !subject || !message) {
        if (formStatus) {
          formStatus.className = 'form-status-msg error';
          formStatus.textContent = 'Please fill out all fields before transmitting.';
        }
        return;
      }

      // Simulate sending
      if (submitText) submitText.textContent = 'Encrypting & Transmitting...';
      if (submitFormBtn) submitFormBtn.disabled = true;

      setTimeout(() => {
        if (submitText) submitText.textContent = 'Send Transmission';
        if (submitFormBtn) submitFormBtn.disabled = false;
        if (formStatus) {
          formStatus.className = 'form-status-msg success';
          formStatus.textContent = 'Message transmitted successfully! Opening your mail client as fallback.';
        }

        contactForm.reset();
        showToast('Message Transmitted to R. Mahalakshmy', 'paper-plane');
        playSuccessSound();

        // Direct mailto fallback
        window.location.href = `mailto:maha13022007@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
      }, 1200);
    });
  }

  // =========================================================================
  // 10. Copy Helpers (Email & Phone)
  // =========================================================================
  window.copyContactEmail = function () {
    const email = 'maha13022007@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Email address copied to clipboard!', 'check');
      const copyBtnText = document.getElementById('copy-btn-text');
      if (copyBtnText) {
        const orig = copyBtnText.textContent;
        copyBtnText.textContent = 'Copied!';
        setTimeout(() => (copyBtnText.textContent = orig), 2000);
      }
      playSuccessSound();
    }).catch(() => {
      window.location.href = `mailto:${email}`;
    });
  };

  window.copyContactPhone = function () {
    const phone = '+91 9159127654';
    navigator.clipboard.writeText(phone).then(() => {
      showToast('Phone number copied to clipboard!', 'phone');
      playSuccessSound();
    }).catch(() => {
      window.location.href = `tel:+919159127654`;
    });
  };

  // Toast Notification System
  function showToast(message, icon = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // =========================================================================
  // 11. Live Indian Standard Time (IST) Clock in Footer
  // =========================================================================
  const clockElement = document.getElementById('live-ist-clock');
  function updateISTClock() {
    if (!clockElement) return;
    const now = new Date();
    const istTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    clockElement.textContent = istTimeStr;
  }
  setInterval(updateISTClock, 1000);
  updateISTClock();

  // =========================================================================
  // 12. Mobile Menu Navigation
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Navbar active item indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-item');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
});
