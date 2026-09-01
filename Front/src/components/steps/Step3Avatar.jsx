import { useState } from 'react';
import { ImagePlus } from 'lucide-react';

export default function Step2Avatar({ onNext, data }) {
  const [avatar, setAvatar] = useState(data.avatar);
  const [previewUrl, setPreviewUrl] = useState(null);

  const manageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ avatar });
  };

  return (
    <form onSubmit={manageSubmit} className="space-y-4">
      <label className="group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-8 transition-colors hover:border-white/25">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Aperçu de l'avatar"
            className="h-28 w-28 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <span className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/30 transition-colors group-hover:text-white/50">
            <ImagePlus className="h-8 w-8" />
          </span>
        )}
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          {previewUrl ? 'Changer la photo' : 'Choisir une photo'}
        </span>
        <input type="file" onChange={manageFileChange} accept="image/*" className="hidden" />
      </label>
      <button
        type="submit"
        className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95"
      >
        Continuer
      </button>
    </form>
  );
}
