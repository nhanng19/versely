const bibleVerseRegex = /\b([1-3]?\s?[A-Za-z]+\.?)\s(\d+):(\d+)(?:[–-](\d+))?\b|\b([1-3]?\s?(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s?Samuel|2\s?Samuel|1\s?Kings|2\s?Kings|1\s?Chronicles|2\s?Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song\s?of\s?Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s?Corinthians|2\s?Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s?Thessalonians|2\s?Thessalonians|1\s?Timothy|2\s?Timothy|Titus|Philemon|Hebrews|James|1\s?Peter|2\s?Peter|1\s?John|2\s?John|3\s?John|Jude|Revelation)\.?)(\s?(\d+))?\b/g;

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
    Array.from(node.childNodes).forEach((child) => highlightBibleReferences(child));
  }
}

highlightBibleReferences(document.body);

const style = document.createElement('style');
style.textContent = `
  .bible-verse-highlight {
    text-decoration: underline;
    text-decoration-color: #7AD2A8;
    text-decoration-thickness: 5px;
    cursor: pointer;
    color: black;
  }

  .bible-popup {
    position: absolute;
    background: #f9f9f9;
    border: 1px solid #ccc;
    padding: 20px;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
    z-index: 10000;
    display: none;
    color: black;
    width: 400px;
    max-height: 400px;
    border-radius: 0.5rem;
    overflow-y: scroll;
  }

  .verse-number {
  font-size: 0.8em;
  color: gray
}
`;
document.head.appendChild(style);

const popup = document.createElement('div');
popup.className = 'bible-popup';
document.body.appendChild(popup);

let isPopupVisible = false;

document.body.addEventListener('mouseover', (e) => {
  if (e.target.classList.contains('bible-verse-highlight')) {
    const reference = e.target.dataset.reference;

    fetch(`https://bible-api.com/${reference}?translation=kjv`)
      .then((response) => response.json())
      .then((data) => {
        popup.innerHTML = '';

        data.verses.forEach((verse) => {
          const verseContent = `${verse.text.trim()}`;
          
          const verseElement = document.createElement('p');
          
          const verseNumber = document.createElement('span');
          verseNumber.textContent = `${verse.verse}  `;
          verseNumber.className = 'verse-number';
          
          verseElement.appendChild(verseNumber);
          verseElement.appendChild(document.createTextNode(verseContent));
          
          popup.appendChild(verseElement);
        });

        popup.style.left = `${e.pageX + 10}px`;
        popup.style.top = `${e.pageY + 10}px`;
        popup.style.display = 'block';
        isPopupVisible = true;
      })
      .catch(() => {
        popup.textContent = 'Verse not found.';
        popup.style.left = `${e.pageX + 10}px`;
        popup.style.top = `${e.pageY + 10}px`;
        popup.style.display = 'block';
        isPopupVisible = true;
      });
  }
});

document.body.addEventListener('mouseout', (e) => {
  if (e.target.classList.contains('bible-verse-highlight') && !popup.contains(e.relatedTarget)) {
    popup.style.display = 'none';
    isPopupVisible = false;
  }
});

popup.addEventListener('mouseover', () => {
  isPopupVisible = true;
});

popup.addEventListener('mouseout', (e) => {
  if (!popup.contains(e.relatedTarget)) {
    popup.style.display = 'none';
    isPopupVisible = false;
  }
});