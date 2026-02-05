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
}

export const scenes: SceneInfo[] = [
  { id: 1, title: "オープニング", background: "gradient" },
  { id: 2, title: "メインコンテンツ", background: "solid" },
  { id: 3, title: "エンディング", background: "gradient" },
];

// このファイルは config/script.yaml から自動生成されます
// 編集する場合は config/script.yaml を編集して npm run sync-script を実行してください
export const scriptData: ScriptLine[] = [
  {
    "id": 1,
    "character": "zundamon",
    "text": "みんなー！MBSラジオで放送中の「まいどおおきに！！アッパレでーす！」を紹介するのだ！",
    "displayText": "みんなー！MBSラジオで放送中の「まいどおおきに！！Appare!でーす！」を紹介するのだ！",
    "scene": 1,
    "pauseAfter": 15,
    "visual": {
      "type": "text",
      "text": "MBSラジオ\n「まいどおおきに！！Appare!でーす！」",
      "fontSize": 60,
      "color": "#ffffff",
      "animation": "zoomIn"
    },
    "voiceFile": "01_zundamon.wav",
    "durationInFrames": 292
  },
  {
    "id": 2,
    "character": "gaoyan",
    "text": "そうね。アイドルグループ「アッパレ」のメンバーが、賑やかにお送りするトーク番組よ。",
    "displayText": "そうね。アイドルグループ「Appare!」のメンバーが、賑やかにお送りするトーク番組よ。",
    "scene": 1,
    "pauseAfter": 15,
    "voiceFile": "02_gaoyan.wav",
    "durationInFrames": 236
  },
  {
    "id": 3,
    "character": "zundamon",
    "text": "新メンバー3人が加わって9人体制になったアッパレの、ラジオでしか聞けない素顔がたっぷりなのだ！",
    "displayText": "新メンバー3人が加わって9人体制になったAppare!の、ラジオでしか聞けない素顔がたっぷりなのだ！",
    "scene": 1,
    "pauseAfter": 10,
    "voiceFile": "03_zundamon.wav",
    "durationInFrames": 284
  },
  {
    "id": 4,
    "character": "gaoyan",
    "text": "毎週の放送、私たちと一緒にチェックしていきましょう。",
    "scene": 1,
    "pauseAfter": 30,
    "voiceFile": "04_gaoyan.wav",
    "durationInFrames": 143
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
