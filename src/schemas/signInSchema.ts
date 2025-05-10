import * as z from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "メールアドレスまたはユーザー名を入力してください。" })
    .email({ message: "有効なメールアドレスを入力してください。" }),
  password: z
    .string()
    .min(1, { message: "パスワードを入力してください。" })
    .min(8, { message: "パスワードは8文字以上で入力してください。" }),
});
