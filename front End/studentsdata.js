/* ========================================================
   studentsdata.js - JavaScript for studentsdata.html
   ======================================================== */

let currentUser = null;
let students = [];
let attendance = [];
let selectedDepartment = "";
let filteredStudents = [];

// Department data with icons
const departments = {
    "Computer Science": { icon: "💻", name: "Computer Science" },
    "Information Technology": { icon: "🌐", name: "Information Technology" },
    "Tamil": { icon: "📚", name: "Tamil" },
    "English": { icon: "📖", name: "English" }
};

/**
 * Check authentication and load user info
 * Allows both Admin and Staff users
 */
function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Allow admin and staff users
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "staff")) {
        alert("Access denied. Admin or Staff privileges required.");
        window.location.href = "index.html";
        return false;
    }

    return true;
}

/**
 * Load and display user info
 */
function loadUserInfo() {
    if (!checkAuth()) return;

    const userInfoElem = document.getElementById("userInfo");
    if (userInfoElem) {
        const username = currentUser.name || currentUser.username || "user";
        const role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        userInfoElem.innerText = `${role}: ${username}`;
    }
    
    // Set page title based on user role
    const pageTitle = document.getElementById("pageTitle");
    const backToAdminBtn = document.querySelector('button[onclick="goBackToAdmin()"]');
    const departmentSelectionTitle = document.querySelector('#departmentSelection h4');
    
    if (currentUser && currentUser.role === "staff") {
        if (pageTitle) pageTitle.textContent = "My Students Data";
        if (backToAdminBtn) backToAdminBtn.textContent = "Back to Dashboard";
        if (departmentSelectionTitle) departmentSelectionTitle.textContent = "Select Department to View Your Students:";
    } else {
        if (pageTitle) pageTitle.textContent = "Students Data Management";
        if (backToAdminBtn) backToAdminBtn.textContent = "Back to Admin Panel";
        if (departmentSelectionTitle) departmentSelectionTitle.textContent = "Select Department to View Students:";
    }
}

/**
 * Load data from localStorage
 */
function loadData() {
    students = JSON.parse(localStorage.getItem("students")) || [];
    attendance = JSON.parse(localStorage.getItem("attendance")) || [];
}

/**
 * Save data to localStorage
 */
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

/**
 * Generate department dropdown options
 */
function generateDepartmentCards() {
    const departmentDropdown = document.getElementById("departmentDropdown");
    departmentDropdown.innerHTML = "";

    Object.keys(departments).forEach(deptKey => {
        const dept = departments[deptKey];
        
        // Count students in this department
        const deptStudents = students.filter(s => 
            s.department && s.department.trim().toLowerCase() === deptKey.toLowerCase()
        );

        const dropdownItem = document.createElement("div");
        dropdownItem.className = "dropdown-item";
        dropdownItem.onclick = () => selectDepartmentFromDropdown(deptKey);
        
        dropdownItem.innerHTML = `
            <div class="dropdown-dept-info">
                <span class="dropdown-icon">${dept.icon}</span>
                <span class="dropdown-dept-name">${dept.name}</span>
            </div>
            <div class="dropdown-student-count">${deptStudents.length} Students</div>
        `;

        departmentDropdown.appendChild(dropdownItem);
    });
}

/**
 * Toggle dropdown open/close
 */
function toggleDropdown() {
    const dropdown = document.getElementById("departmentDropdown");
    const arrow = document.querySelector(".dropdown-arrow");
    
    dropdown.classList.toggle("open");
    arrow.classList.toggle("rotated");
}

/**
 * Close dropdown when clicking outside
 */
document.addEventListener('click', function(event) {
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (!dropdownContainer.contains(event.target)) {
        const dropdown = document.getElementById("departmentDropdown");
        const arrow = document.querySelector(".dropdown-arrow");
        
        dropdown.classList.remove("open");
        arrow.classList.remove("rotated");
    }
});

/**
 * Select department from dropdown
 */
function selectDepartmentFromDropdown(department) {
    // Close dropdown
    const dropdown = document.getElementById("departmentDropdown");
    const arrow = document.querySelector(".dropdown-arrow");
    dropdown.classList.remove("open");
    arrow.classList.remove("rotated");
    
    // Update selected text
    const selectedText = document.getElementById("selectedDeptText");
    selectedText.textContent = departments[department].icon + " " + departments[department].name;
    
    // Proceed with selection
    selectDepartment(department);
}

/**
 * Select a department and show students
 */
function selectDepartment(department) {
    selectedDepartment = department;
    
    // Hide department selection and show students view
    document.getElementById("departmentSelection").style.display = "none";
    document.getElementById("studentsDataView").style.display = "block";
    
    // Update selected department info
    document.getElementById("selectedDeptInfo").innerHTML = `
        ${departments[department].icon} ${departments[department].name} Department
    `;
    
    // Reset year filter
    document.getElementById("dataYear").value = "";
    
    // Load students for this department
    loadStudentsForDepartment();
}

/**
 * Load students for selected department
 */
