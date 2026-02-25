export interface HumanizeRequest {
  content: string
  language?: string
  preview?: boolean
  variables?: HumanizeVariable[],
  keywords?: string,
  personal?: string,
  highQuality?: number
  highPassRate?: number
}
export interface HumanizeVariable {
  name: string
  value: string
}

export enum HumanizeStatus {
  FINISH = "FINISH",
  FAILED = "FAILED",
}

export interface HumanizeInfo {
  id: string
  words: string
  success: boolean
}

export interface HumanizeResult {
  id: string
  result: string
  status: HumanizeStatus
  errorMsg: string,
  requestID: string
}

export interface DetectResult {
  name: string
  ratio: number
  isHuman: boolean
}

export enum Readability {
  HighSchool = "High School",
  University = "University",
  Doctorate = "Doctorate",
  Journalist = "Journalist",
  Marketing = "Marketing",
}

export enum Purpose {
  GeneralWriting = "General Writing",
  Essay = "Essay",
  Article = "Article",
  MarketingMaterial = "Marketing Material",
  Story = "Story",
  CoverLetter = "Cover Letter",
  Report = "Report",
  BusinessMaterial = "Business Material",
  LegalMaterial = "Legal Material",
}

export enum Strength {
  Quality = "Quality",
  Balanced = "Balanced",
  MoreHuman = "More Human",
}

export interface Variable {
  variable: string
  options?: VariableOption[]
}

export interface VariableOption {
  option: string
  prompt: string
  configs?: VariableOptionTranslation[]
}

export interface VariableOptionTranslation {
  language: string
  value: string
  promptValue: string
}

export interface EventData {
  fbp: string
  fbc: string
  eventId: string
  event: string
  sourceUrl: string
  externalId: string
  customData: {
    value: number
    currency: string
    contentName: string
    content_category: string
    content_ids: [string]
    contents: [string]
    contentType: string
  },
  userSource: string
}

export interface MessageResponse {
  chatId: string
  reply: string
  chatName: string
  tool: string
}
export interface GetChatMessagePosponse {
  chatId: string
  chatName: string
  tool: string
  messages: { role: "user" | "assistant"; message: string }[]
}

export interface GetChatsHistoryResponse {
  chatId: string
  chatName: string
  date: string
}

export interface ChildContentRef {
  handleSetKeywords(keywords: string): void;
  handleSetPersonal(personal: string): void;
  handleMoreContent: (content: string) => void;
}

export interface ChildKeyWordsRef {
  handleSetContent: (type: number, content: string) => void;
}

export interface messageContext {
  keywords: string,
  personal: string
}
