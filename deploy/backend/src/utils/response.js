export const successResponse = (res, data, message = 'Sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (res, message = 'Erro', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, data, pagination, message = 'Sucesso') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};