function loadStudentsForDepartment() {
    const yearFilter = document.getElementById("dataYear").value.trim();
    
    // Filter students by department
    filteredStudents = students.filter(s =>
        s.department && s.department.trim().toLowerCase() === selectedDepartment.toLowerCase()
    );

    // Apply year filter if selected
    if (yearFilter) {
        filteredStudents = filteredStudents.filter(s =>
            String(s.year).trim() === String(yearFilter)
        );
    }

    displayStudentsTable();
}

/**
 * Apply year filter
 */
function applyYearFilter() {
    loadStudentsForDepartment();
}

/**
 * Display students in table
 */
function displayStudentsTable() {
    const tbody = document.getElementById("studentsBody");
    const statsDiv = document.getElementById("studentsStats");
    const messageArea = document.getElementById("messageArea");
    const yearFilter = document.getElementById("dataYear").value.trim();

    tbody.innerHTML = "";
    messageArea.innerHTML = "";

    if (filteredStudents.length === 0) {
        const yearText = yearFilter ? ` - Year ${yearFilter}` : "";
        statsDiv.innerHTML = `<span style="color: #ffeb3b;">⚠️ No students found for ${selectedDepartment}${yearText}</span>`;
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 25px; color: #ffeb3b;">No student records found. Please upload or register students first.</td></tr>`;
        return;
    }

    // Display statistics
    const yearText = yearFilter ? ` - Year ${yearFilter}` : "";
    statsDiv.innerHTML = `Showing Students: <strong>${selectedDepartment}${yearText}</strong> (Total: <strong>${filteredStudents.length}</strong> students)`;

    // Display students in table
    filteredStudents.forEach((student, index) => {
        const displaySerial = student.serial || (index + 1);
        const studentId = student.studentId || student.id;
        const studentName = student.studentName || student.name;
        
        // Get initials for placeholder
        const initials = getInitials(studentName);
        
        // Photo cell HTML
        let photoHTML = '';
        if (student.photo) {
            photoHTML = `<img src="${student.photo}" alt="${studentName}" class="student-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                        <div class="student-photo-placeholder" style="display:none;">${initials}</div>`;
        } else {
            photoHTML = `<div class="student-photo-placeholder">${initials}</div>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${displaySerial}</td>
                <td style="text-align: center;">${photoHTML}</td>
                <td>${studentId}</td>
                <td>${studentName}</td>
                <td>${student.department}</td>
                <td>Year ${student.year}</td>
                <td style="text-align: center;">
                    <button class="view-details-btn" onclick='viewStudentDetails(${JSON.stringify(student).replace(/'/g, "&#39;")})'>
                        View Details
                    </button>
                </td>
                <td>
                    <button class="red" style="padding: 4px 12px; font-size: 12px;" onclick="deleteSingleStudent('${studentId}', '${studentName}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    messageArea.innerHTML = '<span style="color: #51cf66;">✅ Students data loaded successfully.</span>';
}

/**
 * Get initials from name
 */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * View full student details in modal
 */
function viewStudentDetails(student) {
    const modal = document.getElementById('studentDetailsModal');
    const detailsContainer = document.getElementById('modalStudentDetails');
    
    const studentId = student.studentId || student.id;
    const studentName = student.studentName || student.name;
    const initials = getInitials(studentName);
    
    // Photo HTML for modal
    let photoHTML = '';
    if (student.photo) {
        photoHTML = `<img src="${student.photo}" alt="${studentName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="placeholder-large" style="display:none;">${initials}</div>`;
    } else {
        photoHTML = `<div class="placeholder-large">${initials}</div>`;
    }
    
    // Format date if available
    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    
    detailsContainer.innerHTML = `
        <div class="student-photo-large">
            ${photoHTML}
        </div>
        <div class="student-info-details">
            <div class="detail-row">
                <div class="detail-label">📝 Register Number</div>
                <div class="detail-value">${studentId || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">👤 Student Name</div>
                <div class="detail-value">${studentName || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">🏢 Department</div>
                <div class="detail-value">${student.department || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">📅 Year</div>
                <div class="detail-value">Year ${student.year || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">📧 Email</div>
                <div class="detail-value">${student.email || 'Not provided'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">📱 Phone</div>
                <div class="detail-value">${student.phone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">🎂 Date of Birth</div>
                <div class="detail-value">${formatDate(student.dateOfBirth)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">🏠 Address</div>
                <div class="detail-value">${student.address || 'Not provided'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">👨‍👩‍👦 Parent Name</div>
                <div class="detail-value">${student.parentName || 'Not provided'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">☎️ Parent Phone</div>
                <div class="detail-value">${student.parentPhone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">✅ Status</div>
                <div class="detail-value" style="color: ${student.status === 'active' ? '#51cf66' : '#ff6b6b'};">
                    ${student.status ? student.status.toUpperCase() : 'ACTIVE'}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

/**
 * Close student details modal
 */
function closeStudentModal() {
    const modal = document.getElementById('studentDetailsModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('studentDetailsModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

/**
 * Delete a single student
 */
function deleteSingleStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to delete student:\n\n• Name: ${studentName}\n• ID: ${studentId}\n\nThis will also remove their attendance records.`)) {
        return;
    }

    loadData();

    // Remove student
    const initialStudentCount = students.length;
    students = students.filter(s => 
        String(s.id).trim().toLowerCase() !== String(studentId).trim().toLowerCase()
    );

    // Remove attendance records
    const initialAttendanceCount = attendance.length;
    attendance = attendance.filter(a => 
        String(a.id).trim().toLowerCase() !== String(studentId).trim().toLowerCase()
    );

    saveData();

    const deletedStudents = initialStudentCount - students.length;
    const deletedAttendance = initialAttendanceCount - attendance.length;

    if (deletedStudents > 0) {
        alert(`Student ${studentName} (${studentId}) deleted successfully.\nAttendance records removed: ${deletedAttendance}`);
        // Reload the current view
        loadStudentsForDepartment();
        // Update department cards count
        generateDepartmentCards();
    } else {
        alert("Error: Student not found.");
    }
}

