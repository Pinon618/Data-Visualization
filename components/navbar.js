class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .navbar {
                    background: linear-gradient(135deg, #9b96eeff 0%, #ffffffff 100%);
                    box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .nav-link {
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .nav-link:hover {
                    transform: translateY(-2px);
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background-color: white;
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
            </style>
            <nav class="navbar text-white px-6 py-4">
                <div class="container mx-auto flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <i data-feather="dollar-sign"></i>
                        <span class="text-xl font-bold">Visualization of Tally</span>
                    </div>
                    <div class="hidden md:flex space-x-6">
                        <a href="#" class="nav-link flex items-center space-x-1">
                            <i data-feather="home"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="#" class="nav-link flex items-center space-x-1">
                            <i data-feather="bar-chart-2"></i>
                            <span>Analytics</span>
                        </a>
                        <a href="#" class="nav-link flex items-center space-x-1">
                            <i data-feather="file-text"></i>
                            <span>Reports</span>
                        </a>
                        <a href="#" class="nav-link flex items-center space-x-1">
                            <i data-feather="settings"></i>
                            <span>Settings</span>
                        </a>
                    </div>
                    <button class="md:hidden">
                        <i data-feather="menu"></i>
                    </button>
                </div>
            </nav>
        `;
    }
}

customElements.define('custom-navbar', CustomNavbar);