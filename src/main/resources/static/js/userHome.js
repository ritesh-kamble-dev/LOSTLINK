document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("jwtToken");
    if (!userId || !token) {
        window.location.href = "signup.html";
        return;
    }

    try {
        const response = await fetch(`/api/users/${encodeURIComponent(userId)}/dashboard`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Unable to load dashboard data.");

        const dashboard = await response.json();
        document.getElementById("title_card").textContent = `Welcome Back, ${dashboard.fullName || "User"}`;
        document.getElementById("lostCount").textContent = dashboard.lostCount || 0;
        document.getElementById("foundCount").textContent = dashboard.foundCount || 0;
        document.getElementById("claimedCount").textContent = dashboard.claimedCount || 0;

        const tableBody = document.getElementById("recentTableBody");
        tableBody.innerHTML = "";
        if (!dashboard.recentItems || dashboard.recentItems.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">You have not reported any items yet.</td></tr>';
            return;
        }

        dashboard.recentItems.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><span class="item-id">#${item.itemId}</span></td>
                <td><strong class="item-name">${escapeHtml(item.itemName || "Unnamed item")}</strong></td>
                <td>${escapeHtml(item.itemType || "-")}</td>
                <td><span class="status-badge status-${escapeHtml(String(item.status || "unknown").toLowerCase())}">${escapeHtml(item.status || "Unknown")}</span></td>
                <td><span class="item-description" title="${escapeHtml(item.description || "No description")}">${escapeHtml(item.description || "No description")}</span></td>
                <td>${escapeHtml(item.location || "Not specified")}</td>
                <td class="date-cell">${escapeHtml(item.dateReported || "Date not recorded")}</td>
                <td><button class="view-item-btn" type="button">View details <span aria-hidden="true">→</span></button></td>
            `;
            row.classList.add("item-row");
            row.title = "Open item details";
            const openItem = () => {
                window.location.href = `itemDetails.html?itemId=${encodeURIComponent(item.itemId)}`;
            };
            row.addEventListener("click", openItem);
            row.querySelector(".view-item-btn").addEventListener("click", event => {
                event.stopPropagation();
                openItem();
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        document.getElementById("recentTableBody").innerHTML =
            '<tr><td colspan="8" class="empty-state">Unable to load your reports. Please sign in again.</td></tr>';
    }
});

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "signup.html";
  });
