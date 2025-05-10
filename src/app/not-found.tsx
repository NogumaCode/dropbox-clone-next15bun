"use client";

import { Button } from "@heroui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-brand drop-shadow-sm mb-4">
          404
        </h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">
          ページが見つかりません
        </p>
        <p className="text-gray-500 mb-6">
          申し訳ありません。このURLには何もありません。
        </p>

        <Link href="/" passHref>
          <Button
            as="a" // Hero UI の Button はアンカータグとして動作
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-100 text-white text-sm font-semibold px-5 py-2.5 rounded-sm shadow-lg hover:shadow-xl transition-all"
          >
            ホームへ戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
