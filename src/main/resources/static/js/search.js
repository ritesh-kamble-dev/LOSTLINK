document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");
  const dateFilter = document.getElementById("dateFilter");
  const filterBtn = document.getElementById("filterBtn");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn"); 
  const tableBody = document.getElementById("searchTableBody");

  loadAllItems();

  async function loadAllItems() {
      const searchVal = searchInput.value.trim();
      const category = categoryFilter.value;
      const status = statusFilter.value;
      const date = dateFilter.value;

      let url = "/api/items/all";

      try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Request failed: ${response.status}`);
          const items = await response.json();

          renderItems(items);
      } catch (err) {
          console.error("Error loading items:", err);
          alert("Failed to load items. See console for details.");
      }
  }

  document.getElementById("filterBtn").addEventListener("click", function() {
      const searchQuery = document.getElementById("searchInput").value;
      const category = document.getElementById("categoryFilter").value;
      const status = document.getElementById("statusFilter").value;
      const date = document.getElementById("dateFilter").value;

      if (category === "All Categories") category = null;
      if (status === "All Statuses") status = null;

      let url = '/api/items/filter?';
      if (searchQuery) url += `searchQuery=${searchQuery}&`;
      if (category) url += `itemType=${category}&`;
      if (status) url += `status=${status}&`;
      if (date) url += `filterDate=${date}&`;

      url = url.endsWith('&') ? url.slice(0, -1) : url;
      fetch(url)
          .then(response => response.json())
          .then(data => renderItems(data))
          .catch(error => console.error('Error fetching search results:', error));
  });

  clearFiltersBtn.addEventListener("click", function() {
      searchInput.value = '';
      categoryFilter.value = '';
      statusFilter.value = '';
      dateFilter.value = '';
      loadAllItems();
  });

  function renderItems(items) {
    const tableBody = document.getElementById("searchTableBody");
    tableBody.innerHTML = "";

    if (!items || items.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='8' class='empty-state'>No matching items found.</td></tr>";
        return;
    }

    items.forEach(item => {
        const row = document.createElement("tr");

        const description = item.description || "No description";
        row.innerHTML = `
            <td><span class="item-id">#${item.itemId}</span></td>
            <td><strong class="item-name">${escapeHtml(item.itemName || "Unnamed item")}</strong></td>
            <td>${escapeHtml(item.itemType || "-")}</td>
            <td><span class="status-badge status-${escapeHtml(String(item.status || "unknown").toLowerCase())}">${escapeHtml(item.status || "Unknown")}</span></td>
            <td><span class="item-description" title="${escapeHtml(description)}">${escapeHtml(description)}</span></td>
            <td>${escapeHtml(item.location || "Not specified")}</td>
            <td class="date-cell">${formatDate(item.dateReported)}</td>
            <td><button class="view-item-btn" type="button">View details <span aria-hidden="true">→</span></button></td>
        `;
        row.classList.add("search-item-row");
        const openItem = () => window.location.href = `itemDetails.html?itemId=${encodeURIComponent(item.itemId)}`;
        row.addEventListener("click", openItem);
        row.querySelector(".view-item-btn").addEventListener("click", event => {
            event.stopPropagation();
            openItem();
        });

        tableBody.appendChild(row);
    });
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not recorded";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "Date not recorded" : date.toLocaleDateString();
}

function escapeHtml(value) {
  return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
}

});