/**
 * Download students data as PDF
 */
function downloadStudentsData() {
    const table = document.getElementById("studentsTable");
    const messageArea = document.getElementById("messageArea");

    if (!selectedDepartment) {
        messageArea.innerHTML = '<span style="color: #ff6b6b;">Please select a department first.</span>';
        return;
    }

    const tbody = document.getElementById("studentsBody");
    if (!tbody || tbody.children.length === 0 || filteredStudents.length === 0) {
        messageArea.innerHTML = '<span style="color: #ff6b6b;">No data available to download.</span>';
        return;
    }

    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            throw new Error('PDF library not loaded. Please refresh the page and try again.');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Create filename
        const deptName = selectedDepartment.replace(/\s+/g, "_");
        const yearFilter = document.getElementById("dataYear").value.trim();
        const yearText = yearFilter ? `Year ${yearFilter}` : "All Years";
        const filename = `Students_Data_${deptName}_${yearText.replace(/\s+/g, '_')}.pdf`;

        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Students Data Report', 14, 15);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Department: ${selectedDepartment}`, 14, 25);
        doc.text(`Year: ${yearText}`, 14, 32);
        doc.text(`Total Students: ${filteredStudents.length}`, 14, 39);

        // Table headers (excluding Photo, Full Details, and Action columns)
        const headers = ['S.No', 'Register No', 'Name', 'Department', 'Year', 'Email', 'Phone'];

        // Get table data
        const tableData = filteredStudents.map((student, index) => [
            index + 1,
            student.studentId || student.id || '',
            student.studentName || student.name || '',
            student.department || '',
            student.year || '',
            student.email || 'N/A',
            student.phone || 'N/A'
        ]);

        // Create table
        doc.autoTable({
            startY: 47,
            head: [headers],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 123, 255],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },   // S.No
                1: { halign: 'center', cellWidth: 25 },   // Register No
                2: { halign: 'left', cellWidth: 40 },     // Name
                3: { halign: 'left', cellWidth: 35 },     // Department
                4: { halign: 'center', cellWidth: 15 },   // Year
                5: { halign: 'left', cellWidth: 35 },     // Email
                6: { halign: 'center', cellWidth: 25 }    // Phone
            }
        });

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.height;
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text(
                `Generated on: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
                14,
                pageHeight - 10
            );
        }

        // Download PDF
        doc.save(filename);
        messageArea.innerHTML = '<span style="color: #51cf66;">✅ Students data downloaded as PDF successfully!</span>';

    } catch (error) {
        console.error("PDF download error:", error);
        messageArea.innerHTML = '<span style="color: #ff6b6b;">❌ Failed to download PDF: ' + error.message + '</span>';
    }
}

/**
 * Go back to department selection
 */
function goBackToDepartments() {
    document.getElementById("studentsDataView").style.display = "none";
    document.getElementById("departmentSelection").style.display = "block";
    selectedDepartment = "";
    
    // Reset dropdown
    document.getElementById("selectedDeptText").textContent = "Choose Department";
    const dropdown = document.getElementById("departmentDropdown");
    const arrow = document.querySelector(".dropdown-arrow");
    dropdown.classList.remove("open");
    arrow.classList.remove("rotated");
    
    // Refresh department options (in case student counts changed)
    generateDepartmentCards();
}

/**
 * Go back to admin panel or home page based on user role
 */
function goBackToAdmin() {
    if (currentUser && currentUser.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "home.html";
    }
}

/**
 * Initialize page when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function() {
    loadUserInfo();
    loadData();
    
    // Set page title based on user role
    const pageTitle = document.getElementById("pageTitle");
    if (currentUser && currentUser.role === "staff") {
        if (pageTitle) pageTitle.textContent = "My Students Data";
    }
    
    generateDepartmentCards();
});

/**
 * Handle logout (inherited from admin functionality)
 */
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        window.location.href = "index.html";
    }
}
