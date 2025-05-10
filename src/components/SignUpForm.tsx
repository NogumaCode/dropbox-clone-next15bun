"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpForm() {
  const router = useRouter();
  // Clerkのサインアップフックから必要な機能を取得
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false); //フォーム送信中か
  const [authError, setAuthError] = useState<string | null>(null); // サインアップエラー用メッセージ
  const [verifying, setVerifying] = useState(false); //メール認証コードの入力画面を表示するか

  const [verificationCode, setVerificationCode] = useState<string>(""); //ユーザーが入力する認証コード
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  ); // 認証コードエラー用メッセージ

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register, // 各フォームフィールドにバリデーションルールを適用するための関数
    handleSubmit, // フォーム送信時のバリデーション処理と送信処理をまとめる関数
    formState: { errors }, // バリデーションエラー情報を取得
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema), // Zodでバリデーションする設定
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return; // Clerkがまだロードされていなければ何もしない
    setIsSubmitting(true); // 送信中フラグを立てる（ローディング状態開始）
    setAuthError(null); // 前回のエラーをリセット

    try {
      // Clerkでアカウント作成リクエストを送信
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      // メールアドレス認証コードの送信リクエスト
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      // 認証コード入力画面に切り替える
      setVerifying(true);
    } catch (error: unknown) {
      // エラー内容が取得できれば表示、できなければデフォルトメッセージ
      console.error("Signup error:", error);

      if (typeof error === "object" && error !== null && "errors" in error) {
        const clerkError = error as { errors?: { message?: string }[] };
        setAuthError(
          clerkError.errors?.[0]?.message ||
            "サインアップ中にエラーが発生しました。",
        );
      }
    } finally {
      setIsSubmitting(false); // ローディング状態解除
    }
  };

  // メール認証コードを送信・検証する処理
  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault(); // フォームのデフォルト送信動作をキャンセル（ページリロード防止）

    // ClerkのAPIがロードされていない、またはsignUpオブジェクトがない場合は処理を中断
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true); // 「処理中」状態にする（ボタンをローディング表示に切り替えるなど）
    setAuthError(null); // 前回のエラー表示をリセット

    try {
      // Clerkに認証コードを送信して検証する
      if (!verificationCode.trim()) {
        setVerificationError("認証コードを入力してください。");
        return;
      }
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      // 認証が成功し、アカウントが有効になった場合
      if (result.status === "complete") {
        // サインイン状態にし、セッションをアクティブにする
        await setActive({ session: result.createdSessionId });

        // 認証後にダッシュボードページへリダイレクト
        router.push("/dashboard");
      } else {
        // 認証が未完了の場合（例：間違ったコードなど）
        console.error("Verification incomplete", result);
        setVerificationError(
          "Verification could not be completed. Please try again.",
        );
      }
    } catch (error: unknown) {
      console.error("Verification error:", error);

      // 型チェックしてエラーメッセージを安全に取得
      if (typeof error === "object" && error !== null && "errors" in error) {
        const clerkError = error as { errors?: { message?: string }[] };
        setAuthError(
          clerkError.errors?.[0]?.message ||
            "認証中にエラーが発生しました。もう一度お試しください。",
        );
      } else {
        // 予期しないエラーの場合のデフォルトメッセージ
        setAuthError(
          "予期しないエラーが発生しました。もう一度お試しください。",
        );
      }
    } finally {
      setIsSubmitting(false); // ローディング状態を解除
    }
  };

  // 「メール認証コード入力画面」を表示する条件分岐（verifying が true の場合に表示）
  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        {/* ヘッダー部分 */}
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            メール認証コードを入力してください
          </h1>
          <p className="text-default-500 text-center">
            ご登録のメールアドレスに認証コードを送信しました
          </p>
        </CardHeader>
        <Divider /> {/* 仕切り線 */}
        <CardBody className="py-6">
          {/* 認証エラーがあれば表示 */}
          {verificationError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          {/* 認証コード入力フォーム */}
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                認証コード
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="6桁のコードを入力してください"
                value={verificationCode} // 入力値を状態にバインド
                onChange={(e) => setVerificationCode(e.target.value)} // 入力内容が変わるたびに状態を更新
                className="w-full"
                autoFocus // 自動的にフォーカスが当たる
              />
            </div>

            {/* 認証ボタン */}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting} // ローディング中はスピナー表示
            >
              {isSubmitting ? "認証中..." : "メールを認証する"}
            </Button>
          </form>

          {/* 再送リンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              認証コードが届いていませんか？{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    // 認証コードを再送信する処理
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                コードを再送信する
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // サインアップフォームの画面（まだ認証コード入力ではない場合に表示）
  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      {/* カードヘッダー：タイトルと説明文 */}
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">アカウント作成</h1>
        <p className="text-default-500 text-center">
          サインアップして安全に画像を管理しましょう
        </p>
      </CardHeader>
      <Divider /> {/* セクションの仕切り線 */}
      <CardBody className="py-6">
        {/* 認証エラーがある場合にエラーメッセージを表示 */}
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        {/* サインアップフォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email 入力欄 */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-default-900"
            >
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />} // メールアイコン
              isInvalid={!!errors.email} // バリデーションエラーがあるか
              errorMessage={errors.email?.message} // エラーメッセージ表示
              {...register("email")} // フォームにバインド
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
              type={showPassword ? "text" : "password"} // パスワード表示切り替え
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />} // 鍵アイコン
              endContent={
                // パスワード表示・非表示切り替えボタン
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

          {/* パスワード確認欄 */}
          <div className="space-y-2">
            <label
              htmlFor="passwordConfirmation"
              className="text-sm font-medium text-default-900"
            >
              パスワード確認
            </label>
            <Input
              id="passwordConfirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.passwordConfirmation}
              errorMessage={errors.passwordConfirmation?.message}
              {...register("passwordConfirmation")}
              className="w-full"
            />
          </div>

          {/* 利用規約の案内 */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-default-600">
                アカウントを作成すると、利用規約とプライバシーポリシーに同意したことになります。
              </p>
            </div>
          </div>

          {/* アカウント作成ボタン */}
          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting} // ローディング中はスピナー表示
          >
            {isSubmitting ? "アカウント作成中..." : "アカウントを作成する"}
          </Button>
        </form>
      </CardBody>
      <Divider />
      {/* フッター：すでにアカウントがある場合のリンク */}
      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            ログイン
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
