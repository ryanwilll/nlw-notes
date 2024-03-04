import * as Dialog from '@radix-ui/react-dialog';
import { useState, ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';

import { X } from 'lucide-react';

interface INewNoteCard {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: INewNoteCard) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value.length <= 0) {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(e: FormEvent) {
    e.preventDefault();

    if (content.length <= 0) {
      return toast.error('Você precisa inserir o texto para salvar a nota!');
    }

    onNoteCreated(content);
    setContent('');
    setShouldShowOnboarding(true);
    toast.success('Nota criada com sucesso!');
  }

  function handleStartRecording() {
    const isSpeechrRecognitionAPIAvaliable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    if (!isSpeechrRecognitionAPIAvaliable) {
      return toast.error('Infelizmente o seu navegador não suporta reconhecimento de voz!');
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    /**
     * Define as configurações da API de reconhecimento de fala.
     *
     * @param {string} lang - O idioma para reconhecimento.
     * @param {boolean} continuous - Define se o reconhecimento é contínuo.
     * @param {number} maxAlternatives - O número máximo de alternativas que devem ser devolvidas pelas chamadas ao método SpeechRecognition.
     * @param {boolean} interimResults - Define se os resultados intermediários devem ser retornados.
     */

    speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.lang = 'pt-BR';
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, '');

      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error('Ocorreu um erro ao executar a API de reconhecimento de fala', event);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);
    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  function handleCloseModal() {
    setContent('');
    setShouldShowOnboarding(true);
    handleStopRecording();
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className='text-left flex flex-col rounded-md bg-slate-700 p-5 gap-3 outline-none hover:ring-2
         hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>
        <p className='text-sm leading-6 text-slate-400'>
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/60' />
        <Dialog.Content
          className='fixed md:left-1/2 inset-0 md:inset-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700
           rounded-md flex flex-col outline-none overflow-hidden'>
          <Dialog.Close
            onClick={handleCloseModal}
            className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100 outline-none rounded-bl-md'>
            <X className='size-5' />
          </Dialog.Close>

          <form className='flex flex-1 flex-col'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>

              {shouldShowOnboarding ? (
                <p className='text-sm leading-6 text-slate-400'>
                  Comece{' '}
                  <button type='button' className='font-medium text-lime-400 hover:underline' onClick={handleStartRecording}>
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button type='button' className='font-medium text-lime-400 hover:underline' onClick={handleStartEditor}>
                    utilize apenas texto.
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  value={content}
                  className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                  onChange={handleContentChanged}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type='button'
                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium group hover:text-slate-100'
                onClick={handleStopRecording}>
                <div className='size-3 rounded-full bg-red-500 animate-pulse' />
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type='button'
                onClick={handleSaveNote}
                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium group hover:bg-lime-500'>
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
