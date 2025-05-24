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

import { tshirtSizes as tshirtSizes, tshirtTypes as tshirtTypes } from '@/shared/constants/tshirt';

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

  const [size, setSize] = useState<number>(() => Number(tshirtSizes[0]?.value ?? 30));
  const [tshirtType, setTshirtType] = useState<number>(() => Number(tshirtTypes[0]?.value ?? 1));

  const modelOptions = [
    { label: 't-shirt diffusion', model: 'RREKVLd' },
    { label: 'Reliberate', model: 'meLy25wO' },
    { label: 'Landscapes mix', model: 'X9zNVO1' },
    { label: 'Unvail AI 3DKX', model: 'mG22KJg' },
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
    const formData = new FormData();
    const token = process.env.NEXT_PUBLIC_SINKIN_API_KEY as string;

    console.log('📦 prompt:', prompt);
    console.log('📦 model_id:', selectedModel.model);
    console.log('📦 access_token (должен быть непустой):', token);

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

    const text = await response.text();
    console.log('📥 Ответ от API:', text); // 🔍 Показывает весь текст

    const result = JSON.parse(text);

    if (result.error_code === 0 && Array.isArray(result.images)) {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(result.images[0])}`;
const imgRes = await fetch(proxyUrl);
const blob = await imgRes.blob();
const localUrl = URL.createObjectURL(blob);
setUploadedImage(localUrl);

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
    if (!uploadedImage) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const tshirt = await loadImage('/assets/images/tshirt-base.png');
    const design = await loadImage(uploadedImage);

    ctx.drawImage(tshirt, 0, 0, 300, 400);

    ctx.save();
    ctx.translate(150 + position.x, 200 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    const VISUAL_WIDTH = 150;
    const VISUAL_HEIGHT = 150;

    ctx.globalAlpha = 0.75;
    ctx.drawImage(design, -VISUAL_WIDTH / 2, -VISUAL_HEIGHT / 2, VISUAL_WIDTH, VISUAL_HEIGHT);
    ctx.restore();

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
      await addCustomDesignItem(image, 1500, size, tshirtType);
      toast.success('Футболка с дизайном добавлена в корзину');
      router.push('/cart');
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      toast.error('Не удалось добавить в корзину');
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 gap-4">
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

      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Загрузить
        </Button>
        <Button variant="outline" onClick={resetEditor}>
          Очистить <X className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={addToCart} disabled={!uploadedImage || storeLoading}>
          {storeLoading ? 'Добавление...' : 'Добавить в корзину'} <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Размер</label>
          <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите размер" />
            </SelectTrigger>
            <SelectContent>
              {tshirtSizes.map((size) => (
                <SelectItem key={size.value} value={size.value.toString()}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Футболка</label>
          <Select value={tshirtType.toString()} onValueChange={(value) => setTshirtType(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {tshirtTypes.map((type) => (
                <SelectItem key={type.value} value={type.value.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full max-w-md">
        <label className="block text-sm font-medium mb-1">Модель генерации</label>
        <Select
          value={selectedModel.model}
          onValueChange={(value) => {
            const found = modelOptions.find((m) => m.model === value);
            if (found) setSelectedModel(found);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите модель" />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option) => (
              <SelectItem key={option.model} value={option.model}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 w-full max-w-md">
        <Input
          type="text"
          placeholder="Введите prompt для генерации"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={generateImageFromPrompt} disabled={loading}>
          {loading ? 'Создание...' : 'Создать'} <ImageIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {uploadedImage && (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => rotateImage('left')}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => rotateImage('right')}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => zoomImage('in')}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => zoomImage('out')}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
