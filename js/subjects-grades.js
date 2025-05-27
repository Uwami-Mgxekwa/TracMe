// Subjects & Grades Management System
class SubjectsGradesManager {
    constructor() {
        this.subjects = [];
        this.currentEditingId = null;
        this.csvData = [];
        
        this.initializeEventListeners();
        this.loadData();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Add Subject Button
        document.getElementById('addSubjectBtn').addEventListener('click', () => {
            this.openAddSubjectModal();
        });

        // Bulk Import Button
        document.getElementById('bulkImportBtn').addEventListener('click', () => {
            this.openImportModal();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterSubjects();
        });

        // Filter controls
        document.getElementById('gradeFilter').addEventListener('change', () => {
            this.filterSubjects();
        });

        document.getElementById('sortBy').addEventListener('change', () => {
            this.filterSubjects();
        });

        // Modal event listeners
        this.initializeModalEvents();

        // File upload events
        this.initializeFileUploadEvents();

        // Handle window resize for responsive layout
        window.addEventListener('resize', () => {
            this.handleResponsiveLayout();
        });

        // Initial responsive layout setup
        this.handleResponsiveLayout();
    }

    // Handle responsive layout changes
    handleResponsiveLayout() {
        // Check if we need mobile layout
        const isMobile = window.innerWidth <= 768;
        
        // Ensure mobile cards container exists
        this.ensureMobileContainer();
        
        // Re-render subjects with appropriate layout
        this.renderSubjects();
    }

    // Ensure mobile cards container exists
    ensureMobileContainer() {
        let mobileContainer = document.querySelector('.mobile-subjects-cards');
        if (!mobileContainer) {
            mobileContainer = document.createElement('div');
            mobileContainer.className = 'mobile-subjects-cards';
            
            // Insert after the subjects table container
            const tableContainer = document.querySelector('.subjects-table-container');
            if (tableContainer && tableContainer.parentNode) {
                tableContainer.parentNode.insertBefore(mobileContainer, tableContainer.nextSibling);
            }
        }
    }

    // Initialize modal event listeners
    initializeModalEvents() {
        // Subject Modal
        const subjectModal = document.getElementById('subjectModal');
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const subjectForm = document.getElementById('subjectForm');

        modalClose.addEventListener('click', () => this.closeModal('subjectModal'));
        cancelBtn.addEventListener('click', () => this.closeModal('subjectModal'));
        subjectForm.addEventListener('submit', (e) => this.handleSubjectSubmit(e));

        // Delete Modal
        const deleteModal = document.getElementById('deleteModal');
        const deleteModalClose = document.getElementById('deleteModalClose');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        deleteModalClose.addEventListener('click', () => this.closeModal('deleteModal'));
        cancelDeleteBtn.addEventListener('click', () => this.closeModal('deleteModal'));
        confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());

        // Import Modal
        const importModal = document.getElementById('importModal');
        const importModalClose = document.getElementById('importModalClose');
        const cancelImportBtn = document.getElementById('cancelImportBtn');
        const confirmImportBtn = document.getElementById('confirmImportBtn');

        importModalClose.addEventListener('click', () => this.closeModal('importModal'));
        cancelImportBtn.addEventListener('click', () => this.closeModal('importModal'));
        confirmImportBtn.addEventListener('click', () => this.confirmImport());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    // Initialize file upload events
    initializeFileUploadEvents() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const csvFileInput = document.getElementById('csvFileInput');
        const browseFileBtn = document.getElementById('browseFileBtn');

        // Browse file button
        browseFileBtn.addEventListener('click', () => {
            csvFileInput.click();
        });

