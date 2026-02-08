
(function () {
    console.log("DEBUG: Checking DOM...");
    const profile = document.getElementById('user-profile-section');
    const overlay = document.getElementById('login-overlay');

    console.log("Profile Element:", profile);
    if (profile) console.log("Profile Classes:", profile.className);

    console.log("Overlay Element:", overlay);
    if (overlay) console.log("Overlay Classes:", overlay.className);

    // Check Firebase Auth availability
    try {
        if (window.firebaseAuthInstance) {
            console.log("Auth initialized:", window.firebaseAuthInstance.currentUser);
        } else {
            console.log("Auth instance not found on window (expected if module scoped).");
        }
    } catch (e) {
        console.error(e);
    }
})();
