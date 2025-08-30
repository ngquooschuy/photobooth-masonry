export type ApiResponse = {
  items: {
    id: string;
    name: string;
    url: string;
    size: number;
    createdAt: number;
    width?: number;
    height?: number;
    tags: string[];
  }[];
  next_cursor: string | null;
};

export type ImgItem = {
  id: string;
  name: string;
  url: string; // blob URL or data URL
  size: number;
  createdAt: number;
  width?: number;
  height?: number;
  tags: string[]; // array of tags without # prefix
};
