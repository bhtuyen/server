export enum Token {
  ForgotPasswordToken = 'ForgotPasswordToken',
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  TableToken = 'TableToken'
}

export enum RowMode {
  None,
  Insert,
  Update,
  Delete
}

export enum TransactionType {
  IN = 'in',
  OUT = 'out'
}
