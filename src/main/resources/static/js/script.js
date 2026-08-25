document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded successfully");

    const sidebarItems = document.querySelectorAll(".nav-item");
    sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            const page = item.textContent.trim();
            switch (page) {
                case "Home":
                    window.location.href = "UserHome.html";
                    break;
                case "Report Items":
                    window.location.href = "ReportItem.html";
                    break;
                case "Search Items":
                    window.location.href = "SearchItem.html";
                    break;
                case "Profile Settings":
                    window.location.href = "Profile.html";
                    break;
                case "Help Center":
                    window.location.href = "HelpCenter.html";
                    break;
                default:
                    console.warn("Navigation not found:", page);
            }
        });
    });
    
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "signup.html";
    });

    const viewDetailsButton = document.getElementById("View Details");
    if (viewDetailsButton) {
        viewDetailsButton.addEventListener("click", () => {
            window.location.href = "itemDetails.html";
        });
    }
});

