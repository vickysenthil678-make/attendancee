/* ==========================================================================
   my-student-requests.js - Staff View My Requests Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = getCurrentUser();
    
    // Check if staff is logged in
    if (!currentUser || currentUser.role !== 'staff') {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    const requestsList = document.getElementById("requestsList");
    if (!requestsList) return;

    // Load requests from localStorage
    let requests = JSON.parse(localStorage.getItem("studentRequests")) || [];
    
    // Filter requests for current staff only
    const myRequests = requests.filter(r => r.staffUsername === currentUser.username);

    if (myRequests.length === 0) {
        requestsList.innerHTML = `
            <div class="no-requests">
                <h3>📋 No Student Requests Yet</h3>
                <p style="margin-top: 10px;">Click "Request to Add Student" button to submit a request.</p>
            </div>
        `;
        return;
    }

    // Display requests
    let html = "";
    myRequests.forEach((request, index) => {
        const statusClass = `status-${request.status}`;
        const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
        
        const submittedDate = new Date(request.submittedAt).toLocaleString();
        
        html += `
            <div class="request-card ${request.status}">
                <div class="request-header">
                    <div>
                        <span class="request-id">Request #${request.id}</span>
                        <h3 style="margin: 5px 0 0 0; color: white;">${request.studentName}</h3>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="request-details">
                    <div class="detail-item">
                        <div class="detail-label">Roll No</div>
                        <div class="detail-value">${request.studentId}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Department</div>
                        <div class="detail-value">${request.department}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Year</div>
                        <div class="detail-value">Year ${request.year}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Phone</div>
                        <div class="detail-value">${request.phone || "Not provided"}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Parent Phone</div>
                        <div class="detail-value">${request.parentPhone || "Not provided"}</div>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <div class="detail-label">Submitted On</div>
                        <div class="detail-value">${submittedDate}</div>
                    </div>
                </div>
            </div>
        `;
    });

    requestsList.innerHTML = html;
});