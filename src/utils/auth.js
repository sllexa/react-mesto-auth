class Auth {
  constructor(baseUrl) {
    this._url = baseUrl;
  }

  _checkResponse(res) {
    return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
  }

  _request(url, options) {
    return fetch(this._url + url, options).then(this._checkResponse);
  }

  registerUser(email, password) {
    return this._request('/signup', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
  }

  loginUser(email, password) {
    return this._request('/signin', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
  }

  checkToken(token) {
    return this._request('/users/me', {
      method: 'GET',
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
  }
}

const auth = new Auth('https://auth.nomoreparties.co');

export default auth;