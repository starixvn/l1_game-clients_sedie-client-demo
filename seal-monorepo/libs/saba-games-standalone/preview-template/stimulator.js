const COLLAPSED_WIDTH = '3.75rem';
const EXPANDED_WIDTH = '244px';

class Sidebar {
    constructor(position) {
        this.position = position;
        this.isOpen = false;
        this.width = COLLAPSED_WIDTH;
        this.button = document.getElementById(`${position}-button`);
    }

    initEvents() {
        this.button.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.width = this.isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
        document.documentElement.style.setProperty(`--${this.position}-width`, this.width);
    }
}

const leftSidebar = new Sidebar('left');
const rightSidebar = new Sidebar('right');

leftSidebar.initEvents();
rightSidebar.initEvents();
