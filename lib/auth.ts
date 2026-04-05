import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getAppBaseUrl, sendAppEmail } from "./email";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const appBaseUrl = getAppBaseUrl();

      void sendAppEmail({
        to: user.email,
        subject: "Verify your email",
        html: `
          <div>
            <p>Hello ${user.name || "there"},</p>
            <p>Please verify your email to continue using Queueless.</p>
            <p>
              <a href="${url}">Verify email</a>
            </p>
            <p>If the button does not work, copy this link:</p>
            <p>${url}</p>
          </div>
        `,
        text: `Hello ${user.name || "there"}, verify your email using this link: ${url}`,
      });
    },
  },
});
