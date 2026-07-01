import { AuthOptions } from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";

export const authOptions: AuthOptions = {
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope:
            "openid profile email User.Read User.ReadBasic.All Calendars.Read Files.Read.All",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      session.isAdmin =
        adminEmails.length > 0 &&
        adminEmails.includes((session.user?.email ?? "").toLowerCase());
      return session;
    },
  },
  session: {
    maxAge: 8 * 60 * 60, // 8 hours — one workday
  },
  pages: {
    signIn: "/auth/signin",
  },
};
