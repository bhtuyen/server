export enum Token {
  ForgotPasswordToken = 'ForgotPasswordToken',
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  TableToken = 'TableToken'
}

export enum Role {
  Owner = 'Owner',
  Employee = 'Employee',
  Guest = 'Guest'
}

export enum DishStatus {
  Available = 'Available',
  Unavailable = 'Unavailable',
  Hidden = 'Hidden'
}

export enum TableStatus {
  Available = 'Available',
  Hidden = 'Hidden',
  Reserved = 'Reserved'
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Rejected = 'Rejected',
  Delivered = 'Delivered',
  Paid = 'Paid'
}

export enum DishCategory {
  Buffet = 'Buffet',
  Paid = 'Paid'
}
