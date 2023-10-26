let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;
let clearFormBtn;

if (window.location.pathname.includes('/notes.html'))

 {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
  clearFormBtn = document.querySelector('.clear-form');
}

// show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const renderActiveNote = () => {
    hide(saveNoteBtn);
  
    if (activeNote.id) {
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
    }
  };
  

// delete the clicked note
const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  const noteData = e.target.parentElement.getAttribute('data-note');
  if (noteData) {
    activeNote = JSON.parse(noteData);
  } else {
    activeNote = {};  // resets to an empty object if no valid data is found
  }
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// renders the list of note titles
const renderNoteList = async (notes) => {
  // let jsonNotes = await notes.json();
  
  if (window.location.pathname === '/notes.html') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  const noteListItems = []; // initializes array to store the note items

  // returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (notes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  } else {
    notes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);
      noteListItems.push(li);
    });

    if (window.location.pathname === '/notes.html') {
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  }
};

// gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => {
  fetch('/api/notes')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(renderNoteList)
    .catch(error => console.error('Fetch error:', error));
};

if (window.location.pathname === '/notes.html') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);

  clearFormBtn.addEventListener('click', () => {
    const isConfirmed = confirm('Are you sure you want to clear the form?');
    if (isConfirmed) {
      noteTitle.value = '';
      noteText.value = '';
      // triggers the render save button logic to update the visibility of the save button
      handleRenderSaveBtn();
    }
  });
}

getAndRenderNotes(); // Call getAndRenderNotes() here

