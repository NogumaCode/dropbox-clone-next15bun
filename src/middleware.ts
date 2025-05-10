import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 認証が不要な（公開）ルートを定義
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// Clerk のミドルウェアを設定
export default clerkMiddleware(async (auth, request) => {
  const user = auth(); // 現在のユーザー情報を取得する Promise
  const userId = (await user).userId; // ユーザーID を取得
  const url = new URL(request.url); // 現在のリクエストURLをオブジェクト化

  //ログイン済みユーザーが「公開ページ」にアクセスしようとした場合、ダッシュボードにリダイレクト
  if (userId && isPublicRoute(request) && url.pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  //公開ページ以外にアクセスしようとした場合は、認証チェックを実行（未認証ならリダイレクトされる）
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// このミドルウェアを適用するパスの設定
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
