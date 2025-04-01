export interface Session {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface Filters {
    title?: string;
    content?: string;
    tags?: string[];
    template?: string;
    author?: string;
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    totalPages: number;
    totalSize: number;
}

export interface User {
    id?: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    avatar?: string;
    phoneNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Template {
    id: number;
    title: string;
    explanation?: string;
    tags: string[];
    forkedSourceId?: number;
    author: User;
    authorId?: number;
    content: string;
    language: string;
    modifiedAt: string;
}

export interface BlogPost {
    id: number;
    title: string;
    description: string;
    tags: string[];
    createdAt: Date;
    flagged: boolean;
    upvoteCount: number;
    downvoteCount: number;
    reportsCount: number;
    hidden: boolean;
    author: User;
    codeTemplates: Template[];
}

export interface Comment {
    id: number;
    content: string;
    parentCommentId?: number;
    blogPostId?: number;
    tags: string[];
    createdAt: Date;
    flagged: boolean;
    upvoteCount: number;
    downvoteCount: number;
    reportsCount: number;
    hidden: boolean;
    author: User;
    replies: Comment[];
}

export interface Report {
    id: number;
    explanation: string;
    blogPostId?: number;
    commentId?: number;
}


export interface Interaction {
    id: number;
    userId: number;
    type: string;
    question?: string;
    imageUrl?: string;
    timestamp: Date;
}

export interface InteractionHistory {
    interactions: Interaction[]; // list of interactions
    deleted: boolean; // if the user has deleted their account, we should not show their history
    numberOfInteractions: number; // number of interactions the user has made
}
export type OpenAIVoice = 'alloy' | 'echo' | 'coral' | 'ash';


export type Message = {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: any;
  timestamp?: Date;
};
