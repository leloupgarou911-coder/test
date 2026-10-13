import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { findSavedEntry, updateEntryNote } from '../services/storage';
import { GeneratorId } from '../types';

interface NoteModalProps {
  name: string;
  generatorId: GeneratorId | string;
  style: string;
  onClose: () => void;
  onSave?: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  name,
  generatorId,
  style,
  onClose,
  onSave,
}) => {
  const existing = findSavedEntry(name, generatorId);
  const [noteText, setNoteText] = useState(existing?.note || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEntryNote(name, noteText, generatorId, style);
    setSavedSuccess(true);
    if (onSave) onSave();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white">Private Note</h3>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Add lore, backstory, class ideas, or notes for{' '}
          <span className="font-bold text-purple-300">"{name}"</span>. Saved locally in your
          browser.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            placeholder="e.g. Rogue assassin in the southern guilds; wields twin starlight daggers..."
            className="w-full p-3 bg-[#090d18] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 transition cursor-pointer flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Note</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
