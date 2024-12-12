const bibleVerseRegex = /\b([1-3]?\s?[A-Za-z]+)\s(\d+):(\d+)(?:[–-](\d+))?\b/g;

function highlightBibleReferences(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const matches = node.textContent.match(bibleVerseRegex);
    if (matches) {
      const parent = node.parentNode;
      const fragment = document.createDocumentFragment();
      let text = node.textContent;

      matches.forEach((match) => {
        const parts = text.split(match);
        fragment.appendChild(document.createTextNode(parts[0]));
        
        const span = document.createElement('span');
        span.textContent = match;
        span.className = 'bible-verse-highlight';
        span.dataset.reference = match.replace(/–/g, '-');
        fragment.appendChild(span);

        text = parts.slice(1).join(match);
      });

      fragment.appendChild(document.createTextNode(text));
      parent.replaceChild(fragment, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
    node.childNodes.forEach((child) => highlightBibleReferences(child));
  }
}

document.body.childNodes.forEach((node) => highlightBibleReferences(node));

const style = document.createElement('style');
style.textContent = `
  .bible-verse-highlight {
    text-decoration: underline;
    cursor: pointer;
    color: red;
  }
  .bible-popup {
    position: absolute;
    background: #f9f9f9;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    display: none;
    color: black;
    width: 300px;
    border-radius: 0.5rem;
  }
`;
document.head.appendChild(style);

const popup = document.createElement('div');
popup.className = 'bible-popup';
document.body.appendChild(popup);

document.body.addEventListener('mouseover', (e) => {
  if (e.target.classList.contains('bible-verse-highlight')) {
    const reference = e.target.dataset.reference;

    fetch(`https://bible-api.com/${reference}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data.text)
        popup.textContent = `${data.text} (${data.reference})`;
        popup.style.left = `${e.pageX + 10}px`;
        popup.style.top = `${e.pageY + 10}px`;
        popup.style.display = 'block';
      })
      .catch(() => {
        popup.textContent = 'Verse not found.';
        popup.style.left = `${e.pageX + 10}px`;
        popup.style.top = `${e.pageY + 10}px`;
        popup.style.display = 'block';
      });
  }
});

document.body.addEventListener('mouseout', (e) => {
  if (e.target.classList.contains('bible-verse-highlight')) {
    popup.style.display = 'none';
  }
});
