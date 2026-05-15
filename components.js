// ============================================
// WriteDiary.online — Components JS
// Header & Footer Dynamic Loading
// ============================================

(function() {
    // Header HTML with navigation links only (no sub-pages)
    const headerHTML = `
        <header class="site-header">
            <div class="header-inner">
                <div class="logo" onclick="window.scrollTo({top:0,behavior:'smooth'})">
                    <span class="logo-icon">📓</span>
                    <span>Diary online</span>
                </div>
                <nav class="nav-links">
                    <a href="/">Home</a>
                    <a href="#about">About</a>
                    <a href="#app">Diary</a>
                    <a href="#features">Features</a>
                    <a href="#mood">Mood</a>
                    <a href="#prompts">Prompts</a>
                    <a href="#faq">FAQ</a>
                    <a href="#" class="nav-cta" onclick="openApp();return false;">Start Writing →</a>
                </nav>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="mobile-menu">
                <a href="/">Home</a>
                <a href="#about">About</a>
                <a href="#app">Diary</a>
                <a href="#features">Features</a>
                <a href="#mood">Mood</a>
                <a href="#prompts">Prompts</a>
                <a href="#faq">FAQ</a>
                <a href="#" onclick="openApp();return false;">Start Writing</a>
            </div>
        </header>
    `;

    // Footer HTML with navigation links only (no sub-pages)
    const footerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <div class="logo" style="justify-content:flex-start; margin-bottom:14px">
                            <span class="logo-icon">📓</span>
                            <span>Diary online</span>
                        </div>
                        <p>Your personal online diary — write, reflect, and grow. Free, secure, and beautiful journaling for everyone.</p>
                    </div>
                    <div class="footer-col">
                        <h4>Explore</h4>
                        <a href="/">Home</a>
                        <a href="#about">About</a>
                        <a href="#app">Diary App</a>
                        <a href="#features">Features</a>
                    </div>
                    <div class="footer-col">
                        <h4>Resources</h4>
                        <a href="/#mood">Mood Tracker</a>
                        <a href="/#prompts">Writing Prompts</a>
                        <a href="/#how">How It Works</a>
                        <a href="/#faq">FAQ</a>
                    </div>
                    <div class="footer-col">
                        <h4>Connect</h4>
                        <a href="contact">Contact</a>
                        <a href="privacy">Privacy Policy</a>
                        <a href="terms">Terms of Use</a>
                        <a href="about">About</a>
                        <a href="#" onclick="openApp();return false;">Start Writing →</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div>© 2026 WriteDiary.online — All rights reserved.</div>
                    <div>Made with ❤️ for diary writers everywhere.</div>
                </div>
            </div>
        </footer>
    `;

    // Insert header and footer when DOM is ready
    function loadComponents() {
        const headerRoot = document.getElementById('header-root');
        const footerRoot = document.getElementById('footer-root');
        
        if (headerRoot) {
            headerRoot.innerHTML = headerHTML;
        }
        if (footerRoot) {
            footerRoot.innerHTML = footerHTML;
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadComponents);
    } else {
        loadComponents();
    }
})();
