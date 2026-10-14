/* ========================================================
   admin.js - JavaScript for admin.html
   ======================================================== */

const BASE_URL = 'http://localhost:5000/api';

/**
 * Check if user is authenticated. Auto-initialise admin session if missing.
 */
function checkAuth() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "admin") {
        currentUser = {
            username: "admin",
            name: "System Administrator",
            role: "admin",
            department: "Administration",
            year: "All"
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("token", "admin-token-authenticated");
    }

    return currentUser;
}

/**
 * Display admin username inside <h2 id="userInfo"></h2>
 */
function loadAdminInfo() {
    const currentUser = checkAuth();
    if (!currentUser) return;

    const userInfoElem = document.getElementById("userInfo");
    if (!userInfoElem) return;

    const username = currentUser.name || currentUser.username || "admin";
    userInfoElem.innerText = `Admin: ${username}`;
}

/**
 * Delete student data for a specified Department and Year
 */
function deleteClassData() {
    const dept = prompt("Enter Department to delete students from (e.g. Computer Science):");
    if (!dept) return;
    const year = prompt("Enter Year to delete (1, 2, or 3):");
    if (!year) return;

    if (confirm(`Are you sure you want to delete all students for ${dept} - Year ${year}?`)) {
        let students = JSON.parse(localStorage.getItem("students")) || [];
        const initialCount = students.length;
        students = students.filter(s =>
            !( (s.department || "").toLowerCase() === dept.trim().toLowerCase() && String(s.year) === String(year.trim()) )
        );
        localStorage.setItem("students", JSON.stringify(students));
        const deleted = initialCount - students.length;
        alert(`Successfully removed ${deleted} students for ${dept} - Year ${year}.`);
    }
}

/**
 * Logout: clear session and redirect to index.html.
 */
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        try {
            fetch(`${BASE_URL}/logout`, { method: "POST" }).catch(() => {});
        } catch (e) {}

        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        localStorage.removeItem("department");
        localStorage.removeItem("year");

        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAdminInfo();
});
