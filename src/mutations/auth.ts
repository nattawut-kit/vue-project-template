import { defineMutation, useMutation } from '@pinia/colada'
import { login } from '@/api/auth'

export const useLogin = defineMutation(() =>
  useMutation({
    mutation: (liffToken: string) => login(liffToken),
  }),
)
