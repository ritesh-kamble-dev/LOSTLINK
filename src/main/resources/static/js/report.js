document.addEventListener("DOMContentLoaded", () => {
  const reportForm = document.getElementById("reportItemForm");
  if (!reportForm) return;
  const fileInput = document.getElementById("itemImage");
  const fileName = document.getElementById("image-file-name");
  

  fileInput.addEventListener("change", () => {
    fileName.textContent = fileInput.files[0] ? `Selected: ${fileInput.files[0].name}` : "PNG, JPG, or JPEG accepted.";
  });

  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("User not authenticated. Please log in.");
      return;
    }
    
    const statusValue   = document.getElementById("statusSelect").value;  
    const itemName      = document.getElementById("itemName").value;
    const itemTypeValue = document.getElementById("itemTypeSelect").value; 
    const description   = document.getElementById("description")?.value || "";
    const location      = document.getElementById("location")?.value || "";
    const date          = document.getElementById("date")?.value || "";
    
    let imageBase64 = ""; 
    const fileInput = document.getElementById("itemImage");
    if (fileInput && fileInput.files[0]) {
      const file = fileInput.files[0]; 
      imageBase64 = await convertImageToBase64(file);  
    }

   
    const requestBody = {
      status: statusValue,
      itemName,
      itemType: itemTypeValue,
      description,
      location,
      date,
      imageBase64       
    };

    try {
      const submitButton = reportForm.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.querySelector("span").textContent = "Submitting...";
      // 3. POST to your backend
      const response = await fetch("/api/items/report", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to report item.");
        submitButton.disabled = false;
        submitButton.querySelector("span").textContent = "Submit Report";
        return;
      }

      const responseData = await response.json();
      alert("Item reported successfully!");
      console.log("Reported Data:", responseData);
      reportForm.reset();
      fileName.textContent = "PNG, JPG, or JPEG accepted.";
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "Submit Report";
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Please try again later.");
      const submitButton = reportForm.querySelector("button[type='submit']");
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "Submit Report";
    }
  });
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "signup.html";
});

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); 
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
