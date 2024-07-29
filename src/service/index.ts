export interface SingUpData {
  name: string;
  password: string;
  email: string;
  username: string;
}

export interface SingInData {
  username?: string;
  email?: string;
  password: string;
}

export interface PostData {
  content: string;
  parentId?: string;
  images?: File[];
}

export interface Post {
  id: string;
  content: string;
  parentId?: string;
  images?: string[];
  createdAt: Date;
  authorId: string;
  author: UserViewDTO;
  reactions: Reaction[];
  comments: Post[];
  qtyComments: number;
  qtyLikes: number;
  qtyRetweets: number;
}

export enum ReactionType {
  Like = "Like",
  Retweet = "Retweet"
}

export interface Reaction {
  id: string;
  reactionType: ReactionType;
  createdAt: Date;
  authorId: string;
  postId: string;
  updatedAt: Date;
  deletedAt?: Date;
}
export interface UserViewDTO {
  id: string;
  name?: string;
  username: string;
  profilePicture?: string;
  isPrivate: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name?: string;
  username: string;
  profilePicture?: string;
  private: boolean;
  createdAt: Date;
  followers: UserViewDTO[];
  following: UserViewDTO[];
  posts: Post[];
}

export interface MessageDTO {
  id: string;
  content: string;
  createdAt: Date;
  chatId: string;
  senderId: string;
  sender: UserViewDTO;
}

export interface ChatDTO {
  id: string;
  users: UserViewDTO[];
  messages: MessageDTO[];
}
