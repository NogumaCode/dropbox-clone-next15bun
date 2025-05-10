import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "メールアドレスを入力してください。" })
      .email({ message: "有効なメールアドレスを入力してください。" }),
    password: z
      .string()
      .min(1, { message: "パスワードを入力してください。" })
      .min(8, { message: "パスワードは8文字以上で入力してください。" }),
    passwordConfirmation: z
      .string()
      .min(1, { message: "確認用パスワードを入力してください。" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません。",
    path: ["passwordConfirmation"], // エラー表示をこのフィールドに紐付け
  });
