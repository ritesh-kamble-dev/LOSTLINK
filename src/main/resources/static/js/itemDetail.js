document.addEventListener("DOMContentLoaded", async () => {
  let selectedItem = JSON.parse(localStorage.getItem("selectedItem"));
  const itemId = new URLSearchParams(window.location.search).get("itemId");

  if (itemId) {
      try {
          const response = await fetch(`/api/items/${encodeURIComponent(itemId)}`);
          if (!response.ok) throw new Error(`Item request failed: ${response.status}`);
          selectedItem = await response.json();
          localStorage.setItem("selectedItem", JSON.stringify(selectedItem));
      } catch (error) {
          console.error("Error loading item details:", error);
          alert("Unable to load this item. Please try again.");
          return;
      }
  }
  
  if (!selectedItem) {
      alert("No item details found. Please select an item from the search page.");
      window.location.href = "search.html";
      return;
  }
  
  displayItemDetails(selectedItem);
  loadClaimRequestsForReporter(selectedItem);
  
  const claimButton = document.getElementById("claim-btn");
  claimButton.addEventListener("click", handleClaimItem);
  
  const emailButton = document.getElementById("email-btn");
  emailButton.addEventListener("click", () => handleEmailUser(selectedItem));
  document.getElementById("back-to-search").addEventListener("click", () => {
      window.location.href = "SearchItem.html";
  });
});

function displayItemDetails(item) {
  document.title = `${item.itemName} | Lost & Found`;
  
  document.getElementById("item-name").textContent = item.itemName || "Item name not available";
  document.getElementById("item-description").textContent = item.description || "No description available";
  document.getElementById("item-location").textContent = item.location || "Location not specified";
  document.getElementById("item-date").textContent = formatItemDate(item.dateReported);

  const itemStatus = String(item.status || "unknown").toLowerCase();
  const statusBadge = document.getElementById("item-status");
  statusBadge.textContent = itemStatus;
  statusBadge.className = `status-badge status-${itemStatus}`;

  const reporterLink = document.getElementById("reporter-link");
  reporterLink.textContent = item.reportedBy || "Reporter unavailable";
  reporterLink.href = item.reporterEmail ? `mailto:${encodeURIComponent(item.reporterEmail)}` : "#";
  
  const claimButton = document.getElementById("claim-btn");
  if (itemStatus === "found") {
      claimButton.textContent = "This Item Is Mine";
  } else if (itemStatus === "lost") {
      claimButton.textContent = "I Found This Item";
  }
  if (itemStatus === "claimed") {
      claimButton.textContent = "Already Claimed";
      claimButton.disabled = true;
      claimButton.classList.add("disabled");
  } else if (itemStatus !== "lost" && itemStatus !== "found") {
      claimButton.textContent = "Not Available";
      claimButton.disabled = true;
      claimButton.classList.add("disabled");
  }
  
  const mainImage = document.querySelector(".main-image");
  if (item.itemId) {
      mainImage.src = `/api/items/${encodeURIComponent(item.itemId)}/image`;
      mainImage.alt = item.itemName || "Item image";
  } else if (item.imagePath) {
      mainImage.src = item.imagePath;
      mainImage.alt = item.itemName || "Item image";
  }
}

