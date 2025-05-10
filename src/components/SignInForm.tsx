"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";

export default function SignInForm() {
  const router = useRouter(); // ルーティング操作用

  // Clerk のサインイン関連機能を取得
  const { signIn, isLoaded, setActive } = useSignIn();

  // 状態管理（フォーム送信中・エラーメッセージ・パスワード表示切り替え）
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // フォームバリデーション設定（Zod を使用）
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema), // Zod バリデーション適用
    defaultValues: {
      identifier: "", // メールアドレス（ユーザーID）
      password: "",
    },
  });

  // フォーム送信処理
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return; // Clerk がロードされていなければ処理中断

    setIsSubmitting(true); // 送信中状態に変更
    setAuthError(null); // 前回のエラーをリセット

    try {
      // Clerk でサインイン処理を実行
      const result = await signIn.create({
        identifier: data.identifier, // メールアドレス入力値
        password: data.password, // パスワード入力値
      });

      // サインインが成功した場合
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId }); // セッション開始
        router.push("/dashboard"); // ダッシュボードにリダイレクト
      } else {
        console.error("Sign-in incomplete:", result);
        setAuthError("サインインに失敗しました。もう一度お試しください。");
      }
    } catch (error: unknown) {
      console.error("Sign-in error:", error);
      // エラーメッセージがあれば表示、なければデフォルトメッセージ
      if (typeof error === "object" && error !== null && "errors" in error) {
        const clerkError = error as { errors?: { message?: string }[] };

        setAuthError(
          clerkError.errors?.[0]?.message ||
            "サインイン中にエラーが発生しました。もう一度お試しください。",
        );
      }
    } finally {
      setIsSubmitting(false); // ローディング終了
    }
  };

  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      {/* ヘッダー部分 */}
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">お帰りなさい</h1>
        <p className="text-default-500 text-center">
          サインインしてセキュアなクラウドストレージにアクセスしましょう
        </p>
      </CardHeader>
      <Divider /> {/* セクションの仕切り線 */}
      <CardBody className="py-6">
        {/* エラーメッセージ表示 */}
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        {/* サインインフォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* メールアドレス入力欄 */}
          <div className="space-y-2">
            <label
              htmlFor="identifier"
              className="text-sm font-medium text-default-900"
            >
              メールアドレス
            </label>
            <Input
              id="identifier"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
              className="w-full"
            />
          </div>

          {/* パスワード入力欄 */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-900"
            >
              パスワード
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"} // パスワード表示切替
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                // パスワード表示/非表示切り替えボタン
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          {/* サインインボタン */}
          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "サインイン中..." : "サインイン"}
          </Button>
        </form>
      </CardBody>
      <Divider />
      {/* アカウントを持っていない場合のリンク */}
      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          アカウントをお持ちでない方は{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            サインアップ
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
