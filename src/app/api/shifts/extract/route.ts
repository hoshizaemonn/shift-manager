import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const EXTRACTION_PROMPT = `これらの画像はシフト希望のスクリーンショットです（LINEトーク、手書きカレンダー、メモなど）。
全画像からスタッフの出勤希望を読み取り、1つのJSONにまとめてください。

■ 最重要ルール:

1. シフト希望の読み取り:
- スタッフが「3・6・10でお願いします」「3日、6日、10日希望」→ その送信者がその日に出勤
- 「9日、18時〜出れます」→ その送信者が9日の18:00に出勤

2. 管理者の指示を正しく読む（超重要）:
- 「@関口 2・3 17時出勤でお願いします」→ これは「関口」さんが2日と3日に17時出勤するという意味
- @やメンション先の人がシフトに入る。メッセージの送信者は管理者であり、シフトには入らない
- 管理者が誰かに指示を出している場合、指示された人のシフトとして登録する

3. カレンダー画像:
- ×印がある日は定休日（isClosed: true）。定休日にはシフトを入れない
- 手書きカレンダーに名前+時間が書いてある場合もそのまま読み取る

4. 名前のルール:
- LINEの表示名がそのままスタッフ名。ただし英語やニックネームの場合もそのまま使う
- 時間の表記: "15半" = 15:30、"16" = 16:00、"18時" = 18:00
- 時間が書かれていない場合、startTimeは "" にする

5. その他:
- 複数画像のデータは統合する
- スタンプや「お疲れ様です」等の挨拶は無視する
- 読み取れない箇所は名前を "?" にする

■ JSON形式（これだけを返してください。説明文不要）:
{
  "year": 2026,
  "month": 4,
  "days": [
    {
      "date": "2026-04-01",
      "isClosed": true,
      "shifts": []
    },
    {
      "date": "2026-04-03",
      "isClosed": false,
      "shifts": [
        { "name": "ちな", "startTime": "" },
        { "name": "関口 滋樹", "startTime": "17:00" }
      ]
    }
  ],
  "staffNames": ["ちな", "関口 滋樹"]
}

■ 注意:
- 全ての日（1日〜月末）を必ず含めてください
- staffNamesには登場した全スタッフ名を重複なしで入れてください
- JSONのみを返してください。マークダウンのコードブロックも不要です`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const yearParam = formData.get("year") as string | null;
    const monthParam = formData.get("month") as string | null;

    // Collect all image files
    const images: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image") && value instanceof File) {
        images.push(value);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: "画像ファイルが必要です" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    // Build content array with all images
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

    for (const file of images) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "JPEG, PNG, WebP, GIF のみ対応しています" },
          { status: 400 }
        );
      }
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: base64,
        },
      });
    }

    let prompt = EXTRACTION_PROMPT;
    if (yearParam && monthParam) {
      prompt += `\n\nヒント: これらの画像は ${yearParam}年${monthParam}月 のシフト表です。`;
    }
    content.push({ type: "text", text: prompt });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { success: false, error: "AIからの応答が空でした" },
        { status: 500 }
      );
    }

    let jsonStr = textBlock.text.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const data = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Shift extraction error:", error);
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
