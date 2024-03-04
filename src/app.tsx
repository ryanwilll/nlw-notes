import { ChangeEvent, useState } from 'react';
import { NewNoteCard } from './components/new-note-card';
import { NoteCard } from './components/note-card';
import { toast } from 'sonner';

import logo from './assets/logo-nlw-expert.svg';

interface INote {
  uuid: string;
  date: Date;
  content: string;
}

export function App() {
  const [search, setSearch] = useState<string>('');
  const [notes, setNotes] = useState<INote[]>(() => {
    const notesOnStorage = localStorage.getItem('notes');

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage);
    }

    return [];
  });

  const filteredNotes = search !== '' ? notes.filter((note) => note.content.toLowerCase().includes(search)) : notes;

  function onNoteCreated(content: string) {
    const newNote = {
      uuid: crypto.randomUUID(),
      date: new Date(),
      content,
    };

    const notesArray = [newNote, ...notes];

    setNotes(notesArray);

    localStorage.setItem('notes', JSON.stringify(notesArray));
  }

  function onNoteDeleted(uuid: string) {
    const notesArray = notes.filter((note) => note.uuid !== uuid);
    setNotes(notesArray);
    localStorage.setItem('notes', JSON.stringify(notesArray));
    toast.success('Nota excluida com sucesso');
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;

    setSearch(query.toLowerCase());
  }

  return (
    <div className='mx-auto space-y-6 max-w-6xl my-12 px-5'>
      <img src={logo} alt='NLW expert' />

      <form className='w-full'>
        <input
          type='text'
          placeholder='Busque em suas notas...'
          className='w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none'
          onChange={handleSearch}
        />
      </form>

      <div className='h-px bg-slate-700' />

      <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 auto-rows-[250px] gap-6'>
        <NewNoteCard onNoteCreated={onNoteCreated} />

        {filteredNotes.map((note) => (
          <NoteCard
            key={note.uuid}
            note={{
              uuid: note.uuid,
              date: note.date,
              content: note.content,
            }}
            onNoteDeleted={onNoteDeleted}
          />
        ))}
      </div>
    </div>
  );
}
