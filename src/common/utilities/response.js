export const ResponseUtils = {
  success: (message, data = null) => ({
    status: 'success',
    message,
    data
  }),
  error: (message, data = null) => ({
    status: 'error',
    message,
    data
  })
};