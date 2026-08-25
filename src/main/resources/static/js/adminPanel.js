document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("reportsTableBody");
  const lostCountElement = document.getElementById("lostReportsCount");
  const foundCountElement = document.getElementById("foundReportsCount");
  const claimedCountElement = document.getElementById("claimedReportsCount");
  const userCountElement = document.getElementById("totalUsersCount");

  try {
      const response = await fetch("http:/api/users/count"); 
      if (!response.ok) 
        throw new Error("Failed to fetch user count");

      const userCount = await response.json(); 
      userCountElement.textContent = userCount; 

  } catch (error) {
      console.error("Error loading user count:", error);
  }

  try {
      const response = await fetch("/api/items/all"); 
      if (!response.ok) 
        throw new Error("Failed to fetch items");

      const items = await response.json();
      tableBody.innerHTML = ""; 

      
      let lostCount = 0, foundCount = 0, claimedCount = 0;

      items.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${item.itemId}</td>
              <td>${item.itemName}</td>
              <td>${item.itemType}</td>
              <td>${new Date(item.dateReported).toLocaleDateString()}</td>
              <td>${item.status}</td>
          `;
          tableBody.appendChild(row);

          if (item.status === "lost") lostCount++;
          else if (item.status === "found") foundCount++;
          else if (item.status === "claimed") claimedCount++;
      });

      
      lostCountElement.textContent = lostCount;
      foundCountElement.textContent = foundCount;
      claimedCountElement.textContent = claimedCount;

  } catch (error) {
      console.error("Error loading items:", error);
  }
});



document.getElementById("Home").addEventListener("click", () => {
  window.location.href = "AdminPanel.html";
});

document.getElementById("viewLostReports").addEventListener("click", () => {
  window.location.href = "lostReports.html";
});

document.getElementById("viewFoundReports").addEventListener("click", () => {
  window.location.href = "foundReports.html";
});

document.getElementById("viewClaimedReports").addEventListener("click", () => {
  window.location.href = "claimedReports.html";
});

document.getElementById("viewUsers").addEventListener("click", () => {
  window.location.href = "userReports.html";
});

document.getElementById("profileSettings").addEventListener("click", () => {
  window.location.href = "adminProfile.html";
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "signup.html";
});
