'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import NextImage from 'next/image';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, X, ImageIcon, ShoppingCart } from 'lucide-react';
import { InferenceClient } from '@huggingface/inference';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/shared/store/cart';
import toast from 'react-hot-toast';

export const DesignEditor: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [addCustomDesignItem, storeLoading] = useCartStore((s) => [s.addCustomDesignItem, s.loading]);

  const modelOptions = [
    {
      label: 'FLUX-1 (HuggingFace)',
      provider: 'hf-inference',
      model: 'black-forest-labs/FLUX.1-dev',
    },
    {
      label: 'HiDream I1 (Fal AI)',
      provider: 'hf-inference',
      model: 'HiDream-ai/HiDream-I1-Full',
    },
  ];
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);

  const dragRef = useRef<HTMLImageElement>(null);

  const handleDragStart = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = position.x;
    const initY = position.y;

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPosition({ x: initX + dx, y: initY + dy });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const resetEditor = () => {
    setUploadedImage(null);
    setRotation(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setPrompt('');
  };

  const rotateImage = (dir: 'left' | 'right') => {
    setRotation((prev) => (dir === 'left' ? prev - 15 : prev + 15));
  };

  const zoomImage = (dir: 'in' | 'out') => {
    setScale((prev) => (dir === 'in' ? prev + 0.1 : Math.max(prev - 0.1, 0.1)));
  };

  const generateImageFromPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const client = new InferenceClient(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY as string);
      const response = await client.textToImage({
        provider: selectedModel.provider as any,
        model: selectedModel.model,
        inputs: prompt,
        parameters: { num_inference_steps: 5 },
      });

      if (response && typeof response === 'object' && 'size' in response) {
        const blob = response as Blob;
        const imageUrl = URL.createObjectURL(blob);
        setUploadedImage(imageUrl);
      } else {
        throw new Error('Ответ от API не является изображением');
      }
    } catch (err) {
      console.error('Ошибка генерации:', err);
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
  if (!uploadedImage) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const tshirt = await loadImage('/assets/images/tshirt-base.png');
  const design = await loadImage(uploadedImage);

  // Фон
  ctx.drawImage(tshirt, 0, 0, 300, 400);

  // Печать дизайна
  ctx.save();
  ctx.translate(150 + position.x, 200 + position.y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);

  const VISUAL_WIDTH = 150;
  const VISUAL_HEIGHT = 150;

  ctx.globalAlpha = 0.75; // прозрачность
  //ctx.globalCompositeOperation = 'multiply'; // "впечатывание"
  ctx.drawImage(design, -VISUAL_WIDTH / 2, -VISUAL_HEIGHT / 2, VISUAL_WIDTH, VISUAL_HEIGHT);
  ctx.restore();

  // Восстановить обычный режим
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // [необязательно] Текстура ткани сверху
  const texture = await loadImage('/assets/images/fabric-texture.png');
  ctx.globalAlpha = 0.3;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(texture, 0, 0, 300, 400);

  return canvas.toDataURL('image/png');
};



  const addToCart = async () => {
    const image = await renderToCanvas();
    if (!image) return toast.error('Не удалось собрать изображение');

    try {
      await addCustomDesignItem(image, 1500);
      toast.success('Дизайн добавлен в корзину');
      router.push('/cart');
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      toast.error('Не удалось добавить в корзину');
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      {/* Preview block */}
      <div className="relative w-[300px] h-[400px] bg-neutral-100 border rounded-md overflow-hidden">
        <NextImage src="/assets/images/tshirt-base.png" alt="T-Shirt" width={300} height={400} />
        <div className="absolute inset-0">
          {uploadedImage && (
            <img
              ref={dragRef}
              src={uploadedImage}
              onMouseDown={handleDragStart}
              alt="Design"
              className="absolute max-w-[250px] max-h-[350px] cursor-move"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
              }}
            />
          )}
        </div>
      </div>

      {/* Upload / Reset / Add */}
      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Загрузить
        </Button>
        <Button variant="outline" onClick={resetEditor}>
          Очистить <X className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={addToCart} disabled={!uploadedImage || storeLoading}>
          {loading ? 'Добавление...' : 'Добавить в корзину'} <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Model selector */}
      <div className="mt-4 flex gap-2 items-center">
        <label className="text-sm font-medium">Модель:</label>
        <select
          className="border px-3 py-2 rounded"
          value={selectedModel.model}
          onChange={(e) => {
            const found = modelOptions.find((m) => m.model === e.target.value);
            if (found) setSelectedModel(found);
          }}
        >
          {modelOptions.map((option) => (
            <option key={option.model} value={option.model}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prompt / Generate */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-[300px]"
          placeholder="Введите prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={generateImageFromPrompt} disabled={loading}>
          {loading ? 'Создание...' : 'Создать'} <ImageIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Rotate / Zoom */}
      {uploadedImage && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => rotateImage('left')}>
            Влево <RotateCcw className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => rotateImage('right')}>
            Вправо <RotateCw className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => zoomImage('in')}>
            + <ZoomIn className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => zoomImage('out')}>
            – <ZoomOut className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
