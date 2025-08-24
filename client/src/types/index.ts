export type User = {
  _id: string
  email: string
  name: string
  avatar?: string
  roles: string[]
}

export type Option = {
  _id?: string
  text: string
  points: number
  isCorrect: boolean
}

export type Question = {
  _id?: string
  questionText: string
  explanation?: string
  points?: number
  options: Option[]
}

export type Quiz = {
  _id: string
  title: string
  author: User | string
  description?: string
  tags: string[]
  maxPoints: number
  isPrivate: boolean
  visibility: 'private' | 'public'
  questions: Question[]
  createdAt: string
  updatedAt: string
}
