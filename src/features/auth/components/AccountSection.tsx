import { useMe } from '../hooks/useMe'
import { useSignOut } from '../hooks/useSignOut'
import { AccountCard } from './AccountCard'

/** The signed-in account with a sign-out button. Rendered inside the You tab. */
export function AccountSection() {
  const me = useMe()
  const signOut = useSignOut()

  if (!me.data) return null

  return (
    <AccountCard
      name={me.data.name}
      email={me.data.email}
      isAdmin={me.data.is_admin}
      signingOut={signOut.isPending}
      onSignOut={() => signOut.mutate()}
    />
  )
}
