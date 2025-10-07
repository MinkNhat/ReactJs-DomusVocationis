import { ISurveyData } from "@/pages/client/home/modal.survey-chart";
import {
  IBackendRes,
  IAccount,
  IUser,
  IModelPaginate,
  IGetAccount,
  IPermission,
  IRole,
  IResponseImport,
  IPeriod,
  ISession,
  IListSessions,
  ICategory,
  IPost,
  ICreateSurveyBulk,
  IAnswer,
  IFeeType,
  IRegistrationFee,
  IPayment,
  IVNPayPayment,
  IResVNPayPayment,
  IReqChangePassword,
  IReqUpdateAvatar,
} from "@/types/backend";
import axios from "config/axios-customize";

/**
 * 
Module Auth
 */
export const callRegister = (
  name: string,
  email: string,
  password: string,
  age: number,
  gender: string,
  address: string
) => {
  return axios.post<IBackendRes<IUser>>("/api/v1/auth/register", {
    name,
    email,
    password,
    age,
    gender,
    address,
  });
};

export const callLogin = (username: string, password: string) => {
  return axios.post<IBackendRes<IAccount>>("/api/v1/auth/login", {
    username,
    password,
  });
};

export const callFetchAccount = () => {
  return axios.get<IBackendRes<IGetAccount>>("/api/v1/auth/account");
};

export const callRefreshToken = () => {
  return axios.get<IBackendRes<IAccount>>("/api/v1/auth/refresh");
};

export const callLogout = () => {
  return axios.post<IBackendRes<string>>("/api/v1/auth/logout");
};

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
  const bodyFormData = new FormData();
  bodyFormData.append("file", file);
  bodyFormData.append("folder", folderType);

  return axios<IBackendRes<{ fileName: string }>>({
    method: "post",
    url: "/api/v1/files",
    data: bodyFormData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 
Module Period
 */
export const callCreatePeriod = (period: IPeriod) => {
  return axios.post<IBackendRes<IPeriod>>("/api/v1/periods", { ...period });
};

export const callUpdatePeriod = (period: IPeriod) => {
  return axios.put<IBackendRes<IPeriod>>(`/api/v1/periods`, { ...period });
};

export const callDeletePeriod = (id: string) => {
  return axios.delete<IBackendRes<IPeriod>>(`/api/v1/periods/${id}`);
};

export const callFetchPeriod = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPeriod>>>(
    `/api/v1/periods?${query}`
  );
};

export const callFetchOpenPeriod = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPeriod>>>(
    `/api/v1/open-periods?${query}`
  );
};

export const callFetchPeriodById = (id: string) => {
  return axios.get<IBackendRes<IPeriod>>(`/api/v1/periods/${id}`);
};

/**
 * 
Module Session
 */

export const callCreateSession = (session: ISession) => {
  return axios.post<IBackendRes<ISession>>(`/api/v1/sessions`, { ...session });
};

export const callRegisterSession = (id: string) => {
  return axios.put<IBackendRes<ISession>>(`/api/v1/sessions`, { id: id });
};

export const callFetchSessionsByPeriod = (id: string) => {
  return axios.get<IBackendRes<IListSessions>>(
    `/api/v1/periods/${id}/sessions`
  );
};

export const callFetchSessionsByUser = (query: string, userId: string) => {
  return axios.get<IBackendRes<IModelPaginate<ISession>>>(
    `/api/v1/users/${userId}/sessions?${query}`
  );
};

/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
  return axios.post<IBackendRes<IUser>>("/api/v1/users", { ...user });
};

export const callBulkCreateUser = (data: IUser[]) => {
  return axios.post<IBackendRes<IResponseImport>>(
    "/api/v1/users/bulk-create",
    data
  );
};

export const callUpdateUser = (user: IUser) => {
  return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user });
};

export const callDeleteUser = (id: string) => {
  return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
};

export const callFetchUser = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IUser>>>(
    `/api/v1/users?${query}`
  );
};

