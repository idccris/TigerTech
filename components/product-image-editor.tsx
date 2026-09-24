"use client";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onError: (message: string) => void;
  compact?: boolean;
};

export default function ProductImageEditor({ images, onChange, onError, compact = false }: Props) {
  const slots = Array.from({ length: 4 }, (_, index) => images[index] || "");

  async function optimize(file: File) {
    const source = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new window.Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Imagem inválida"));
        element.src = source;
      });
      const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.7, 0.58]) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size <= 700_000) return blob;
      }
      throw new Error("A foto continuou muito grande após a otimização.");
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  async function pick(index: number, file?: File) {
    if (!file) return;
    if (!/^image\/(?:png|jpeg|webp)$/.test(file.type)) {
      onError("Selecione uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onError("A imagem original deve ter no máximo 8 MB.");
      return;
    }
    try {
      const optimized = await optimize(file);
      const reader = new FileReader();
      reader.onload = () => {
        const next = [...slots];
        next[index] = String(reader.result || "");
        onError("");
        onChange(next);
      };
      reader.readAsDataURL(optimized);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Não foi possível processar a imagem.");
    }
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
    <small>PNG, JPG ou WebP · otimização automática · arquivo original de até 8 MB</small>
  </fieldset>;
}
