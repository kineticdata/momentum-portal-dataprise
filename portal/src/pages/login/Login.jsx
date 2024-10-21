export const Login = ({
  error,
  onChangePassword,
  onChangeUsername,
  onLogin,
  onSso,
  password,
  pending,
  username,
}) => (
  <div className="login-container">
    <form className="login-form">
      <div className="form-group">
        <label htmlFor="_username">Username</label>
        <input
          className="form-control"
          id="_username"
          type="text"
          name="_username"
          data-locator="username"
          required={true}
          autoFocus={true}
          value={username}
          onChange={onChangeUsername}
        />
      </div>
      <div className="form-group">
        <label htmlFor="_password">Password</label>
        <input
          className="form-control"
          id="_password"
          type="password"
          name="_password"
          data-locator="password"
          required={true}
          value={password}
          onChange={onChangePassword}
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="login-button">
        <button
          className="btn btn-lg btn-primary"
          type="submit"
          onClick={onLogin}
          disabled={pending || !username || !password}
        >
          Sign In
        </button>
      </div>
      {onSso && (
        <>
          <hr className="my-4 bg-secondary opacity-100" />
          <div className="login-button">
            <button
              className="btn btn-lg btn-outline-primary"
              type="button"
              onClick={onSso}
              disabled={pending}
            >
              Enterprise Single Sign-On
            </button>
          </div>
        </>
      )}
    </form>
  </div>
);
