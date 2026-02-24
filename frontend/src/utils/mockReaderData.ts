export interface Comment {
  id: string;
  readerName: string;
  bookTitle: string;
  text: string;
  timestamp: string;
}

export interface TopFan {
  id: string;
  readerName: string;
  totalReads: number;
  totalRatings: number;
  totalComments: number;
  engagementScore: number;
}

export interface ReaderData {
  comments: Comment[];
  topFans: TopFan[];
}

export function getMockReaderData(): ReaderData {
  return {
    comments: [
      {
        id: '1',
        readerName: 'Sarah Johnson',
        bookTitle: 'The Midnight Garden',
        text: 'Absolutely loved this book! The characters were so well-developed and the plot kept me engaged from start to finish.',
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        readerName: 'Michael Chen',
        bookTitle: 'Echoes of Tomorrow',
        text: 'A masterpiece of science fiction. The world-building is incredible and the themes are thought-provoking.',
        timestamp: '1 day ago',
      },
      {
        id: '3',
        readerName: 'Emma Williams',
        bookTitle: 'The Midnight Garden',
        text: 'This is my third time reading this book. It gets better every time! Thank you for creating such a beautiful story.',
        timestamp: '3 days ago',
      },
    ],
    topFans: [
      {
        id: '1',
        readerName: 'Alex Thompson',
        totalReads: 12,
        totalRatings: 12,
        totalComments: 8,
        engagementScore: 95,
      },
      {
        id: '2',
        readerName: 'Jessica Martinez',
        totalReads: 10,
        totalRatings: 10,
        totalComments: 6,
        engagementScore: 87,
      },
      {
        id: '3',
        readerName: 'David Lee',
        totalReads: 8,
        totalRatings: 8,
        totalComments: 5,
        engagementScore: 78,
      },
      {
        id: '4',
        readerName: 'Sophie Anderson',
        totalReads: 7,
        totalRatings: 7,
        totalComments: 4,
        engagementScore: 72,
      },
      {
        id: '5',
        readerName: 'Ryan Cooper',
        totalReads: 6,
        totalRatings: 6,
        totalComments: 3,
        engagementScore: 65,
      },
    ],
  };
}
