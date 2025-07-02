/**
 * Modal for sharing multiplayer game invites.
 * Includes copy-to-clipboard functionality.
 */
import React, { useState, useEffect } from 'react';

interface InviteModalProps {
  sessionId: string;
  onClose: () => void;
}

export function InviteModal({ sessionId, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Generate the invite URL
  const inviteUrl = `${window.location.origin}/join/${sessionId}`;

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add fade-out animation before closing
  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div 
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-[#FCC822] text-4xl mb-2">🎮</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Multiplayer-Spiel erstellt!
          </h2>
          <p className="text-gray-300">
            Teile diesen Link mit deinem Gegner, um das Spiel zu starten.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Einladungslink</label>
          <div className="flex">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="flex-1 px-3 py-2 rounded-l-lg bg-gray-900 text-white border-r-0 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FCC822]"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900'
              }`}
            >
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Schließen
          </button>
          
          <div className="text-gray-400 text-sm flex items-center">
            <span>Warte auf Mitspieler...</span>
            <div className="ml-2 w-4 h-4 rounded-full border-2 border-t-transparent border-[#FCC822] animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 