module.exports = (() => {

  let response = (res,result,error) => {
    res.json({result,error});
  };

  let success = (res,data) => {
    response(res,data);
  };

  let badRequest = (res,err) => {
    response(res.status(400),null,err);
  };

  let unauthorized = (res,err) => {
    response(res.status(401),null,err);
  };

  let forbidden = (res,err) => {
    response(res.status(403),null,err);
  };

  let notFound = (res,err) => {
    response(res.status(404),null,err);
  };

  let conflict = (res,err) => {
    response(res.status(409),null,err);
  };

  let internalError = (res,err) => {
    response(res.status(500),null,err);
  };

  let serviceUnavailable = (res,err) => {
    response(res.status(503),null,err);
  };
  return {
    success,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    internalError,
    serviceUnavailable
  };
})();
