import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import { fauna } from '../../../services/fauna'

import { query } from "faunadb"

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENTE_ID,
      clientSecret: process.env.GITHUB_CLIENTE_SECRET,
      scope: 'read:user'
    }),
  ],
  // jwt: {
  //   signingKey: process.env.SIGNIN_KEY,
  // },
  callbacks: {
    async signIn(user, account, profile) {
      try {
        const { email } = user
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index('user_by_email'),
                  query.Casefold(user.email)
                )
              )
            ),
            query.Create(
              query.Collection('users'),
              { data: { email: user.email } }
            ),
            query.Get(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch (error) {
        return false
      }

    },
  }
})