function formatItemDate(dateValue) {
  if (!dateValue) return "Date not recorded";

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
      ? "Date not recorded"
      : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

async function handleClaimItem() {
  const selectedItem = JSON.parse(localStorage.getItem("selectedItem"));
  const token = localStorage.getItem("jwtToken");

  if (!token) {
      alert("Please log in before submitting a claim.");
      return;
  }

  const isFoundItem = String(selectedItem.status).toLowerCase() === "found";
  const firstQuestion = isFoundItem
      ? "Verification question 1: Describe unique features that prove this item is yours."
      : "Verification question 1: Describe unique features of the item you found.";
  const distinctiveFeatures = prompt(firstQuestion);
  if (!distinctiveFeatures || !distinctiveFeatures.trim()) return;
  const secondQuestion = isFoundItem
      ? "Verification question 2: Where and when did you lose this item?"
      : "Verification question 2: Where and when did you find this item?";
  const lostDetails = prompt(secondQuestion);
  if (!lostDetails || !lostDetails.trim()) return;

  const confirmClaim = confirm("Send this claim request to the reporter for review?");
  
  if (!confirmClaim) return;
  
  try {
      const claimButton = document.querySelector(".action-btn");
      claimButton.textContent = "Processing...";
      claimButton.disabled = true;
      
      const response = await fetch(`/api/items/${encodeURIComponent(selectedItem.itemId)}/claims`, {
          method: "POST",
          body: JSON.stringify({
              answers: `Unique features: ${distinctiveFeatures.trim()}\nDetails: ${lostDetails.trim()}`
          }),
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Failed to submit claim: ${response.status}`);
      
      claimButton.textContent = "Claim Request Sent";
      claimButton.disabled = true;
      alert(result.message || "Claim request sent to the reporter.");
      
  } catch (error) {
      console.error("Error claiming item:", error);
      
      const claimButton = document.querySelector(".action-btn");
      claimButton.textContent = "Claim Item";
      claimButton.disabled = false;
      
      alert(error.message || "Failed to claim the item. Please try again later.");
  }
}

function handleEmailUser(item) {
  const reporterEmail = item.reporterEmail || "";
  
  if (!reporterEmail) {
      alert("Reporter email is not available.");
      return;
  }
  
  const subject = `Regarding your ${item.status} item: ${item.itemName}`;
  const body = `Hello,\n\nI am contacting you regarding the ${item.itemName} that you reported as ${item.status} on ${new Date(item.dateReported).toLocaleDateString()}.\n\nPlease let me know if we can arrange a meetup for the item.\n\nRegards,\n[Your Name]`;
  
  window.location.href = `mailto:${reporterEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function getCurrentUserId() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  return userData.id || "anonymous";
}

async function loadClaimRequestsForReporter(item) {
  const reporterId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("jwtToken");
  if (!reporterId || reporterId !== Number(item.reporterId) || !token) return;

  const reviewSection = document.getElementById("claim-review");
  const requestsContainer = document.getElementById("claim-requests");
  reviewSection.hidden = false;

  try {
      const response = await fetch(`/api/items/${encodeURIComponent(item.itemId)}/claims`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Unable to load claim requests.");
      const claims = await response.json();
      if (claims.length === 0) {
          requestsContainer.textContent = "No claim requests yet.";
          return;
      }

      requestsContainer.innerHTML = "";
      claims.forEach(claim => {
          const request = document.createElement("article");
          request.className = "claim-request";
          const heading = document.createElement("strong");
          const requestType = claim.claimType === "OWNERSHIP_REQUEST"
              ? "Ownership request" : "Found-item match";
          heading.textContent = `${claim.claimantName} - ${requestType} - ${claim.status}`;
          const answers = document.createElement("p");
          answers.textContent = claim.answers;
          request.append(heading, answers);
          if (claim.status === "pending") {
              const approve = document.createElement("button");
              approve.className = "action-btn";
              approve.textContent = "Approve";
              approve.addEventListener("click", () => decideClaim(claim.claimId, "approved", item));
              const reject = document.createElement("button");
              reject.className = "action-btn";
              reject.textContent = "Reject";
              reject.addEventListener("click", () => decideClaim(claim.claimId, "rejected", item));
              request.append(approve, reject);
          }
          requestsContainer.appendChild(request);
      });
  } catch (error) {
      requestsContainer.textContent = error.message;
  }
}

async function decideClaim(claimId, decision, item) {
  if (!confirm(`Are you sure you want to ${decision} this claim?`)) return;
  try {
      const response = await fetch(`/api/items/claims/${encodeURIComponent(claimId)}/decision`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwtToken")}` },
          body: JSON.stringify({ decision })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to review claim.");
      alert(result.message);
      loadClaimRequestsForReporter(item);
  } catch (error) {
      alert(error.message);
  }
}
