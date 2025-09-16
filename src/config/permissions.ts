export const ALL_PERMISSIONS = {
  PERMISSIONS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/permissions/{id}",
      module: "PERMISSIONS",
    },
  },

  ROLES: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/roles", module: "ROLES" },
    CREATE: { method: "POST", apiPath: "/api/v1/roles", module: "ROLES" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/roles", module: "ROLES" },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/roles/{id}",
      module: "ROLES",
    },
  },

  USERS: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/users", module: "USERS" },
    CREATE: { method: "POST", apiPath: "/api/v1/users", module: "USERS" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/users", module: "USERS" },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/users/{id}",
      module: "USERS",
    },
  },

  PERIODS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/periods",
      module: "PERIODS",
    },
    CREATE: { method: "POST", apiPath: "/api/v1/periods", module: "PERIODS" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/periods", module: "PERIODS" },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/periods/{id}",
      module: "PERIODS",
    },
  },

  CATEGORIES: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/categories",
      module: "CATEGORIES",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/categories",
      module: "CATEGORIES",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/categories",
      module: "CATEGORIES",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/categories/{id}",
      module: "CATEGORIES",
    },
  },

  FEE_TYPES: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/fee-types",
      module: "FEE_TYPES",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/fee-types",
      module: "FEE_TYPES",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/fee-types",
      module: "FEE_TYPES",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/fee-types/{id}",
      module: "FEE_TYPES",
    },
  },
};

export const ALL_MODULES = {
  FILES: "FILES",
  PERMISSIONS: "PERMISSIONS",
  ROLES: "ROLES",
  USERS: "USERS",
  PERIODS: "PERIODS",
  CATEGORIES: "CATEGORIES",
  FEE_TYPES: "FEE_TYPES",
};
