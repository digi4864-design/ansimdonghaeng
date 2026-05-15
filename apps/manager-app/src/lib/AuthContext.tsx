import { createContext, useContext } from 'react'

type AuthContextType = { logout: () => void }
export const AuthContext = createContext<AuthContextType>({ logout: () => {} })
export const useAuth = () => useContext(AuthContext)
