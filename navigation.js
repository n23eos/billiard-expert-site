const navigationLinks = document.querySelectorAll('header nav a');
function updateNavigation() {
  const page = location.pathname.split('/').pop() || 'index.html';
  for (const link of navigationLinks) {
    const target = new URL(link.href);
    const targetPage = target.pathname.split('/').pop();
    const active = target.hash ? page === 'index.html' && location.hash === target.hash : (targetPage === page && !location.hash) || page === 'concept.html' && targetPage === 'concepts.html';
    if (active) link.setAttribute('aria-current', target.hash ? 'location' : 'page');
    else link.removeAttribute('aria-current');
  }
}
updateNavigation();
window.addEventListener('hashchange', updateNavigation);
