const formats = {
  avatar: {
    height: 100,
    width: 100
  },
  banner: {
    height: 1080,
    width: 1920
  },
  poster: {
    height: 160,
    width: 120
  }
} as const;

export type Formats = keyof typeof formats;

export function getRatio(format: Formats) {
  const { height, width } = format[format];
  return width/height;
}
