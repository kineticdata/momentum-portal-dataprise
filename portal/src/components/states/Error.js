export const Error = ({ error }) =>
  error && (
    <div>
      <h1>{error.statusCode}</h1>
      <h2>Error</h2>
      <p>{error.message}</p>
    </div>
  );
