export function loadInfo() {
  return new Promise((resolve) => {
    resolve({
      message: 'This came from the api server',
      time: Date.now()
    });
  });
}

export function plusone(req) {
  req.session.count = (req.session.count || 0) + 1;
  return Promise.resolve(req.session.count);
}
