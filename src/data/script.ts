import { CharacterId } from "../config";

// アニメーションの型定義
export type AnimationType = "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn" | "bounce";

// ビジュアルの型定義
export interface VisualContent {
  type: "image" | "text" | "none";
  src?: string;
  text?: string;
  fontSize?: number;
  color?: string;
  animation?: AnimationType;
}

// 効果音の型定義
export interface SoundEffect {
  src: string;
  volume?: number;
}

// BGM設定
export interface BGMConfig {
  src: string;
  volume?: number;
  loop?: boolean;
}

// BGM設定（動画全体で使用）
export const bgmConfig: BGMConfig | null = null;

// セリフデータの型定義
export interface ScriptLine {
  id: number;
  character: CharacterId;
  text: string;
  displayText?: string;
  scene: number;
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  emotion?: "normal" | "happy" | "surprised" | "thinking" | "sad";
  visual?: VisualContent;
  se?: SoundEffect;
}

// シーン定義
export interface SceneInfo {
  id: number;
  title: string;
  background: string;
  backgroundImage?: string;
  backgroundColor?: string; 
}

export const scenes: SceneInfo[] = [
  {
    "id": 1,
    "title": "シーン1",
    "background": "image",
    "backgroundImage": "imported/260207_1.png"
  },
  {
    "id": 2,
    "title": "シーン2",
    "background": "image",
    "backgroundImage": "imported/260207_2.png"
  },
  {
    "id": 3,
    "title": "シーン3",
    "background": "image",
    "backgroundImage": "imported/260207_3.png"
  },
  {
    "id": 4,
    "title": "シーン4",
    "background": "image",
    "backgroundImage": "imported/260207_4.png"
  },
  {
    "id": 5,
    "title": "シーン5",
    "background": "image",
    "backgroundImage": "imported/260207_5.png"
  },
  {
    "id": 6,
    "title": "シーン6",
    "background": "image",
    "backgroundImage": "imported/260207_6.png"
  },
  {
    "id": 7,
    "title": "シーン7",
    "background": "image",
    "backgroundImage": "imported/260207_7.png"
  }
];

// このファイルは config/script.yaml から自動生成されます
// 編集する場合は config/script.yaml を編集して npm run sync-script を実行してください
export const scriptData: ScriptLine[] = [
  {
    "id": 1,
    "character": "zundamon",
    "text": "2月7日、今日はフナの日。運気の波に乗ってスイスイ進めるのはどの星座？",
    "displayText": "2月7日の運勢ランキング",
    "scene": 1,
    "pauseAfter": 10,
    "voiceFile": "01_zundamon.wav",
    "durationInFrames": 240
  },
  {
    "id": 3,
    "character": "gaoyan",
    "text": "10位から12位の運勢はこちら。深呼吸して、自分を労わる時間を作ってね。",
    "displayText": "10位 魚座：無理せず休息を（水色） 11位 射手座：忘れ物に注意（ポーチ） 12位 乙女座：優先順位を整理（白）",
    "scene": 2,
    "pauseAfter": 10,
    "voiceFile": "03_gaoyan.wav",
    "durationInFrames": 221
  },
  {
    "id": 5,
    "character": "zundamon",
    "text": "第3位は、おひつじ座。直感が冴えわたる日！迷わず進むのが正解だよ。",
    "displayText": "3位 牡羊座：直感を信じて即行動（赤色/スニーカー/朝の散歩）",
    "scene": 3,
    "pauseAfter": 10,
    "voiceFile": "05_zundamon.wav",
    "durationInFrames": 252
  },
  {
    "id": 7,
    "character": "gaoyan",
    "text": "第2位は、ふたご座。コミュニケーションが絶好調！懐かしい人から連絡があるかも。",
    "displayText": "3位 牡羊座：直感を信じて即行動（赤色/スニーカー/朝の散歩）",
    "scene": 4,
    "pauseAfter": 10,
    "voiceFile": "07_gaoyan.wav",
    "durationInFrames": 226
  },
  {
    "id": 10,
    "character": "zundamon",
    "text": "栄光の第1位は、しし座！あなたの魅力が爆発する最高の日。今日はあなたが主役だよ！",
    "displayText": "3位 牡羊座：直感を信じて即行動（赤色/スニーカー/朝の散歩）",
    "scene": 5,
    "pauseAfter": 10,
    "voiceFile": "10_zundamon.wav",
    "durationInFrames": 289
  },
  {
    "id": 14,
    "character": "gaoyan",
    "text": "最後に今日の名言。人生とは、自分を見つけることではない。自分を創ることだ。",
    "displayText": "人生とは、自分を見つけることではない。自分を創ることだ。",
    "scene": 6,
    "pauseAfter": 10,
    "voiceFile": "14_gaoyan.wav",
    "durationInFrames": 231
  },
  {
    "id": 16,
    "character": "zundamon",
    "text": "願い事をコメントしてね！あなたの元に幸運が届きますように。",
    "displayText": "願い事をコメントしてね！ 幸運が届きますように",
    "scene": 7,
    "pauseAfter": 10,
    "voiceFile": "16_zundamon.wav",
    "durationInFrames": 189
  }
];

// VOICEVOXスクリプト生成用
export const generateVoicevoxScript = (
  data: ScriptLine[],
  characterSpeakerMap: Record<CharacterId, number>
) => {
  return data.map((line) => ({
    id: line.id,
    character: line.character,
    speakerId: characterSpeakerMap[line.character],
    text: line.text,
    outputFile: line.voiceFile,
  }));
};
