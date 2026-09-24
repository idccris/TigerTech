"use client";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onError: (message: string) => void;
  compact?: boolean;
};

export default function ProductImageEditor({ images, onChange, onError, compact = false }: Props) {
  const slots = Array.from({ length: 4 }, (_, index) => images[index] || "");

  function pick(index: number, file?: File) {
    if (!file) return;
    if (!/^image\/(?:png|jpeg|webp)$/.test(file.type)) {
      onError("Selecione uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      onError("Cada imagem deve ter no máximo 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...slots];
      next[index] = String(reader.result || "");
      onError("");
      onChange(next);
    };
    reader.readAsDataURL(file);
  }

  function remove(index: number) {
    const next = [...slots];
    next[index] = "";
    onChange(next);
  }

  return <fieldset className={`product-image-editor ${compact ? "compact" : ""}`}>
    <legend>Fotos do produto</legend>
    <p>A primeira foto será a principal. Você pode adicionar até quatro imagens.</p>
    <div className="product-image-slots">
      {slots.map((image, index) => <div className="product-image-slot" key={index}>
        <label className={image ? "has-image" : ""} style={image ? { backgroundImage: `url(${image})` } : undefined}>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => pick(index, event.target.files?.[0])} />
          {!image ? <><b>+</b><span>{index === 0 ? "Foto principal" : `Foto ${index + 1}`}</span></> : <span>Trocar foto</span>}
        </label>
        {image ? <button type="button" onClick={() => remove(index)} aria-label={`Remover foto ${index + 1}`}>Remover</button> : null}
      </div>)}
    </div>
    <small>PNG, JPG ou WebP · máximo 3 MB por imagem</small>
  </fieldset>;
}
