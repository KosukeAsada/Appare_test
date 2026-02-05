import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { parse } from "csv-parse/sync";
import * as iconv from "iconv-lite";
import * as jschardet from "jschardet";

const ROOT_DIR = process.cwd();
const CSV_PATH = path.join(ROOT_DIR, "config", "scenario.csv");
const SCRIPT_YAML_PATH = path.join(ROOT_DIR, "config", "script.yaml");
const SCENES_YAML_PATH = path.join(ROOT_DIR, "config", "scenes.yaml");
const IMPORT_DIR = path.join(ROOT_DIR, "import_images");
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, "public", "images", "imported");

// CSVの型定義
interface ScenarioRow {
    scene: string;
    character: string;
    text: string;
    subtitle: string;
    duration: string;
    image_file: string;
    image_prompt: string;
}

// script.yaml の型定義
interface ScriptLine {
    id: number;
    character: string;
    text: string;
    displayText?: string;
    scene: number;
    pauseAfter: number;
    duration?: number; // 秒数
}

// scenes.yaml の型定義
interface SceneConfig {
    id: number;
    title: string;
    background: "image" | "gradient" | "solid";
    backgroundImage?: string;
    backgroundColor?: string;
}

function main() {
    console.log("📥 CSV取り込みを開始します: config/scenario.csv");

    if (!fs.existsSync(CSV_PATH)) {
        console.error("❌ CSVファイルが見つかりません。");
        process.exit(1);
    }

    // ファイルをバイナリとして読み込む
    const buffer = fs.readFileSync(CSV_PATH);

    // エンコーディング検出
    const detected = jschardet.detect(buffer);
    const encoding = detected.encoding || "utf-8";
    console.log(`🔤 Detected encoding: ${encoding} (confidence: ${detected.confidence})`);

    // デコード
    let csvContent: string;
    if (encoding.toLowerCase() === "shift_jis" || encoding.toLowerCase() === "windows-1252") {
        // Windows-1252と判定されても日本語環境ならShift_JISの可能性が高い
        csvContent = iconv.decode(buffer, "Shift_JIS");
    } else {
        csvContent = iconv.decode(buffer, encoding);
    }

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
    }) as ScenarioRow[];

    const scriptData: ScriptLine[] = [];
    const scenesData: SceneConfig[] = [];
    const sceneMap = new Map<string, number>();

    let currentSceneId = 0;

    // 処理開始
    records.forEach((row, index) => {
        // シーン管理
        let sceneId: number;
        const sceneName = row.scene || `scene_${index}`;

        if (sceneMap.has(sceneName)) {
            sceneId = sceneMap.get(sceneName)!;
        } else {
            currentSceneId++;
            sceneId = currentSceneId;
            sceneMap.set(sceneName, sceneId);

            // 新しいシーン定義を作成
            const sceneConfig: SceneConfig = {
                id: sceneId,
                title: sceneName,
                background: "gradient", // デフォルト
            };

            // 画像の処理
            if (row.image_file) {
                const srcPath = path.join(IMPORT_DIR, row.image_file);
                if (fs.existsSync(srcPath)) {
                    // 画像をコピー
                    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
                        fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
                    }
                    const destFile = row.image_file; // そのままの名前で使用
                    const destPath = path.join(PUBLIC_IMAGES_DIR, destFile);

                    fs.copyFileSync(srcPath, destPath);
                    console.log(`🖼️ 画像をインポート: ${row.image_file}`);

                    sceneConfig.background = "image";
                    sceneConfig.backgroundImage = `imported/${destFile}`;
                } else {
                    console.warn(`⚠️ 画像が見つかりません: ${row.image_file} (Scene: ${sceneName})`);
                }
            }

            scenesData.push(sceneConfig);
        }

        // セリフデータ作成
        if (row.text && row.character) {
            const line: ScriptLine = {
                id: index + 1,
                character: row.character,
                text: row.text,
                displayText: row.subtitle || row.text,
                scene: sceneId,
                pauseAfter: 10, // デフォルト
            };

            if (row.duration && !isNaN(parseFloat(row.duration))) {
                line.duration = parseFloat(row.duration);
            }

            scriptData.push(line);
        }
    });

    // YAML出力
    fs.writeFileSync(SCRIPT_YAML_PATH, yaml.stringify(scriptData));
    fs.writeFileSync(SCENES_YAML_PATH, yaml.stringify(scenesData));

    console.log("✅ config/script.yaml を更新しました");
    console.log("✅ config/scenes.yaml を更新しました");
    console.log("🚀 次は 'npm run sync-settings' (または generate-all) を実行してください");
}

main();
