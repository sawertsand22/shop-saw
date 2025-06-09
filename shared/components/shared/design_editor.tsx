'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import NextImage from 'next/image';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, X, ImageIcon, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/shared/store/cart';
import toast from 'react-hot-toast';
import { tshirtSizes, tshirtTypes } from '@/shared/constants/tshirt';

type DesignImage = {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export const DesignEditor: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<DesignImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [addCustomDesignItem, storeLoading] = useCartStore((s) => [s.addCustomDesignItem, s.loading]);

  const [size, setSize] = useState<number>(() => Number(tshirtSizes[0]?.value ?? 30));
  const [tshirtType, setTshirtType] = useState<number>(() => Number(tshirtTypes[0]?.value ?? 1));

  const modelOptions = [
    { label: 't-shirt diffusion', model: 'RREKVLd' },
    { label: 'XXMix_9realistic', model: 'Y99mNKb' },
    { label: 'Landscapes mix', model: 'X9zNVO1' },
    { label: 'Unvail AI 3DKX', model: 'mG22KJg' },
    { label: 'Hassaku', model: '76EmEaz' },
    { label: 'epiCRealism', model: 'woojZkD' },
  ];
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const id = crypto.randomUUID();
        const newImage: DesignImage = {
          id,
          src: reader.result as string,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        };
        setUploadedImages((prev) => [...prev, newImage]);
        setActiveImageId(id);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const image = uploadedImages.find((img) => img.id === id);
    if (!image) return;

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setUploadedImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, x: image.x + dx, y: image.y + dy } : img))
      );
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const modifyActiveImage = (mod: Partial<Pick<DesignImage, 'rotation' | 'scale'>>) => {
    if (!activeImageId) return;
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === activeImageId ? { ...img, ...mod } : img
      )
    );
  };

  const resetEditor = () => {
    setUploadedImages([]);
    setActiveImageId(null);
    setPrompt('');
  };

  const generateImageFromPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const token = process.env.NEXT_PUBLIC_SINKIN_API_KEY as string;

      formData.append('access_token', token);
      formData.append('model_id', selectedModel.model);
      formData.append('prompt', prompt);
      formData.append('num_images', '1');
      formData.append('width', '512');
      formData.append('height', '512');
      formData.append('scale', '7');
      formData.append('steps', '20');
      formData.append('use_default_neg', 'true');
      formData.append('scheduler', 'DPMSolverMultistep');

      const response = await fetch('https://sinkin.ai/api/inference', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error_code === 0 && Array.isArray(result.images)) {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(result.images[0])}`;
        const imgRes = await fetch(proxyUrl);
        const blob = await imgRes.blob();
        const localUrl = URL.createObjectURL(blob);
        const id = crypto.randomUUID();
        setUploadedImages((prev) => [...prev, { id, src: localUrl, x: 0, y: 0, scale: 1, rotation: 0 }]);
        setActiveImageId(id);
      } else {
        throw new Error(result.message || 'Ошибка генерации');
      }
    } catch (err) {
      console.error('❌ Ошибка генерации:', err);
      toast.error('Ошибка генерации изображения');
    } finally {
      setLoading(false);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const renderToCanvas = async (): Promise<string | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const tshirt = await loadImage('/assets/images/tshirt-base.png');
    ctx.drawImage(tshirt, 0, 0, 300, 400);

    for (const img of uploadedImages) {
      const design = await loadImage(img.src);
      ctx.save();
      ctx.translate(150 + img.x, 200 + img.y);
      ctx.rotate((img.rotation * Math.PI) / 180);
      ctx.scale(img.scale, img.scale);
      ctx.globalAlpha = 0.75;
      ctx.drawImage(design, -75, -75, 150, 150);
      ctx.restore();
    }

    const mask = await loadImage('/assets/images/tshirt-mask.png'); // или сделай PNG-маску
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, 300, 400);

    return canvas.toDataURL('image/png');
  };

  const addToCart = async () => {
    const image = await renderToCanvas();
    if (!image) return toast.error('Не удалось собрать изображение');

    try {
      await addCustomDesignItem(image, 1500, size, tshirtType);
      toast.success('Футболка с дизайном добавлена в корзину');
      router.push('/cart');
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      toast.error('Не удалось добавить в корзину');
    }
  };

  const activeImage = uploadedImages.find((img) => img.id === activeImageId);

  return (
    <div className="flex flex-col items-center mt-10 gap-4">
      <div className="relative w-[300px] h-[400px] border rounded-md overflow-hidden bg-neutral-100">
        {/* Маска обрезки */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: 'url(/assets/svg/tshirt-mask.svg)',
            maskImage: 'url(/assets/svg/tshirt-mask.svg)',
            WebkitMaskSize: '300px 400px',
            maskSize: '300px 400px',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        >
          {uploadedImages.map((img) => (
            <img
              key={img.id}
              src={img.src}
              onMouseDown={(e) => handleDragStart(e, img.id)}
              onClick={() => setActiveImageId(img.id)}
              className={`absolute max-w-[250px] max-h-[350px] cursor-move ${img.id === activeImageId ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${img.x}px, ${img.y}px) rotate(${img.rotation}deg) scale(${img.scale})`,
              }}
            />
          ))}
        </div>

        {/* Футболка как фон */}
        <div className="absolute inset-0 -z-10">
          <NextImage
            src="/assets/images/tshirt-base.png"
            alt="T-Shirt"
            width={300}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <input ref={inputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>Загрузить</Button>
        <Button variant="outline" onClick={resetEditor}>Очистить <X className="ml-2 h-4 w-4" /></Button>
        <Button onClick={addToCart} disabled={uploadedImages.length === 0 || storeLoading}>
          {storeLoading ? 'Добавление...' : 'Добавить в корзину'} <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Размер</label>
          <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
            <SelectTrigger><SelectValue placeholder="Выберите размер" /></SelectTrigger>
            <SelectContent>{tshirtSizes.map((size) => <SelectItem key={size.value} value={size.value.toString()}>{size.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Футболка</label>
          <Select value={tshirtType.toString()} onValueChange={(value) => setTshirtType(Number(value))}>
            <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
            <SelectContent>{tshirtTypes.map((type) => <SelectItem key={type.value} value={type.value.toString()}>{type.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full max-w-md">
        <label className="block text-sm font-medium mb-1">Модель генерации</label>
        <Select value={selectedModel.model} onValueChange={(value) => {
          const found = modelOptions.find((m) => m.model === value);
          if (found) setSelectedModel(found);
        }}>
          <SelectTrigger><SelectValue placeholder="Выберите модель" /></SelectTrigger>
          <SelectContent>{modelOptions.map((option) => <SelectItem key={option.model} value={option.model}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 w-full max-w-md">
        <Input type="text" placeholder="Введите prompt для генерации" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button onClick={generateImageFromPrompt} disabled={loading}>
          {loading ? 'Создание...' : 'Создать'} <ImageIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {activeImage && (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => modifyActiveImage({ rotation: activeImage.rotation - 15 })}><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => modifyActiveImage({ rotation: activeImage.rotation + 15 })}><RotateCw className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => modifyActiveImage({ scale: activeImage.scale + 0.1 })}><ZoomIn className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => modifyActiveImage({ scale: Math.max(activeImage.scale - 0.1, 0.1) })}><ZoomOut className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
};
