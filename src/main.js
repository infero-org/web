const colors = ['#db3c23', '#8b5cf6', '#f59e0b', '#3eb549', '#567cfd'];

// Exact 6 angles from logo: horizontal + 45° diagonals on both sides
const angles = [0, 45, 315, 180, 135, 225];

document.addEventListener('click', e => {
  if (getComputedStyle(e.target).cursor.startsWith('url("data:image/svg+xml')) {
    const container = document.createElement('div');
    container.className = 'sparkle-container';
    container.style.left = e.clientX + 'px';
    container.style.top = e.clientY + 'px';

    for (const angle of angles) {
      const spark = document.createElement('div');
      spark.className = 'spark';

      const distance = 40 + Math.random() * 30;
      const size = 0.6 + Math.random() * 0.6;
      const delay = Math.random() * 0.08;

      spark.style.cssText = `
          --rotation: rotate(${angle}deg);
          --distance: ${distance}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          transform: rotate(${angle}deg);
          animation-delay: ${delay}s;
          animation-duration: ${0.4 + Math.random() * 0.2}s;
          width: ${32 * size}px;
          height: ${6 * size}px;
        `;

      container.appendChild(spark);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 800);
  }
});