        // File input change
        csvFileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop events
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    // Load data from data.json file
    async loadData() {
        try {
            // Try to load from data.json first
            await this.loadFromJSON();
        } catch (error) {
            console.log('Failed to load from data.json, trying localStorage...');
            try {
                // Try to load from localStorage as fallback
                const savedData = localStorage.getItem('tracme_subjects');
                if (savedData) {
                    this.subjects = JSON.parse(savedData).map(subject => ({
                        ...subject,
                        dateAdded: new Date(subject.dateAdded),
                        lastUpdated: new Date(subject.lastUpdated)
                    }));
                } else {
                    throw new Error('No localStorage data found');
                }
            } catch (storageError) {
                console.log('Could not load saved data, using default subjects');
                // Fallback to sample data
                this.subjects = [
                    {
                        id: 1,
                        name: 'Mathematics',
                        grade: 92,
                        description: 'Advanced Calculus and Statistics',
                        dateAdded: new Date('2024-01-15'),
                        lastUpdated: new Date('2024-02-01')
                    },
                    {
                        id: 2,
                        name: 'Physics',
                        grade: 88,
                        description: 'Classical Mechanics and Thermodynamics',
                        dateAdded: new Date('2024-01-20'),
                        lastUpdated: new Date('2024-01-25')
                    },
                    {
                        id: 3,
                        name: 'Computer Science',
                        grade: 95,
                        description: 'Data Structures and Algorithms',
                        dateAdded: new Date('2024-01-25'),
                        lastUpdated: new Date('2024-02-05')
                    }
                ];
            }
        }
        
        this.updateUI();
    }

