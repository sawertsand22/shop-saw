export const mapTshirtSize = {
  44: 'S (44-46)',
  46: 'M (46-48)',
  48: 'L (48-50)',
  50: 'XL (50-52)',
  52: '2XL (52-54)',
  54: '3XL (54-56)',
  58: '4XL (58-60)',
} as const;

export const mapTshirtType = {
  1: 'классическая',
  2: 'оверсайз',
} as const;

export const tshirtSizes = Object.entries(mapTshirtSize).map(([value, name]) => ({
  name,
  value,
}));

export const tshirtTypes = Object.entries(mapTshirtType).map(([value, name]) => ({
  name,
  value,
}));

export type TshirtSize = keyof typeof mapTshirtSize;
export type TshirtType = keyof typeof mapTshirtType;
