#!/usr/bin/env npx ts-node

/**
 * VOICEVOX音声一括生成スクリプト
 *
 * 使用方法:
 *   npx ts-node scripts/generate-voices.ts
 *
 * 前提条件:
 *   - VOICEVOXがlocalhost:50021で起動していること
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as yaml from "yaml";

const ROOT_DIR = process.cwd();

// 設定読み込み
const CONFIG_PATH = path.join(ROOT_DIR, "src/config.ts");
const SCRIPT_YAML_PATH = path.join(ROOT_DIR, "config", "script.yaml"); // YAMLを読む
const OUTPUT_DIR = path.join(ROOT_DIR, "public/voices");

interface VoiceGenerationConfig {
  host: string;
  playbackRate: number;
  fps: number;
}

interface ScriptLine {
  id: number;
  character: string;
  text: string;
  voiceFile: string;
}

interface CharacterConfig {
  id: string;
  voicevoxSpeakerId: number;
}

// VOICEVOXが起動しているか確認
async function checkVoicevox(host: string): Promise<boolean> {
  try {
    const response = await fetch(`${host}/version`);
    if (response.ok) {
      const version = await response.text();
      console.log(`VOICEVOX version: ${version}`);
      return true;
    }
  } catch (e) {
    console.error("VOICEVOXに接続できません。VOICEVOXを起動してください。");
  }
  return false;
}

// 音声クエリを取得
async function getAudioQuery(
  host: string,
  text: string,
  speakerId: number
): Promise<any> {
  const encodedText = encodeURIComponent(text);
  const response = await fetch(
    `${host}/audio_query?speaker=${speakerId}&text=${encodedText}`,
    { method: "POST" }
  );
  if (!response.ok) {
    throw new Error(`audio_query failed: ${response.statusText}`);
  }
  return response.json();
}

// 音声を合成
async function synthesize(
  host: string,
  query: any,
  speakerId: number
): Promise<ArrayBuffer> {
  const response = await fetch(`${host}/synthesis?speaker=${speakerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!response.ok) {
    throw new Error(`synthesis failed: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

// WAVファイルの長さを取得（秒）
function getWavDuration(filePath: string): number {
  try {
    const safePath = filePath.replace(/\\/g, "/");
    const result = execSync(
      `python3 -c "import wave; w=wave.open('${safePath}','r'); print(w.getnframes()/w.getframerate())"`,
      { encoding: "utf-8" }
    );
    return parseFloat(result.trim());
  } catch (e) {
    console.error(`Failed to get duration for ${filePath}`);
    return 0;
  }
}

// メイン処理
async function main() {
  const host = "http://localhost:50021";
  const fps = 30;
  const playbackRate = 1.2;

  // VOICEVOX確認
  if (!(await checkVoicevox(host))) {
    process.exit(1);
  }

  // 出力ディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // スクリプトデータを動的に読み込み
  // Note: 実際の実装ではesbuildなどでビルドしてから読み込む
  console.log("スクリプトデータを読み込んでいます...");

  // ここでは例としてハードコードされたデータを使用
  // 実際にはscript.tsをパースして使用
  const scriptData: ScriptLine[] = [];
  const characters: Map<string, number> = new Map([
    ["zundamon", 3],
    ["gaoyan", 2],
  ]);

  // 読み込みロジック（既存コードを削除）

  // script.yamlを読み込んでパース
  console.log(`📖 Reading script from: ${SCRIPT_YAML_PATH}`);
  const scriptContent = fs.readFileSync(SCRIPT_YAML_PATH, "utf-8");
  const parsedData = yaml.parse(scriptContent) as any[];

  if (Array.isArray(parsedData)) {
    for (const line of parsedData) {
      // voiceFile名を自動生成（sync-scriptと同じロジックにする）
      // idが数値であることを前提
      const voiceFile = `${String(line.id).padStart(2, "0")}_${line.character}.wav`;

      scriptData.push({
        id: line.id,
        character: line.character,
        text: line.text,
        voiceFile: voiceFile,
      });
    }
  }

  if (scriptData.length === 0) {
    console.error("セリフデータが見つかりませんでした。パースに失敗した可能性があります。");
    process.exit(1);
  }

  console.log(`${scriptData.length}件のセリフを処理します...`);

  const durationsArray: { id: number; file: string; duration: number; frames: number }[] = [];
  const durationsMap: Record<string, number> = {};

  for (const line of scriptData) {
    const speakerId = characters.get(line.character);
    if (speakerId === undefined) {
      console.error(`Unknown character: ${line.character}`);
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, line.voiceFile);

    // 既存ファイルがあればスキップ（オプション）
    // if (fs.existsSync(outputPath)) {
    //   console.log(`Skip: ${line.voiceFile} (already exists)`);
    //   continue;
    // }

    try {
      console.log(`Generating: ${line.voiceFile} - "${line.text.substring(0, 30)}..."`);

      // 音声クエリ取得
      const query = await getAudioQuery(host, line.text, speakerId);

      // 音声合成
      const audio = await synthesize(host, query, speakerId);

      // ファイル保存
      fs.writeFileSync(outputPath, Buffer.from(audio));

      // 長さを取得してフレーム数を計算
      const duration = getWavDuration(outputPath);
      const frames = Math.ceil(duration * fps * playbackRate);

      durationsArray.push({
        id: line.id,
        file: line.voiceFile,
        duration,
        frames,
      });
      durationsMap[line.voiceFile] = frames;

      console.log(`  -> ${duration.toFixed(2)}s, ${frames} frames`);

    } catch (e) {
      console.error(`Error generating ${line.voiceFile}:`, e);
    }
  }

  // 結果をJSONで保存（sync-script.tsが期待するオブジェクト形式）
  const resultPath = path.join(OUTPUT_DIR, "durations.json");
  fs.writeFileSync(resultPath, JSON.stringify(durationsMap, null, 2));
  console.log(`\nDuration data saved to: ${resultPath}`);

  // script.ts更新用のコードを出力
  console.log("\n=== script.ts更新用 ===");
  for (const d of durationsArray) {
    console.log(`ID ${d.id}: durationInFrames: ${d.frames}, // ${d.duration.toFixed(2)}s`);
  }
}

main().catch(console.error);
