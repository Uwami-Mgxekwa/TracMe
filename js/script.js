// Application State
let studentData = null;
let sidebarOpen = false;

// DOM Elements
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mainContent = document.getElementById('mainContent');
const footer = document.getElementById('footer');
const themeToggle = document.getElementById('themeToggle');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadStudentData();
    handleResponsiveLayout();
});

// Event Listeners
function initializeEventListeners() {
    // Hamburger menu
    hamburger.addEventListener('click', toggleSidebar);
    
    // Sidebar overlay (mobile)
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Window resize
    window.addEventListener('resize', handleResponsiveLayout);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
}

// Sidebar Management
function toggleSidebar() {
    if (window.innerWidth <= 768) {
        // Mobile behavior
        if (sidebar.classList.contains('mobile-show')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    } else {
        // Desktop behavior
        if (sidebar.classList.contains('desktop-hidden')) {
            showDesktopSidebar();
        } else {
            hideDesktopSidebar();
        }
    }
}

function openSidebar() {
    sidebar.classList.add('mobile-show');
    sidebar.classList.remove('mobile-hidden');
    sidebarOverlay.classList.add('active');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    sidebarOpen = true;
}

function closeSidebar() {
    sidebar.classList.remove('mobile-show');
    sidebar.classList.add('mobile-hidden');
    sidebarOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    sidebarOpen = false;
}

function hideDesktopSidebar() {
    sidebar.classList.add('desktop-hidden');
    sidebar.classList.remove('desktop-show');
    mainContent.classList.add('expanded');
    footer.classList.add('expanded');
    hamburger.classList.add('active');
    sidebarOpen = false;
}

function showDesktopSidebar() {
    sidebar.classList.remove('desktop-hidden');
    sidebar.classList.add('desktop-show');
    mainContent.classList.remove('expanded');
    footer.classList.remove('expanded');
    hamburger.classList.remove('active');
    sidebarOpen = true;
}

// Handle responsive layout changes
function handleResponsiveLayout() {
    if (window.innerWidth <= 768) {
        // Mobile layout
        sidebar.classList.remove('desktop-hidden', 'desktop-show');
        if (!sidebar.classList.contains('mobile-show')) {
            sidebar.classList.add('mobile-hidden');
        }
        mainContent.classList.remove('expanded');
        footer.classList.remove('expanded');
    } else {
        // Desktop layout
        sidebar.classList.remove('mobile-hidden', 'mobile-show');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        if (!sidebar.classList.contains('desktop-hidden')) {
            sidebar.classList.add('desktop-show');
            mainContent.classList.remove('expanded');
            footer.classList.remove('expanded');
            hamburger.classList.remove('active');
        }
    }
}

// Keyboard navigation
function handleKeydown(event) {
    if (event.key === 'Escape' && sidebarOpen && window.innerWidth <= 768) {
        closeSidebar();
    }
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
}

// Data Management
function loadStudentData() {
    loadFromJSON()
        .then(data => {
            studentData = data;
            renderDashboard();
        })
        .catch(error => {
            console.error('Error loading data:', error);
            showErrorMessage('Failed to load student data from data/data.json. Using default data.');
            loadDefaultData().then(data => {
                studentData = data;
                renderDashboard();
            });
        });
}

// Load from JSON file
async function loadFromJSON() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Successfully loaded data from data/data.json');
        return data;
    } catch (error) {
        console.error('Failed to load JSON data:', error.message);
        throw new Error(`Failed to load JSON data: ${error.message}`);
    }
}

// Default data fallback
function loadDefaultData() {
    return Promise.resolve({
        student: {
            name: "John Doe",
            subjects: [
                { name: "Mathematics", grade: 85 },
                { name: "Physics", grade: 92 },
                { name: "Chemistry", grade: 78 },
                { name: "English", grade: 65 },
                { name: "History", grade: 82 },
                { name: "Biology", grade: 58 }
            ]
        }
    });
}

// Dashboard Rendering
function renderDashboard() {
    if (!studentData || !studentData.student) {
        showErrorMessage('Invalid student data format');
        return;
    }
    
    const subjects = studentData.student.subjects || [];
    
    // Update overall statistics
    updateOverallStats(subjects);
    
    // Render subject cards
    renderSubjectCards(subjects);
    
    // Animate progress bars
    setTimeout(animateProgressBars, 100);
}

function updateOverallStats(subjects) {
    const totalSubjects = subjects.length;
    const avgScore = totalSubjects > 0 ? 
        Math.round(subjects.reduce((sum, subject) => sum + subject.grade, 0) / totalSubjects) : 0;
    
    const aboveAverage = subjects.filter(s => s.grade >= avgScore).length;
    const needImprovement = subjects.filter(s => s.grade < 70).length;
    
    document.getElementById('avgScore').textContent = `${avgScore}%`;
    document.getElementById('totalSubjects').textContent = totalSubjects;
    document.getElementById('aboveAverage').textContent = aboveAverage;
    document.getElementById('needImprovement').textContent = needImprovement;
}

function renderSubjectCards(subjects) {
    const grid = document.getElementById('subjectsGrid');
    grid.innerHTML = '';
    
    subjects.forEach((subject, index) => {
        const card = createSubjectCard(subject, index);
        grid.appendChild(card);
    });
}

function createSubjectCard(subject, index) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.animationDelay = `${0.1 * (index + 1)}s`;
    
    const gradeClass = getGradeClass(subject.grade);
    const letterGrade = getLetterGrade(subject.grade);
    const progressColor = getProgressColor(subject.grade);
    
    card.innerHTML = `
        <div class="subject-header">
            <div class="subject-name">${subject.name}</div>
            <div class="subject-grade ${gradeClass}">${subject.grade}%</div>
        </div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" 
                     style="width: 0%; background: ${progressColor};" 
                     data-width="${subject.grade}%"></div>
            </div>
            <div class="progress-label">
                <span>Grade: ${letterGrade}</span>
                <span>${subject.grade}/100</span>
            </div>
        </div>
    `;
    
    return card;
}

function getGradeClass(grade) {
    if (grade >= 90) return 'grade-excellent';
    if (grade >= 80) return 'grade-good';
    if (grade >= 70) return 'grade-average';
    return 'grade-poor';
}

function getLetterGrade(grade) {
    if (grade >= 97) return 'A+';
    if (grade >= 93) return 'A';
    if (grade >= 90) return 'A-';
    if (grade >= 87) return 'B+';
    if (grade >= 83) return 'B';
    if (grade >= 80) return 'B-';
    if (grade >= 77) return 'C+';
    if (grade >= 73) return 'C';
    if (grade >= 70) return 'C-';
    if (grade >= 67) return 'D+';
    if (grade >= 65) return 'D';
    return 'F';
}

function getProgressColor(grade) {
    if (grade >= 90) return 'var(--success)';
    if (grade >= 80) return 'var(--secondary)';
    if (grade >= 70) return 'var(--warning)';
    return 'var(--danger)';
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-width');
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 100);
    });
}

// Error handling
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const mainContent = document.getElementById('mainContent');
    const existingError = mainContent.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize theme on load
loadSavedTheme();

// Export functions for potential external use
window.GradeTracker = {
    loadStudentData,
    toggleSidebar,
    toggleTheme,
    renderDashboard
};