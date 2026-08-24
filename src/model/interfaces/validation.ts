export interface IValidationRule {
  validator: (value: string) => boolean
  message: string
}
