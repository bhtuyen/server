import crypto from 'crypto';
import fs from 'fs';
import z from 'zod';

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


type SelectShape<T extends z.ZodTypeAny> =
  T extends z.ZodObject<infer Shape>
    ? { [K in keyof Shape]: Shape[K] extends z.ZodObject<any> ? { select: SelectShape<Shape[K]> } : true }
    : never;
export function buildSelect<T extends z.ZodObject<any>>(schema: T): SelectShape<T> {
  const shape = schema._def.shape(); // Lấy cấu trúc của schema

  const select = Object.entries(shape).reduce((acc, [key, value]) => {
    if (value instanceof z.ZodObject) {
      acc[key] = { select: buildSelect(value) }; // Đệ quy xử lý schema con
    } else {
      acc[key] = true; // Gán true cho các key thông thường
    }
    return acc;
  }, {} as any);

  return select;
}
