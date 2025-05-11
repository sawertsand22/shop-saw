// shared/components/shared/design-editor/DesignEditor.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, X, ImageIcon, ShoppingCart } from "lucide-react";
import { InferenceClient } from "@huggingface/inference";
import { useRouter } from "next/navigation";


import { useCartStore } from "@/shared/store/cart";
import toast from "react-hot-toast";


export const DesignEditor: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Функция загрузки изображения пользователем
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Сброс редактора
  const resetEditor = () => {
    setUploadedImage(null);
    setRotation(0);
    setScale(1);
    setPrompt("");
  };

  // Поворот изображения
  const rotateImage = (direction: "left" | "right") => {
    setRotation((prev) => (direction === "left" ? prev - 15 : prev + 15));
  };

  // Масштабирование изображения
  const zoomImage = (zoomType: "in" | "out") => {
    setScale((prev) => (zoomType === "in" ? prev + 0.1 : Math.max(prev - 0.1, 0.1)));
  };

  // Генерация изображения с помощью Hugging Face
  const generateImageFromPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const client = new InferenceClient(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY as string);
      const response = await client.textToImage({
        provider: "together",
        model: "black-forest-labs/FLUX.1-dev",
        inputs: prompt,
        parameters: { num_inference_steps: 5 },
      });

      // Проверяем, является ли ответ Blob (через наличие метода size)
    if (response && typeof response === "object" && "size" in response) {
      const blob = response as Blob;
      const imageUrl = URL.createObjectURL(blob);
      setUploadedImage(imageUrl);

      } else {
        throw new Error("Ответ от API не является изображением");
      }
    } catch (error) {
      console.error("Ошибка генерации изображения:", error);
      alert("Не удалось создать изображение. Проверьте ваш API ключ.");
    } finally {
      setLoading(false);
    }
  };

  // Добавление кастомного дизайна в корзину
 const [addCustomDesignItem, storeloading] = useCartStore((s) => [s.addCustomDesignItem, s.loading]);

const addToCart = async () => {
  if (!uploadedImage) {
    toast.error("Сначала загрузите изображение!");
    return;
  }

  try {
    await addCustomDesignItem(uploadedImage, 1500);
    toast.success("Дизайн добавлен в корзину");
    router.push("/cart"); // можно также router.refresh() для SSR страниц
  } catch (error) {
    console.error("Ошибка при добавлении:", error);
    toast.error("Не удалось добавить в корзину");
  }
};


  return (
    <div className="flex flex-col items-center mt-10">
      <div className="relative w-[300px] h-[400px] bg-neutral-100 border rounded-md overflow-hidden">
        <Image src="/assets/images/tshirt-base.jpg" alt="T-Shirt" width={300} height={400} />
        
        <div className="absolute inset-0 flex items-center justify-center">
          {uploadedImage ? (
            <TransformWrapper initialScale={1}>
              <TransformComponent>
                <img
                  src={uploadedImage}
                  alt="Design"
                  className="max-w-[250px] max-h-[350px]"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                  }}
                />
              </TransformComponent>
            </TransformWrapper>
          ) : (
            <p className="text-sm text-gray-500">Загрузите изображение или создайте с помощью AI</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Загрузить изображение
        </Button>
        <Button variant="outline" onClick={resetEditor}>
          Очистить <X className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={addToCart} disabled={!uploadedImage || storeloading}>
          {loading ? "Добавление..." : "Добавить в корзину"} <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-[300px]"
          placeholder="Введите описание (prompt)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={generateImageFromPrompt} disabled={loading}>
          {loading ? "Создание..." : "Создать изображение"} <ImageIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {uploadedImage && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => rotateImage("left")}>
            Повернуть влево <RotateCcw className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => rotateImage("right")}>
            Повернуть вправо <RotateCw className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => zoomImage("in")}>
            Увеличить <ZoomIn className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => zoomImage("out")}>
            Уменьшить <ZoomOut className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
