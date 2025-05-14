import { TshirtSize, TshirtType } from '@/shared/constants/tshirt';
import React from 'react';
import { Variant } from '../components/shared/group-variants';
import { useSet } from 'react-use';
import { getAvailableTshirtSizes } from '../lib';
import { ProductItem } from '@prisma/client';

interface ReturnProps {
  size: TshirtSize;
  type: TshirtType;
  selectedIngredients: Set<number>;
  availableSizes: Variant[];
  currentItemId?: number;
  setSize: (size: TshirtSize) => void;
  setType: (size: TshirtType) => void;
  addIngredient: (id: number) => void;
}

export const useTshirtOptions = (items: ProductItem[]): ReturnProps => {
  const [size, setSize] = React.useState<TshirtSize>(44);
  const [type, setType] = React.useState<TshirtType>(1);
  const [selectedIngredients, { toggle: addIngredient }] = useSet(new Set<number>([]));

  const availableSizes = getAvailableTshirtSizes(type, items);

  const currentItemId = items.find((item) => item.pizzaType === type && item.size === size)?.id;

  React.useEffect(() => {
    const isAvailableSize = availableSizes?.find(
      (item) => Number(item.value) === size && !item.disabled,
    );
    const availableSize = availableSizes?.find((item) => !item.disabled);

    if (!isAvailableSize && availableSize) {
      setSize(Number(availableSize.value) as TshirtSize);
    }
  }, [type]);

  return {
    size,
    type,
    selectedIngredients,
    availableSizes,
    currentItemId,
    setSize,
    setType,
    addIngredient,
  };
};