    // Load data from JSON file
    async loadFromJSON() {
        // Updated paths for js/data folder structure
        const possiblePaths = [
            '../data/data.json',     // Most likely: js folder to data folder (sibling directories)
            './data/data.json',      // If data folder is inside js folder
            '../../data/data.json',  // If js is nested deeper
            '../../../data/data.json', // If js is nested even deeper
            './data.json',           // If data.json is in the js folder
            '../data.json'           // If data.json is in parent directory
        ];

        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load from: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Loaded JSON data:', data);
                    
                    // Handle the nested structure from your data.json
                    if (data.student && data.student.subjects && Array.isArray(data.student.subjects)) {
                        this.subjects = data.student.subjects.map((subject, index) => ({
                            id: Date.now() + index, // Generate unique IDs
                            name: subject.name || '',
                            grade: parseInt(subject.grade) || 0,
                            description: subject.teacher ? `Teacher: ${subject.teacher}` : '',
                            credits: subject.credits || null,
                            teacher: subject.teacher || '',
                            dateAdded: new Date(),
                            lastUpdated: new Date()
                        }));
                        
                        // Store student info if needed
                        this.studentInfo = {
                            name: data.student.name,
                            id: data.student.id
                        };
                        
                        console.log(`Successfully loaded ${this.subjects.length} subjects from ${path}`);
                        return; // Success, exit the function
                    }
                    // Handle direct subjects array format (your original format)
                    else if (data.subjects && Array.isArray(data.subjects)) {
                        this.subjects = data.subjects.map(subject => ({
                            id: subject.id || Date.now() + Math.random(),
                            name: subject.name || subject.subjectName || '',
                            grade: parseInt(subject.grade) || 0,
                            description: subject.description || '',
                            dateAdded: subject.dateAdded ? new Date(subject.dateAdded) : new Date(),
                            lastUpdated: subject.lastUpdated ? new Date(subject.lastUpdated) : new Date()
                        }));
                        console.log(`Data loaded successfully from ${path}`);
                        return; // Success, exit the function
                    } 
                    // Handle direct array format
                    else if (Array.isArray(data)) {
                        this.subjects = data.map(subject => ({
                            id: subject.id || Date.now() + Math.random(),
                            name: subject.name || subject.subjectName || '',
                            grade: parseInt(subject.grade) || 0,
                            description: subject.description || '',
                            dateAdded: subject.dateAdded ? new Date(subject.dateAdded) : new Date(),
                            lastUpdated: subject.lastUpdated ? new Date(subject.lastUpdated) : new Date()
                        }));
                        console.log(`Data loaded successfully from ${path}`);
                        return; // Success, exit the function
                    } else {
                        console.log(`JSON structure not recognized in ${path}`);
                        continue;
                    }
                } else {
                    console.log(`HTTP ${response.status} for ${path}`);
                }
            } catch (error) {
                console.log(`Failed to load from ${path}:`, error.message);
                continue; // Try next path
            }
        }
        
        // If all paths failed, throw error
        throw new Error('Could not load data.json from any expected location');
    }

    // Save data to both localStorage and potentially update JSON file
    async saveData() {
        try {
            // Save to localStorage for immediate persistence
            localStorage.setItem('tracme_subjects', JSON.stringify(this.subjects));
            
            // In a real application, you would also send the data to a server
            // to update the JSON file. For now, we'll just use localStorage
            console.log('Data saved successfully to localStorage');
            
            // If you want to save back to JSON file, you would need a server endpoint
            // Example:
            // await fetch('/api/save-subjects', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ subjects: this.subjects })
            // });
            
        } catch (error) {
            console.error('Could not save data:', error);
            this.showNotification('Could not save data', 'warning');
        }
    }

    // Update the entire UI
    updateUI() {
        this.updateQuickStats();
        this.renderSubjects();
    }

    // Update quick statistics
    updateQuickStats() {
        const totalSubjects = this.subjects.length;
        const grades = this.subjects.map(s => s.grade);
        const averageGrade = totalSubjects > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / totalSubjects) : 0;
        const topGrade = totalSubjects > 0 ? Math.max(...grades) : 0;
        const lowGrade = totalSubjects > 0 ? Math.min(...grades) : 0;

        document.getElementById('totalSubjectsCount').textContent = totalSubjects;
        document.getElementById('averageGrade').textContent = `${averageGrade}%`;
        document.getElementById('topGrade').textContent = `${topGrade}%`;
        document.getElementById('lowGrade').textContent = `${lowGrade}%`;
    }

    // Render subjects for both desktop and mobile
    renderSubjects() {
        this.renderSubjectsTable();
        this.renderMobileCards();
    }

    // Render subjects table (desktop)
    renderSubjectsTable() {
        const tableBody = document.getElementById('subjectsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (this.subjects.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        tableBody.innerHTML = this.subjects.map(subject => `
            <tr>
                <td><strong>${this.escapeHtml(subject.name)}</strong></td>
                <td>${subject.grade}%</td>
                <td>${this.getLetterGrade(subject.grade)}</td>
                <td>${this.getGradeStatus(subject.grade)}</td>
                <td>${this.formatDate(subject.lastUpdated)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="subjectsManager.editSubject(${subject.id})">
                            Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="subjectsManager.deleteSubject(${subject.id})">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Render mobile cards
    renderMobileCards() {
        let mobileContainer = document.querySelector('.mobile-subjects-cards');
        
        if (!mobileContainer) {
            this.ensureMobileContainer();
            mobileContainer = document.querySelector('.mobile-subjects-cards');
        }

        if (this.subjects.length === 0) {
            mobileContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>No subjects found</h3>
                    <p>Add your first subject to start tracking your grades!</p>
                    <button class="btn btn-primary" onclick="subjectsManager.openAddSubjectModal()">Add Subject</button>
                </div>
            `;
            return;
        }

        mobileContainer.innerHTML = this.subjects.map(subject => `
            <div class="subject-card">
                <div class="subject-card-header">
                    <h3 class="subject-card-title">${this.escapeHtml(subject.name)}</h3>
                    <div class="subject-card-grade">${subject.grade}%</div>
                </div>
                
                <div class="subject-card-details">
                    <div class="subject-card-detail">
                        <div class="subject-card-detail-label">Letter Grade</div>
                        <div class="subject-card-detail-value">${this.getLetterGrade(subject.grade)}</div>
                    </div>
                    <div class="subject-card-detail">
                        <div class="subject-card-detail-label">Status</div>
                        <div class="subject-card-detail-value">${this.getGradeStatusText(subject.grade)}</div>
                    </div>
                    <div class="subject-card-detail">
                        <div class="subject-card-detail-label">Last Updated</div>
                        <div class="subject-card-detail-value">${this.formatDate(subject.lastUpdated)}</div>
                    </div>
                    ${subject.description ? `
                        <div class="subject-card-detail">
                            <div class="subject-card-detail-label">Description</div>
                            <div class="subject-card-detail-value">${this.escapeHtml(subject.description)}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="subject-card-actions">
                    <button class="action-btn edit-btn" onclick="subjectsManager.editSubject(${subject.id})">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="subjectsManager.deleteSubject(${subject.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Filter and sort subjects
    filterSubjects() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const gradeFilter = document.getElementById('gradeFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filteredSubjects = [...this.subjects];

        // Apply search filter
        if (searchTerm) {
            filteredSubjects = filteredSubjects.filter(subject =>
                subject.name.toLowerCase().includes(searchTerm) ||
                subject.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply grade filter
        if (gradeFilter !== 'all') {
            filteredSubjects = filteredSubjects.filter(subject => {
                const grade = subject.grade;
                switch (gradeFilter) {
                    case 'excellent': return grade >= 90;
                    case 'good': return grade >= 80 && grade < 90;
                    case 'average': return grade >= 70 && grade < 80;
                    case 'poor': return grade < 70;
                    default: return true;
                }
            });
        }

        // Apply sorting
        filteredSubjects.sort((a, b) => {
            switch (sortBy) {
                case 'name': 
                    return a.name.localeCompare(b.name);
                case 'grade-desc': 
                    return b.grade - a.grade;
                case 'grade-asc': 
                    return a.grade - b.grade;
                case 'recent': 
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                default: 
                    return 0;
            }
        });

        // Temporarily replace subjects for rendering
        const originalSubjects = this.subjects;
        this.subjects = filteredSubjects;
        this.renderSubjects();
        this.subjects = originalSubjects;
    }

    // Open add subject modal
    openAddSubjectModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Subject';
        document.getElementById('saveBtn').textContent = 'Save Subject';
        this.clearForm();
        this.openModal('subjectModal');
    }

    // Edit subject
    editSubject(id) {
        const subject = this.subjects.find(s => s.id === id);
        if (!subject) return;

        this.currentEditingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Subject';
        document.getElementById('saveBtn').textContent = 'Update Subject';
        
        // Populate form
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectGrade').value = subject.grade;
        document.getElementById('subjectDescription').value = subject.description;
        
        this.openModal('subjectModal');
    }

    // Delete subject
    deleteSubject(id) {
        const subject = this.subjects.find(s => s.id === id);
        if (!subject) return;

        document.getElementById('deleteSubjectName').textContent = subject.name;
        this.currentEditingId = id;
        this.openModal('deleteModal');
    }

    // Confirm delete
    confirmDelete() {
        if (this.currentEditingId) {
            this.subjects = this.subjects.filter(s => s.id !== this.currentEditingId);
            this.saveData();
            this.updateUI();
            this.closeModal('deleteModal');
            this.showNotification('Subject deleted successfully', 'success');
        }
    }

    // Handle subject form submission
    handleSubjectSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const subjectData = {
            name: formData.get('subjectName').trim(),
            grade: parseInt(formData.get('subjectGrade')),
            description: formData.get('subjectDescription').trim()
        };

        // Validation
        if (!subjectData.name || subjectData.grade < 0 || subjectData.grade > 100) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        if (this.currentEditingId) {
            // Update existing subject
            const subjectIndex = this.subjects.findIndex(s => s.id === this.currentEditingId);
            if (subjectIndex !== -1) {
                this.subjects[subjectIndex] = {
                    ...this.subjects[subjectIndex],
                    ...subjectData,
                    lastUpdated: new Date()
                };
                this.showNotification('Subject updated successfully', 'success');
            }
        } else {
            // Add new subject
            const newSubject = {
                id: Date.now(), // Simple ID generation
                ...subjectData,
                dateAdded: new Date(),
                lastUpdated: new Date()
            };
            this.subjects.push(newSubject);
            this.showNotification('Subject added successfully', 'success');
        }

        this.saveData();
        this.updateUI();
        this.closeModal('subjectModal');
    }

    // Open import modal
    openImportModal() {
        this.csvData = [];
        document.getElementById('importPreview').style.display = 'none';
        document.getElementById('confirmImportBtn').disabled = true;
        this.openModal('importModal');
    }

    // Handle file upload
    handleFileUpload(file) {
        if (!file || !file.name.endsWith('.csv')) {
            this.showNotification('Please select a valid CSV file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
            } catch (error) {
                this.showNotification('Error reading CSV file', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Parse CSV data
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            this.showNotification('CSV file must have a header row and at least one data row', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const gradeIndex = headers.findIndex(h => h.includes('grade'));

        if (nameIndex === -1 || gradeIndex === -1) {
            this.showNotification('CSV must have "Name" and "Grade" columns', 'error');
            return;
        }

        this.csvData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const name = values[nameIndex];
            const grade = parseInt(values[gradeIndex]);

            if (name && !isNaN(grade) && grade >= 0 && grade <= 100) {
                this.csvData.push({ name, grade });
            }
        }

        if (this.csvData.length === 0) {
            this.showNotification('No valid data found in CSV', 'error');
            return;
        }

        this.showImportPreview();
    }

    // Show import preview
    showImportPreview() {
        const previewBody = document.getElementById('previewTableBody');
        previewBody.innerHTML = this.csvData.map(item => `
            <tr>
                <td>${this.escapeHtml(item.name)}</td>
                <td>${item.grade}%</td>
            </tr>
        `).join('');

        document.getElementById('importPreview').style.display = 'block';
        document.getElementById('confirmImportBtn').disabled = false;
    }

    // Confirm import
    confirmImport() {
        const importedCount = this.csvData.length;
        
        this.csvData.forEach(item => {
            const newSubject = {
                id: Date.now() + Math.random(), // Ensure unique ID
                name: item.name,
                grade: item.grade,
                description: '',
                dateAdded: new Date(),
                lastUpdated: new Date()
            };
            this.subjects.push(newSubject);
        });

        this.saveData();
        this.updateUI();
        this.closeModal('importModal');
        this.showNotification(`Successfully imported ${importedCount} subjects`, 'success');
    }

    // Utility methods
    getLetterGrade(grade) {
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

    getGradeStatus(grade) {
        let statusClass, statusText;
        if (grade >= 90) {
            statusClass = 'status-excellent';
            statusText = '🌟 Excellent';
        } else if (grade >= 80) {
            statusClass = 'status-good';
            statusText = '👍 Good';
        } else if (grade >= 70) {
            statusClass = 'status-average';
            statusText = '⚡ Average';
        } else {
            statusClass = 'status-poor';
            statusText = '⚠️ Needs Improvement';
        }
        
        return `<span class="status-indicator ${statusClass}">${statusText}</span>`;
    }

    // Get grade status text without HTML (for mobile cards)
    getGradeStatusText(grade) {
        if (grade >= 90) return '🌟 Excellent';
        if (grade >= 80) return '👍 Good';
        if (grade >= 70) return '⚡ Average';
        return '⚠️ Needs Improvement';
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearForm() {
        document.getElementById('subjectForm').reset();
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentEditingId = null;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                break;
            default:
                notification.style.background = '#3b82f6';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the subjects manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.subjectsManager = new SubjectsGradesManager();
});

// Global functions for HTML onclick handlers
window.openAddSubjectModal = () => {
    window.subjectsManager.openAddSubjectModal();
};