export const callFetchUserById = (id: string) => {
  return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}`);
};

export const callChangeUserPassword = (id: string, req: IReqChangePassword) => {
  return axios.patch<IBackendRes<IUser>>(
    `/api/v1/users/change-password/${id}`,
    {
      ...req,
    }
  );
};

export const callUpdateAvatar = (id: string, req: IReqUpdateAvatar) => {
  return axios.patch<IBackendRes<IUser>>(`/api/v1/users/upload-avatar/${id}`, {
    ...req,
  });
};

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
  return axios.post<IBackendRes<IPermission>>("/api/v1/permissions", {
    ...permission,
  });
};

export const callUpdatePermission = (permission: IPermission, id: string) => {
  return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, {
    id,
    ...permission,
  });
};

export const callDeletePermission = (id: string) => {
  return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
};

export const callFetchPermission = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPermission>>>(
    `/api/v1/permissions?${query}`
  );
};

export const callFetchPermissionById = (id: string) => {
  return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
};

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
  return axios.post<IBackendRes<IRole>>("/api/v1/roles", { ...role });
};

export const callUpdateRole = (role: IRole, id: string) => {
  return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role });
};

export const callDeleteRole = (id: string) => {
  return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
};

export const callFetchRole = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IRole>>>(
    `/api/v1/roles?${query}`
  );
};

export const callFetchRoleById = (id: string) => {
  return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
};

/**
 * 
Module Category
 */
export const callCreateCategory = (category: ICategory) => {
  return axios.post<IBackendRes<ICategory>>("/api/v1/categories", {
    ...category,
  });
};

export const callUpdateCategory = (category: ICategory) => {
  return axios.put<IBackendRes<ICategory>>(`/api/v1/categories`, {
    ...category,
  });
};

export const callDeleteCategory = (id: string) => {
  return axios.delete<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
};

export const callFetchCategory = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    `/api/v1/categories?${query}`
  );
};

// export const callFetchCategoryById = (id: string) => {
//   return axios.get<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
// };

/**
 * 
Module Post
 */
export const callCreatePost = (post: IPost) => {
  return axios.post<IBackendRes<IPost>>("/api/v1/posts", { ...post });
};

export const callUpdatePost = (post: IPost) => {
  return axios.put<IBackendRes<IPost>>(`/api/v1/posts`, { ...post });
};

export const callDeletePost = (id: string) => {
  return axios.delete<IBackendRes<IPost>>(`/api/v1/posts/${id}`);
};

export const callFetchPost = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPost>>>(
    `/api/v1/posts?${query}`
  );
};

export const callFetchPostById = (id: string) => {
  return axios.get<IBackendRes<IPost>>(`/api/v1/posts/${id}`);
};

export const callCreateSurveyBulk = (surveyData: ICreateSurveyBulk) => {
  return axios.post<IBackendRes<IPost>>(
    "/api/v1/posts/survey-bulk",
    surveyData
  );
};

export const callFetchSurveyResult = (id: string) => {
  return axios.get<IBackendRes<ISurveyData>>(`/api/v1/posts/${id}/stats`);
};

/**
 * 
Module Answer
 */

export const callCreateAnswer = (answer: IAnswer) => {
  return axios.post<IBackendRes<IAnswer>>("/api/v1/answers", {
    ...answer,
  });
};

/**
 * 
Module Fee Type
 */
export const callCreateFeeType = (feeType: IFeeType) => {
  return axios.post<IBackendRes<IFeeType>>("/api/v1/fee-types", {
    ...feeType,
  });
};

export const callUpdateFeeType = (feeType: IFeeType) => {
  return axios.put<IBackendRes<IFeeType>>(`/api/v1/fee-types`, {
    ...feeType,
  });
};

export const callDeleteFeeType = (id: string) => {
  return axios.delete<IBackendRes<IFeeType>>(`/api/v1/fee-types/${id}`);
};

export const callFetchFeeType = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IFeeType>>>(
    `/api/v1/fee-types?${query}`
  );
};

/**
 * 
Module Registered Fee
 */

export const callCreateFeeRegister = (feeRegis: IRegistrationFee) => {
  return axios.post<IBackendRes<IRegistrationFee>>("/api/v1/fee-registers", {
    ...feeRegis,
  });
};

export const callFetchRegisteredFeeByUserId = (
  query: string,
  userId: string
) => {
  return axios.get<IBackendRes<IModelPaginate<IRegistrationFee>>>(
    `/api/v1/users/${userId}/fee-registers?${query}`
  );
};

export const callUpdateFeeRegister = (feeRegis: IRegistrationFee) => {
  return axios.put<IBackendRes<IFeeType>>(`/api/v1/fee-registers`, {
    ...feeRegis,
  });
};

/**
 * 
Module Payment
 */

export const callFetchPaymentsByUser = (query: string, userId: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPayment>>>(
    `/api/v1/users/${userId}/payments?${query}`
  );
};

export const callFetchPayment = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPayment>>>(
    `/api/v1/payments?${query}`
  );
};

export const callVNPayPayment = (pay: IVNPayPayment) => {
  return axios.post<IBackendRes<IResVNPayPayment>>(`/api/v1/payments/vn-pay`, {
    ...pay,
  });
};
