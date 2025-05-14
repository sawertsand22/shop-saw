import { ProductItem } from '@prisma/client';
import { TshirtType, tshirtSizes } from '../constants/tshirt';
import { Variant } from '../components/shared/group-variants';

export const getAvailableTshirtSizes = (type: TshirtType, items: ProductItem[]): Variant[] => {
  const filteredTshirtsByType = items.filter((item) => item.tshirtType === type);

  return tshirtSizes.map((item) => ({
    name: item.name,
    value: item.value,
    disabled: !filteredTshirtsByType.some((tshirt) => Number(tshirt.size) === Number(item.value)),
  }));
};
