export interface Point {
  x: number;
  y: number;
}

export interface Cursor {
  nickname: string;
  x: number;
  y: number;
}

export interface BoardElement {
  id: string;
  boardId: string;
  pageId: string;
  type: string;
  jsonData: string;
  authorNickname: string;
  zIndex: number;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  createdAt: string;
  pagesCount: number;
  membersCount: number;
  pages: BoardPage[];
}

export interface BoardPage {
  id: string;
  order: number;
  thumbnailUrl: string | null;
  elements: BoardElement[];
}