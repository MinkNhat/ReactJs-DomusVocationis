/**
 * 
Interface utils
 */
export interface IBackendRes<T> {
  error?: string | string[];
  message: string;
  statusCode: number | string;
  data?: T;
}

export interface IModelPaginate<T> {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface IAccount {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: {
      id: string;
      name: string;
      permissions: {
        id: string;
        name: string;
        apiPath: string;
        method: string;
        module: string;
      }[];
    };
  };
}

export interface IGetAccount extends Omit<IAccount, "access_token"> {}

export interface IResponseImport {
  successCount: number;
  errorCount: number;
  errorDetails: {
    index: number;
    errMessage: string;
  }[];
}

/**
 * 
Models Interface
 */

export interface IPeriod {
  id?: string;
  name: string;
  status: string;
  type: string;
  startDate: Date;
  endDate: Date;
  registrationStartTime: Date;
  registrationEndTime: Date;
  notes?: string;
  excludedDaysOfWeek?: number[];
  allowedSessions?: string[];
  currentUsers?: number;
  totalSlot?: number;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISession {
  id?: string;
  registrationDate: Date | string;
  sessionTime: string;
  activity: string;
  totalSlot?: number;
  period?: {
    id: string;
    name?: string;
    status?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  users?: {
    id: string;
    full_name: string;
  }[];
  currentRegistrations?: number;
  availableSlots?: number;
}

export interface IListSessions {
  id: string;
  sessions: {
    id: string;
    registrationDate: Date;
    sessionTime: string;
    activity: string;
    totalSlot: number;
    currentRegistrations: number;
    users: {
      id: string;
      full_name: string;
    }[];
  }[];
}

export interface IUser {
  id?: string;
  christianName?: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  birth?: Date;
  gender?: string;
  avatar?: string;
  address?: string;
  active: boolean;
  team?: Integer;

  fatherName?: string | null;
  fatherPhone?: string | null;
  motherName?: string | null;
  motherPhone?: string | null;
  parish?: string | null;
  deanery?: string | null;
  spiritualDirectorName?: string | null;
  sponsoringPriestName?: string | null;
  university?: string | null;
  major?: string | null;

  role?: {
    id: string;
    name: string;
  } | null;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPermission {
  id?: string;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRole {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  permissions: IPermission[] | string[];

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  id?: string;
  name: string;
  description?: string;
  active: boolean;
  allowPost: boolean;
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPost {
  id?: string;
  title: string;
  content: string;
  type: string;
  status: string;
  expiresAt?: string;
  publicPost: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar: string;
  };
  category: {
    id: string;
    name?: string;
  };
  questions?: IQuestion[];
  submitted?: boolean;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

// Question interface for surveys
export interface IQuestion {
  id?: string;
  questionText: string;
  type: "MULTIPLE_CHOICE" | "TEXT";
  orderDisplay: number;
  required: boolean;
  allowMultiple: boolean;

  // Relationships
  post?: {
    id: string;
  };
  options?: IOption[];
  answers?: IAnswer[];

  // Audit fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Option interface for multiple choice questions
export interface IOption {
  id?: string;
  optionText: string;
  orderDisplay: number;

  // Relationships
  question?: {
    id: string;
  };
  answers?: IAnswer[];

  // Audit fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Answer interface for user responses
export interface IAnswer {
  id?: string;
  answerText?: string; // For TEXT type questions

  // Relationships
  question?: {
    id: string;
    questionText?: string;
  };
  user?: {
    id: string;
    full_name?: string;
  };
  selectedOptions?: {
    id: string;
    optionText?: string;
  }[]; // For MULTIPLE_CHOICE type questions

  // Audit fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateSurveyBulk {
  title: string;
  content: string;
  type: string;
  status: string;
  expiresAt?: string;
  publicPost: boolean;
  categoryId: string;

  questions: {
    questionText: string;
    type: string;
    orderDisplay: number;
    required: boolean;
    allowMultiple?: boolean;

    options?: {
      optionText: string;
      orderDisplay: number;
    }[];
  }[];
}

export interface IFeeType {
  id?: string;
  name: string;
  description?: string;
  active?: boolean;

  frequency: string;
  amount: double;
  startDate?: string;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRegistrationFee {
  id?: string;
  registrationDate?: string;
  nextPaymentDate?: string | null;
  active: boolean;

  user?: {
    id: string;
    fullName?: string;
    email?: string;
  };
  feeType: IFeeType;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPayment {
  id: string;
  transactionCode: string;
  amount: number;
  dueDate: string;
  status: string;
  method: string;
  paymentDate: string;

  user: IUser;
  feeRegistration: IRegistrationFee;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IVNPayPayment {
  requestId: string;
  userId: string;
  txnRef: string;
  amount: number;
}

export interface IResVNPayPayment {
  paymentUrl: string;
}

export interface IReqChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IReqUpdateAvatar {
  fileName: string;
}
