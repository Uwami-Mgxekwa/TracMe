 // Sample student data
const studentsData = [
    {
        id: "ST001",
        name: "Emily Johnson",
        class: "10A",
        overallScore: 92,
        subjects: {
            "Mathematics": { score: 95, grade: "A" },
            "Physics": { score: 89, grade: "B" },
            "Chemistry": { score: 94, grade: "A" },
            "English": { score: 88, grade: "B" },
            "Biology": { score: 92, grade: "A" },
            "History": { score: 90, grade: "A" }
        }
    },
    {
        id: "ST002",
        name: "Michael Chen",
        class: "10A",
        overallScore: 87,
        subjects: {
            "Mathematics": { score: 91, grade: "A" },
            "Physics": { score: 85, grade: "B" },
            "Chemistry": { score: 88, grade: "B" },
            "English": { score: 84, grade: "B" },
            "Biology": { score: 89, grade: "B" },
            "History": { score: 86, grade: "B" }
        }
    },
    {
        id: "ST003",
        name: "Sarah Williams",
        class: "10B",
        overallScore: 78,
        subjects: {
            "Mathematics": { score: 82, grade: "B" },
            "Physics": { score: 76, grade: "C" },
            "Chemistry": { score: 80, grade: "B" },
            "English": { score: 75, grade: "C" },
            "Biology": { score: 79, grade: "C" },
            "History": { score: 77, grade: "C" }
        }
    },
    {
        id: "ST004",
        name: "David Rodriguez",
        class: "11A",
        overallScore: 85,
        subjects: {
            "Mathematics": { score: 88, grade: "B" },
            "Physics": { score: 83, grade: "B" },
            "Chemistry": { score: 87, grade: "B" },
            "English": { score: 82, grade: "B" },
            "Biology": { score: 85, grade: "B" },
            "History": { score: 86, grade: "B" }
        }
    },
    {
        id: "ST005",
        name: "Jessica Davis",
        class: "11A",
        overallScore: 95,
        subjects: {
            "Mathematics": { score: 97, grade: "A" },
            "Physics": { score: 94, grade: "A" },
            "Chemistry": { score: 96, grade: "A" },
            "English": { score: 93, grade: "A" },
            "Biology": { score: 95, grade: "A" },
            "History": { score: 95, grade: "A" }
        }
    },
    {
        id: "ST006",
        name: "Ryan Thompson",
        class: "10B",
        overallScore: 72,
        subjects: {
            "Mathematics": { score: 75, grade: "C" },
            "Physics": { score: 70, grade: "C" },
            "Chemistry": { score: 74, grade: "C" },
            "English": { score: 68, grade: "D" },
            "Biology": { score: 73, grade: "C" },
            "History": { score: 72, grade: "C" }
        }
    },
    {
        id: "ST007",
        name: "Amanda Wilson",
        class: "11B",
        overallScore: 89,
        subjects: {
            "Mathematics": { score: 92, grade: "A" },
            "Physics": { score: 87, grade: "B" },
            "Chemistry": { score: 90, grade: "A" },
            "English": { score: 86, grade: "B" },
            "Biology": { score: 88, grade: "B" },
            "History": { score: 91, grade: "A" }
        }
    },
    {
        id: "ST008",
        name: "Kevin Martinez",
        class: "11B",
        overallScore: 81,
        subjects: {
            "Mathematics": { score: 84, grade: "B" },
            "Physics": { score: 79, grade: "C" },
            "Chemistry": { score: 83, grade: "B" },
            "English": { score: 78, grade: "C" },
            "Biology": { score: 80, grade: "B" },
            "History": { score: 82, grade: "B" }
        }
    }
];

// Hamburger menu functionality
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleSidebar() {
    hamburgerMenu.classList.toggle('active');
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

hamburgerMenu.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);

// Close sidebar when clicking on nav items on mobile
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            toggleSidebar();
        }
    });
});

// Close sidebar on window resize if it's open
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        hamburgerMenu.classList.remove('active');
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
});

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
}

function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
}

function getGradeClass(grade) {
    return `grade-${grade.toLowerCase()}`;
}

function createStudentCard(student) {
    const subjectsHtml = Object.entries(student.subjects).slice(0, 6).map(([subject, data]) => `
        <div class="subject-item">
            <span class="subject-name">${subject}</span>
            <span class="subject-grade ${getGradeClass(data.grade)}">${data.grade}</span>
        </div>
    `).join('');

    return `
        <div class="student-card" data-student-id="${student.id}" data-class="${student.class}">
            <div class="student-header">
                <div class="student-avatar">${getInitials(student.name)}</div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <div class="student-id">ID: ${student.id} • Class: ${student.class}</div>
                </div>
            </div>
            
            <div class="overall-score">
                <div class="score-circle ${getScoreClass(student.overallScore)}">${student.overallScore}%</div>
                <div class="score-label">Overall Score</div>
            </div>
            
            <div class="subjects-summary">
                ${subjectsHtml}
            </div>
            
            <div class="student-actions">
                <button class="action-btn btn-primary" onclick="viewDetails('${student.id}')">View Details</button>
                <button class="action-btn btn-secondary" onclick="editStudent('${student.id}')">Edit</button>
            </div>
        </div>
    `;
}

function renderStudents(students) {
    const grid = document.getElementById('studentsGrid');
    const noResults = document.getElementById('noResults');
    
    if (students.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = students.map(createStudentCard).join('');
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const gradeFilter = document.getElementById('gradeFilter').value;
    const classFilter = document.getElementById('classFilter').value;
    
    const filtered = studentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            student.id.toLowerCase().includes(searchTerm);
        
        const matchesGrade = !gradeFilter || 
                            Object.values(student.subjects).some(subject => subject.grade === gradeFilter);
        
        const matchesClass = !classFilter || student.class === classFilter;
        
        return matchesSearch && matchesGrade && matchesClass;
    });
    
    renderStudents(filtered);
}

function viewDetails(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    alert(`Viewing details for ${student.name}\nOverall Score: ${student.overallScore}%\nClass: ${student.class}`);
}

function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    alert(`Edit mode for ${student.name}\n(This would open an edit form in a real application)`);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterStudents);
document.getElementById('gradeFilter').addEventListener('change', filterStudents);
document.getElementById('classFilter').addEventListener('change', filterStudents);

// Initial render
renderStudents(studentsData);

// Add click animation to cards
document.addEventListener('click', function(e) {
    if (e.target.closest('.student-card') && !e.target.closest('.action-btn')) {
        const card = e.target.closest('.student-card');
        const studentId = card.dataset.studentId;
        viewDetails(studentId);
    }
});