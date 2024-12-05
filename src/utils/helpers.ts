import crypto from 'crypto';
import fs from 'fs';

export const randomId = () => crypto.randomUUID().replace(/-/g, '');

export const getUUID = () => crypto.randomUUID();
export const createFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const getChalk = async () => {
  const chalk = (await import('chalk')).default;
  return chalk;
};

export function buildSelect<TDto>(): Record<keyof TDto, any> {
  const isObject = (value: unknown): value is object =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  return new Proxy(
    {},
    {
      get: (_, key: string) => {
        // Nếu giá trị là object, tiếp tục đệ quy
        const nestedKeyType = {} as TDto[keyof TDto];
        return isObject(nestedKeyType) ? buildSelect() : true;
      }
    }
  ) as Record<keyof TDto, any>;
}
